# 分组导出功能使用指南

## 概述

分组导出功能已成功添加到通用导出模块中，现在您可以通过可视化的配置界面轻松设置数据分组和单元格合并。

## 🎯 主要功能

### 1. 分组配置界面
- ✅ 启用/禁用分组开关
- ✅ 可视化添加分组字段
- ✅ 分组模式选择（合并/分离/嵌套）
- ✅ 值处理方式配置
- ✅ Excel单元格合并开关
- ✅ 分组头显示配置
- ✅ 空值处理策略

### 2. 支持的导出格式
- **Excel** (推荐) - 完整支持单元格合并
- **CSV** - 支持分组显示，空行表示合并
- **JSON** - 支持分组数据结构

### 3. 分组模式
- **合并模式** - 同组数据的分组字段合并显示
- **分离模式** - 每个分组独立显示
- **嵌套模式** - 支持多级分组

## 🚀 快速开始

### 1. 使用配置编辑器

```tsx
import { ExportConfigEditor } from '@/components/UniversalExport';

<ExportConfigEditor
  moduleId="your-module"
  businessId="your-business"
  availableFields={yourFields}
  onSave={handleConfigSave}
  onCancel={() => setShowEditor(false)}
  visible={showEditor}
/>
```

### 2. 配置分组

在配置编辑器中：

1. **启用分组**: 勾选"启用分组"开关
2. **添加分组字段**: 从下拉列表中选择要分组的字段
3. **设置分组模式**: 选择"合并模式"以支持单元格合并
4. **配置合并选项**: 如果是Excel格式，勾选"合并单元格"
5. **保存配置**: 点击"保存配置"按钮

### 3. 执行分组导出

```tsx
import { UniversalExportButton } from '@/components/UniversalExport';

<UniversalExportButton
  exportService={exportService}
  moduleId="your-module"
  availableFields={yourFields}
  dataSource={yourDataSource}
  defaultConfig={yourGroupingConfig}
  onExportSuccess={handleSuccess}
/>
```

## 📋 完整示例

查看 `src/components/UniversalExport/examples/GroupingExportExample.tsx` 中的完整示例，包含：

- 示例数据定义
- 字段配置
- 分组配置
- 完整的UI组件使用

## 🔧 分组配置详解

### 分组字段配置

```typescript
interface GroupingField {
  key: string;                    // 分组字段键名
  label: string;                  // 字段显示名称
  mode: GroupingMode;             // 分组模式
  valueProcessing: GroupValueProcessing; // 值处理方式
  showGroupHeader: boolean;       // 是否显示分组头
  mergeCells: boolean;           // 是否合并单元格
  groupHeaderTemplate?: string;   // 分组头模板
}
```

### 分组配置

```typescript
interface GroupingConfig {
  enabled: boolean;               // 是否启用分组
  fields: GroupingField[];        // 分组字段列表
  preserveOrder: boolean;         // 保持原始顺序
  nullValueHandling: 'skip' | 'group' | 'separate'; // 空值处理
  nullGroupName?: string;         // 空值分组名称
}
```

## 💡 最佳实践

### 1. 选择合适的分组字段
- 选择重复度高的字段进行分组（如用户ID、客户信息）
- 将分组字段放在表格的前几列
- 确保分组字段的数据质量

### 2. 导出格式选择
- **Excel格式** - 获得最佳的分组和合并效果
- **CSV格式** - 适合简单的分组展示
- **JSON格式** - 适合程序化处理

### 3. 分组模式选择
- **合并模式** - 适合需要清晰视觉效果的报表
- **分离模式** - 适合需要添加分组摘要的场景
- **嵌套模式** - 适合多层级的数据结构

## 🔍 常见问题

### Q: CSV导出没有合并单元格效果？
A: CSV格式本身不支持单元格合并，但会将重复的分组字段值设为空，在Excel中打开时有视觉上的分组效果。如需真正的单元格合并，请使用Excel格式。

### Q: 如何设置多级分组？
A: 在分组配置中添加多个分组字段，选择"嵌套模式"，系统会按字段顺序进行多级分组。

### Q: 空值如何处理？
A: 可以选择三种处理方式：
- **跳过空值** - 忽略空值记录
- **空值归为一组** - 所有空值归为一个分组
- **空值单独分组** - 空值单独成组，可自定义组名

## 📊 效果展示

### 原始数据
```
手机号     | QQ号      | 姓名  | 订单ID | 产品
138001     | 123456    | 张三  | 1      | 产品A  
138001     | 123456    | 张三  | 2      | 产品B
138001     | 123456    | 张三  | 3      | 产品C
139001     | 789012    | 李四  | 4      | 产品A
```

### 分组后效果（Excel合并单元格）
```
手机号     | QQ号      | 姓名  | 订单ID | 产品
138001     | 123456    | 张三  | 1      | 产品A  
[合并]     | [合并]    | [合并]| 2      | 产品B
[合并]     | [合并]    | [合并]| 3      | 产品C
139001     | 789012    | 李四  | 4      | 产品A
```

## 🛠️ 技术支持

如遇到问题，请检查：
1. 分组字段是否在已启用的字段列表中
2. 导出格式是否支持所需的分组功能
3. 数据源是否返回正确的数据结构
4. 浏览器控制台是否有错误信息

---

*最后更新时间: 2025年1月2日*
