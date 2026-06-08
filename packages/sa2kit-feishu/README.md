# @sa2kit/feishu-bot

飞书自定义机器人 Webhook 消息发送工具包，支持签名校验与 post 富文本消息。

## 安装

在 monorepo 内通过 TypeScript 路径别名引用（见根目录 `tsconfig.json`）。

若发布到 npm：

```bash
pnpm add @sa2kit/feishu-bot
```

## 用法

### 发送消息

```typescript
import { sendFeishuPostMessage, buildFeishuPostMessage } from '@sa2kit/feishu-bot';

const message = buildFeishuPostMessage('【通知标题】', [
  '第一行内容',
  '第二行内容',
]);

const result = await sendFeishuPostMessage(
  'https://open.feishu.cn/open-apis/bot/v2/hook/xxx',
  message,
  'your-sign-secret', // 可选
);

if (!result.success) {
  console.error(result.errorMessage);
}
```

### 首页留言模板

```typescript
import { buildContactFeishuMessage, sendFeishuPostMessage } from '@sa2kit/feishu-bot';

const message = buildContactFeishuMessage({
  name: '张三',
  email: 'zhang@example.com',
  message: '你好',
  submittedAt: new Date().toISOString(),
});

await sendFeishuPostMessage(webhookUrl, message, signSecret);
```

## API

| 导出 | 说明 |
|------|------|
| `sendFeishuPostMessage` | 向 Webhook URL 发送 post 消息 |
| `buildFeishuPostMessage` | 构建通用 post 消息体 |
| `buildContactFeishuMessage` | 构建首页留言通知消息 |
| `formatDateTime` | 中文日期时间格式化 |
| `FeishuPostMessage` | 消息体类型 |
| `FeishuSendResult` | 发送结果类型 |
