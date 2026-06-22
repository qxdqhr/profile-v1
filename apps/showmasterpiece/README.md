# apps/showmasterpiece

独立 ShowMasterpiece 子应用 `@profile/showmasterpiece`。

| 命令 | 说明 |
|------|------|
| `pnpm dev:showmasterpiece` | 开发服务器 `http://localhost:3003` |
| `pnpm build:showmasterpiece` | 生产构建 |
| `pnpm package:showmasterpiece` | Docker 镜像打包（默认 tag: local） |

业务核心：`packages/showmasterpiece-core`  
API：`/api/showmasterpiece/*`、`/api/auth/*`

## 打包发布

### Web 子应用（Docker）

与 CI `docker-build-push` 对齐，本地打包：

```bash
pnpm package:showmasterpiece              # 默认 tag: local
bash scripts/showmasterpiece-docker-package.sh v1.2.3
```

