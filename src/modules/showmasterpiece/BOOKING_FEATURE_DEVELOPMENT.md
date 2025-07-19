# 画集预订功能开发文档

## 功能概述

为画集展览模块添加预订画集功能，用户可以通过悬浮弹窗进入预订页面，查看画集列表并提交预订信息。

## 功能需求

### 1. 预订入口
- 在画集展示页面添加预订按钮
- 使用现有的悬浮弹窗组件（Modal）
- 点击后打开预订画集页面

### 2. 预订页面功能
- 展示画集列表（简略信息，包括价格）
- 用户可以填入QQ号
- 用户可以选择希望预订的画集数量
- 提交预订信息

### 3. 数据库设计
- 新增预订表（comic_universe_bookings）
- 关联画集表
- 记录用户QQ号、预订数量、预订时间等信息

## 实现步骤

### 第一步：数据库设计
1. 创建预订表结构
2. 在画集表中添加价格字段
3. 生成数据库迁移文件

### 第二步：后端API开发
1. 创建预订相关的API路由
2. 实现预订数据的CRUD操作
3. 添加数据验证和错误处理

### 第三步：前端组件开发
1. 创建预订弹窗组件
2. 创建预订页面组件
3. 创建画集列表组件（简略信息展示）

### 第四步：集成和测试
1. 在画集展示页面集成预订功能
2. 测试预订流程
3. 优化用户体验

## 技术栈

- 前端：React + TypeScript + Tailwind CSS
- 后端：Next.js API Routes
- 数据库：PostgreSQL + Drizzle ORM
- 弹窗组件：复用现有的Modal组件

## 文件结构

```
src/modules/showmasterpiece/
├── components/
│   ├── BookingModal.tsx          # 预订弹窗组件
│   ├── BookingPage.tsx           # 预订页面组件
│   └── CollectionList.tsx        # 画集列表组件
├── db/
│   └── schema/
│       └── bookings.ts           # 预订表结构
├── api/
│   └── bookings/
│       ├── route.ts              # 预订API路由
│       └── [id]/
│           └── route.ts          # 单个预订操作
├── services/
│   └── bookingService.ts         # 预订服务
├── types/
│   └── booking.ts                # 预订相关类型
└── hooks/
    └── useBooking.ts             # 预订相关Hook
```

## 开发进度

- [x] 第一步：数据库设计
  - [x] 创建预订表结构
  - [x] 在画集表中添加价格字段
  - [x] 生成数据库迁移文件
- [x] 第二步：后端API开发
  - [x] 创建预订相关的API路由
  - [x] 实现预订数据的CRUD操作
  - [x] 添加数据验证和错误处理
- [x] 第三步：前端组件开发
  - [x] 创建预订弹窗组件
  - [x] 创建预订页面组件
  - [x] 创建画集列表组件（简略信息展示）
- [x] 第四步：集成和测试
  - [x] 在画集展示页面集成预订功能
  - [x] 测试预订流程
  - [x] 优化用户体验

## 功能使用说明

### 1. 用户预订流程

1. **访问画集展览页面**
   - 进入画集展览页面：`/testField/ShowMasterPieces`

2. **点击预订按钮**
   - 在页面顶部找到"预订画集"按钮
   - 点击按钮打开预订弹窗

3. **选择画集**
   - 在弹窗中浏览可预订的画集列表
   - 点击画集卡片进行选择
   - 查看画集信息（标题、艺术家、价格等）

4. **填写预订信息**
   - 输入QQ号（必填，5-11位数字）
   - 选择预订数量（必填，至少1份）
   - 填写备注信息（可选）

5. **提交预订**
   - 点击"提交预订"按钮
   - 系统会验证表单信息
   - 提交成功后显示确认页面

### 2. 管理员功能

#### 查看预订列表
- API端点：`GET /api/showmasterpiece/bookings`
- 支持按画集ID、QQ号、状态等条件筛选
- 支持分页查询

#### 更新预订状态
- API端点：`PUT /api/showmasterpiece/bookings/[id]`
- 可更新状态：pending(待确认)、confirmed(已确认)、completed(已完成)、cancelled(已取消)
- 可添加管理员备注

#### 删除预订
- API端点：`DELETE /api/showmasterpiece/bookings/[id]`

### 3. 数据库表结构

#### comic_universe_bookings (预订表)
- `id`: 主键
- `collection_id`: 画集ID（外键）
- `qq_number`: 用户QQ号
- `quantity`: 预订数量
- `status`: 预订状态
- `notes`: 用户备注
- `admin_notes`: 管理员备注
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `confirmed_at`: 确认时间
- `completed_at`: 完成时间
- `cancelled_at`: 取消时间

#### comic_universe_collections (画集表)
- 新增 `price` 字段：画集价格（单位：元）

### 4. API接口说明

#### 预订相关接口
- `GET /api/showmasterpiece/bookings` - 获取预订列表
- `POST /api/showmasterpiece/bookings` - 创建预订
- `GET /api/showmasterpiece/bookings/[id]` - 获取预订详情
- `PUT /api/showmasterpiece/bookings/[id]` - 更新预订
- `DELETE /api/showmasterpiece/bookings/[id]` - 删除预订
- `GET /api/showmasterpiece/bookings/collections` - 获取可预订画集列表

### 5. 组件使用示例

```tsx
import { BookingModal } from '@/modules/showmasterpiece';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        打开预订
      </button>
      
      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="预订画集"
      />
    </div>
  );
}
```

## 技术特点

1. **模块化设计**
   - 完整的预订功能模块
   - 可复用的组件和服务
   - 清晰的类型定义

2. **用户体验**
   - 步骤式预订流程
   - 响应式设计
   - 实时表单验证
   - 友好的错误提示

3. **数据安全**
   - 服务端数据验证
   - SQL注入防护
   - 输入格式检查

4. **扩展性**
   - 支持多种预订状态
   - 可扩展的字段结构
   - 灵活的查询接口 