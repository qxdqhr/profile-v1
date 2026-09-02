# CR — sa2kit-ui（动森 / 多主题 UI 库）

| 项 | 内容 |
|----|------|
| 源码 | `/home/qhr/project/sa2kit-ui`（独立 git monorepo） |
| 根版本 | 0.2.0（private）；发布面 `@sa2kit-ui/react` = **0.1.6** → npm `@qhr123/sa2kit-ui-react` |
| 形态 | pnpm + Turborepo：tokens / themes / react / rn / taro / electron |
| 组件 | Web 24/24；RN 源码有但未作可消费 dist |
| CSS | `style.css` ≈ **1.3MB**（全主题打包） |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed |

---

## 1. 与兄弟仓 / 消费方关系

| 名称 | 角色 |
|------|------|
| **animal-island-ui** | 上游 Less 参考 + 部分子应用仍在用的旧 npm `^0.9.6` |
| **base-components-sa2kit** | 空壳脚手架（Placeholder），**不是** sa2kit-ui 的 rename |
| **sa2kit-ui** | 动森主题生产实现；`pnpm sync-styles` 对齐上游 |
| **@profile/ui** | 仅 Tailwind preset（shadcn HSL），**未**接入 `@sa2kit-ui/tokens` |
| **sa2kit/common/components** | 另一套 shadcn 业务 UI，勿与本库混淆 |

### profile-v1 消费分裂（关键）

| 消费方 | 实际依赖 |
|--------|----------|
| `web/web` HomeV2 | `@sa2kit-ui/react` → `@qhr123/sa2kit-ui-react@0.1.6` ✅ |
| `web/web` Home / fitnessPlan | 源码写 `animal-island-ui`，靠 **webpack alias** 偷换到 `@sa2kit-ui/react` |
| calendar / teach-hub / showmasterpiece（及 core） | 真实 **`animal-island-ui@^0.9.6`**，无 alias |
| calendar-mobile / teach-hub-mobile | 手写 `src/ui/*`，未接 `@sa2kit-ui/rn` |

---

## 2. 模块清单

```
packages/
  tokens/           语义 CSS 变量
  themes/*          animal-island / jieyuan-garden / rhine-life /
                    endfield / mizuki-roguelike / sami-roguelike
  react/            唯一正式 npm 发布面 + ThemeProvider
  theme-runtime/    实为 re-export react（命名易误导）
  rn/ taro/ electron/
web/demo-* + docs (Ladle)
```

主题切换：`ThemeProvider` → `document.documentElement[data-theme]` + overlay CSS。  
`tech` 在类型/`SA2_THEMES` 中存在，但 **无独立 theme 包**（半成品）。

---

## 3. 发现项

| ID | 严重度 | 标题 | 位置 / 证据 | 建议 | 状态 |
|----|--------|------|-------------|------|------|
| SUI-001 | **P0** | 双轨依赖：主站 alias vs 子应用旧包 | web `next.config` alias；calendar/teach-hub `package.json` | 全仓统一 `@sa2kit-ui/react`；删 animal-island-ui | open |
| SUI-002 | **P0** | 组件库无 `'use client'`，RSC 靠消费方自律 | `@sa2kit-ui/react` 全组件 | 库入口加 client 边界或 exports 标明 | open |
| SUI-003 | **P0** | 全主题 CSS ~1.3MB 强制全量 | `packages/react/dist/style.css` | 按主题分包 / 懒加载 | open |
| SUI-004 | P1 | `@sa2kit-ui/rn` 无 dist，mobile 重复 UI | rn package + mobile `src/ui` | 发布 RN 包并替换手写 | open |
| SUI-005 | P1 | `tech` 主题承诺与实现不符 | tokens 占位 vs 无 overlay | 补齐或从公开展示移除 | open |
| SUI-006 | P1 | Modal/Select 等 a11y 缺口 | react 组件 | 焦点陷阱、listbox、aria | open |
| SUI-007 | P1 | React 19 消费 vs 库 peer/dev React 18 | profile web 19.2 | CI 矩阵验证 19 | open |
| SUI-008 | P1 | 根 0.2.0 / react 0.1.6 版本漂移；无 publish CI | package.json / workflows | changeset + 自动发布 | open |
| SUI-009 | P2 | HomeV2 Google Fonts 与包内 `@fontsource` 重复 | layout + 发布 deps | 二选一 | open |
| SUI-010 | P2 | `theme-runtime` 整包 re-export 无独立价值 | packages/theme-runtime | 收窄或删除 | open |
| SUI-011 | P2 | web 未声明 animal-island-ui，依赖 alias | web/web | 迁移后删除 alias | open |
| SUI-012 | P3 | `@profile/ui` 与 sa2kit-ui tokens 双轨 | 两套色板 | 知识库写清选用规则 | open |

---

## 4. 优点

- tokens → theme overlay → 平台包结构清晰，符合 sa2kit UI skill 约定  
- HomeV2：`ThemeProvider` + localStorage + 单行 style import，集成标杆  
- `sync-styles` 可持续跟踪 animal-island-ui  
- 单包发布降低消费方配置成本  
- 跨端组件目录齐全（源码层）

---

## 5. 建议二轮 / 迁移顺序

1. **统一依赖**：calendar-core / teach-hub-core / showmasterpiece → `@sa2kit-ui/react`；对照 API 差异  
2. CSS 分包与首页 LCP  
3. 库级 `'use client'` + React 19  
4. RN 发布替换 mobile `src/ui`  
5. a11y 专项 + publish CI  
6. 在 KNOWLEDGE_BASE 写明：`sa2kit/common/components` vs `@sa2kit-ui/react` 选用规则

---

## 6. 跟进

- [ ] SUI-001 迁移计划与 PR 拆分  
- [ ] SUI-002 / SUI-003（库侧）  
- [ ] SUI-004 mobile 去重排期
