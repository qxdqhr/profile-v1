# ShowMasterpiece 运维脚本

历史脚本曾放在 `src/modules/showmasterpiece/migration/`，已移除。

| package.json 命令 | 说明 |
|-------------------|------|
| `migration:artwork` | 见 `run-artwork-migration.ts`（依赖 sa2kit 是否导出 migration） |
| `migration:oss*` | 见 `migrate-to-oss.ts` |
| `migrate:multi-events` | 见 `migrate-to-multi-events.ts` |

若 `sa2kit/showmasterpiece/migration` 在当前安装版本无构建产物，请在 [sa2kit](https://github.com) 源码仓执行迁移或升级 `sa2kit` 后重试。
