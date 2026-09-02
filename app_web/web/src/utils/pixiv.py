import requests
from bs4 import BeautifulSoup
import json
import os
import time
import random
import re
from urllib.parse import urljoin

class PixivCrawler:
    def __init__(self, username, password):
        """
        初始化Pixiv爬虫
        
        Args:
            username: Pixiv账号用户名/邮箱
            password: Pixiv账号密码
        """
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.pixiv.net/',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        }
        self.base_url = 'https://www.pixiv.net'
        self.download_folder = 'pixiv_images'
        
        # 创建下载文件夹
        if not os.path.exists(self.download_folder):
            os.makedirs(self.download_folder)
    
    def login(self):
        """使用正确的登录URL和方法登录Pixiv"""
        print("正在登录Pixiv...")
        
        # 访问登录页面
        login_url = 'https://accounts.pixiv.net/login'
        print(f"访问登录页面: {login_url}")
        
        try:
            response = self.session.get(login_url, headers=self.headers)
            if response.status_code != 200:
                print(f"访问登录页面失败，状态码: {response.status_code}")
                return False
            
            print("成功访问登录页面")
            
            # 解析页面
            soup = BeautifulSoup(response.text, 'html.parser')
            
            print(soup)
            # 查找表单和CSRF令牌
            form = soup.find('input')
            if not form:
                print("未找到登录表单")
                return False
            
            # 查找表单提交URL
            form_action = form.get('action')
            if form_action:
                if not form_action.startswith('http'):
                    form_action = urljoin('https://accounts.pixiv.net/', form_action)
            else:
                # 使用默认的API端点
                form_action = 'https://accounts.pixiv.net/api/login'
            
            print(f"表单提交URL: {form_action}")
            
            # 查找输入字段
            username_field = form.find('input', {'autocomplete': lambda x: x and 'username' in x})
            password_field = form.find('input', {'autocomplete': lambda x: x and 'password' in x})
            
            if not username_field or not password_field:
                print("未找到用户名或密码输入字段")
                # 尝试使用默认字段名
                username_field_name = 'login_id'
                password_field_name = 'password'
            else:
                username_field_name = username_field.get('name', 'login_id')
                password_field_name = password_field.get('name', 'password')
            
            print(f"用户名字段名: {username_field_name}")
            print(f"密码字段名: {password_field_name}")
            
            # 查找CSRF令牌
            csrf_token = None
            csrf_input = form.find('input', {'name': 'post_key'}) or form.find('input', {'name': 'csrf_token'})
            if csrf_input:
                csrf_token = csrf_input.get('value')
                print(f"找到CSRF令牌: {csrf_token[:10]}..." if csrf_token else "未找到CSRF令牌")
            
            # 准备登录数据
            login_data = {
                username_field_name: self.username,
                password_field_name: self.password,
                'return_to': 'https://www.pixiv.net/',
                'source': 'pc',
                'lang': 'zh'
            }
            
            # 添加CSRF令牌（如果找到）
            if csrf_token:
                login_data['post_key'] = csrf_token
            
            # 发送登录请求
            headers = self.headers.copy()
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
            headers['Origin'] = 'https://accounts.pixiv.net'
            headers['Referer'] = login_url
            
            print(f"发送登录请求...")
            response = self.session.post(form_action, data=login_data, headers=headers)
            
            if response.status_code not in [200, 301, 302]:
                print(f"登录请求失败，状态码: {response.status_code}")
                return False
            
            # 验证登录状态
            print("验证登录状态...")
            user_page = self.session.get('https://www.pixiv.net/dashboard', headers=self.headers)
            
            if 'logout' in user_page.text or self.username.lower() in user_page.text.lower():
                print("登录成功！")
                return True
            else:
                print("登录失败，无法验证登录状态")
                return False
            
        except Exception as e:
            print(f"登录过程中出错: {str(e)}")
            return False
    
    def get_daily_rankings(self, mode='daily', limit=50):
        """获取今日热门图片"""
        print(f"正在获取{mode}排行榜...")
        
        # 访问排行榜页面
        ranking_url = f'https://www.pixiv.net/ranking.php?mode={mode}'
        response = self.session.get(ranking_url, headers=self.headers)
        
        if response.status_code != 200:
            print(f"获取排行榜失败，状态码: {response.status_code}")
            return []
        
        # 解析页面
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取图片信息
        image_items = []
        items = soup.select('div.ranking-item')
        
        if not items:
            print("未找到排行榜项目，可能页面结构已变化")
            return []
        
        for i, item in enumerate(items[:limit]):
            try:
                # 提取图片ID
                image_id = item.get('data-id')
                
                # 提取标题
                title = item.select_one('h2').text.strip() if item.select_one('h2') else f"未知标题_{image_id}"
                
                # 提取作者
                author = item.select_one('a.user-name').text.strip() if item.select_one('a.user-name') else "未知作者"
                
                # 提取缩略图URL
                thumbnail = item.select_one('img._thumbnail').get('src') if item.select_one('img._thumbnail') else None
                
                # 构建作品页面URL
                artwork_url = f'https://www.pixiv.net/artworks/{image_id}'
                
                image_items.append({
                    'id': image_id,
                    'title': title,
                    'author': author,
                    'thumbnail': thumbnail,
                    'artwork_url': artwork_url
                })
                
            except Exception as e:
                print(f"解析第{i+1}个作品时出错: {str(e)}")
        
        print(f"成功获取{len(image_items)}个作品信息")
        return image_items
    
    def get_original_image_url(self, artwork_url):
        """获取原始图片URL"""
        try:
            # 访问作品页面
            response = self.session.get(artwork_url, headers=self.headers)
            
            if response.status_code != 200:
                print(f"访问作品页面失败，状态码: {response.status_code}")
                return None
            
            # 提取页面中的图片数据
            match = re.search(r'\"original\":\"(.*?)\"', response.text)
            if match:
                original_url = match.group(1).replace('\\', '')
                return original_url
            
            return None
        
        except Exception as e:
            print(f"获取原始图片URL时出错: {str(e)}")
            return None
    
    def download_image(self, image_info):
        """下载图片"""
        try:
            image_id = image_info['id']
            title = image_info['title']
            author = image_info['author']
            artwork_url = image_info['artwork_url']
            
            # 获取原始图片URL
            original_url = self.get_original_image_url(artwork_url)
            if not original_url:
                print(f"无法获取作品 {image_id} 的原始图片URL")
                return False
            
            # 构建文件名（去除非法字符）
            filename = f"{image_id}_{re.sub(r'[\\/*?:"<>|]', '', title)}_{re.sub(r'[\\/*?:"<>|]', '', author)}"
            
            # 获取文件扩展名
            ext = original_url.split('.')[-1]
            filepath = os.path.join(self.download_folder, f"{filename}.{ext}")
            
            # 检查文件是否已存在
            if os.path.exists(filepath):
                print(f"文件已存在: {filepath}")
                return True
            
            # 下载图片
            print(f"正在下载: {title} - {author}")
            
            # 设置Referer头，这对Pixiv下载非常重要
            download_headers = self.headers.copy()
            download_headers['Referer'] = artwork_url
            
            response = self.session.get(original_url, headers=download_headers, stream=True)
            
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                print(f"下载成功: {filepath}")
                return True
            else:
                print(f"下载失败，状态码: {response.status_code}")
                return False
        
        except Exception as e:
            print(f"下载图片时出错: {str(e)}")
            return False
    
    def download_daily_rankings(self, mode='daily', limit=50):
        """下载今日热门图片"""
        # 获取排行榜
        image_items = self.get_daily_rankings(mode, limit)
        
        if not image_items:
            print("没有找到任何作品")
            return
        
        # 下载图片
        success_count = 0
        for i, image_info in enumerate(image_items):
            print(f"\n[{i+1}/{len(image_items)}] 处理作品: {image_info['title']}")
            
            if self.download_image(image_info):
                success_count += 1
            
            # 随机延迟，避免请求过于频繁
            delay = random.uniform(1, 3)
            print(f"等待 {delay:.2f} 秒...")
            time.sleep(delay)
        
        print(f"\n下载完成! 成功: {success_count}/{len(image_items)}")

def main():
    # 请替换为你的Pixiv账号信息
    username = "你的Pixiv用户名/邮箱"
    password = "你的Pixiv密码"
    
    # 创建爬虫实例
    crawler = PixivCrawler(username, password)
    
    # 登录
    if crawler.login():
        # 下载今日热门图片，限制为20张
        crawler.download_daily_rankings(mode='daily', limit=20)
    else:
        print("登录失败，无法继续")

if __name__ == "__main__":
    main()