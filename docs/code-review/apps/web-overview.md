# CR — web/web 边界总览

| 项 | 内容 |
|----|------|
| 路径 | `web/web/` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed（边界层；模块逐个见 `modules/`） |

---

## 职责（当前）

- Auth SSOT：`/api/auth/*`（网关唯一落点）  
- 实验田宿主 + 大量 `src/modules/*`  
- `/api/ai/*` 生产落点  
- 兼容重定向：calendar / teach-hub / showmasterpiece URL helpers  
- **残留**：`app/api/showmasterpiece/**` 双挂载（见 showmasterpiece CR）

---

## cutover 清理状态

| 领域 | modules | app/api | 备注 |
|------|---------|---------|------|
| calendar | 无 | 无 | 干净；examples demo 302 |
| teach-hub | 无 | 无 | 干净；nginx 301 legacy |
| showmasterpiece | 8 文件薄 re-export | **21 route 仍在** | P0 债务 |

---

## 发现项（边界层）

| ID | 严重度 | 标题 | 建议 | 状态 |
|----|--------|------|------|------|
| WEB-001 | P0 | showmasterpiece API 双挂载 | 移除或 CI 禁止新增；生产只走子应用 | open |
| WEB-002 | P1 | `ignoreBuildErrors: true` | 见 CX-001 | open |
| WEB-003 | P2 | `src/db` deprecated 兼容层仍存在 | 全仓改 `@profile/db` 后删除 | open |
| WEB-004 | P3 | `api/showmasterpiece/OPTIMIZATION.md` 路径过时 | 删或改写 | open |

---

## 模块评审优先级（摘自 README）

1. ideaList ✅  
2. fitnessPlan / comfyPrompt / filetransfer  
3. mmd / mikutap  
4. Home/HomeV2、ticketMonitor、aiApi  
5. 小游戏批量

---

## 跟进

- [ ] WEB-001 方案选型（删除 web API vs 明确 deprecated）  
- [ ] 按优先级继续 `modules/*.md`
