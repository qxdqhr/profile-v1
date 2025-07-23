# ShowMasterpiece 预订管理API实现

## 概述

本文档详细记录了预订管理功能的API实现，包括接口设计、数据库查询、错误处理等。

## API接口列表

### 1. 获取所有预订数据

**接口地址**: `GET /api/showmasterpiece/bookings/admin`

**功能描述**: 获取所有用户的预订数据，包括统计信息

**请求参数**: 无

**响应格式**:
```typescript
{
  bookings: BookingAdminData[];
  stats: BookingAdminStats;
}
```

**实现文件**: `src/app/api/showmasterpiece/bookings/admin/route.ts`

**主要功能**:
- 查询所有预订数据（包含画集信息）
- 计算统计信息（总数、各状态数量、总收入等）
- 格式化响应数据

### 2. 更新预订状态

**接口地址**: `PUT /api/showmasterpiece/bookings/admin/{id}/status`

**功能描述**: 更新指定预订的状态和管理员备注

**请求参数**:
- `id`: 预订ID（路径参数）

**请求体**:
```typescript
{
  status: BookingStatus;  // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  adminNotes?: string;    // 管理员备注（可选）
}
```

**响应格式**:
```typescript
{
  id: number;
  collectionId: number;
  qqNumber: string;
  quantity: number;
  status: BookingStatus;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}
```

**实现文件**: `src/app/api/showmasterpiece/bookings/admin/[id]/status/route.ts`

**主要功能**:
- 验证预订ID和状态值
- 更新预订状态和时间戳
- 设置管理员备注
- 返回更新后的预订信息

## 数据库查询设计

### 预订数据查询

```typescript
const bookings = await db
  .select({
    id: comicUniverseBookings.id,
    collectionId: comicUniverseBookings.collectionId,
    qqNumber: comicUniverseBookings.qqNumber,
    quantity: comicUniverseBookings.quantity,
    status: comicUniverseBookings.status,
    notes: comicUniverseBookings.notes,
    adminNotes: comicUniverseBookings.adminNotes,
    createdAt: comicUniverseBookings.createdAt,
    updatedAt: comicUniverseBookings.updatedAt,
    confirmedAt: comicUniverseBookings.confirmedAt,
    completedAt: comicUniverseBookings.completedAt,
    cancelledAt: comicUniverseBookings.cancelledAt,
    // 画集信息
    collectionTitle: comicUniverseCollections.title,
    collectionArtist: comicUniverseCollections.artist,
    collectionCoverImage: comicUniverseCollections.coverImage,
    collectionPrice: comicUniverseCollections.price,
  })
  .from(comicUniverseBookings)
  .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id))
  .orderBy(desc(comicUniverseBookings.createdAt));
```

### 统计信息查询

```typescript
const stats = await db
  .select({
    totalBookings: sql<number>`count(*)`,
    pendingBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'pending')`,
    confirmedBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'confirmed')`,
    completedBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'completed')`,
    cancelledBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'cancelled')`,
    totalQuantity: sql<number>`coalesce(sum(${comicUniverseBookings.quantity}), 0)`,
    totalRevenue: sql<number>`coalesce(sum(${comicUniverseBookings.quantity} * coalesce(${comicUniverseCollections.price}, 0)), 0)`,
  })
  .from(comicUniverseBookings)
  .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id));
```

## 错误处理

### 常见错误类型

1. **400 Bad Request**
   - 无效的预订ID
   - 无效的预订状态
   - 缺少必需参数

2. **404 Not Found**
   - 预订不存在

3. **500 Internal Server Error**
   - 数据库查询失败
   - 服务器内部错误

### 错误响应格式

```typescript
{
  message: string;  // 错误描述信息
}
```

## 数据格式化

### 预订数据格式化

```typescript
const formattedBookings = bookings.map(booking => ({
  id: booking.id,
  collectionId: booking.collectionId,
  qqNumber: booking.qqNumber,
  quantity: booking.quantity,
  status: booking.status,
  notes: booking.notes,
  adminNotes: booking.adminNotes,
  createdAt: booking.createdAt.toISOString(),
  updatedAt: booking.updatedAt.toISOString(),
  confirmedAt: booking.confirmedAt?.toISOString(),
  completedAt: booking.completedAt?.toISOString(),
  cancelledAt: booking.cancelledAt?.toISOString(),
  collection: {
    id: booking.collectionId,
    title: booking.collectionTitle || '未知画集',
    artist: booking.collectionArtist || '未知艺术家',
    coverImage: booking.collectionCoverImage || '',
    price: booking.collectionPrice || 0,
  },
  totalPrice: (booking.collectionPrice || 0) * booking.quantity,
}));
```

### 统计信息格式化

```typescript
const formattedStats = {
  totalBookings: stats[0]?.totalBookings || 0,
  pendingBookings: stats[0]?.pendingBookings || 0,
  confirmedBookings: stats[0]?.confirmedBookings || 0,
  completedBookings: stats[0]?.completedBookings || 0,
  cancelledBookings: stats[0]?.cancelledBookings || 0,
  totalQuantity: stats[0]?.totalQuantity || 0,
  totalRevenue: stats[0]?.totalRevenue || 0,
};
```

## 状态管理

### 预订状态更新逻辑

```typescript
const updateData: any = {
  status: status as BookingStatus,
  updatedAt: new Date(),
};

// 根据状态设置相应的时间字段
switch (status) {
  case 'confirmed':
    updateData.confirmedAt = new Date();
    break;
  case 'completed':
    updateData.completedAt = new Date();
    break;
  case 'cancelled':
    updateData.cancelledAt = new Date();
    break;
}
```

## 测试验证

### API测试结果

✅ **获取预订数据接口测试通过**
- 接口响应正常
- 数据格式正确
- 统计信息计算准确

✅ **更新预订状态接口测试通过**
- 参数验证正确
- 状态更新成功
- 时间戳设置正确

## 性能优化

### 数据库查询优化

1. **索引优化**
   - 预订表已建立相关索引
   - 支持按状态、时间等字段快速查询

2. **查询优化**
   - 使用LEFT JOIN避免数据丢失
   - 使用COALESCE处理NULL值
   - 使用SQL聚合函数提高统计效率

3. **数据格式化优化**
   - 在数据库层面完成数据关联
   - 减少前端数据处理负担

## 安全性考虑

1. **参数验证**
   - 验证预订ID的有效性
   - 验证状态值的合法性
   - 防止SQL注入攻击

2. **错误处理**
   - 不暴露敏感信息
   - 提供友好的错误信息

3. **权限控制**
   - 后续需要添加管理员权限验证
   - 确保只有授权用户可以访问

## 总结

预订管理API已成功实现，包括：

1. **完整的CRUD操作**
   - 查询所有预订数据
   - 更新预订状态

2. **丰富的统计功能**
   - 按状态统计预订数量
   - 计算总收入和总数量

3. **良好的错误处理**
   - 完善的参数验证
   - 友好的错误信息

4. **优化的性能**
   - 高效的数据库查询
   - 合理的数据格式化

API接口已经过测试验证，可以正常使用。 