# Architecture Decision Records (ADR)

> ADR = "Architecture Decision Record"。记录**项目级架构决策的 why**(不记 how / what)。

## 什么时候写 ADR

写(`ADR_REQUIRED=yes`):
- 改变架构或模块边界
- 形成持久的跨 feature 技术决定(数据库、框架、协议等只有达到这一级才算)
- 取代或直接冲突于既有 Accepted/Proposed ADR

不写:
- 单功能内的技术选择(那进 `docs/specs/changes/<NNN>-<feature>/plan.md`)
- 临时调试选择(进 plan.md `实施记录`)
- 跟项目无关的个人偏好(进 `CLAUDE.local.md`)

## 命名约定

- `0001-<title>.md`,编号递增,不重用
- title 用 kebab-case,简短:`0001-use-postgres-not-mongo.md`、`0023-deprecate-old-api.md`

## 写法

安装 project-workflow 时,由需要 ADR 的 action 从 plugin 内 `template/docs/adr/0000-template.md` 实例化具体编号文件;项目目录不保留空模板。手工流程从 project-workflow 源库同一路径复制。

每份 ADR 在 Accepted 后**正文冻结**。决策推翻时:
- 起新 ADR
- 老 ADR 的 Status 改为 `Superseded by NNNN`(唯一允许的改动)

**工具支持**(装了 project-workflow 时):draft 规划由主会话按 `ADR_REQUIRED` 条件从 plugin 模板实例化 ADR,`/spec-quality-check` 在条件成立时核对引用;`/spec-revise` 对 frozen contract 使用同一判据并核对 supersede。普通修订只写 revision record。`/feature-archive` / `/spec-reconcile` 在合并 current truth 时核对结论与 Accepted ADR 的一致性。ADR 不按年龄或引用数自动失效。

## ADR vs 其他文档

| 文档 | 回答 | 范围 | 寿命 |
|---|---|---|---|
| ADR | 为什么这么选(技术取舍) | 跨多个功能的架构决策 | 项目同寿;Accepted 后正文冻结,状态可闭环 |
| `spec.md`(功能级) | 这个功能做什么 | 单功能 | 功能开发期 |
| `plan.md`(功能级) | 这个功能怎么做 | 单功能 | 功能开发期 |
| `AGENTS.md` | 项目长期协作约定 | 全项目 | 缓慢演化 |

## 相关阅读

- [Documenting Architecture Decisions — Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)(模板源头)
- [project-workflow / workflow.md §1.8](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#18-adr-目录初始化)
