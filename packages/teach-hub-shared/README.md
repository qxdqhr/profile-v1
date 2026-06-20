# @profile/teach-hub-shared

TeachHub 跨端共享层：类型、HTTP API 客户端、路由常量。

**不含** React / Next / RN 组件，供 `apps/teach-hub`（Web）、`apps/teach-hub-mobile`（RN）及未来桌面端共用。

## 导出

| 路径 | 内容 |
|------|------|
| `@profile/teach-hub-shared` | 聚合导出 |
| `@profile/teach-hub-shared/types` | 领域类型（与 `teach-hub-core` 对齐） |
| `@profile/teach-hub-shared/api` | `TeachHubApiClient` |
| `@profile/teach-hub-shared/routes` | API 路径与移动端 screen 名 |

## API Base URL

| 环境 | `apiBaseUrl` 示例 |
|------|-------------------|
| 本地 teach-hub 子应用 | `http://localhost:3002` |
| 生产网关 | `https://your-domain.com/teach-hub` |

客户端请求路径为 `{apiBaseUrl}/api/teach-hub/...`。

## 与 teach-hub-core 的关系

`packages/teach-hub-core` 的 `types` 与 `teachHubClient` 已改为引用本包（`@profile/teach-hub-shared`）。
