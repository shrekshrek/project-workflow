# scaffold-v2 Backlog

> 待评估 / 排期的功能。已确认的功能走 `docs/specs/<NNN>-<slug>/`。

## Tier 2(scaffold 范围内,第一版后做)

- [Email Verification + Password Reset](proposals/email-verification.md) —— 含 MailHog 本地 SMTP 集成、token 表、前端 verify/reset 页
- E2E 测试基建 —— Playwright 集成,跑 register → login → CRUD 全链路

## Tier 3(暂不在 scaffold 范围,业务按需加)

- Social login(GitHub / Google OAuth)
- 2FA / TOTP
- Magic link(无密码登录)
- Redis 缓存 / Celery 任务队列(业务真用上再加)
- WebSocket / SSE(实时推送场景)
- 上传 / 文件存储(对象存储集成)
- 国际化(i18n)

## 工程化待评估

- Pre-commit hook(husky / lefthook) vs 现在的 `pnpm check` 手动跑
- API 文档自动生成 TypeScript client(`openapi-typescript-codegen` 等)
- 监控 / observability(Sentry / OpenTelemetry)
- CI/CD 工作流(本仓库 `.github/workflows/` 目前为空)
