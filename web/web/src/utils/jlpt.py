import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import os
import re

def get_jlpt_words(level):
    """
    爬取特定JLPT级别的单词
    
    Args:
        level: JLPT级别（1-5）
    
    Returns:
        包含单词数据的列表
    """
    words_data = []
    base_url = f"https://jlptsensei.com/jlpt-n{level}-vocabulary-list/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # 获取总页数
    response = requests.get(base_url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # 方法1：查找"Currently viewing page X of Y"并提取Y值
    max_page = None
    page_text = soup.get_text()
    currently_viewing_match = re.search(r'Currently viewing page \d+ of (\d+)', page_text)
    if currently_viewing_match:
        # 获取匹配到的字符串，例如"71234567"
        matched_str = currently_viewing_match.group(1)
        print(f"原始匹配到的页码字符串: '{matched_str}'")
        
        # 只取第一个数字字符
        first_digit = matched_str[0]
        max_page = int(first_digit)
        print(f"从'Currently viewing'文本中提取第一个数字作为总页数: {max_page}")
    
    # 如果上述方法失败，尝试其他方法
    if not max_page:
        # 尝试找到分页元素
        pagination = soup.select_one('.wp-pagenavi')
        if pagination:
            page_links = pagination.select('a.page')
            page_numbers = [int(a.text) for a in page_links if a.text.strip().isdigit()]
            if page_numbers:
                max_page = max(page_numbers)
                print(f"从页码链接中检测到总页数: {max_page}")
    
    # 如果还是没有找到，使用已知的页数
    if not max_page or max_page < 1 or max_page > 50:
        known_pages = {1: 34, 2: 24, 3: 19, 4: 12, 5: 7}
        max_page = known_pages.get(level, 7)
        print(f"使用已知的N{level}页数: {max_page}")
    
    print(f"开始爬取JLPT N{level}单词，共{max_page}页")
    
    total_words = 0
    word_id = 1  # 为每个单词添加ID
    
    for page in range(1, max_page + 1):
        # 正确构建URL，第一页不需要/page/1/，其他页需要/page/X/
        url = base_url
        if page > 1:
            url = f"{base_url}page/{page}/"
            
        print(f"正在爬取第{page}/{max_page}页，URL: {url}")
        
        # 添加重试机制
        retry_count = 0
        max_retries = 3
        success = False
        
        while retry_count < max_retries and not success:
            try:
                response = requests.get(url, headers=headers, timeout=15)
                if response.status_code == 200:
                    success = True
                else:
                    retry_count += 1
                    print(f"请求失败，状态码：{response.status_code}，重试 ({retry_count}/{max_retries})...")
                    time.sleep(random.uniform(3, 7))
            except Exception as e:
                retry_count += 1
                print(f"请求出错: {str(e)}，重试 ({retry_count}/{max_retries})...")
                time.sleep(random.uniform(3, 7))
        
        if not success:
            print(f"无法访问页面: {url}，跳过")
            continue
            
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.select_one('.jl-table')
        
        if table:
            rows = table.select('tbody tr')
            page_word_count = 0
            for row in rows:
                cells = row.select('td')
                if len(cells) >= 4:
                    try:
                        # 尝试获取更多信息（如果有）
                        word = cells[1].text.strip()
                        reading = cells[2].text.strip()
                        meaning = cells[3].text.strip()
                        
                        # 创建更完整的单词数据结构
                        word_data = {
                            'id': f'jlpt-n{level}-{word_id:04d}',  # 添加ID
                            'level': f'N{level}',
                            'word': word,
                            'reading': reading,
                            'meaning': meaning,
                            'romaji': '',  # 空字段，应用中可以生成
                            'example_jp': '',  # 示例句（日语）
                            'example_en': '',  # 示例句（英语）
                            'tags': f'jlpt-n{level}',  # 添加标签
                            'difficulty': level  # 数字难度级别（1-5）
                        }
                        words_data.append(word_data)
                        page_word_count += 1
                        word_id += 1
                    except IndexError:
                        print(f"警告：行数据格式异常: {[cell.text.strip() for cell in cells]}")
            
            total_words += page_word_count
            print(f"第{page}页爬取完成，获取{page_word_count}个单词，累计：{total_words}")
        else:
            print(f"在第{page}页未找到单词表格")
        
        # 随机延迟，更友好的方式
        if page < max_page:  # 最后一页不需要延迟
            delay = random.uniform(4, 8)
            print(f"等待{delay:.2f}秒后继续...")
            time.sleep(delay)
    
    print(f"JLPT N{level}单词爬取完成，共获取{len(words_data)}个单词")
    return words_data

def save_to_csv(data, filename):
    """将数据保存为CSV文件，确保正确的列顺序和格式"""
    if not data:
        print(f"警告：没有数据可保存到 {filename}")
        return
    
    # 确保所有记录有相同的字段
    expected_keys = ['id', 'level', 'word', 'reading', 'meaning', 'romaji', 
                     'example_jp', 'example_en', 'tags', 'difficulty']
    
    # 确保所有记录都有所有字段
    for item in data:
        for key in expected_keys:
            if key not in item:
                item[key] = ''
    
    # 创建DataFrame并指定列顺序
    df = pd.DataFrame(data, columns=expected_keys)
    
    # 保存为CSV，确保使用UTF-8编码和正确的分隔符
    df.to_csv(filename, index=False, encoding='utf-8', sep=',', quoting=1)
    print(f"数据已保存到 {filename}，共{len(df)}条记录")
    
    # 显示数据样例
    if len(df) > 0:
        print("\n数据样例:")
        print(df.head(3).to_string())

def main():
    # 创建保存数据的目录
    os.makedirs('jlpt_words', exist_ok=True)
    
    all_words = []
    
    # 爬取N1到N5级别的单词
    for level in range(5, 0, -1):  # 从N5开始，因为数据量更小
        print(f"\n{'='*50}\n开始爬取 N{level} 级别单词\n{'='*50}")
        words = get_jlpt_words(level)
        save_to_csv(words, f'jlpt_words/jlpt_n{level}_words.csv')
        all_words.extend(words)
        
        # 每个级别之间稍作休息
        if level > 1:
            delay = random.uniform(8, 15)
            print(f"完成N{level}，休息{delay:.2f}秒后继续爬取N{level-1}...")
            time.sleep(delay)
    
    # 保存所有单词到一个文件
    save_to_csv(all_words, 'jlpt_words/all_jlpt_words.csv')
    
    # 统计每个级别的单词数量
    level_counts = {}
    for word in all_words:
        level = word['level']
        level_counts[level] = level_counts.get(level, 0) + 1
    
    print("\n各级别单词数量统计:")
    for level in sorted(level_counts.keys()):
        print(f"{level}: {level_counts[level]}个单词")
    
    print(f"\n爬取完成！共获取{len(all_words)}个单词")

if __name__ == "__main__":
    main()