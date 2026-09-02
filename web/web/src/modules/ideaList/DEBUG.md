# 想法清单模块调试指南

## 🐛 问题诊断步骤

### 1. 检查用户登录状态
- 打开浏览器开发者工具 (F12)
- 访问 `/testField/ideaList` 页面
- 查看是否显示登录界面
- 如果显示登录界面，点击右上角用户菜单登录

### 2. 检查网络请求
在浏览器开发者工具的 Network 标签中查看以下请求：

#### 认证相关
- `GET /api/auth/validate` - 验证用户登录状态
- 状态应该是 200，响应应该包含 `{ valid: true, user: {...} }`

#### 想法清单相关
- `GET /api/ideaLists/lists` - 获取想法清单列表
- `POST /api/ideaLists/lists` - 创建新清单
- `PUT /api/ideaLists/lists/{id}` - 更新清单
- `DELETE /api/ideaLists/lists/{id}` - 删除清单

#### 想法项目相关
- `GET /api/ideaLists/items?listId={id}` - 获取指定清单的项目
- `POST /api/ideaLists/items` - 创建新项目
- `PUT /api/ideaLists/items/{id}` - 更新项目
- `DELETE /api/ideaLists/items/{id}` - 删除项目
- `POST /api/ideaLists/items/{id}/toggle` - 切换完成状态

### 3. 检查控制台日志
在浏览器开发者工具的 Console 标签中查看详细的调试日志：

#### 页面级别的日志
- `🚀 [IdeaListPage] 开始创建清单:` - 页面开始创建清单
- `📡 [IdeaListPage] 调用 createList...` - 页面调用 hook
- `✅ [IdeaListPage] 创建清单结果:` - 页面收到结果

#### Hook 级别的日志
- `🔄 [useIdeaLists] createList 开始:` - Hook 开始处理
- `📡 [useIdeaLists] 调用 IdeaListService.createList...` - Hook 调用服务
- `✅ [useIdeaLists] 创建清单成功，刷新列表...` - Hook 操作成功

#### 服务级别的日志
- `🌐 [IdeaListService] createList 开始:` - 服务开始请求
- `🌐 [IdeaListService] 请求URL:` - 请求的 URL
- `🌐 [IdeaListService] 响应状态:` - HTTP 响应状态码
- `🌐 [IdeaListService] 响应数据:` - API 响应数据

#### 认证级别的日志
- `🔐 [authUtils] 开始API权限验证` - 权限验证开始
- `🎫 [authUtils] 提取的session_token:` - 会话令牌
- `✅ [authUtils] 权限验证完成:` - 权限验证结果

### 4. 常见问题排查

#### 问题 1: 用户未登录
**现象**: 看到登录提示界面
**解决**: 点击右上角用户菜单进行登录

#### 问题 2: API 返回 401 未授权
**现象**: 网络请求返回 401 状态码
**排查**: 
- 检查 cookies 中是否有 `session_token`
- 检查 `/api/auth/validate` 是否返回 `valid: true`

#### 问题 3: API 返回 500 服务器错误
**现象**: 网络请求返回 500 状态码
**排查**:
- 检查数据库连接是否正常
- 检查服务器控制台是否有错误日志

#### 问题 4: 数据库表不存在
**现象**: 控制台显示表不存在的错误
**解决**: 运行数据库迁移命令
```bash
pnpm db:push:test  # 测试环境
pnpm db:push:prod  # 生产环境
```

#### 问题 5: 新清单创建后无法添加想法 [已修复]
**现象**: 用户创建新清单后，无法为新清单添加想法项目
**原因**: 创建清单成功后没有自动选中新创建的清单，导致 `selectedListId` 为 null
**修复**: 
- 修改 `useIdeaLists` hook 的 `createList` 方法返回新创建清单的ID
- 修改 `IdeaListService.createList` 返回新创建的清单数据
- 修改 `handleCreateList` 在创建成功后自动设置 `selectedListId`
- 确保 `useIdeaItems` hook 在 `selectedListId` 变化时自动刷新

#### 问题 6: 前端状态更新问题
**现象**: 操作成功但界面没有更新
**排查**:
- 检查 Hook 是否正确返回 true
- 检查页面是否正确处理 Hook 的返回值
- 检查是否有 React 状态更新问题

### 5. 快速测试步骤

1. **登录测试**
   - 访问页面
   - 登录账户
   - 确认能看到想法清单界面

2. **创建清单测试**
   - 点击"创建新清单"
   - 填写清单信息
   - 提交并观察控制台日志

3. **创建项目测试**
   - 选择一个清单
   - 点击"添加想法"
   - 填写项目信息
   - 提交并观察控制台日志

### 6. 开发环境检查

确保以下环境正确配置：
- ✅ 数据库连接正常
- ✅ 用户认证模块正常工作
- ✅ API 路由正确配置
- ✅ 想法清单表已创建
- ✅ 用户已登录

## 📞 获取帮助

如果问题仍然存在，请提供以下信息：
1. 浏览器控制台的完整日志
2. 网络请求的详细信息（状态码、响应内容）
3. 具体的错误现象描述
4. 重现问题的步骤 