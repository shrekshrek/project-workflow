# Proposal: Email Verification + Password Reset

> 状态:**proposal**(待评估,未确认实施)
> 提出时间:2026-05-12
> 关联:[backlog.md](../backlog.md) Tier 2

## 背景

第一版 scaffold 的 auth 是最简版:register + login + JWT + me。没接邮件验证(`email_verified_at` 字段已留位但默认 null,不阻塞登录)。这是脚手架的正常状态——邮件验证一旦真做就是个独立子系统,塞进第一版会让起步变重。

但生产项目通常需要:
- 注册后验证邮箱(防垃圾注册、确认是用户本人)
- 密码重置(忘记密码场景)

## 范围

**Include**:
- 注册流程:发送验证邮件(含一次性 token),用户点链接 → 后端校验 → 写 `email_verified_at`
- 密码重置:`/auth/forgot-password` 发邮件,`/auth/reset-password` 校验 token + 改密码
- Token 持久化:新增 `verification_tokens` 表(`type` 区分 verify / reset,带过期)
- 本地 SMTP 模拟:docker-compose 加 MailHog,8025 端口看邮件 UI
- 邮件模板:纯文本 + HTML 双版本(放 `backend/src/email/templates/`)
- 前端:`/verify-email?token=xxx` + `/forgot-password` + `/reset-password?token=xxx` 三个页

**Exclude**:
- 不强制存量用户重新验证(migration 把所有现有 user 标 verified)
- 不做"重发验证邮件"按钮(第一版,可后加)
- 不接生产 SMTP 供应商(SendGrid / SES / 等)—— 留接口,生产部署时填 env

## 设计要点

### 后端

- 新 module `backend/src/email/`:
  - `service.py` 暴露 `send_verification_email(user)` / `send_reset_email(user)`,内部用 `aiosmtplib`
  - `templates/` 邮件模板(jinja2)
  - 配置走 env(`SMTP_HOST` 等,`.env.example` 已留位注释)
- 扩 `auth` module:
  - `models.py` 加 `VerificationToken` 表
  - `service.py` 加 `request_verification` / `verify_email` / `request_password_reset` / `reset_password`
  - `router.py` 加四个端点
- Migration:`verification_tokens` 表 + data migration 标记存量 user 已验证

### 前端

- 新 view:`VerifyEmailView.vue` / `ForgotPasswordView.vue` / `ResetPasswordView.vue`
- 路由:加三条,都 `meta.hideForAuth: true`
- 注册流程改:成功后跳"验证邮件已发送"提示页(不自动登录)

### Docker

- `docker-compose.yml` 加 mailhog service(`mailhog/mailhog:latest`,1025 SMTP / 8025 UI)
- backend depends_on mailhog
- `.env.example` 解开 SMTP_* 注释(默认指向 mailhog:1025)

## 实施时机

确认时把本提案搬到 `docs/specs/002-email-verification/spec.md`(走 P2 spec-driven 流程),拆 plan + tasks。

预计 1-2 天。这也是 blueprint 验证的好 case —— 跨前后端 / 新增基础设施(MailHog)/ migration / 三个新 view,覆盖面广。

## 开放问题

- Verification token 过期多久?(建议 24h)
- Reset token 过期多久?(建议 1h,生效一次)
- 验证失败是否锁账号?(第一版不锁,只显示错误)
- 是否限速?(防垃圾发邮件——建议 slowapi 限制同 IP / 同 user 频率)
