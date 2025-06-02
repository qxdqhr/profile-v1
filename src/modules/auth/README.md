# Auth 认证模块

这是一个完整的用户认证模块，提供登录、会话管理、权限控制等功能，专为后期封装成库而设计。

## 🚀 功能特性

- ✅ 用户登录/登出
- ✅ 用户注册
- ✅ 登录注册之间的无缝切换
- ✅ 会话管理（基于Cookie）
- ✅ 权限守卫组件
- ✅ 密码加密存储
- ✅ 会话过期管理
- ✅ 完整的TypeScript类型支持
- ✅ 响应式UI设计
- ✅ 开发环境测试账号快速填充
- ✅ **自定义菜单项支持**

## 📁 目录结构

```
src/modules/auth/
├── components/          # React组件
│   ├── AuthGuard.tsx   # 权限守卫组件
│   ├── LoginModal.tsx  # 登录模态框组件
│   └── UserMenu.tsx    # 用户菜单组件
├── hooks/              # React Hooks
│   └── useAuth.ts      # 认证状态管理Hook
├── services/           # 业务服务
│   └── authDbService.ts # 数据库服务
├── utils/              # 工具函数
│   └── authUtils.ts    # 认证相关工具
├── types/              # TypeScript类型定义
│   └── index.ts        # 所有类型定义
├── api/                # API路由处理器
│   ├── login/
│   │   └── route.ts
│   ├── logout/
│   │   └── route.ts
│   └── validate/
│       └── route.ts
├── styles/             # 样式文件
│   ├── LoginModal.module.css
│   └── UserMenu.module.css
├── index.ts            # 模块入口文件
└── README.md           # 文档说明
```

## 🔧 安装使用

### 1. 基础使用

```typescript
import { 
  LoginModal, 
  RegisterModal,
  AuthGuard, 
  UserMenu,
  useAuth,
  authDbService 
} from '@/modules/auth';

// 使用认证Hook
function MyComponent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>欢迎，{user?.name || user?.phone}</h1>
          <button onClick={logout}>登出</button>
        </div>
      ) : (
        <div>请先登录</div>
      )}
    </div>
  );
}

// 使用权限守卫
function ProtectedPage() {
  return (
    <AuthGuard>
      <div>这是受保护的内容</div>
    </AuthGuard>
  );
}

// 使用用户菜单
function Layout() {
  return (
    <header>
      <nav>
        <UserMenu 
          onConfigClick={() => console.log('打开配置')}
          showConfigOption={true}
        />
      </nav>
    </header>
  );
}
```

### 2. 组件说明

#### LoginModal 登录模态框

```typescript
import { LoginModal } from '@/modules/auth';

<LoginModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // 登录成功回调
    console.log('用户登录成功');
  }}
  onSwitchToRegister={() => {
    // 切换到注册页面（可选）
    setShowModal(false);
    setShowRegisterModal(true);
  }}
/>
```

#### RegisterModal 注册模态框

```typescript
import { RegisterModal } from '@/modules/auth';

<RegisterModal
  isOpen={showRegisterModal}
  onClose={() => setShowRegisterModal(false)}
  onSuccess={() => {
    // 注册成功回调
    console.log('用户注册成功');
  }}
  onSwitchToLogin={() => {
    // 切换到登录页面（可选）
    setShowRegisterModal(false);
    setShowModal(true);
  }}
/>
```

**注册功能特性：**
- 📝 手机号 + 密码注册
- 🏷️ 可选用户姓名
- 🔐 密码确认验证
- 🔄 与登录模态框无缝切换
- ✅ 注册成功自动登录
- 🎨 复用登录模态框样式

#### AuthGuard 权限守卫

```typescript
import { AuthGuard } from '@/modules/auth';

// 基础用法
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// 自定义未登录提示
<AuthGuard 
  fallback={<div>请先登录</div>}
  requireAuth={true}
>
  <ProtectedContent />
</AuthGuard>
```

#### UserMenu 用户菜单

