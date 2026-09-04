# ST-11 实验田注册与构建验证

**任务 ID**：T-11  
**状态**：pending  
**依赖**：ST-05（至少主页可访问）

## 目标

在 testField 实验田注册 teachHub 入口，并通过 production build。

## 交付物

- [ ] `src/modules/testField/utils/experimentData.ts` 新增条目
- [ ] 路由可访问：`/testField/teachHub`
- [ ] `pnpm run build` 通过

## experimentData 条目草案

```ts
{
  id: 'teach-hub',
  title: 'Teach 学习工作区',
  description: '每人独立的 teach skill 工作区：管理 Mission、学习 HTML 课时、追踪进度，并可由 Mimo 续备下一课',
  path: '/testField/teachHub',
  tags: ['教育', '乐理', '学习', 'teach', 'AI'],
  category: 'utility',
  isCompleted: false,
  createdAt: '2026-06-15',
  updatedAt: '2026-06-15',
}
```

## 验收标准

1. 实验田列表可见 teachHub 卡片
2. 点击跳转登录守卫后的仪表盘
3. build 日志无 teachHub 相关错误

## 子步骤

1. 插入 experimentData
2. 确认 layout AuthGuard
3. 运行 `pnpm run build`
4. 更新 `teach-hub-plan.md` 勾选 ST-11

## 备注

- 不在本任务自动 commit / push，除非用户要求
