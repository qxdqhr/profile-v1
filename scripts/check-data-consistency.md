# 数据一致性检查指南

## 问题：外键约束违反

当遇到 `foreign key constraint` 错误时，说明数据库中存在引用完整性问题。

### 错误示例
```
insert or update on table "comic_universe_artworks" violates foreign key constraint 
"comic_universe_artworks_collection_id_comic_universe_collection"
Key (collection_id)=(8) is not present in table "comic_universe_collections"
```

## 🔍 检查步骤

### 1. 检查画集是否存在
在浏览器开发者工具 Console 中执行：

```javascript
// 检查所有画集
fetch('/api/masterpieces/collections')
  .then(r => r.json())
  .then(collections => {
    console.log('现有画集:', collections.map(c => ({id: c.id, title: c.title})));
    console.log('画集总数:', collections.length);
  });
```

### 2. 检查特定画集ID
```javascript
// 检查特定画集（替换8为实际ID）
const collectionId = 8;
fetch(`/api/masterpieces/collections/${collectionId}`)
  .then(r => {
    if (r.ok) {
      return r.json().then(data => console.log('画集存在:', data));
    } else {
      console.log('画集不存在，状态码:', r.status);
    }
  });
```

### 3. 清除缓存并重新加载
```javascript
// 清除本地存储和缓存
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

## 🛠️ 解决方案

### 立即解决方案
1. **刷新页面** - 清除前端缓存，重新加载最新数据
2. **重新选择画集** - 确保选择的是存在的画集
3. **检查权限** - 确保有访问该画集的权限

### 预防措施
现在已经添加了以下保护措施：

1. **API层面检查** - 在保存作品前验证画集是否存在
2. **前端错误处理** - 提供清晰的错误提示
3. **强制数据库查询** - 绕过缓存直接查询数据库

## 🚨 常见原因

1. **画集被删除** - 画集在其他地方被删除，但前端缓存未更新
2. **并发操作** - 多个用户同时操作，导致数据不一致
3. **缓存问题** - 前端缓存显示过期的画集信息
4. **权限变更** - 用户对画集的访问权限发生变化

## 📊 数据完整性检查

### 检查孤立作品
如果需要检查数据库中是否有孤立的作品（引用不存在的画集）：

1. 联系开发团队进行数据库查询
2. 或使用数据库管理工具执行：

```sql
-- 查找孤立作品
SELECT a.id, a.title, a.collection_id 
FROM comic_universe_artworks a 
LEFT JOIN comic_universe_collections c ON a.collection_id = c.id 
WHERE c.id IS NULL;

-- 查找所有画集ID
SELECT id, title FROM comic_universe_collections ORDER BY id;
```

## ⚡ 快速修复

如果频繁遇到此问题，可以尝试：

1. **清除浏览器缓存**
2. **退出并重新登录**
3. **使用无痕模式测试**
4. **检查网络连接稳定性**

## 📞 报告问题

如果问题持续出现，请提供：

1. 错误发生时的画集ID
2. 浏览器 Console 中的完整错误日志
3. 操作步骤的详细描述
4. 最近是否进行了画集删除操作 