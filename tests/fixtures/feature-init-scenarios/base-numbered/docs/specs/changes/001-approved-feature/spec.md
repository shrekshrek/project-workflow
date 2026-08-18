# 001 approved-feature — Change Spec

> 创建于 2026-07-01 · 状态:草稿 / **已确认** / 已实现

## 1. Outcomes

已登录用户可以在个人资料页看到现有会话列表。

## 2. Scope boundaries

**做**:
- 展示现有会话。

**不做**:
- 不增加新 API。
- 不修改会话生命周期。

## 3. Constraints

- 沿用现有 auth 契约。

## 4. Verification

- Primary flow: 已登录用户打开个人资料页后可看到现有会话列表 → 现有 profile/session 展示测试。
- 会话列表继续沿用现有 auth 契约且不新增 API → 同一测试与 changed-scope project checks。
