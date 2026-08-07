# Full-lane feature artifact example

下面用“团队邀请”展示一套完整 `spec.md` / `plan.md` / `tasks.md`。它是写作参考,不是可复制的技术默认值;路径、接口、数据模型和约束必须来自当前项目证据与用户决定。

## `docs/specs/changes/002-invitation/spec.md`

```markdown
# 002 invitation — Change Spec

> 创建于 2026-05-08 · 状态:**已确认**

## 1. Outcomes

管理员在团队设置页输入邮箱发邀请,被邀请者收到邮件、点链接 24 小时内可注册并自动加入团队。
管理员可以在管理页面看到所有未使用的邀请,可手动撤销。

## 2. Scope boundaries

**做**:
- 单邮箱邀请、邮件发送、链接过期、注册自动入队
- 管理页面查看 + 撤销未使用邀请

**不做**:
- SMS / Slack / 企业微信等多渠道邀请
- 邀请配额与使用追踪 UI
- 批量邀请

## 3. Constraints

- 邀请 token 256-bit,HMAC-SHA256 签名(不是加密)
- 24h 过期,过期访问返回 410 Gone
- 同邮箱 24h 内最多发 3 次(速率限制)
- 邮件发送失败必须可重试 3 次

## 4. Verification

- token 生命周期与滥用风险:`invitation service` test 覆盖过期、重复使用、伪造和速率限制
- API / 邮件契约风险:一条 integration test 覆盖 POST、邮件 payload 和 GET token 解码
- provider/config 发生变化时:staging delivery smoke 验证真实邮件链路
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

### 1.1 Sibling Alignment

| 兄弟模块 | 对齐方式 | 备注 |
|---|---|---|
| `backend/src/users/` | Align | 沿用现有 service/transaction 边界 |
| `frontend/layers/teams/` | Deviate | 邀请落地页独立成 invitations layer,避免把注册流塞进 teams |

## 2. 架构决策

### 数据模型

`invitations(id, team_id, email, token_hash, expires_at, created_by, used_at)`

### 外部接口 / API 契约

| Operation / Method | Target / Path | Input | Output | Errors |
|---|---|---|---|---|
| POST | `/invitations` | email | invitation id | 400 / 429 |
| GET | `/invitations/<token>` | token | invitation summary | 404 / 410 |
| DELETE | `/invitations/<id>` | invitation id | 204 | 404 / 409 |

### 关键流程

邀请链接走 frontend 路由 `/i/<token>` → backend 校验 token → 注册时在事务里加入 team。

## 3. Prior decisions

| 决策 | 为什么 |
|---|---|
| Resend 不选 SES | 已有 Resend 账号,SES 还需域名验证 |
| token 存 hash 不存原文 | 数据库泄露后不能直接复用 |
| 邀请链接先进入前端 | 登录/注册跳转由前端统一处理 |

## 4. 风险与未决

### 风险

- Resend 配额可能不足 → 上线后观察

### 未决(实施时决)

- 邀请邮件文案 → 实施前与产品确认

## 5. 实施顺序

1. 建数据模型和 invitation service,先验证 token 生命周期。
2. 接 API 与邮件发送,验证 API / 邮件契约。
3. 接管理页和邀请落地页,按剩余发布风险完成验证。
```

## `docs/specs/changes/002-invitation/tasks.md`

```markdown
# 002 invitation — Tasks

> 基于 plan.md

## 1. 任务清单

### Setup

- [ ] 建 `backend/src/invitations/` 与最小入口文件
- [ ] 接入 backend composition point
- [ ] 添加并验证 invitations migration

### Backend

- [ ] POST `/invitations` + Resend(2h)
- [ ] GET `/invitations/<token>` + 注册时校验(1.5h)
- [ ] DELETE `/invitations/<id>` 撤销(0.5h)

### Frontend

- [ ] 团队设置页:发邀请 form(1h)
- [ ] 邀请管理页:列表 + 撤销(1.5h)
- [ ] 邀请落地页:接受 → 注册流(1h)

### Verification

- [ ] token 生命周期与滥用风险 → 运行 invitation service tests
- [ ] API / 邮件契约风险 → 运行对应 integration test
- [ ] 若 provider/config 有变化 → 运行 staging delivery smoke

### Acceptance

- [ ] spec §4 Verification 全部 pass

## 2. 实施记录

- (只填仍影响交付/维护的偏差、决策或临时方案;不写逐轮测试/调试流水;无则写"无")

## Proof Bundle

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` 或 `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]`; `endpoint-outputs=[tasks receipt, READY status]`
- Checks:`<command; mode=run|same-task reuse; result; totals; reused evidence reference when applicable>`
- Review execution:`L2=<reviewer; mode=fresh-subagent|result-reuse|main-session fallback; status; fallback-reason>|not-run(L1 prerequisite); L3=<same shape>`
- L2:`verdict; baseline=[AGENTS.md + applicable convention paths]; add non-empty exceptions only` 或 `not-run(L1 prerequisite)`
- L3:`verdict; baseline=[spec.md + applicable sections]; add non-empty exceptions only` 或 `not-run(L1 prerequisite)`
- Current truth:
```
