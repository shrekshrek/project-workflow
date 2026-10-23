---
description: Gin + sqlx detailed rules (path-scoped to backend Go)
paths:
  - "backend/**/*.go"
---

<!--
来源:此 starter 浓缩了几条社区广为采纳的 Gin / Go web 实践
(参考 Gin 官方 docs + golang-standards/project-layout + Effective Go)。
按项目实际选择适用规则，来源记录在采用它的约定中。
本文件触发条件:Claude 读取 backend/**/*.go 任一文件时自动 inject。
若 tier 命名不是 backend(如 server / api),改上方 paths 列表。
-->

# Gin + sqlx 项目约定

> 项目特有规则由适用的 AGENTS.md 与本文件分工维护。

## 路由 / 端点

- 路由分组用 `r.Group("/api/v1")`;`cmd/<binary>/main.go` 只注册顶层 router,**不**写 handler 内联
- handler 文件组织沿用项目的资源与责任边界
- HTTP path kebab-case(`/user-profile`),verb 走 HTTP method,**不**塞 verb 进 path(`/users/:id` 不 `/get-user/:id`)

## 输入 / 输出 dto

- 输入 dto 用 struct + `binding:` tag:`c.ShouldBindJSON(&dto)`,绑定失败 `c.AbortWithStatusJSON(400, ...)`
- 校验走 `go-playground/validator`(Gin 内建):`Email string \`binding:"required,email"\``
- 输出**返回 dto struct**,**不**直接返 model(避免 ORM 字段意外暴露);敏感字段(password hash 等)从 dto 排除

## Handler 设计

- handler 签名 `func(c *gin.Context)`;**禁** package-global state
- 依赖(DB / config / logger)走 closure 注入(`func NewHandler(deps Deps) gin.HandlerFunc`)或 context value
- handler 内**只**做:bind dto → call service → 返回 response;业务逻辑全在 `service.go`

## Middleware

- CORS / auth / logging / request-id / panic-recover 走 middleware,**禁** handler 内 inline
- middleware 顺序按恢复、日志上下文、跨域和认证的实际依赖确定
- 自定义 middleware 用 `func(c *gin.Context) { ... c.Next() ... }` 模式

## 错误处理

- handler 内 `c.Error(err); c.AbortWithStatus(500); return`,让中央 `errorHandler` middleware 接管 + 统一 response shape
- 业务错误用自定义 `type AppError struct { Code int; Msg string }` + `errors.As` 提取 status code
- **禁** `if err.Error() == "..."` 字符串比较;用 `errors.Is` / `errors.As` 类型化

## Context 传递

- 服务函数签名第一个参数必 `ctx context.Context`(从 `c.Request.Context()` 取)
- **禁** `context.Background()` / `context.TODO()` 出现在 handler 调用链;cancel 信号必须透传
- context value 命名空间:用包级 `type ctxKey int; const userIDKey ctxKey = iota`,**禁** 字符串 key

## sqlx 查询

- 用 `db.GetContext` / `db.SelectContext` / `db.NamedExecContext` + struct tag `db:"col_name"`
- **禁** `fmt.Sprintf` / 字符串拼接 SQL — 永远 named param 或 `?` placeholder
- Transaction:检查 `BeginTxx` 错误，安排失败回滚，并检查 `Commit` 结果
- Migration 沿用项目已有工具与发布流程

## Config

- 配置沿用项目现有加载方式
- 敏感字段不打 log;`String()` method 显式 redact
- Config 通过 wiring 注入,**禁** package-level global var(测试不友好)

## 测试

- HTTP 行为可用 `httptest.NewRecorder()` + Gin engine 做进程内验证
- 按本次主要风险选择最小场景集;只有不同场景能证明不同风险时才增加用例,不按 endpoint 固定凑 happy / 边界 / 状态码矩阵
- 相似输入输出场景可用 table-driven tests 合并重复代码
- DB 测试:transactional rollback / testcontainers-go / sqlmock 各有取舍,见项目 ADR
