# 通用CSV导出模块

## 概述

通用CSV导出模块是一个可配置的、可扩展的数据导出解决方案，支持多种导出格式和自定义字段配置。该模块参考了通用文件上传模块的设计模式，提供了统一的导出服务接口和可视化配置工具。

## 功能特性

### 🎯 核心功能
- **多格式支持**: CSV、JSON、Excel（完整支持）
- **字段配置**: 可视化字段选择和排序
- **格式化器**: 内置多种数据格式化器
- **分组导出**: 支持按列分组并合并单元格
- **进度跟踪**: 实时导出进度显示
- **错误处理**: 完善的错误处理和用户反馈

### 🔧 配置化导出
- **字段选择**: 支持启用/禁用特定字段
- **字段排序**: 拖拽调整字段顺序
- **对齐方式**: 支持左对齐、居中、右对齐
- **格式化**: 自定义字段格式化规则
- **文件名模板**: 支持变量替换的文件名

### 📊 分组功能
- **单列分组**: 按单个字段分组数据
- **多级分组**: 支持多层级嵌套分组
- **合并单元格**: Excel格式支持单元格合并
- **分组模式**: 合并模式、分离模式、嵌套模式
- **分组头**: 可选的分组标题行
- **空值处理**: 灵活的空值分组策略

### 🎨 用户界面
- **配置编辑器**: 可视化的导出配置编辑界面
- **导出按钮**: 统一的导出入口组件
- **进度显示**: 实时导出进度和状态
- **响应式设计**: 适配桌面端和移动端

## 模块结构

```
src/services/universalExport/
├── types/
│   └── index.ts              # 类型定义
├── UniversalExportService.ts # 核心服务类
└── index.ts                  # 模块入口

src/components/UniversalExport/
├── ExportConfigEditor.tsx    # 配置编辑器组件
├── UniversalExportButton.tsx # 导出按钮组件
└── index.ts                  # 组件入口
```

## 快速开始

### 1. 导入模块

```typescript
import { UniversalExportService } from '@/services/universalExport';
import { UniversalExportButton } from '@/components/UniversalExport';
```

### 2. 定义字段配置

```typescript
import type { ExportField, GroupingConfig } from '@/services/universalExport';

const EXPORT_FIELDS: ExportField[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'number',
    enabled: true,
    alignment: 'center',
  },
  {
    key: 'name',
    label: '名称',
    type: 'string',
    enabled: true,
    alignment: 'left',
  },
  {
    key: 'price',
    label: '价格',
    type: 'number',
    enabled: true,
    alignment: 'right',
    formatter: (value) => `¥${Number(value).toFixed(2)}`,
  },
  {
    key: 'createdAt',
    label: '创建时间',
    type: 'date',
    enabled: true,
    alignment: 'center',
    formatter: (value) => new Date(value).toLocaleString('zh-CN'),
  },
];
```

### 3. 使用导出按钮

```typescript
import { UniversalExportService } from '@/services/universalExport';
import { UniversalExportButton } from '@/components/UniversalExport';

const MyComponent = () => {
  const exportService = new UniversalExportService();
  
  const dataSource = async () => {
    // 返回要导出的数据
    return await fetchMyData();
  };

  return (
    <UniversalExportButton
      exportService={exportService}
      moduleId="my-module"
      businessId="my-business"
      availableFields={EXPORT_FIELDS}
      dataSource={dataSource}
      buttonText="导出数据"
      onExportSuccess={(result) => {
        console.log('导出成功:', result);
      }}
      onExportError={(error) => {
        console.error('导出失败:', error);
      }}
    />
  );
};
```

## API 参考

### UniversalExportService

#### 构造函数
```typescript
new UniversalExportService(config?: Partial<UniversalExportServiceConfig>)
```

#### 主要方法

##### createConfig(config)
创建导出配置
```typescript
const config = await exportService.createConfig({
  name: '我的导出配置',
  format: 'csv',
  fields: EXPORT_FIELDS,
  // ... 其他配置
});
```

##### export(request)
执行导出
```typescript
const result = await exportService.export({
  configId: 'config-id',
  dataSource: async () => [...],
  callbacks: {
    onProgress: (progress) => console.log('进度:', progress),
    onSuccess: (result) => console.log('成功:', result),
    onError: (error) => console.error('错误:', error),
  },
});
```

### UniversalExportButton

#### Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| exportService | UniversalExportService | ✅ | 导出服务实例 |
| moduleId | string | ✅ | 模块标识 |
| businessId | string | ❌ | 业务标识 |
| availableFields | ExportField[] | ✅ | 可用字段定义 |
| dataSource | () => Promise<any[]> | ✅ | 数据源函数 |
| defaultConfig | ExportConfig | ❌ | 默认配置 |
| buttonText | string | ❌ | 按钮文本 |
| variant | 'primary' \| 'secondary' \| 'outline' | ❌ | 按钮样式 |
| size | 'sm' \| 'md' \| 'lg' | ❌ | 按钮大小 |
| disabled | boolean | ❌ | 是否禁用 |
| onExportSuccess | (result: ExportResult) => void | ❌ | 导出成功回调 |
| onExportError | (error: string) => void | ❌ | 导出失败回调 |

### ExportConfigEditor

#### Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| initialConfig | ExportConfig | ❌ | 初始配置 |
| moduleId | string | ✅ | 模块标识 |
| businessId | string | ❌ | 业务标识 |
| availableFields | ExportField[] | ✅ | 可用字段定义 |
| onSave | (config: ExportConfig) => void | ❌ | 保存配置回调 |
| onCancel | () => void | ❌ | 取消回调 |
| visible | boolean | ❌ | 是否显示 |

## 内置格式化器

### 日期格式化
```typescript
// 日期格式化
date: (value) => new Date(value).toISOString().split('T')[0]

// 时间格式化
datetime: (value) => new Date(value).toLocaleString('zh-CN')
```

### 数字格式化
```typescript
// 数字格式化
number: (value) => String(value)

// 货币格式化
currency: (value) => `¥${Number(value).toFixed(2)}`

// 百分比格式化
percentage: (value) => `${(Number(value) * 100).toFixed(2)}%`
```

### 其他格式化
```typescript
// 布尔值格式化
boolean: (value) => value ? '是' : '否'

// 数组格式化
array: (value) => Array.isArray(value) ? value.join(', ') : ''

// 对象格式化
object: (value) => JSON.stringify(value)
```

## 使用示例

### ShowMasterpiece 模块集成

```typescript
// 1. 定义字段配置
export const BOOKING_EXPORT_FIELDS: ExportField[] = [
  {
    key: 'id',
    label: '预订ID',
    type: 'number',
    enabled: true,
    alignment: 'center',
  },
  {
    key: 'qqNumber',
    label: 'QQ号',
    type: 'string',
    enabled: true,
    alignment: 'left',
  },
  // ... 更多字段
];

// 2. 在组件中使用
const BookingAdminPanel = () => {
  const exportService = new UniversalExportService();
  
  const dataSource = async () => {
    return bookings.map(booking => ({
      id: booking.id,
      qqNumber: booking.qqNumber,
      // ... 映射其他字段
    }));
  };

  return (
    <UniversalExportButton
      exportService={exportService}
      moduleId="showmasterpiece"
      businessId="bookings"
      availableFields={BOOKING_EXPORT_FIELDS}
      dataSource={dataSource}
      buttonText="导出预订数据"
    />
  );
};
```

## 高级功能

### 自定义格式化器
```typescript
const customFormatter = (value: any) => {
  // 自定义格式化逻辑
  return `自定义格式: ${value}`;
};

const field: ExportField = {
  key: 'custom',
  label: '自定义字段',
  type: 'string',
  enabled: true,
  formatter: customFormatter,
};
```

### 过滤和排序
```typescript
const request: ExportRequest = {
  configId: 'config-id',
  dataSource: async () => [...],
  filters: [
    { field: 'status', operator: 'eq', value: 'active' },
    { field: 'price', operator: 'gte', value: 100 },
  ],
  sortBy: [
    { field: 'createdAt', direction: 'desc' },
    { field: 'name', direction: 'asc' },
  ],
};
```

### 事件监听
```typescript
exportService.addEventListener('export:start', (event) => {
  console.log('导出开始:', event);
});

exportService.addEventListener('export:progress', (event) => {
  console.log('导出进度:', event);
});

exportService.addEventListener('export:complete', (event) => {
  console.log('导出完成:', event);
});
```

## 最佳实践

### 1. 字段配置
- 为每个字段提供清晰的描述
- 合理设置字段的对齐方式
- 使用适当的格式化器

### 2. 性能优化
- 对于大数据量，考虑分页导出
- 使用适当的数据过滤减少导出量
- 缓存导出配置避免重复创建

### 3. 用户体验
- 提供清晰的进度反馈
- 处理导出错误并给出友好提示
- 支持取消长时间运行的导出

### 4. 扩展性
- 为不同业务场景创建专门的字段配置
- 利用事件系统集成到现有工作流
- 支持自定义格式化器满足特殊需求

## 故障排除

### 常见问题

1. **导出失败**
   - 检查数据源函数是否正确返回数据
   - 确认字段配置与数据结构匹配
   - 查看控制台错误信息

2. **字段显示异常**
   - 检查字段的 key 是否与数据属性匹配
   - 确认格式化器函数是否正确
   - 验证字段类型设置

