# 购物车本地存储迁移文档

## 迁移概述

根据用户反馈，购物车数据不应该上传到服务器，应该是临时的本地数据。因此将购物车功能从服务器数据库存储迁移到浏览器本地存储（localStorage）。

## 迁移时间

**完成时间**: 2024年12月19日

## 迁移原因

### 用户反馈
- 购物车数据应该是临时的本地数据
- 不需要上传到服务器
- 每个用户应该有独立的购物车

### 技术考虑
- 减少服务器负载
- 提高响应速度
- 简化架构
- 更好的用户体验

## 主要变更

### 1. 存储方式变更

#### 迁移前：服务器数据库存储
- 购物车数据存储在PostgreSQL数据库中
- 每次操作都需要与服务器通信
- 支持多设备同步
- 数据持久化

#### 迁移后：本地存储
- 购物车数据存储在浏览器localStorage中
- 操作完全在本地进行，无需网络请求
- 每个用户独立的本地购物车
- 临时数据，浏览器清除后丢失

### 2. 删除的文件

#### API路由文件
- `src/app/api/showmasterpiece/cart/route.ts` - 获取购物车API
- `src/app/api/showmasterpiece/cart/add/route.ts` - 添加商品API
- `src/app/api/showmasterpiece/cart/update/route.ts` - 更新商品API
- `src/app/api/showmasterpiece/cart/remove/route.ts` - 移除商品API
- `src/app/api/showmasterpiece/cart/clear/route.ts` - 清空购物车API
- `src/app/api/showmasterpiece/cart/admin/route.ts` - 购物车管理API

#### 服务文件
- `src/modules/showmasterpiece/services/cartDbService.ts` - 购物车数据库服务
- `src/modules/showmasterpiece/services/cartAdminService.ts` - 购物车管理服务

#### 数据库文件
- `src/modules/showmasterpiece/db/schema/cart.ts` - 购物车数据库表结构

### 3. 修改的文件

#### 购物车服务 (`src/modules/showmasterpiece/services/cartService.ts`)
- 完全重写为本地存储版本
- 使用localStorage存储购物车数据
- 移除所有HTTP请求
- 保留批量预订API调用（这是必要的）

#### 购物车Hook (`src/modules/showmasterpiece/hooks/useCart.ts`)
- 移除定期刷新逻辑
- 更新addItemToCart方法签名
- 保持相同的接口和功能

#### 购物车上下文 (`src/modules/showmasterpiece/contexts/CartContext.tsx`)
- 移除定期刷新逻辑
- 简化状态管理
- 保持事件通知机制

#### 添加到购物车按钮 (`src/modules/showmasterpiece/components/AddToCartButton.tsx`)
- 更新addItemToCart调用方式
- 传递完整的画集信息

## 技术实现

### 1. 本地存储键名
```typescript
const CART_STORAGE_KEY = 'showmasterpiece_cart';
// 实际存储键名: showmasterpiece_cart_{userId}
```

### 2. 数据结构
```typescript
interface Cart {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

interface CartItem {
  collectionId: number;
  collection: ArtCollection;
  quantity: number;
  addedAt: Date;
}
```

### 3. 主要方法
- `getCart(userId)` - 从localStorage获取购物车数据
- `saveCart(userId, cart)` - 保存购物车数据到localStorage
- `addToCart(data)` - 添加商品到购物车
- `updateCartItem(data)` - 更新购物车商品数量
- `removeFromCart(data)` - 从购物车移除商品
- `clearCart(userId)` - 清空购物车

### 4. 数据序列化
- 存储时将Date对象转换为ISO字符串
- 读取时将ISO字符串转换回Date对象
- 处理JSON序列化错误

## 优势

### 1. 性能提升
- 无需网络请求，操作瞬间完成
- 减少服务器负载
- 提高用户体验

### 2. 架构简化
- 移除复杂的数据库操作
- 减少API路由数量
- 简化错误处理

### 3. 用户隐私
- 购物车数据完全本地化
- 不会上传到服务器
- 用户完全控制数据

### 4. 开发效率
- 减少后端开发工作
- 简化测试流程
- 降低维护成本

## 限制

### 1. 数据持久性
- 浏览器清除数据后购物车会丢失
- 不支持多设备同步
- 无法备份购物车数据

### 2. 存储限制
- localStorage有大小限制（通常5-10MB）
- 不支持复杂查询
- 无法进行数据分析

### 3. 安全性
- 本地数据可能被用户修改
- 无法进行服务器端验证
- 不支持权限控制

## 使用方式

### 1. 基本使用
```typescript
import { useCart } from '@/modules/showmasterpiece';

const { cart, addItemToCart, updateItemQuantity } = useCart(userId);

// 添加商品
await addItemToCart({
  userId,
  collectionId: 1,
  quantity: 2,
  collection: collectionData
});

// 更新数量
await updateItemQuantity(1, 3);
```

### 2. 组件使用
```tsx
import { AddToCartButton } from '@/modules/showmasterpiece';

<AddToCartButton
  collection={collection}
  userId={userId}
  size="md"
  showQuantitySelector={false}
/>
```

### 3. 上下文使用
```tsx
import { CartProvider, useCartContext } from '@/modules/showmasterpiece';

<CartProvider userId={userId}>
  <YourComponent />
</CartProvider>

// 在组件中使用
const { cart, refreshCart } = useCartContext();
```

## 注意事项

### 1. 用户ID
- 购物车仍然需要用户ID来区分不同用户
- 每个用户有独立的localStorage键
- 用户ID变化时购物车数据会切换

### 2. 画集信息
- 添加商品时需要传递完整的画集信息
- 本地存储包含画集的基本信息
- 确保画集信息的准确性

### 3. 错误处理
- localStorage可能不可用（隐私模式）
- 处理存储空间不足的情况
- 处理数据格式错误

### 4. 兼容性
- 保持与现有组件的兼容性
- 保持相同的API接口
- 确保功能完整性

## 测试建议

### 1. 功能测试
- 添加商品到购物车
- 更新商品数量
- 移除商品
- 清空购物车
- 批量预订

### 2. 边界测试
- localStorage不可用的情况
- 存储空间不足
- 数据格式错误
- 用户ID变化

### 3. 性能测试
- 大量商品的处理
- 频繁操作的影响
- 内存使用情况

## 总结

购物车功能已成功从服务器存储迁移到本地存储，实现了：

1. **性能提升** - 操作瞬间完成，无需网络请求
2. **架构简化** - 移除复杂的数据库操作和API路由
3. **用户隐私** - 购物车数据完全本地化
4. **开发效率** - 减少后端开发和维护工作

虽然失去了一些功能（如多设备同步、数据持久化），但获得了更好的性能和用户体验，符合用户对购物车作为临时本地数据的需求。 