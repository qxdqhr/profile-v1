# CR — `@profile/ui`

| 项 | 内容 |
|----|------|
| 路径 | `packages/ui/` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed |

---

## 范围

- `tailwind.preset.ts` — 设计令牌 / 动画  
- `postcss.config.js` — 导出存在但各 app 多为本地复制

**说明**：本包 **不是** React 组件库；共享组件在 `app_web/web/src/components/` 与 sa2kit。

---

## 发现项

| ID | 严重度 | 标题 | 建议 | 状态 |
|----|--------|------|------|------|------|
| UI-001 | P3 | 包名易误解为组件库 | README 一行说明「仅 preset」 | open |
| UI-002 | P3 | `@profile/ui/postcss` 未被统一引用 | 各 app 改 import 或删除导出 | open |
| UI-003 | P3 | preset 内 `require('tailwindcss-animate')` | 评估 ESM 兼容；可改为 import | open |

---

## 优点

- 五 Web 应用统一 presets，品牌色与 shadcn CSS 变量一致  
- 体积小、职责单一

---

## 跟进

- [ ] 补 packages/ui 简短 README 或 package description
