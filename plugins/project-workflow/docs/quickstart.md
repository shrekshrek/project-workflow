# project-workflow 快速开始

当你想在真实项目里按最短路径使用 project-workflow 时,读这份。完整方法论见 [`workflow.md`](workflow.md),action 权威定义见 [`actions/`](actions/),跨工具边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

本文按 **workflow action** 写。命令示例是当前成熟的 **Claude Code adapter** 入口;Codex 安装 `plugins/project-workflow/` 后使用同名 `$skill`;OpenCode / 手工模式执行同一 action,但入口可以不同。

| Action | Canonical spec | Claude Code adapter | Codex / manual fallback |
|---|---|---|---|
| 初始化项目约定 | [`project-init`](actions/project-init.md) / [`project-personalize`](actions/project-personalize.md) | `/project-workflow:project-init` 或 `/project-workflow:project-personalize` | Codex:`$project-init` / `$project-personalize`;manual:复制 `template/`,按 action spec 填 `AGENTS.md` / path-scoped rules / hooks |
| 开始功能 | [`feature-init`](actions/feature-init.md) | `/project-workflow:feature-init <slug>` | Codex:`$feature-init <slug>`;manual:创建 `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md` |
| 实施前质量门 | [`spec-quality-check`](actions/spec-quality-check.md) | `/project-workflow:spec-quality-check <slug>` | Codex:`$spec-quality-check <slug>`;manual:按 action spec + `spec-driven.md §3.7` 7 问检查 |
| 中途修订 | [`spec-revise`](actions/spec-revise.md) | `/project-workflow:spec-revise <slug>` | Codex:`$spec-revise <slug>`;manual:按 action spec 修 spec、ADR、plan、tasks |
| 完成交付 | [`feature-done`](actions/feature-done.md) | `/project-workflow:feature-done <slug>` | Codex:`$feature-done <slug>`;manual:手动跑 L1/L2/L3 + proof bundle |
| 约定刷新 | [`agents-md-revise`](actions/agents-md-revise.md) | `/project-workflow:agents-md-revise` | Codex:`$agents-md-revise`;manual:按 action spec 扫 A 类约定和真实项目 drift |

## 1. 初始化项目约定

新项目:

```text
/project-workflow:project-init
```

已有脚手架 / 复制来的项目:

```text
/project-workflow:project-personalize
```

预期结果:在功能开发前,项目里已有 `AGENTS.md`、路径级规则语义、hooks、ADR 模板和 spec 模板。Claude Code adapter 默认把路径级规则 materialize 为 `.claude/rules/`;Codex adapter 优先通过嵌套 `AGENTS.md` / `AGENTS.override.md` 和显式规则章节承载同一语义,并用 `.codex/hooks.json` 映射 runtime enforcement。必要时只把 `.claude/rules/` 当兼容输入读取。

## 2. 开始一个功能

```text
/project-workflow:feature-init <feature-slug>
```

然后补全:

- `docs/specs/<NNN>-<slug>/spec.md`:结果、范围、约束、验证方式
- `docs/specs/<NNN>-<slug>/plan.md`:模块影响、Sibling Alignment、技术决策
- `docs/specs/<NNN>-<slug>/tasks.md`:可验证的实施步骤

写代码前先跑:

```text
/project-workflow:spec-quality-check <feature-slug>
```

如果还有 failed 项,先修 spec / plan / tasks,不要直接开始实施。borderline 项可以继续,但必须在 `plan.md` 风险 / open issues 或 `tasks.md` 实施说明里显式记录接受理由和后续处理。

## 3. 按 spec 边界实施

让 AI 基于 `spec.md` + `plan.md` + `tasks.md` 写代码。

如果实施中发现 spec 或 plan 本身错了,先停下,不要边改代码边改规格。运行:

```text
/project-workflow:spec-revise <feature-slug>
```

这个命令用于真实的需求、契约、模块边界变更;普通任务进度不需要用它。

## 4. 完成功能

```text
/project-workflow:feature-done <feature-slug>
```

这是默认端点门禁,会组合执行:

- L1 机械检查
- L2 项目约定 review
- L3 code-vs-spec review
- proof bundle 写入 `tasks.md`

Claude Code adapter 还保留 `l1-review` / `l2-review` / `l3-review` / `proof-bundle` 作为 helper skills,用于局部复查或调试。它们不是独立 workflow action。正常交付只跑 `feature-done`;如果你已经手动跑过 review,只需要在 Claude Code 中装配交付证据:

```text
/project-workflow:proof-bundle <feature-slug>
```

## 5. 发现约定漂移时刷新

周期性、重大依赖/框架变更后,或你发现自己反复提醒 AI 同一件事时,运行:

```text
/project-workflow:agents-md-revise
```

它会让 `AGENTS.md` 和路径级规则语义跟真实项目保持接近,避免约定只留在聊天记录里。Claude Code adapter 会检查 `.claude/rules/`;Codex adapter 会优先检查嵌套 `AGENTS.md` / `AGENTS.override.md` 和显式规则章节。

## 什么时候可以跳过完整流程

| 场景 | 简化做法 |
|---|---|
| 大约 50 行以内的小改动 | 跳过 feature spec,依赖 hooks + review |
| 探索性 spike | 在临时 branch / worktree 做;决策留下来时再写 ADR |
| 生产 hotfix | 先修;之后补测试并记录后续技术债 |
| 架构 / API / 数据模型变更 | 不要跳过 spec;使用 feature spec + ADR |
