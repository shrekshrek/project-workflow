---
# 安全规则全量加载,不加 globs frontmatter
---

# Security Rules

## 绝不(🚫 Never)

- 提交 `.env*` / secret / API key 到 git
- 在代码里硬编码 credential
- 用 raw SQL 拼接(用 ORM 或参数化查询)
- 信任用户输入(必须 validate / sanitize)
- 把 password / token 明文存数据库(必须 hash / 加密)

## 必须确认(⚠️ Ask first)

- 改认证 / 授权逻辑
- 改 token / session 处理
- 加新的外部 API 调用(确认是否引入数据外泄风险)
- 改 CORS / CSP / 同源策略
- 数据库迁移涉及敏感字段

## 默认做(✅ Always)

- 用户输入用 schema 校验(Pydantic / Zod / 等)
- 错误信息不泄露 stack trace 给 end user(只 log,不 expose)
- 密钥从环境变量读,不在代码里
- 日志脱敏敏感字段

## 走 agent review

涉及以下任一,功能完成时跑 `/security-review`(Claude Code 原生)或同类:

- 认证 / 授权
- 用户输入处理
- 外部数据源(API / 文件 / DB)
- 密钥 / token 管理
- 任何 `eval` / `exec` / shell 调用
