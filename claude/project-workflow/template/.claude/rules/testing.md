---
description: {{TESTING_DESCRIPTION}}
paths:
{{TESTING_PATHS}}
---

# Testing Conventions

> **方法论占位模板** —— 只填写项目实际采用的测试层级、命令和已有门槛;不为填满模板引入新层级。
> 若本项目已有可复发的测试基础设施故障,记录在 [`docs/gotchas.md`](../../docs/gotchas.md),不要从其他技术栈复制默认答案。

## 已采用的测试层级

- {{TEST_LAYER}}:{{TEST_FRAMEWORK}}

## 文件组织

- 位置:{{TEST_FILE_LAYOUT}}(如 `tests/` 目录镜像 `src/`,或 `<name>.test.ts` 同目录)
- 命名:{{TEST_NAME_PATTERN}}

## 写测试纪律

- 写 spec 时把主要风险映射到最小可执行 verification。
- 失败模式覆盖优先于覆盖率数字,但只覆盖与本次风险相关的错误和边界。
- 同一行为不跨单测、集成和 E2E 重复证明,除非各层提供不同证据。
- 只在多个输入/状态/平台维度的交互会改变结果、项目已有回归矩阵,或发布/合规契约要求时使用测试矩阵;不按 endpoint、状态码或测试层级凑表。

## 跑测试

- 变更范围检查:`{{TEST_RUN_COMMAND}}`
- 覆盖率:`{{COVERAGE_COMMAND}}`(仅当项目已有门槛且本次适用)
- E2E:`{{E2E_RUN_COMMAND}}`(仅当 spec、项目约定或发布风险要求;不进 hook)