```typescript
import { UserMenu, CustomMenuItem } from '@/modules/auth';
import { Settings, Star } from 'lucide-react';

// 定义自定义菜单项
const customMenuItems: CustomMenuItem[] = [
  {
    id: 'settings',
    label: '设置',
    icon: Settings,
    onClick: () => {
      // 处理设置点击
      window.location.href = '/settings';
    },
    requireAuth: true // 只有登录后才显示
  },
  {
    id: 'favorites',
    label: '收藏',
    icon: Star,
    onClick: () => alert('收藏页面'),
    requireAuth: true
  }
];

function App() {
  return (
    <UserMenu 
      customMenuItems={customMenuItems}
      className="my-custom-style"
    />
  );
}
```

**自定义菜单项特性：**
- `requireAuth: true` - 只有登录后才显示
- `requireAuth: false` - 只有未登录才显示  
- 不设置 `requireAuth` - 始终显示
- 支持自定义图标 (lucide-react组件)
- 支持自定义点击处理

### 3. Hook使用

#### useAuth 认证状态管理

```typescript
import { useAuth } from '@/modules/auth';

function Component() {
  const { 
    user,              // 当前用户信息
    loading,           // 加载状态
    isAuthenticated,   // 是否已认证
    logout,            // 登出函数
    refreshUser        // 刷新用户信息
  } = useAuth();
  
  return (
    // JSX...
  );
}
```

### 4. 工具函数

```typescript
import { 
  validateApiAuth,
  validatePhoneNumber,
  validatePassword,
  isAdmin,
  getUserDisplayName 
} from '@/modules/auth';

// API权限验证
export async function GET(request: NextRequest) {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未认证' }, { status: 401 });
  }
  // 处理请求...
}

// 表单验证
const isValidPhone = validatePhoneNumber('13800138000'); // true
const passwordCheck = validatePassword('123456'); // { valid: true }
```

## 🔒 安全特性

### 1. 密码安全
- 使用 bcrypt 进行密码哈希
- Salt rounds: 12
- 不在API响应中返回密码字段

### 2. 会话安全
- HttpOnly Cookie 存储
- 生产环境启用 Secure 标志
- SameSite: 'lax' 防护
- 30天自动过期

### 3. 输入验证
- 手机号格式验证：`/^1[3-9]\d{9}$/`
- 密码长度最少6位
- 前端和后端双重验证

## 🛠️ 开发调试

### 测试账号
模块在开发环境提供快速测试账号：

- **管理员**: 13800138000 / admin123456
- **普通用户**: 13900139000 / test123456

### API 端点

```
POST /api/auth/login     # 用户登录
POST /api/auth/register  # 用户注册
POST /api/auth/logout    # 用户登出
GET  /api/auth/validate  # 验证会话
```

### 日志调试
所有关键步骤都有详细的控制台日志，便于开发调试：

```
🔑 [API/login] 收到登录请求
📝 [API/login] 登录参数: {...}
🔍 [API/login] 开始验证用户密码...
✅ [API/login] 用户验证成功
🎫 [API/login] 创建会话...
```

## 📦 库封装准备

### 依赖要求

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "drizzle-orm": "^0.29.0",
    "bcryptjs": "^2.4.3",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.0.0"
  }
}
```

### 外部依赖
- 数据库连接：`@/db/index`
- 数据库Schema：`@/db/schema/auth`

### 配置要求
- 需要PostgreSQL数据库
- 需要配置环境变量 `NODE_ENV`

## 🔄 迁移指南

### 从原始分散文件迁移到模块化

1. **更新导入路径**：
```typescript
// 旧的导入方式
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/auth/LoginModal';

// 新的导入方式
import { useAuth, LoginModal } from '@/modules/auth';
```

2. **API路由处理**：
```typescript
// 如果需要自定义API路由，可以这样做：
import { POST as authLogin } from '@/modules/auth/api/login/route';
export { authLogin as POST };
```

3. **样式文件**：
样式已整合到模块内部，无需额外配置。

## 📝 更新日志

### v1.0.0
- ✅ 初始版本发布
- ✅ 完整的认证功能
- ✅ 组件化设计
- ✅ TypeScript支持
- ✅ 响应式UI
- ✅ 详细文档

## 🤝 贡献指南

1. 保持代码风格一致
2. 添加完整的TypeScript类型
3. 确保所有功能有单元测试
4. 更新相关文档
5. 遵循语义化版本规范

## 📄 License

MIT License 