# 图片代理下载API测试

## 测试端点
`GET /api/proxy-image?url={imageUrl}`

## 测试用例

### 1. 正常情况测试
```bash
# 测试GitHub图片（通常支持CORS）
curl "http://localhost:3000/api/proxy-image?url=https://github.com/microsoft/vscode/raw/main/resources/linux/code.png"

# 测试其他CDN图片
curl "http://localhost:3000/api/proxy-image?url=https://picsum.photos/300/200"
```

### 2. 错误情况测试
```bash
# 测试无效URL
curl "http://localhost:3000/api/proxy-image?url=invalid-url"

# 测试不存在的图片
curl "http://localhost:3000/api/proxy-image?url=https://example.com/nonexistent.jpg"

# 测试非图片内容
curl "http://localhost:3000/api/proxy-image?url=https://www.google.com"
```

### 3. 浏览器中测试
1. 打开图片下载器页面
2. 输入一个跨域受限的图片URL
3. 点击下载，观察是否自动切换到代理下载
4. 检查浏览器开发者工具的网络请求

## 常见跨域测试图片源

### ✅ 通常可用（支持CORS或同域）
- `https://picsum.photos/800/600` - Lorem Picsum随机图片
- `https://via.placeholder.com/500x300` - 占位符图片
- `https://github.com/用户名/仓库名/raw/main/图片路径` - GitHub原始文件

### ❌ 通常受限（需要代理）
- 微博图片：`https://wx1.sinaimg.cn/...`
- 知乎图片：`https://pic1.zhimg.com/...`  
- 淘宝商品图片：`https://img.alicdn.com/...`

## 预期行为
1. 直接下载失败时，自动尝试代理下载
2. 代理下载成功时，正常下载文件
3. 代理下载失败时，显示友好的错误提示和替代方案

## 性能考虑
- 代理下载会增加服务器负载
- 大文件下载可能需要更长时间
- 建议对请求频率进行限制 