# 001 todos — Spec (WHAT)

> 创建于 2026-05-12 · 状态:已实现(第一版随脚手架交付)

## 1. 目标

让登录用户管理自己的 TODO 列表 —— 最小可用 CRUD,作为 scaffold-v2 的首个 feature,**目的是跑通 spec-driven 全链路**,不是做完美的 TODO 应用。

## 2. 范围

**Include**:
- 列出当前用户所有 TODO(按创建时间倒序)
- 创建 TODO(纯文本)
- 标记完成 / 取消完成
- 删除 TODO

**Exclude**:
- 分页 / 搜索 / 过滤(数量少不需要)
- 截止时间 / 优先级 / 标签
- 共享给其他用户
- 子任务嵌套
- 批量操作

## 3. 用户场景

- **新用户登录后**:看到空列表 + "还没有 TODO" 引导
- **创建**:输入框 → 回车 / 点添加 → 立即出现在列表顶部
- **完成**:点 checkbox → 立即划线 + 灰显
- **删除**:点删除按钮 → 确认框 → 删除 → 列表更新
- **跨用户隔离**:用户 A 看不到也改不了用户 B 的 TODO

## 4. 数据模型

```
todos
├── id            int, PK
├── user_id       int, FK → users.id, ON DELETE CASCADE
├── text          string(500), not null
├── done          bool, default false
├── created_at    datetime
└── updated_at    datetime
```

索引:`user_id`(按用户查询)

## 5. API 契约

所有端点前缀 `/api/v1/todos`,**全部要 JWT**(`Authorization: Bearer <token>`)。

| 方法 | 路径 | Body | 响应 | 状态码 |
|---|---|---|---|---|
| GET | `/` | — | `{ items: Todo[], total: int }` | 200 |
| POST | `/` | `{ text: string }` | `Todo` | 201 |
| PATCH | `/{id}` | `{ text?, done? }` | `Todo` | 200 |
| DELETE | `/{id}` | — | — | 204 |

错误:
- 401 未登录 / token 失效
- 404 todo 不存在 **或** 不属于当前用户(不暴露存在性,避免 enumeration)
- 422 校验失败(text 空 / 超长)

## 6. 验证标准(verification)

完成时需通过:
- [x] 后端单元测试 `tests/todos/test_router.py` 全绿(10 个用例)
- [x] 覆盖 happy path + 边界(空 text)+ 错误路径(401 / 404)
- [x] 跨用户隔离测试(用户 B 改不了用户 A 的 todo)
- [x] 前端 `pnpm fe:typecheck` 通过
- [x] 手动验证:浏览器走完 register → login → 创建 → 完成 → 删除 全流程
