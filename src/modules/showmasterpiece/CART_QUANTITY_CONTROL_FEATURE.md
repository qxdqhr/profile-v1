# 购物车数量控制功能

## 功能概述

实现了购物车数量控制功能，支持连续点击同一画集的"加入购物车"按钮，并提供数量增减控件来管理购物车中的商品数量。

## 功能特性

### 1. 智能状态切换
- **未添加状态**：显示"加入购物车"按钮
- **已添加状态**：显示"已加入购物车"按钮 + 数量控制控件

### 2. 数量控制
- **添加前**：可选择要添加的数量
- **添加后**：直接控制购物车中的数量
- **实时同步**：数量变化与购物车数据保持同步

### 3. 购物车角标
- **实时更新**：显示所有种类画集的数量之和
- **自动计算**：基于购物车中的实际数据

## 技术实现

### 1. 组件状态管理

**AddToCartButton 组件**:
```typescript
// 检查当前画集是否已在购物车中
const cartItem = cart.items.find(item => item.collectionId === collection.id);
const isInCart = !!cartItem;
const currentQuantity = cartItem?.quantity || 0;

// 当购物车数据更新时，同步本地状态
useEffect(() => {
  if (cartItem) {
    setQuantity(cartItem.quantity);
    setIsAdded(true);
  } else {
    setQuantity(1);
    setIsAdded(false);
  }
}, [cartItem]);
```

### 2. 智能添加逻辑

```typescript
const handleAddToCart = async () => {
  try {
    if (isInCart) {
      // 如果已在购物车中，增加数量
      await updateItemQuantity(collection.id, currentQuantity + quantity);
    } else {
      // 如果不在购物车中，添加新项
      await addItemToCart(collection, quantity);
    }
    setIsAdded(true);
  } catch (error) {
    console.error('添加到购物车失败:', error);
  }
};
```

### 3. 数量控制逻辑

```typescript
const handleCartQuantityChange = async (newQuantity: number) => {
  try {
    if (newQuantity <= 0) {
      // 如果数量为0或负数，从购物车中移除
      await removeItemFromCart(collection.id);
    } else {
      // 否则更新数量
      await updateItemQuantity(collection.id, newQuantity);
    }
  } catch (error) {
    console.error('更新购物车数量失败:', error);
  }
};
```

### 4. 界面渲染逻辑

```typescript
return (
  <div className={`flex flex-col gap-2 ${className}`}>
    {isInCart ? (
      // 已在购物车中的状态
      <div className="flex flex-col gap-2">
        {/* 已添加状态按钮 */}
        <button className="bg-green-600 text-white">
          <Check size={16} />
          <span>已加入购物车</span>
        </button>
        
        {/* 数量控制控件 */}
        <div className="flex items-center justify-center border border-gray-300 rounded-lg bg-white">
          <button onClick={() => handleCartQuantityChange(currentQuantity - 1)}>
            <Minus size={14} />
          </button>
          <span>{currentQuantity}</span>
          <button onClick={() => handleCartQuantityChange(currentQuantity + 1)}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    ) : (
      // 未在购物车中的状态
      <div className="flex flex-col gap-2">
        {/* 数量选择器 */}
        <div className="flex items-center justify-center border border-gray-300 rounded-lg bg-white">
          <button onClick={() => handleQuantityChange(quantity - 1)}>
            <Minus size={14} />
          </button>
          <span>{quantity}</span>
          <button onClick={() => handleQuantityChange(quantity + 1)}>
            <Plus size={14} />
          </button>
        </div>

        {/* 添加到购物车按钮 */}
        <button onClick={handleAddToCart} className="bg-blue-600 text-white">
          <ShoppingCart size={16} />
          <span>加入购物车</span>
        </button>
      </div>
    )}
  </div>
);
```

## 用户体验流程

### 1. 首次添加画集
1. 用户看到"加入购物车"按钮
2. 可选择要添加的数量（默认1）
3. 点击按钮后，画集被添加到购物车
4. 按钮状态变为"已加入购物车"
5. 下方显示数量控制控件

### 2. 连续点击同一画集
1. 如果画集已在购物车中，点击会增加数量
2. 数量控制控件实时显示当前数量
3. 购物车角标同步更新

### 3. 数量调整
1. 使用数量控制控件的 +/- 按钮
2. 数量实时更新到购物车
3. 购物车角标同步更新
4. **数量为1时点击减号**：从购物车中移除画集，隐藏数量控件，按钮变回"加入购物车"

## 数据同步机制

### 1. 购物车上下文
- 使用 `useCartContext()` 获取实时购物车数据
- 所有组件共享同一份购物车状态

### 2. 事件驱动更新
- 操作成功后触发 `notifyCartUpdate()` 事件
- 所有相关组件自动更新

### 3. 定期刷新
- 每10秒自动刷新购物车数据
- 确保数据一致性

## 样式设计

### 1. 按钮状态
- **未添加**：蓝色背景，购物车图标
- **已添加**：绿色背景，勾选图标

### 2. 数量控件
- 白色背景，灰色边框
- 居中布局，清晰的 +/- 按钮
- 数量显示在中间，字体加粗

### 3. 响应式设计
- 支持不同尺寸（sm, md, lg）
- 移动端友好的触摸区域

## 错误处理

### 1. 网络错误
- 显示错误提示
- 保持当前状态不变
- 提供重试机制

### 2. 数据不一致
- 定期刷新确保数据同步
- 本地状态与服务器状态对比
- 自动修正不一致的数据

## 性能优化

### 1. 减少API调用
- 使用购物车上下文避免重复请求
- 批量操作减少网络请求

### 2. 状态缓存
- 本地状态缓存减少重渲染
- 智能更新避免不必要的刷新

### 3. 用户体验
- 即时反馈，无需等待
- 平滑的状态切换动画

## 测试验证

### 1. 功能测试
- ✅ 首次添加画集到购物车
- ✅ 连续点击增加数量
- ✅ 数量控件正常工作
- ✅ 购物车角标实时更新
- ✅ 数据同步正确

### 2. 边界测试
- ✅ 数量为1时点击减号自动移除
- ✅ 网络错误时的处理
- ✅ 并发操作的处理

### 3. 用户体验测试
- ✅ 界面响应流畅
- ✅ 状态切换清晰
- ✅ 操作反馈及时

## 使用示例

### 1. 基本使用
```typescript
<AddToCartButton
  collection={collection}
  userId={userId}
  size="md"
  className="my-custom-class"
/>
```

### 2. 带数量选择器
```typescript
<AddToCartButton
  collection={collection}
  userId={userId}
  showQuantitySelector={true}
  size="lg"
/>
```

## 总结

购物车数量控制功能成功实现了用户需求：

1. ✅ **连续点击**：支持连续点击同一画集增加数量
2. ✅ **状态切换**：按钮状态智能切换（加入购物车 → 已加入购物车）
3. ✅ **数量控件**：已添加状态下显示数量增减控件
4. ✅ **数据同步**：画集数量与购物车数据保持同步
5. ✅ **角标更新**：购物车角标显示所有种类画集的数量之和
6. ✅ **智能移除**：数量为1时点击减号自动移除画集并恢复初始状态

该功能提供了完整的购物车管理体验，用户可以方便地添加、调整和查看购物车中的商品数量。 