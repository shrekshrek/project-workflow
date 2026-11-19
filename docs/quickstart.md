# Quickstart

先读项目的 `AGENTS.md`，按当前问题选必要动作，不必逐个运行命令。完整规则见 [actions](actions/README.md)。

## 开始一个项目

新旧项目都从 `project-init` 开始；它会按项目现状完成设置，必要时转入 `project-personalize`。不要为了讨论一个问题初始化全套文件。

项目级规划使用独立的 `project-blueprint`，但不是使用 Workflow 的前提。有已确认的 Blueprint 规划就引用，没有也能正常开发。

## 做一个功能

先沟通问题和具体例子，读取相关代码/测试，关键假设不清楚时做获准的有限试验。目标和验收明确、无需交接或记录风险的工作可直接实施，并报告相关检查结果。

需要跨会话保留决定、追踪验收或更新产品现状文档时用 `feature-init`。默认只有：

```text
docs/specs/changes/<NNN>-<slug>/spec.md
```

不分文档套餐，不预建计划、任务或证据目录；已有记录覆盖需求则复用。记录怎么写见 [功能记录指南](spec-driven.md)。

开工前按 [实施预告](actions/feature-init.md#record-and-authorization) 主动讲清怎么做和重要选择，已经确认的决定直接沿用。`spec-quality-check` 检查依据是否足以实施：缺少关键决定先澄清，缺少可选文件不阻断。何时停下来沟通、展示结果和验证，见 [feature-init](actions/feature-init.md#implementation-scope-stop)。

## 实现中发现新情况

普通实现细节或任务拆分可继续。发现范围、方案、权限、数据、成本或验收需要重要调整时，先解释影响和建议、确认后用 `spec-revise` 局部更新再继续。不要先扩建，也不要把失败的测试改成新的正确结果。

## 验证和交付

`feature-done` 检查本次改动，汇总测试、适用的独立审查和产品文档状态，说明结果、偏差及查看方式。未通过时报告问题并结束本轮验收；READY 表示验证通过，仍可测试和反馈。按 [关闭授权](actions/feature-archive.md#closure-authorization) 使用 `feature-archive` 收尾；提交代码不等于关闭功能，补文档也不能让失败的检查变成通过。

了解当前行为时读 `docs/specs/` 和活动记录，追溯历史才读 `changes/archive/`。记录之间存在实际冲突时用 `spec-reconcile`；项目约定与代码或配置不符时用 `agents-md-revise`。

如果功能发现项目目标、范围、长期架构、数据所有权或安全边界需要改变，先暂停受影响工作，解决项目级决定并更新已有 Blueprint，不在功能记录里悄悄扩大范围。

## 宿主

Claude 与 Codex 的调用方式见 [跨工具说明](cross-tool-methodology.md#3-adapter-mapping)。不要让用户逐个输入命令才能完成一次自然的讨论、实现与交付。
