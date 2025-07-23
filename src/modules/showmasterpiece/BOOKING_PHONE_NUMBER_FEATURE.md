# 预订信息新增手机号凭据功能文档

## 概述

为预订系统新增了手机号凭据功能，用户可以在预订时提供手机号作为额外的联系方式，提升预订管理的便利性和联系效率。

## 功能特性

### 1. 数据库层面

**新增字段**：
- `phone_number` (varchar(20)) - 用户手机号字段
- 支持索引查询优化

**数据库变更**：
```sql
ALTER TABLE "comic_universe_bookings" ADD COLUMN "phone_number" varchar(20);
CREATE INDEX "bookings_phone_number_idx" ON "comic_universe_bookings" USING btree ("phone_number");
```

### 2. 类型定义更新

**Booking 接口**：
```typescript
export interface Booking {
  // ... 其他字段
  /** 用户手机号 */
  phoneNumber?: string;
  // ... 其他字段
}
```

**CreateBookingRequest 接口**：
```typescript
export interface CreateBookingRequest {
  // ... 其他字段
  /** 用户手机号 */
  phoneNumber?: string;
  // ... 其他字段
}
```

**BookingFormData 接口**：
```typescript
export interface BookingFormData {
  // ... 其他字段
  /** 用户手机号 */
  phoneNumber: string;
  // ... 其他字段
}
```

### 3. API 层面

**创建预订 API**：
- 支持手机号参数接收
- 手机号格式验证（中国手机号格式）
- 可选字段，不影响现有功能

**验证逻辑**：
```typescript
// 验证手机号格式（如果提供）
if (body.phoneNumber) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(body.phoneNumber)) {
    return NextResponse.json(
      { message: '手机号格式不正确' },
      { status: 400 }
    );
  }
}
```

**数据库插入**：
```typescript
.values({
  collectionId: body.collectionId,
  qqNumber: body.qqNumber,
  phoneNumber: body.phoneNumber || null,
  quantity: body.quantity,
  notes: body.notes || null,
  status: 'pending',
})
```

### 4. 前端界面

**预订表单**：
- 在QQ号输入框后添加手机号输入框
- 手机号为可选字段
- 实时格式验证
- 移动端友好的输入体验

**购物车批量预订**：
- 支持手机号输入
- 与单个预订表单保持一致的用户体验

**管理界面**：
- 预订管理面板显示手机号信息
- 预订详情弹窗包含手机号字段
- 移动端适配的显示布局

## 技术实现

### 1. 数据库迁移

**迁移文件**：`drizzle/0033_amusing_calypso.sql`
```sql
ALTER TABLE "comic_universe_bookings" ADD COLUMN "phone_number" varchar(20);
CREATE INDEX "bookings_phone_number_idx" ON "comic_universe_bookings" USING btree ("phone_number");
```

### 2. 表单验证

**前端验证**：
```typescript
// 验证手机号（如果提供）
if (formData.phoneNumber.trim()) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(formData.phoneNumber.trim())) {
    newErrors.phoneNumber = '手机号格式不正确';
  }
}
```

**后端验证**：
```typescript
// 验证手机号格式（如果提供）
if (body.phoneNumber) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(body.phoneNumber)) {
    return NextResponse.json(
      { message: '手机号格式不正确' },
      { status: 400 }
    );
  }
}
```

### 3. UI 组件更新

**预订表单组件**：
- 添加手机号输入字段
- 响应式设计适配
- 错误提示和验证反馈

**管理面板组件**：
- 显示手机号信息
- 条件渲染（仅在有手机号时显示）
- 移动端布局优化

## 用户体验

### 1. 用户预订流程

1. **选择画集** → 进入预订表单
2. **填写QQ号**（必填）
3. **填写手机号**（可选）
4. **填写数量**（必填）
5. **填写备注**（可选）
6. **提交预订**

### 2. 管理员管理流程

1. **查看预订列表** → 显示QQ号和手机号（如果有）
2. **查看预订详情** → 完整显示联系信息
3. **编辑预订状态** → 保持所有信息完整

### 3. 移动端适配

- 输入框在移动端增大高度
- 触摸友好的交互设计
- 响应式布局适配
- 错误提示清晰可见

## 兼容性

### 1. 向后兼容

- 现有预订数据不受影响
- 手机号字段为可选，不会破坏现有功能
- API 接口保持向后兼容

### 2. 数据迁移

- 现有预订记录的 `phone_number` 字段为 `null`
- 不影响现有查询和显示逻辑
- 新预订可以正常使用手机号功能

## 安全性

### 1. 数据验证

- 前端和后端双重验证
- 手机号格式严格校验
- 防止恶意数据注入

### 2. 隐私保护

- 手机号作为可选字段，用户可自主选择是否提供
- 在管理界面中合理显示，避免信息泄露

## 测试建议

### 1. 功能测试

- [ ] 单个预订表单手机号输入
- [ ] 批量预订表单手机号输入
- [ ] 手机号格式验证
- [ ] 空手机号处理
- [ ] 管理界面手机号显示

### 2. 兼容性测试

- [ ] 现有预订数据正常显示
- [ ] 无手机号的预订正常处理
- [ ] API 接口向后兼容

### 3. 移动端测试

- [ ] 手机号输入框触摸体验
- [ ] 响应式布局显示
- [ ] 错误提示清晰度

## 总结

通过新增手机号凭据功能，预订系统现在能够：

- **提供更灵活的联系方式**：用户可以选择提供QQ号或手机号，或两者都提供
- **提升管理效率**：管理员可以通过多种方式联系用户
- **保持向后兼容**：现有功能不受影响，新功能可选择性使用
- **优化用户体验**：移动端友好的输入界面和验证反馈

这个功能增强了预订系统的实用性和用户友好性，为后续的功能扩展奠定了良好的基础。 