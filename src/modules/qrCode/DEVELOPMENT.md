# QRCode 二维码工具模块 - 需求分析与开发文档

## 一、需求背景

在 profile-v1 项目中，需要一个通用的二维码生成工具模块。该模块作为工具型（utils-like）模块存在，核心功能是：**将任意字符串或 URL 转换为可渲染的二维码图片组件**，在 H5 界面上直接展示。

---

## 二、功能需求分析

### 2.1 核心功能
- 传入一个 `url`（字符串或网页地址）参数，渲染出对应的二维码图片
- 支持自定义二维码尺寸（size）
- 支持自定义前景色（fgColor）和背景色（bgColor）
- 支持设置纠错级别（errorCorrectionLevel）：L / M / Q / H
- 支持显示 loading 状态（当 url 为空时）
- 支持自定义 className 样式

### 2.2 可选功能（扩展）
- 支持在二维码中心嵌入 logo 图片
- 支持下载二维码图片（导出为 PNG）
- 支持显示二维码下方的文字说明

### 2.3 测试页面功能
- 输入框：用户可以输入任意 URL 或文字
- 实时预览：输入变化后立即更新二维码
- 参数调节面板：尺寸、颜色、纠错级别
- 下载按钮：将二维码保存为图片

---

## 三、技术方案

### 3.1 依赖库选择

选用 **`qrcode.react`**：
- React 官方生态中最主流的二维码库
- 支持 SVG 和 Canvas 两种渲染方式
- TypeScript 类型支持完善
- 轻量，无额外依赖

### 3.2 渲染方式

采用 **SVG 模式**（`<QRCodeSVG>`）：
- 矢量图，任意缩放不失真
- 便于嵌入 HTML 和 CSS 控制
- H5 移动端兼容性好

### 3.3 模块定位

本模块为 **纯工具型模块**，无需数据库、无需后端 API：
- 不涉及 DB Schema
- 不涉及服务端路由
- 核心产物是一个可复用的 React 组件

---

## 四、模块目录结构

```
src/modules/qrCode/
├── DEVELOPMENT.md          ← 本文档（需求分析 & 开发日志）
├── index.ts                ← 模块入口，统一导出
├── types/
│   └── index.ts            ← 类型定义（QRCodeProps 等）
├── components/
│   ├── QRCodeImage.tsx     ← 核心组件：传入 url，渲染二维码
│   └── index.ts            ← 组件统一导出
├── utils/
│   └── index.ts            ← 工具函数（如 downloadQRCode）
└── pages/
    └── QRCodeDemoPage.tsx  ← 测试演示页面
```

**对应的 App 路由：**
```
src/app/(pages)/testField/(utility)/qrCode/page.tsx
```

---

## 五、组件接口设计

### QRCodeImage 组件 Props

```typescript
interface QRCodeImageProps {
  url: string;                          // 必填：要编码的 URL 或字符串
  size?: number;                        // 可选：二维码尺寸（默认 200）
  fgColor?: string;                     // 可选：前景色（默认 #000000）
  bgColor?: string;                     // 可选：背景色（默认 #ffffff）
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // 可选：纠错级别（默认 'M'）
  className?: string;                   // 可选：自定义样式类名
  showUrl?: boolean;                    // 可选：是否在二维码下方显示 URL 文字
  title?: string;                       // 可选：二维码标题
  logoUrl?: string;                     // 可选：中心 logo 图片 URL
  logoSize?: number;                    // 可选：logo 尺寸（默认 size * 0.2）
}
```

---

## 六、开发步骤（逐步执行）

- [x] Step 1：创建 DEVELOPMENT.md 需求分析文档
- [x] Step 2：安装 `qrcode.react` 依赖（v4.2.0）
- [x] Step 3：创建类型定义文件 `types/index.ts`
- [x] Step 4：实现核心组件 `components/QRCodeImage.tsx`
- [x] Step 5：创建模块入口 `index.ts`
- [x] Step 6：创建测试演示页面 `pages/QRCodeDemoPage.tsx`
- [x] Step 7：在 app 路由中注册测试页面（`/testField/qrCode`）
- [x] Step 8：在 `experimentData.ts` 中注册新模块入口

---

## 七、使用示例

```tsx
import { QRCodeImage } from '@/modules/qrCode'

// 基础用法
<QRCodeImage url="https://example.com" />

// 自定义配置
<QRCodeImage
  url="https://example.com"
  size={300}
  fgColor="#1a1a2e"
  bgColor="#f0f0f0"
  errorCorrectionLevel="H"
  showUrl={true}
  title="扫码访问"
/>
```
