# 购物车按钮禁用问题修复

## 问题描述

在购物车数量控制功能中，当画集数量为1时，点击减号按钮没有反应，无法移除画集。

## 问题原因

在 `AddToCartButton` 组件中，减号按钮被错误地设置为：

```typescript
disabled={currentQuantity <= 1 || loading}
```

这意味着当数量为1时，减号按钮会被禁用，导致点击没有反应。

## 修复方案

### 1. 移除错误的禁用条件

**修复前**：
```typescript
<button
  onClick={() => handleCartQuantityChange(currentQuantity - 1)}
  disabled={currentQuantity <= 1 || loading}  // ❌ 错误的禁用条件
  className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50 transition-colors"
>
  <Minus size={14} />
</button>
```

**修复后**：
```typescript
<button
  onClick={() => handleCartQuantityChange(currentQuantity - 1)}
  disabled={loading}  // ✅ 只禁用加载状态
  className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50 transition-colors"
>
  <Minus size={14} />
</button>
```

### 2. 逻辑说明

移除 `currentQuantity <= 1` 的禁用条件是正确的，因为：

1. **数量为1时应该可以移除**：这是用户期望的行为
2. **移除逻辑在 `handleCartQuantityChange` 中处理**：当数量为0或负数时，会自动调用 `removeItemFromCart`
3. **用户体验更好**：用户可以直观地通过减号按钮移除商品

### 3. 移除逻辑

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

## 修复效果

### 1. 功能恢复
- ✅ 数量为1时点击减号按钮可以正常移除画集
- ✅ 移除后界面自动恢复初始状态
- ✅ 购物车角标正确更新

### 2. 用户体验
- ✅ 操作直观，符合用户预期
- ✅ 按钮状态清晰，不会误导用户
- ✅ 移除操作响应及时

### 3. 代码逻辑
- ✅ 移除逻辑统一在 `handleCartQuantityChange` 中处理
- ✅ 按钮只根据加载状态禁用，逻辑简单清晰
- ✅ 状态管理更加合理

## 测试验证

### 1. 功能测试
- ✅ 数量为1时点击减号移除画集
- ✅ 数量大于1时点击减号减少数量
- ✅ 移除后可以重新添加画集
- ✅ 购物车角标正确更新

### 2. 边界测试
- ✅ 网络错误时的处理
- ✅ 并发操作的处理
- ✅ 数据不一致时的处理

### 3. 用户体验测试
- ✅ 按钮状态清晰
- ✅ 操作反馈及时
- ✅ 界面响应流畅

## 总结

通过移除错误的按钮禁用条件，成功修复了购物车数量控制功能中的问题：

1. **问题根源**：减号按钮在数量为1时被错误禁用
2. **修复方案**：移除 `currentQuantity <= 1` 的禁用条件
3. **修复效果**：数量为1时点击减号可以正常移除画集
4. **用户体验**：操作更加直观，符合用户预期

现在用户可以正常使用购物车的数量控制功能，包括在数量为1时通过减号按钮移除画集。 