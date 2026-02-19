# 实验田模块 (TestField Module)

实验田模块是一个用于展示和管理各种实验性功能和项目的模块化系统。

## 📁 目录结构

```
src/modules/testField/
├── components/          # 组件目录
├── pages/              # 页面组件
│   └── TestFieldPage.tsx
├── types/              # 类型定义
│   └── index.ts
├── utils/              # 工具函数和数据
│   ├── index.ts        # 工具函数
│   └── experimentData.ts # 实验项目数据
├── api/                # API相关 (预留)
├── index.ts            # 模块入口
└── README.md          # 文档
```

## 🚀 快速开始

### 基本使用

```tsx
import { TestFieldPage } from '@/modules/testField';

export default function Page() {
  return <TestFieldPage />;
}
```

### 使用工具函数

```tsx
import { 
  filterExperiments, 
  sortExperiments, 
  experiments 
} from '@/modules/testField';

// 过滤实验项目
const filteredExperiments = filterExperiments(experiments, {
  viewMode: 'utility',
  searchQuery: '考试',
  showCompleted: true
});

// 排序实验项目
const sortedExperiments = sortExperiments(
  filteredExperiments, 
  'title', 
  'asc'
);
```

## 📋 类型定义

### ExperimentItem

```tsx
interface ExperimentItem {
  id: string;                    // 项目唯一标识
  title: string;                 // 项目标题
  description: string;           // 项目描述
  path: string;                  // 项目路径
  tags: string[];               // 项目标签
  category: ExperimentCategory; // 项目类别
  isCompleted?: boolean;        // 是否已完成
  createdAt?: string;           // 创建时间
  updatedAt?: string;           // 更新时间
}
```

### ExperimentCategory

```tsx
type ExperimentCategory = 'utility' | 'leisure';
```

### ViewMode

```tsx
type ViewMode = 'all' | 'utility' | 'leisure';
```

### TestFieldConfig

```tsx
interface TestFieldConfig {
  viewMode: ViewMode;           // 当前视图模式
  searchQuery: string;          // 搜索查询
  showCompleted: boolean;       // 是否显示已完成项目
  sortBy: 'title' | 'category' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';   // 排序方向
}
```

## 🛠 工具函数

### filterExperiments

过滤实验项目列表。

```tsx
function filterExperiments(
  experiments: ExperimentItem[],
  config: Partial<TestFieldConfig>
): ExperimentItem[]
```

### sortExperiments

排序实验项目列表。

```tsx
function sortExperiments(
  experiments: ExperimentItem[],
  sortBy?: TestFieldConfig['sortBy'],
  sortOrder?: TestFieldConfig['sortOrder']
): ExperimentItem[]
```

### getExperimentCounts

获取实验项目统计数据。

```tsx
function getExperimentCounts(experiments: ExperimentItem[]): {
  all: number;
  utility: number;
  leisure: number;
  completed: number;
  inProgress: number;
}
```

### getAllTags

获取所有标签列表。

```tsx
function getAllTags(experiments: ExperimentItem[]): string[]
```

### getCategoryDisplayName

获取类别显示名称。

```tsx
function getCategoryDisplayName(category: ViewMode): string
```

### getCategoryColor

获取类别对应的Tailwind CSS类名。

```tsx
function getCategoryColor(category: ExperimentItem['category']): string
```

### validateExperiment

验证实验项目数据的完整性。

```tsx
function validateExperiment(experiment: Partial<ExperimentItem>): boolean
```

## 📝 数据管理

### 添加新的实验项目

编辑 `utils/experimentData.ts` 文件：

```tsx
export const experiments: ExperimentItem[] = [
  // 现有项目...
  {
    id: 'new-experiment',
    title: '新实验项目',
    description: '项目描述',
    path: '/testField/newExperiment',
    tags: ['标签1', '标签2'],
    category: 'utility',
    isCompleted: false
  }
];
```

### 项目分类说明

- **utility**: 实用工具类 - 具有实际应用价值的功能
- **leisure**: 休闲娱乐类 - 游戏、娱乐相关的功能

## 🎨 组件特性

### TestFieldPage

主要特性：
- ✅ 响应式设计
- ✅ 搜索功能
- ✅ 分类筛选
- ✅ 项目统计
- ✅ 空状态处理
- ✅ 加载状态
- ✅ URL参数支持

### 支持的URL参数

- `mode`: 视图模式 (`all` | `utility` | `leisure`)

示例：`/testField?mode=utility`

## 🔧 扩展指南

### 添加新的组件

在 `components/` 目录下创建新组件：

```tsx
// components/ExperimentFilter.tsx
export interface ExperimentFilterProps {
  // 组件属性
}

export default function ExperimentFilter() {
  // 组件实现
}
```

### 添加新的工具函数

在 `utils/index.ts` 中添加：

```tsx
export function newUtilityFunction() {
  // 函数实现
}
```

### 添加API集成

在 `api/` 目录下添加API相关代码：

```tsx
// api/experimentsApi.ts
export async function fetchExperiments() {
  // API调用实现
}
```

## 📦 依赖关系

### 外部依赖
- React 18+
- Next.js 13+
- Tailwind CSS

### 内部依赖
- `@sa2kit/components/BackButton`
- `@sa2kit/components/ExperimentCard`

## 🚀 性能优化

- 使用 `React.Suspense` 处理异步加载
- 实验项目数据本地缓存
- 搜索防抖优化 (可扩展)
- 虚拟滚动 (大数据量时可扩展)

## 🔄 迁移说明

### 从旧版本迁移

1. 将原 `src/app/(pages)/testField/page.tsx` 替换为新的模块引用
2. 更新相关导入路径
3. 验证功能正常

### 路径映射

- 旧: `src/app/(pages)/testField/page.tsx`
- 新: `src/modules/testField/pages/TestFieldPage.tsx`

## 📄 许可证

与主项目保持一致。