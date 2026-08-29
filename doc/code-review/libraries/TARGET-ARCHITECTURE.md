# 目标架构（归档说明）

> **现行推荐蓝图已升级为：**  
> **[BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md)**  
> （多端 SDK：common + business 同仓按端导出；business **不**迁回 profile）

本文保留早期「profile 经 sa2kit 消费通用能力 + UI 门面」的讨论，但下列表述 **作废**：

- ~~business 逐步迁回 profile-v1~~ → 改为 business 留在 sa2kit，并补齐 `ui/web|rn|taro` + `server`
- ~~profile 是业务实现大本营~~ → profile 是 Web/API **宿主**；多端业务实现在 sa2kit

仍有效的部分：

- UI/主题经 sa2kit 门面，宿主不直连 animal-island / 不首选直连 `@sa2kit-ui/*`
- 登录、OSS、配置、AI 走 `sa2kit/common/*`（可经 `@profile/*` 薄封装）
- 鉴权门禁在宿主

请以 BLUEPRINT 为准推进 Phase A–E。