3. **性能问题**
   - 考虑分页处理大数据量
   - 优化数据源函数
   - 使用适当的过滤条件

## 分组导出功能

### 概述

分组导出功能允许按某一列或多列对数据进行分组，并在Excel格式中支持单元格合并，实现更清晰的数据展示效果。

### 分组配置

```typescript
const groupingConfig: GroupingConfig = {
  enabled: true,
  fields: [
    {
      key: 'customerPhone',          // 分组字段
      label: '客户手机号',           // 字段标签
      mode: 'merge',                 // 分组模式：merge|separate|nested
      valueProcessing: 'first',     // 值处理：first|last|concat|sum|count|custom
      showGroupHeader: false,       // 是否显示分组头
      mergeCells: true              // 是否合并单元格（Excel）
    }
  ],
  preserveOrder: true,              // 保持原始顺序
  nullValueHandling: 'separate',    // 空值处理：skip|group|separate
  nullGroupName: '未知客户'         // 空值分组名称
};
```

### 分组模式说明

#### 1. 合并模式 (merge)
同一分组的第一行显示分组值，其他行该字段为空，支持单元格合并。

```typescript
// 原始数据：
[
  { phone: '138001', name: '张三', product: '产品A' },
  { phone: '138001', name: '张三', product: '产品B' },
  { phone: '139001', name: '李四', product: '产品C' }
]

// 分组后效果：
[
  { phone: '138001', name: '张三', product: '产品A' }, // 第一行显示完整信息
  { phone: '',       name: '',     product: '产品B' }, // 分组字段为空
  { phone: '139001', name: '李四', product: '产品C' }
]
```

#### 2. 分离模式 (separate)
每个分组独立显示，可添加分组头行。

#### 3. 嵌套模式 (nested)
支持多级分组，递归处理子分组。

### 使用示例

```typescript
import { UniversalExportService } from '@/services/universalExport';
import type { ExportConfig, GroupingConfig } from '@/services/universalExport';

// 1. 定义分组配置
const groupingConfig: GroupingConfig = {
  enabled: true,
  fields: [
    {
      key: 'customerPhone',
      label: '客户手机号',
      mode: 'merge',
      valueProcessing: 'first',
      showGroupHeader: false,
      mergeCells: true
    }
  ],
  preserveOrder: true,
  nullValueHandling: 'separate'
};

// 2. 创建导出配置
const exportConfig: ExportConfig = {
  id: 'order-export-grouped',
  name: '订单导出（分组）',
  format: 'excel',                    // Excel支持单元格合并
  fields: exportFields,
  grouping: groupingConfig,           // 应用分组配置
  fileNameTemplate: '订单导出_分组_{date}',
  includeHeader: true,
  delimiter: ',',
  encoding: 'utf-8',
  addBOM: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  moduleId: 'order-management'
};

// 3. 执行分组导出
const exportService = new UniversalExportService();

await exportService.export({
  configId: exportConfig,
  dataSource: async () => orderData,
  callbacks: {
    onProgress: (progress) => {
      console.log(`导出进度: ${progress.progress}%`);
    },
    onSuccess: (result) => {
      console.log('分组导出成功:', result.fileName);
      // 下载文件
      const url = URL.createObjectURL(result.fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  }
});
```

### 多级分组示例

```typescript
// 按客户手机号 + QQ号分组
const multiLevelGrouping: GroupingConfig = {
  enabled: true,
  fields: [
    {
      key: 'customerPhone',
      label: '客户手机号',
      mode: 'merge',
      valueProcessing: 'first',
      mergeCells: true
    },
    {
      key: 'customerQQ',
      label: '客户QQ号',
      mode: 'merge',
      valueProcessing: 'first',
      mergeCells: true
    }
  ],
  preserveOrder: true,
  nullValueHandling: 'separate'
};
```

### 最佳实践

1. **Excel格式优先**: 分组功能在Excel格式中效果最佳，支持单元格合并
2. **合理选择分组字段**: 选择重复度高的字段进行分组，如用户ID、订单号等
3. **字段顺序**: 将分组字段放在表格的前几列，便于视觉识别
4. **数据预处理**: 确保分组字段的数据质量，避免因空值或格式问题影响分组效果

### 完整示例

参考 `src/services/universalExport/examples/grouping-example.ts` 文件中的详细示例，包含：
- 基本分组导出
- 多级分组导出
- 动态分组配置
- 大数据量测试

## 更新日志

### v1.1.0
- 新增分组导出功能
- 支持Excel单元格合并
- 支持多级嵌套分组
- 新增分组模式配置

### v1.0.0
- 初始版本发布
- 支持 CSV 和 JSON 格式导出
- 提供可视化配置编辑器
- 内置多种格式化器
- 支持进度跟踪和事件监听 