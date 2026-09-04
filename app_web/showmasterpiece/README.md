# app_web/showmasterpiece

独立 ShowMasterpiece 子应用 `@profile/showmasterpiece`。

| 命令 | 说明 |
|------|------|
| `pnpm dev:showmasterpiece` | 开发服务器 `http://localhost:3003` |
| `pnpm build:showmasterpiece` | 生产构建 |
| `pnpm package:showmasterpiece` | Docker 镜像打包（默认 tag: local） |

业务：`sa2kit/business/showmasterpiece/*`  
宿主注入：`lib/`（db/OSS/session/rateLimit）  
API：`/api/showmasterpiece/*`、`/api/auth/*`

## 打包发布

```bash
pnpm package:showmasterpiece
bash scripts/showmasterpiece-docker-package.sh v1.2.3
```
