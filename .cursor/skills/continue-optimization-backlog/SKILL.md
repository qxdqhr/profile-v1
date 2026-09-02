---
name: continue-optimization-backlog
description: >-
  Continues the deferred profile-v1 architecture optimization backlog
  (Three/MMD 迁出、裸奔写接口补 session、测试加厚、schema 拆分等).
  Use when the user says 优化项目, 继续优化, 待定优化, 接着优化, or asks to resume
  postponed 减负/优化 after the 2026-09-02 review. Do not use for ordinary
  feature or bug work.
---

# 继续待定优化项目

## 何时用

用户提到 **优化项目** / **继续优化** / **待定优化** 时 **立刻**读清单并动手，不要再问「要不要做优化」。

普通功能/修 bug **不要**主动做清单里的项。

## 步骤

1. 打开 [`docs/code-review/PENDING-OPTIMIZATION.md`](../../../docs/code-review/PENDING-OPTIMIZATION.md)。
2. 从文首 **下次从这里开始** 的 ID（或第一个未勾选）做 **一小步可合并的切片**，不要一次清队列。
3. 遵守仓库约定：文档在 `docs/`；主站 API 公开路径改 allowlist；游戏走 Godot 不引 Phaser。
4. **OPT-01 Three**：默认跳过。只有用户点名 3D / MMD 迁出，或文首「下次从这里开始」就是 OPT-01 时才做。
5. 做完：勾选、更新「下次从这里开始」、需要时改 `2026-09-02-审查结果.md` 一句指向。
6. 不要提交/推送，除非用户明确要求。

## 不要做

- 不要把 Postgres 公网端口当成代码任务（运维确认）。
- 不要恢复已删的 zip/一次性脚本。
- 不要给子应用再挂 `/api/auth`。
