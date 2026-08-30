# Quickstart

先读项目的 `AGENTS.md`，按当前问题选必要动作，不必逐个运行命令。九个动作及其唯一规则源见 [actions](actions/README.md)。

## 开始一个项目

没有工作约定时用 `project-init`；已有代码或自定义约定时用 `project-personalize`。不要为了讨论一个问题初始化全套文件。

## 做一个功能

先沟通问题和具体例子，读取相关代码/测试，关键假设不清楚时做获准的有限试验。目标和验收明确、无需持久交接或风险记录的工作直接实施并报告聚焦检查。

需要跨会话记录、验收追踪或更新当前事实时用 `feature-init`。默认只有：

```text
docs/specs/changes/<NNN>-<slug>/spec.md
```

不选 LIGHT/FULL，不预建计划、任务或证据目录；已有记录覆盖需求则复用。记录怎么写见 [功能记录指南](spec-driven.md)。

`spec-quality-check` 检查依据是否足以实施：缺少关键决定先澄清，缺少可选文件不阻断。实施中的暂停、交接与验证边界见 [feature-init](actions/feature-init.md#implementation-scope-stop)。

## 实现中发现新情况

普通实现细节或任务拆分可继续。影响范围、方案、权限、数据、成本或验收时，先解释影响和建议、确认后用 `spec-revise` 局部更新再继续。不要先扩建，也不要把失败的测试改成新的正确结果。

## 验证和交付

`feature-done` 汇总稳定快照上的 L1、适用的独立 L2/L3 和当前事实状态；non-READY 结束本轮。READY 只表示交付验证通过；明确要求关闭/归档/提交时，再用 `feature-archive` 合并持久事实、移动目录并核验链接。没有通过的检查不能靠补文档变成通过。

当前行为从 `docs/specs/` 和活动记录读取；只有追溯历史才读 `changes/archive/`。真正的历史冲突用 `spec-reconcile`；工程约定出现客观漂移用 `agents-md-revise`。

## 宿主

Claude 与 Codex 的调用方式见 [跨工具说明](cross-tool-methodology.md#3-adapter-mapping)。不要让用户逐个输入命令才能完成一次自然的讨论、实现与交付。
