---
description: {{CODE_STYLE_DESCRIPTION}}
globs: {{CODE_STYLE_GLOBS}}
---

# Code Style

> **方法论占位模板** —— 各栈自填具体规则。

<!-- 跟语言默认不同的 code style 写在这。Claude 已经会的不写。 -->

## 通用

> ⚠️ **命名 / 缩进 / 行宽**:default 跟 formatter / 语言惯例 (Python snake_case + 4 空格 / TS camelCase + 2 空格 / Black 88 / Prettier 80) ── **不写在这**(workflow §1.3 "标准通用约定不该收")。
> 真覆盖了 default 才在下方加一条 + 同步 lint config(`pyproject.toml [tool.ruff]` / `eslint.config.js`)。

- 注释纪律:**不写**"这段代码做了什么"(代码自身能说明);**写**"为什么这么做"(决策、约束、workaround)

## 函数 / 类

- (按需写规则,如"函数 < 50 行 / 类 < 200 行")

## 文件 / 模块

- (按需写规则)

## 错误处理

- (按需写规则)

## 异步代码

- (按需写规则,如"全 async/await,不 mix Promise.then")
