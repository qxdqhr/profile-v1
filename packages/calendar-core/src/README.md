# 📅 日历模块 (Calendar Module)

一个功能完整的日历应用模块，支持事件管理、提醒、重复事件等功能。

## ✨ 功能特性

### 🎯 核心功能
- **完整的事件管理**：创建、编辑、删除事件
- **多种日历视图**：月视图、周视图、日视图、议程视图
- **重复事件支持**：日/周/月/年重复，自定义重复规则
- **智能提醒**：邮件、通知、短信多种提醒方式
- **响应式设计**：完美适配桌面端和移动端

### 🛠 技术特性
- **TypeScript严格类型**：完整的类型定义和类型安全
- **模块化架构**：前后端分离，易于维护和扩展
- **数据库驱动**：使用Drizzle ORM + PostgreSQL
- **现代UI**：基于TailwindCSS的现代化设计
- **组件复用**：通用Modal组件复用，保持设计一致性

## 📁 项目结构

```
src/modules/calendar/
├── api/                    # 后端API路由
│   ├── events/
│   │   ├── route.ts       # 事件列表API
│   │   └── [id]/route.ts  # 单个事件API
│   └── config/route.ts    # 配置API
├── components/             # 前端组件
│   ├── EventForm.tsx      # 事件表单
│   └── EventModal.tsx     # 事件弹窗 ✅ 新增
├── pages/                  # 页面组件
│   └── CalendarPage.tsx   # 主日历页面
├── hooks/                  # 自定义Hook
│   └── useEvents.ts       # 事件管理Hook ✅ 新增
├── db/                     # 数据库层
│   ├── schema.ts          # 数据库表结构
│   └── calendarDbService.ts # 数据库服务
├── types/                  # 类型定义
│   └── index.ts           # 所有类型定义
├── utils/                  # 工具函数
│   └── dateUtils.ts       # 日期工具函数
├── DEVELOPMENT.md          # 开发文档
├── README.md              # 使用说明
├── index.ts               # 客户端导出
└── server.ts              # 服务端导出
```

## 🚀 快速开始

### 1. 基础使用

```typescript
// 导入日历页面
import { CalendarPage } from '@/modules/calendar';

// 在页面中使用
export default function MyCalendarPage() {
  return <CalendarPage />;
}
```

### 2. 使用事件管理Hook

```typescript
import { useEvents } from '@/modules/calendar';

function MyComponent() {
  const { 
    events, 
    loading, 
    error, 
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useEvents();

  const handleCreateEvent = async () => {
    await createEvent({
      title: '新事件',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // 1小时后
      allDay: false,
      color: '#3B82F6'
    });
  };

  return (
    <div>
      {loading && <div>加载中...</div>}
      {error && <div>错误: {error}</div>}
      <button onClick={handleCreateEvent}>创建事件</button>
    </div>
  );
}
```

### 3. 使用事件弹窗组件

```typescript
import { EventModal } from '@/modules/calendar';
import { useState } from 'react';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveEvent = async (eventData) => {
    // 处理事件保存逻辑
    console.log('保存事件:', eventData);
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        创建事件
      </button>
      
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={new Date()}
      />
    </>
  );
}
```

### 4. 自定义日历配置

```typescript
import { CalendarViewType, EventColor } from '@/modules/calendar';

const calendarConfig = {
  defaultView: CalendarViewType.MONTH,
  defaultEventColor: EventColor.BLUE,
  workingHours: {
    start: '09:00',
    end: '18:00'
  },
  firstDayOfWeek: 1, // 0=周日, 1=周一
  timeZone: 'Asia/Shanghai'
};
```

## 🛠 API接口

### 事件管理API

```typescript
// 获取事件列表
GET /api/calendar/events?startDate=2024-01-01&endDate=2024-01-31

// 创建事件
POST /api/calendar/events
{
  "title": "会议",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T10:00:00Z",
  "allDay": false,
  "location": "会议室A",
  "color": "#3B82F6"
}

// 更新事件
PUT /api/calendar/events/123
{
  "title": "更新的会议标题"
}

// 删除事件
DELETE /api/calendar/events/123
```

### 配置管理API

```typescript
// 获取用户配置
GET /api/calendar/config

// 更新用户配置
PUT /api/calendar/config
{
  "workingHours": {
    "start": "08:00",
    "end": "17:00"
  },
  "timeZone": "Asia/Shanghai",
  "defaultView": "month"
}
```

## 📊 数据库表结构

### calendar_events 事件表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| title | varchar(255) | 事件标题 |
| description | text | 事件描述 |
| start_time | timestamp | 开始时间 |
| end_time | timestamp | 结束时间 |
| all_day | boolean | 是否全天事件 |
| location | varchar(255) | 地点 |
| color | varchar(7) | 颜色代码 |
| user_id | integer | 用户ID |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### recurrence_rules 重复规则表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| event_id | integer | 关联事件ID |
| rule_type | enum | 重复类型 |
| interval | integer | 重复间隔 |
| end_date | timestamp | 结束日期 |
| count | integer | 重复次数 |

### reminders 提醒表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| event_id | integer | 关联事件ID |
| reminder_time | timestamp | 提醒时间 |
| reminder_type | enum | 提醒类型 |
| status | enum | 提醒状态 |

## 🎨 样式自定义

日历模块使用TailwindCSS构建，支持完全的样式自定义：

```typescript
// 自定义事件颜色
const customEventColors = {
  work: '#3B82F6',      // 蓝色 - 工作
  personal: '#10B981',  // 绿色 - 个人
  meeting: '#8B5CF6',   // 紫色 - 会议
  urgent: '#EF4444',    // 红色 - 紧急
  reminder: '#F59E0B'   // 黄色 - 提醒
};

// 自定义日历主题
const calendarTheme = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-800',
  accent: 'bg-blue-50 border-blue-200',
  today: 'bg-blue-600 text-white rounded-full'
};
```

## 🧪 在实验田中测试

日历模块已集成到实验田系统中，可以通过以下方式访问：

1. **直接访问**：`/testField/calendar`
2. **实验田首页**：在实用工具分类中找到"日历管理"

### 当前功能状态
- ✅ 基础日历视图
- ✅ 事件创建弹窗
- ✅ 日期导航
- ✅ 响应式设计
- ✅ 数据库集成
- ✅ API接口
- 🚧 事件编辑功能（开发中）
- 🚧 重复事件（开发中）
- 🚧 提醒功能（开发中）

## 🤝 贡献指南

1. **开发环境设置**
   ```bash
   # 推送数据库变更
   pnpm devdb:push
   
   # 启动开发服务器
   pnpm dev
   ```

2. **开发规范**
   - 遵循模块化架构设计
   - 使用TypeScript严格类型
   - 编写单元测试
   - 保持代码风格一致

3. **提交代码**
   - 确保类型检查通过
   - 更新相关文档
   - 测试功能完整性

## 📄 许可证

本项目基于 MIT 许可证开源。

---

**开发状态**: 🚧 积极开发中  
**版本**: v1.0.0  
**最后更新**: 2024年12月  

如有问题或建议，请在项目仓库中提交Issue。 