# Full-lane feature artifact example

下面用“团队邀请”展示一套完整 `spec.md` / `plan.md` / `tasks.md`。它是写作参考,不是可复制的技术默认值;路径、接口、数据模型和约束必须来自当前项目证据与用户决定。

## `docs/specs/changes/002-invitation/spec.md`

```markdown
# 002 invitation — Spec

> 创建于 2026-05-08 · 状态:已确认

## 1. Outcomes

管理员在团队设置页输入邮箱发邀请,被邀请者收到邮件、点链接 24 小时内可注册并自动加入团队。
管理员可以在管理页面看到所有未使用的邀请,可手动撤销。

## 2. Scope boundaries

**做**:
- 单邮箱邀请、邮件发送、链接过期、注册自动入队
- 管理页面查看 + 撤销未使用邀请

**不做**:
- 多渠道(SMS / Slack / 企业微信)、邀请配额、追踪 UI、批量邀请

## 3. Constraints

- 邀请 token 256-bit,HMAC-SHA256 签名(不是加密)
- 24h 过期,过期访问返回 410 Gone
- 同邮箱 24h 内最多发 3 次(速率限制)
- 邮件发送失败必须可重试 3 次

## 4. Verification

- 单测:invitation service 的过期/重复使用/token 伪造/速率限制四场景
- 集成:POST + 邮件 mock 验 payload + GET 验 token 解码
- 手测:真实邮箱发,完整 happy path
- 上线指标:发送成功率 ≥ 99%
```

## `docs/specs/changes/002-invitation/plan.md`

```markdown
# 002 invitation — Plan

> 基于 spec.md

## 1. 模块影响范围

- `backend/src/invitations/` —— 新增模块
- `backend/src/users/` —— 改:加 `accept_invitation` 方法
- `backend/src/email/` —— 改:加邀请模板
- `frontend/layers/invitations/` —— 新增 layer
- `frontend/layers/teams/` —— 改:设置页加 form

## 2. 架构决策

- 邀请数据模型:`invitations(id, team_id, email, token_hash, expires_at, created_by, used_at)`
- 邀请链接走 frontend 路由 `/i/<token>` → 调 backend `GET /invitations/<token>` → 落地页注册流
- 注册时校验 token 并在事务里 join team

## 3. Prior decisions

- Resend 不选 SES:已有 Resend 账号,SES 要跑域名验证
- token 存 hash 不存原文(类似密码):泄露 db 不能复用
- 邀请链接经前端而非直打 backend:UX(401 跳登录易处理)

## 4. 风险与未决

- 风险:Resend 配额上限不够支撑大量邀请 → 上线后观察
- 未决:邀请邮件文案 → 实施时跟产品对一遍
```

## `docs/specs/changes/002-invitation/tasks.md`

```markdown
# 002 invitation — Tasks

> 基于 spec.md + plan.md

## 任务清单

### 后端
- [ ] migration: invitations 表(2h)
- [ ] backend: POST /invitations + Resend(2h)
- [ ] backend: GET /invitations/<token> + 注册时校验(1.5h)
- [ ] backend: DELETE /invitations/<id> 撤销(0.5h)

### 前端
- [ ] 团队设置页:发邀请 form(1h)
- [ ] 邀请管理页:列表 + 撤销(1.5h)
- [ ] 邀请落地页:接受 → 注册流(1h)

### 验证
- [ ] e2e: 发→收邮件→点链接→注册→入队(0.5h)
- [ ] 单测覆盖 spec.md §4 的四个核心场景(0.5h)

## 实施记录

- (实施时填)
```
