---
# paths: 可选,只在 Claude 读匹配文件时加载,节省 context budget
# paths:
#   - "src/**/*.{ts,tsx}"
#   - "lib/**/*.ts"
---

# Code Style

> **方法论占位模板** —— 各栈自填具体规则。

<!-- 跟语言默认不同的 code style 写在这。Claude 已经会的不写。 -->

## 通用

- 命名:{{NAMING_CONVENTION}}(如 camelCase / snake_case / PascalCase)
- 缩进:{{INDENT}}(如 2 空格 / 4 空格 / tab)
- 行宽上限:{{LINE_LIMIT}}(如 100 / 120)
- 注释纪律:**不写**"这段代码做了什么"(代码自身能说明);**写**"为什么这么做"(决策、约束、 workaround)

## 函数 / 类

- (按需写规则,如"函数 < 50 行 / 类 < 200 行")

## 文件 / 模块

- (按需写规则)

## 错误处理

- (按需写规则)

## 异步代码

- (按需写规则,如"全 async/await,不 mix Promise.then")
