---
description: {{CODE_STYLE_DESCRIPTION}}
paths:
{{CODE_STYLE_PATHS}}
---

# Code Style

> **方法论占位模板** —— 各栈自填具体规则。

<!-- 跟语言默认不同的 code style 写在这。Claude 已经会的不写。 -->

## 通用

> 格式规则由项目 formatter/lint 配置维护；这里只记录工具不能表达的项目特有约定。

- 注释纪律:**不写**"这段代码做了什么"(代码自身能说明);**写**"为什么这么做"(决策、约束、workaround)

## 命名

- (按需写 lint 不管的项目特定 naming,如 boolean `is_*` prefix、测试函数 pattern、Vue 组件 `PascalCase.vue` vs `kebab-case.vue` 锁一、API endpoint / DB 字段命名等)

## 函数 / 类

- (按项目已有约定填写职责或接口要求)

## 文件 / 模块

- (按需写)

## 错误处理

- (按需写)

## 异步代码

- (按项目实际并发与取消约定填写)
