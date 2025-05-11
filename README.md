# 考试系统数据库迁移

本项目将JSON文件格式的考试数据迁移到PostgreSQL数据库，使用Drizzle ORM进行数据库操作。

## 项目设置

1. 安装依赖：

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

2. 复制环境变量文件：

```bash
cp .env.example .env
```

3. 编辑`.env`文件，设置你的PostgreSQL数据库连接URL：

```
DATABASE_URL=postgresql://用户名:密码@localhost:5432/数据库名
```

## 数据库迁移

1. 生成迁移文件：

```bash
npm run db:generate
# 或者
yarn db:generate
# 或者
pnpm db:generate
```

2. 执行迁移：

```bash
npm run db:migrate
# 或者
yarn db:migrate
# 或者
pnpm db:migrate
```

3. 从JSON文件导入数据：

```bash
npm run db:init-experiment
# 或者
yarn db:init-experiment
# 或者
pnpm db:init-experiment
```

## 数据库结构

数据库由以下表组成：

- `exam_types` - 存储考试类型
- `exam_metadata` - 存储考试元数据
- `exam_questions` - 存储考试问题

## API使用

项目提供以下API端点：

- `GET /api/exam/types` - 获取所有考试类型
- `GET /api/exam/[type]/metadata` - 获取特定考试类型的元数据
- `GET /api/exam/[type]/questions` - 获取特定考试类型的问题

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# profile-v1
