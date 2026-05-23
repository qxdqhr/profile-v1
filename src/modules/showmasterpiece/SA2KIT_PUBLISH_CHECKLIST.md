# sa2kit 1.6.115 发版核对清单（ShowMasterpiece 删单）

> 你 push/npm 发布前可按本清单自检；profile-v1 在发版完成前继续使用 `^1.6.114` + 宿主删单校验。

---

## 1. sa2kit 仓

- [ ] `package.json` 版本为 `1.6.115`
- [ ] `CHANGELOG.md` 含 `[1.6.115]`：T6-sa2kit-cmd + showmasterpiece UI 说明
- [ ] `pnpm build` 无错误
- [ ] `dist/showmasterpiece/server` 导出含 `DeleteBookingOptions`、`UNAUTHORIZED`
- [ ] Git commit + push（你的节奏）

---

## 2. npm 发布

- [ ] `npm publish`（或你们内部 registry 流程）
- [ ] 确认线上可安装 `sa2kit@1.6.115`

---

## 3. profile-v1 升级

```bash
cd /home/qhr/project/profile-v1
pnpm add sa2kit@^1.6.115
```

- [ ] 删除 `src/types/sa2kit-showmasterpiece-server.d.ts`（若 node_modules 类型已齐全）
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm build`（可选全量）
- [ ] 抽检：用户删单错误 QQ/手机 → 401；管理端删单 → 200

---

## 4. 文档

- [ ] `FIX_CHECKLIST.md`：T6-sa2kit-cmd 标为 ✅ 已发版
- [ ] `SA2KIT_PLAN.md`：「待发版」改为「已发布」
- [ ] 架构行 `sa2kit@^1.6.115` 与 npm 一致

---

## 5. 回滚

若 1.6.115 有问题：`pnpm add sa2kit@1.6.114` — 宿主 `bookingDelete` 仍保留预校验，删单安全不依赖 Command 第二参数。
