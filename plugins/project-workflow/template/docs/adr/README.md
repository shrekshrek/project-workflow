# Architecture Decision Records (ADR)

> ADR = "Architecture Decision Record"。记录**项目级架构决策的 why**(不记 how / what)。

## 什么时候写 ADR

写:
- 选了 X 不选 Y 的技术决策(数据库、框架、协议等)
- 引入新依赖且**会影响项目结构**
- 拒绝了一个看似合理的方案(留下"为什么没选"的记录)
- 影响多 feature / 多模块的架构边界划分

不写:
- 单功能内的技术选择(那进 `docs/specs/<NNN>-<feature>/plan.md`)
- 临时调试选择(进 plan.md `实施记录`)
- 跟项目无关的个人偏好(进 `CLAUDE.local.md`)

## 命名约定

- `0001-<title>.md`,编号递增,不重用
- title 用 kebab-case,简短:`0001-use-postgres-not-mongo.md`、`0023-deprecate-old-api.md`

## 写法

复制 [`0000-template.md`](0000-template.md) → 改名 → 填内容。

每份 ADR **只追加,不修改**。决策推翻时:
- 起新 ADR
- 老 ADR 的 Status 改为 `Superseded by NNNN`(唯一允许的改动)

**工具支持**(装了 project-workflow 时):`/spec-revise` 起新 ADR 会自动扫既有 ADR 做反向 supersede 核对(经你确认后翻旧状态);`/feature-archive` / `/spec-reconcile` 在合并 current truth 时核对结论与 Accepted ADR 的一致性;`/agents-md-revise` 周期性点名"零引用 + 60 天以上"的孤儿 ADR。状态不实是 ADR 唯一的腐化通道——这三道核对就是为它设的。

## ADR vs 其他文档

| 文档 | 回答 | 范围 | 寿命 |
|---|---|---|---|
| ADR | 为什么这么选(技术取舍) | 跨多个功能的架构决策 | 项目同寿,只追加不修改 |
| `spec.md`(功能级) | 这个功能做什么 | 单功能 | 功能开发期 |
| `plan.md`(功能级) | 这个功能怎么做 | 单功能 | 功能开发期 |
| `AGENTS.md` | 项目长期协作约定 | 全项目 | 缓慢演化 |

## 相关阅读

- [Documenting Architecture Decisions — Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)(模板源头)
- [project-workflow / workflow.md §1.8](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#18-adr-目录初始化)
