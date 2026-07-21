---
description: {{CODE_STYLE_DESCRIPTION}}
paths:
{{CODE_STYLE_PATHS}}
---

# Code Style

> **方法论占位模板** —— 各栈自填具体规则。

<!-- 跟语言默认不同的 code style 写在这。Claude 已经会的不写。 -->

## 通用

> ⚠️ **缩进 / 行宽**:跟 formatter default 一致(Python Black/Ruff 88 / TS Prettier 80 等)── **不写在这**(workflow §1.3 "标准通用约定不该收")。真覆盖了 default 才在下方加一条 + 同步 lint config(`pyproject.toml [tool.ruff]` / `eslint.config.js`)。

- 注释纪律:**不写**"这段代码做了什么"(代码自身能说明);**写**"为什么这么做"(决策、约束、workaround)

## 命名

- (按需写 lint 不管的项目特定 naming,如 boolean `is_*` prefix、测试函数 pattern、Vue 组件 `PascalCase.vue` vs `kebab-case.vue` 锁一、API endpoint / DB 字段命名等)

## 函数 / 类

- (按需写,如"函数 < 50 行 / 类 < 200 行")

## 文件 / 模块

- (按需写)

## 错误处理

- (按需写)

## 异步代码

- (按需写,如"全 async/await,不 mix Promise.then")
