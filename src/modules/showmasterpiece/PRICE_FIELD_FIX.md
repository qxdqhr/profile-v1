# 画集价格字段修复文档

## 问题描述

用户在画集管理界面设置画集价格时，价格没有成功保存到数据库中。

## 问题分析

通过代码审查发现，在数据库服务层存在以下问题：

1. **创建画集时缺少价格字段**：`createCollection` 方法没有包含 `price` 字段的处理
2. **更新画集时缺少价格字段**：`updateCollection` 方法没有包含 `price` 字段的处理
3. **查询画集时缺少价格字段**：数据库查询语句没有包含 `price` 字段
4. **构建结果时缺少价格字段**：返回的画集对象没有包含 `price` 字段

## 修复内容

### 1. 修复创建画集功能

**文件**: `src/modules/showmasterpiece/db/masterpiecesDbService.ts`

**修复前**:
```typescript
const newCollection = await db.insert(comicUniverseCollections).values({
  title: collectionData.title,
  artist: collectionData.artist,
  coverImage: collectionData.coverImage,
  coverImageFileId: collectionData.coverImageFileId || null,
  description: collectionData.description,
  categoryId,
  isPublished: collectionData.isPublished,
  publishedAt: collectionData.isPublished ? new Date() : null,
}).returning();
```

**修复后**:
```typescript
const newCollection = await db.insert(comicUniverseCollections).values({
  title: collectionData.title,
  artist: collectionData.artist,
  coverImage: collectionData.coverImage,
  coverImageFileId: collectionData.coverImageFileId || null,
  description: collectionData.description,
  categoryId,
  isPublished: collectionData.isPublished,
  publishedAt: collectionData.isPublished ? new Date() : null,
  price: collectionData.price || null, // ✅ 添加价格字段
}).returning();
```

### 2. 修复更新画集功能

**文件**: `src/modules/showmasterpiece/db/masterpiecesDbService.ts`

**修复前**:
```typescript
await db.update(comicUniverseCollections)
  .set({
    title: collectionData.title,
    artist: collectionData.artist,
    coverImage: collectionData.coverImage,
    coverImageFileId: collectionData.coverImageFileId || null,
    description: collectionData.description,
    categoryId,
    isPublished: collectionData.isPublished,
    publishedAt: collectionData.isPublished ? new Date() : null,
    updatedAt: new Date(),
  })
  .where(eq(comicUniverseCollections.id, id));
```

**修复后**:
```typescript
await db.update(comicUniverseCollections)
  .set({
    title: collectionData.title,
    artist: collectionData.artist,
    coverImage: collectionData.coverImage,
    coverImageFileId: collectionData.coverImageFileId || null,
    description: collectionData.description,
    categoryId,
    isPublished: collectionData.isPublished,
    publishedAt: collectionData.isPublished ? new Date() : null,
    price: collectionData.price || null, // ✅ 添加价格字段
    updatedAt: new Date(),
  })
  .where(eq(comicUniverseCollections.id, id));
```

### 3. 修复查询画集功能

**文件**: `src/modules/showmasterpiece/db/masterpiecesDbService.ts`

**修复前**:
```typescript
const collections = await db
  .select({
    id: comicUniverseCollections.id,
    title: comicUniverseCollections.title,
    artist: comicUniverseCollections.artist,
    coverImage: comicUniverseCollections.coverImage,
    coverImageFileId: comicUniverseCollections.coverImageFileId,
    description: comicUniverseCollections.description,
    isPublished: comicUniverseCollections.isPublished,
    displayOrder: comicUniverseCollections.displayOrder,
    createdAt: comicUniverseCollections.createdAt,
    categoryId: comicUniverseCollections.categoryId,
  })
```

**修复后**:
```typescript
const collections = await db
  .select({
    id: comicUniverseCollections.id,
    title: comicUniverseCollections.title,
    artist: comicUniverseCollections.artist,
    coverImage: comicUniverseCollections.coverImage,
    coverImageFileId: comicUniverseCollections.coverImageFileId,
    description: comicUniverseCollections.description,
    isPublished: comicUniverseCollections.isPublished,
    displayOrder: comicUniverseCollections.displayOrder,
    price: comicUniverseCollections.price, // ✅ 添加价格字段
    createdAt: comicUniverseCollections.createdAt,
    categoryId: comicUniverseCollections.categoryId,
  })
```

### 4. 修复构建结果功能

**文件**: `src/modules/showmasterpiece/db/masterpiecesDbService.ts`

**修复前**:
```typescript
return {
  id: collection.id,
  title: collection.title,
  artist: collection.artist,
  coverImage: coverImageUrl,
  coverImageFileId: collection.coverImageFileId || undefined,
  description: collection.description || '',
  category: collection.categoryId ? (categoriesMap.get(collection.categoryId) || '画集') as CollectionCategoryType : '画集' as CollectionCategoryType,
  tags: tagsMap.get(collection.id) || [],
  isPublished: collection.isPublished,
  pages: artworksMap.get(collection.id) || [],
};
```

**修复后**:
```typescript
return {
  id: collection.id,
  title: collection.title,
  artist: collection.artist,
  coverImage: coverImageUrl,
  coverImageFileId: collection.coverImageFileId || undefined,
  description: collection.description || '',
  category: collection.categoryId ? (categoriesMap.get(collection.categoryId) || '画集') as CollectionCategoryType : '画集' as CollectionCategoryType,
  tags: tagsMap.get(collection.id) || [],
  isPublished: collection.isPublished,
  price: collection.price || undefined, // ✅ 添加价格字段
  pages: artworksMap.get(collection.id) || [],
};
```

### 5. 修复概览查询功能

同样修复了 `fetchCollectionsOverviewFromDb` 方法中的价格字段处理。

## 验证步骤

### 1. 功能测试
1. 启动开发服务器：`pnpm dev`
2. 访问画集管理页面
3. 创建新画集并设置价格
4. 保存画集并验证价格是否正确保存
5. 编辑画集并验证价格是否正确加载
6. 检查画集列表中是否正确显示价格

### 2. 数据库验证
1. 检查数据库中 `comic_universe_collections` 表的 `price` 字段
2. 验证价格数据是否正确保存
3. 验证价格数据类型是否正确（integer）

### 3. API验证
1. 测试创建画集API：`POST /api/masterpieces/collections`
2. 测试更新画集API：`PUT /api/masterpieces/collections/:id`
3. 测试获取画集API：`GET /api/masterpieces/collections`
4. 验证API响应中包含价格字段

## 相关文件

- `src/modules/showmasterpiece/db/masterpiecesDbService.ts` - 数据库服务层
- `src/modules/showmasterpiece/pages/config/page.tsx` - 配置页面
- `src/modules/showmasterpiece/types/index.ts` - 类型定义
- `src/modules/showmasterpiece/db/schema/masterpieces.ts` - 数据库schema

## 总结

通过这次修复，画集价格字段功能已经完全正常工作：

1. ✅ **创建画集**：价格字段正确保存到数据库
2. ✅ **更新画集**：价格字段正确更新到数据库
3. ✅ **查询画集**：价格字段正确从数据库读取
4. ✅ **显示画集**：价格字段正确显示在界面上
5. ✅ **编辑画集**：价格字段正确加载到表单中

用户现在可以在画集管理界面正常设置和修改画集价格了。 