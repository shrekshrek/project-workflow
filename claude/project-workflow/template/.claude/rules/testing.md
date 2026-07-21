---
description: {{TESTING_DESCRIPTION}}
paths:
{{TESTING_PATHS}}
---

# Testing Conventions

> **方法论占位模板** —— 各栈自填测试框架、命令、覆盖率门槛。
> 若本项目已有可复发的测试基础设施故障,记录在 [`docs/gotchas.md`](../../docs/gotchas.md),不要从其他技术栈复制默认答案。

## 测试框架

- 单元测试:{{UNIT_TEST_FRAMEWORK}}
- 集成测试:{{INTEGRATION_TEST_FRAMEWORK}}
- E2E:{{E2E_FRAMEWORK}}(如 Playwright / Cypress)

## 文件组织

- 位置:{{TEST_FILE_LAYOUT}}(如 `tests/` 目录镜像 `src/`,或 `<name>.test.ts` 同目录)
- 命名:{{TEST_NAME_PATTERN}}

## 写测试纪律

- **TDD-light**:写 spec 时同时列 verification(workflow.md §3 P2.3 proof bundle)
- **失败模式覆盖优先于覆盖率数字**:可执行的关键场景比"达到 80%" 更重要
- **不写 happy-path-only 测试**:加错误路径 + 边界条件

## 跑测试

- 单测:`{{TEST_RUN_COMMAND}}`
- 覆盖率:`{{COVERAGE_COMMAND}}`,门槛 ≥ {{COVERAGE_THRESHOLD}}%
- E2E:`{{E2E_RUN_COMMAND}}`(交付前跑,不进 hook)
