# FloatingMenu 可拖动悬浮菜单组件

一个可在页面任意位置拖动的悬浮菜单组件，会根据在屏幕中的位置自动调整菜单弹出方向。使用 Tailwind CSS 实现，完全符合项目的样式系统。

## 功能特点

- 可在页面任意位置拖动
- 根据屏幕位置自动调整菜单弹出方向（左侧位置菜单向右弹出，右侧位置菜单向左弹出）
- 支持自定义触发器和菜单内容
- 支持自定义样式和位置
- 防止拖出屏幕边界
- 支持移动端和桌面端
- 使用 Tailwind CSS 实现，易于定制
- 区分拖拽和点击事件，拖拽后不会意外触发菜单

## 安装

该组件是项目内部组件，无需额外安装。

## 使用方法

```tsx
import { FloatingMenu } from '@/components/FloatingMenu';

function MyComponent() {
  return (
    <FloatingMenu
      trigger={<span>点击我</span>}
      menu={
        <div>
          <h3>菜单标题</h3>
          <ul>
            <li>菜单项 1</li>
            <li>菜单项 2</li>
            <li>菜单项 3</li>
          </ul>
        </div>
      }
      initialPosition={{ x: 100, y: 100 }}
    />
  );
}
```

## 属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| trigger | ReactNode | - | 触发按钮的内容 |
| menu | ReactNode | - | 菜单内容 |
| initialPosition | { x: number; y: number } | { x: 20, y: 20 } | 初始位置 |
| defaultOpen | boolean | false | 是否默认打开菜单 |
| className | string | '' | 自定义类名 |
| menuClassName | string | '' | 菜单类名 |
| triggerClassName | string | '' | 触发器类名 |
| zIndex | number | 1000 | z-index 层级 |

## 示例

### 基础用法

```tsx
<FloatingMenu
  trigger={<span className="text-xl">➕</span>}
  menu={
    <div>
      <h3>菜单标题</h3>
      <ul>
        <li>菜单项 1</li>
        <li>菜单项 2</li>
        <li>菜单项 3</li>
      </ul>
    </div>
  }
/>
```

### 自定义样式

由于组件使用 Tailwind CSS 实现，你可以通过传递类名轻松自定义样式：

```tsx
<FloatingMenu
  trigger={<span>自定义样式</span>}
  menu={<div>菜单内容</div>}
  className="border-2 border-blue-500"
  menuClassName="bg-gray-50"
  triggerClassName="bg-blue-100 text-blue-800"
/>
```

## 注意事项

- 组件使用了 React Portal 将菜单渲染到 body 下，避免被其他元素遮挡
- 组件会根据屏幕位置自动调整菜单弹出方向
- 组件会防止被拖出屏幕边界
- 点击菜单外部会自动关闭菜单
- 组件能够区分拖拽和点击事件，拖拽后松开不会触发菜单打开 