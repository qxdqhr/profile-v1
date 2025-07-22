# ShowMasterpiece 购物车功能

## 功能概述

购物车功能允许用户同时预订多个画集，提供更好的用户体验。用户可以将多个画集添加到购物车，然后一次性提交批量预订。**购物车数据完全存储在数据库中，确保数据持久化和多设备同步。**

## 主要功能

### 1. 添加到购物车
- 在画集卡片上点击"加入购物车"按钮
- 支持数量选择（可选）
- 自动合并相同画集的数量

### 2. 购物车管理
- 查看购物车中的商品列表
- 调整商品数量
- 移除单个商品
- 清空整个购物车

### 3. 批量预订
- 一次性预订购物车中的所有画集
- 统一的QQ号和备注信息
- 批量处理结果反馈

## 技术实现

### 数据库存储

购物车数据完全存储在PostgreSQL数据库中，包含以下表结构：

#### 购物车表 (comic_universe_carts)
- `id`: 购物车ID
- `userId`: 用户ID
- `status`: 购物车状态 (active/abandoned/converted)
- `isExpired`: 是否过期
- `expiresAt`: 过期时间
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

#### 购物车项表 (comic_universe_cart_items)
- `id`: 购物车项ID
- `cartId`: 购物车ID
- `collectionId`: 画集ID
- `quantity`: 商品数量
- `addedAt`: 添加时间
- `updatedAt`: 更新时间

### 前端组件

#### CartButton
购物车按钮组件，显示购物车图标和商品数量徽章。

```tsx
import { CartButton } from '@/modules/showmasterpiece';

<CartButton 
  onClick={handleCartClick}
  showBadge={true}
/>
```

#### AddToCartButton
添加到购物车按钮组件，用于画集卡片。

```tsx
import { AddToCartButton } from '@/modules/showmasterpiece';

<AddToCartButton
  collection={collection}
  size="sm"
  showQuantitySelector={false}
/>
```

#### CartModal
购物车弹窗组件，包含完整的购物车功能。

```tsx
import { CartModal } from '@/modules/showmasterpiece';

<CartModal
  isOpen={isCartOpen}
  onClose={handleCloseCart}
  title="购物车"
/>
```

### Hook

#### useCart
购物车状态管理Hook，提供所有购物车相关的操作。

```tsx
import { useCart } from '@/modules/showmasterpiece';

const {
  cart,
  loading,
  error,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCartItems,
  checkoutCart,
  openCart,
  closeCart,
} = useCart(userId); // 需要传入用户ID
```

### API接口

#### 获取购物车
```
GET /api/showmasterpiece/cart?userId={userId}
```

响应：
```json
{
  "id": 1,
  "items": [
    {
      "collectionId": 1,
      "collection": { /* 画集信息 */ },
      "quantity": 2,
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalQuantity": 2,
  "totalPrice": 0
}
```

#### 添加商品到购物车
```
POST /api/showmasterpiece/cart/add
```

请求体：
```json
{
  "userId": 1,
  "collectionId": 1,
  "quantity": 1
}
```

#### 更新购物车商品数量
```
PUT /api/showmasterpiece/cart/update
```

请求体：
```json
{
  "userId": 1,
  "collectionId": 1,
  "quantity": 3
}
```

#### 从购物车移除商品
```
DELETE /api/showmasterpiece/cart/remove
```

请求体：
```json
{
  "userId": 1,
  "collectionId": 1
}
```

#### 清空购物车
```
DELETE /api/showmasterpiece/cart/clear
```

请求体：
```json
{
  "userId": 1
}
```

#### 批量预订
```
POST /api/showmasterpiece/bookings/batch
```

请求体：
```json
{
  "qqNumber": "123456789",
  "items": [
    {
      "collectionId": 1,
      "quantity": 2
    }
  ],
  "notes": "备注信息"
}
```

响应：
```json
{
  "bookingIds": [1, 2],
  "successCount": 2,
  "failCount": 0
}
```

## 使用流程

1. **用户认证**：用户需要先登录获取用户ID
2. **浏览画集**：用户在画集列表页面浏览可用的画集
3. **添加到购物车**：点击画集卡片上的"加入购物车"按钮
4. **管理购物车**：点击顶部的购物车按钮打开购物车弹窗
5. **调整商品**：在购物车中调整商品数量或移除商品
6. **批量预订**：填写QQ号和备注信息，点击"批量预订"提交

## 数据持久化

### 优势
- **数据持久化**：购物车数据存储在数据库中，不会因浏览器清除而丢失
- **多设备同步**：用户可以在不同设备上访问相同的购物车
- **数据安全**：数据存储在服务器端，更安全可靠
- **用户隔离**：每个用户都有独立的购物车

### 购物车生命周期
1. **创建**：用户首次添加商品时自动创建购物车
2. **活跃**：购物车处于活跃状态，可以正常添加/修改商品
3. **转换**：批量预订成功后，购物车状态变为"已转换"
4. **过期**：购物车超过30天未使用自动过期
5. **清理**：定期清理过期的购物车数据

## 样式定制

购物车组件使用Tailwind CSS进行样式设计，支持响应式布局，适配桌面端和移动端。

### 主要样式类

- `cart-actions`: 购物车操作按钮容器
- `cart-item`: 购物车商品项
- `cart-summary`: 购物车统计信息
- `checkout-form`: 批量预订表单

## 注意事项

1. **用户认证**：购物车功能需要用户ID，确保用户已登录
2. **网络连接**：购物车操作需要网络连接才能与服务器同步
3. **数据一致性**：购物车数据实时与数据库同步，确保数据一致性
4. **性能优化**：购物车数据按需加载，减少不必要的网络请求

## 扩展功能

未来可以考虑添加以下功能：

1. **购物车商品收藏功能**
2. **购物车商品分享功能**
3. **购物车历史记录**
4. **购物车商品推荐**
5. **购物车数据备份和恢复**
6. **购物车商品价格计算**
7. **购物车优惠券和折扣功能** 