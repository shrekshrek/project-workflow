---
description: Security baseline (always-loaded — Never/Ask first/Always lists)
# 安全规则不加 paths frontmatter，由 Claude Code 自动全局加载。
---

# Security Rules

## 绝不(🚫 Never)

- 提交 `.env*` / secret / API key 到 git
- 在代码里硬编码 credential
- 在命令、查询或模板中拼接不可信输入
- 未验证就跨越外部输入、文件、网络或进程边界
- 在日志、错误或持久化数据中暴露 secret / credential / token

## 必须确认(⚠️ Ask first)

- 改认证、授权、身份或权限边界
- 改公开接口、数据契约或敏感信息处理
- 加新的外部数据传输或外部写操作
- 做不可逆迁移或扩大受信任边界

## 默认做(✅ Always)

- 在每个外部信任边界做与当前栈一致的校验、编码或参数化
- 对外错误不泄露内部路径、stack trace 或敏感上下文
- 密钥通过项目认可的 secret/config 机制注入,不写进源码
- 日志和遥测脱敏敏感字段

## 走 agent review

涉及以下任一,功能完成时跑 `/security-review`(Claude Code 原生)或同类:

- 认证 / 授权
- 外部输入处理
- 外部数据源(API / 文件 / DB / message / process)
- 密钥 / token 管理
- 任何 `eval` / `exec` / shell 调用
