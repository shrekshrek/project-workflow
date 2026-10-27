---
description: Project security requirements for secrets, trust boundaries, and sensitive data
# 安全规则不加 paths frontmatter，由 Claude Code 自动全局加载。
---

# Security Rules

## 绝不(🚫 Never)

- 提交 secret、API key 或含凭据的配置到 git
- 在代码里硬编码 credential
- 在命令、查询或模板中拼接不可信输入
- 未验证就跨越外部输入、文件、网络或进程边界
- 在日志、错误或持久化数据中暴露 secret / credential / token

## 默认做(✅ Always)

- 在每个外部信任边界做与当前栈一致的校验、编码或参数化
- 对外错误不泄露内部路径、stack trace 或敏感上下文
- 密钥通过项目认可的 secret/config 机制注入,不写进源码
- 日志和遥测脱敏敏感字段

重大安全边界变化按项目的执行预览与 Scope Stop 沟通；外部写入和不可逆操作遵守实际授权。
安全验证纳入相关风险的检查及 `feature-done`，项目明确要求的额外审查照常执行。
