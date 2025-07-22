# 画集分类枚举实现文档

## 概述

根据用户需求："对于画集的分类请先设定成两种枚举"画集""商品""，我们实现了画集分类的枚举系统。

## 实现内容

### 1. 类型定义 (`src/modules/showmasterpiece/types/index.ts`)

#### 枚举定义
```typescript
export enum CollectionCategory {
  /** 画集 - 用于展示艺术作品 */
  COLLECTION = '画集',
  /** 商品 - 用于销售的商品 */
  PRODUCT = '商品'
}

export type CollectionCategoryType = `${CollectionCategory}`;
```

#### 工具函数
```typescript
// 获取所有可用分类
export function getAvailableCategories(): CollectionCategoryType[] {
  return Object.values(CollectionCategory);
}

// 验证分类是否有效
export function isValidCategory(category: string): category is CollectionCategoryType {
  return getAvailableCategories().includes(category as CollectionCategoryType);
}

// 获取分类显示名称
export function getCategoryDisplayName(category: CollectionCategoryType): string {
  return category;
}

// 获取分类描述
export function getCategoryDescription(category: CollectionCategoryType): string {
  switch (category) {
    case CollectionCategory.COLLECTION:
      return '用于展示艺术作品';
    case CollectionCategory.PRODUCT:
      return '用于销售的商品';
    default:
      return '未知分类';
  }
}
```

### 2. 接口更新

#### ArtCollection 接口
```typescript
export interface ArtCollection {
  // ... 其他字段
  category: CollectionCategoryType; // 使用枚举类型
  // ... 其他字段
}
```

#### CollectionFormData 接口
```typescript
export interface CollectionFormData {
  // ... 其他字段
  category: CollectionCategoryType; // 使用枚举类型
  // ... 其他字段
}
```

### 3. API 更新 (`src/modules/showmasterpiece/api/categories/route.ts`)

将分类API从数据库查询改为返回预定义的枚举值：

```typescript
import { getAvailableCategories } from '../../types';

export async function GET() {
  try {
    // 返回预定义的分类枚举值
    const categories = getAvailableCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}
```

### 4. 前端UI更新 (`src/modules/showmasterpiece/pages/config/page.tsx`)

#### 表单初始化
```typescript
const [collectionForm, setCollectionForm] = useState<CollectionFormData>({
  // ... 其他字段
  category: CollectionCategory.COLLECTION, // 默认使用"画集"分类
  // ... 其他字段
});
```

#### 编辑处理
```typescript
const handleEditCollection = (collection: any) => {
  setCollectionForm({
    // ... 其他字段
    category: (collection.category as CollectionCategoryType) || CollectionCategory.COLLECTION,
    // ... 其他字段
  });
  // ...
};
```

#### UI组件更新
将分类输入框改为下拉选择框：

```typescript
<div>
  <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
  <select
    value={collectionForm.category}
    onChange={(e) => setCollectionForm(prev => ({ ...prev, category: e.target.value as CollectionCategoryType }))}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    {getAvailableCategories().map((category) => (
      <option key={category} value={category}>
        {getCategoryDisplayName(category)}
      </option>
    ))}
  </select>
</div>
```

## 功能特点

1. **类型安全**: 使用TypeScript枚举确保类型安全
2. **易于扩展**: 通过修改枚举可以轻松添加新分类
3. **统一管理**: 所有分类相关的逻辑都集中在types文件中
4. **用户友好**: 提供清晰的显示名称和描述
5. **向后兼容**: 保持与现有数据库结构的兼容性

## 使用方式

### 前端使用
```typescript
import { CollectionCategory, getAvailableCategories, getCategoryDisplayName } from '../../types';

// 获取所有分类
const categories = getAvailableCategories(); // ['画集', '商品']

// 获取分类显示名称
const displayName = getCategoryDisplayName(CollectionCategory.COLLECTION); // '画集'

// 验证分类
const isValid = isValidCategory('画集'); // true
```

### 数据库存储
分类值直接存储为字符串：
- `'画集'` - 表示艺术作品展示
- `'商品'` - 表示可销售商品

## 后续扩展

如果需要添加新的分类，只需要：

1. 在 `CollectionCategory` 枚举中添加新值
2. 在 `getCategoryDescription` 函数中添加对应的描述
3. 前端UI会自动更新显示新的分类选项

## 总结

通过这次实现，我们成功将画集分类从自由文本输入改为预定义的枚举系统，提供了更好的类型安全性和用户体验。系统现在支持"画集"和"商品"两种分类，并且为未来的扩展提供了良好的基础。 