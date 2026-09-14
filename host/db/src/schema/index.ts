/**
 * 全站 schema 聚合（drizzle migrate / 主站 db 客户端）。
 * 按域拆分见 `./domains/*` 与 docs/code-review/packages/db-schema-domains.md。
 */
export * from './domains/platform';
export * from './domains/product';
export * from './domains/webExperiments';
