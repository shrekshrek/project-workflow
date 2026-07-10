# project-workflow 快速开始

当你想在真实项目里按最短路径使用 project-workflow 时,读这份。完整方法论见 [`workflow.md`](workflow.md),action 权威定义见 [`actions/`](actions/),跨工具边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

本文使用 Claude Code 命令示例;Codex 安装 plugin 后使用同名 `$skill`,手工模式按 [`docs/actions/`](actions/) 执行同一 action。

日常主路径只有这一条:

```text
一次初始化
  → 小改直接做;需要追踪时 feature-init(no artifact / light / full)
  → full lane 与用户补完草稿后跑 spec-quality-check
  → 实施
  → feature-done
  → feature-archive 周期性批量收尾
```

四个低频入口不属于日常必经步骤:

| 仅在这种情况出现 | Action |
|---|---|
| 复制脚手架或任意非空既有代码库 retrofit | [`project-personalize`](actions/project-personalize.md) |
| 已确认契约在实施中发生实质变化 | [`spec-revise`](actions/spec-revise.md) |
| 存量 active specs 已经互相冲突 | [`spec-reconcile`](actions/spec-reconcile.md) |
| 客观项目状态与 A 类约定发生 drift | [`agents-md-revise`](actions/agents-md-revise.md) |

## 1. 初始化项目约定

空目录或真正的新项目:

```text
/project-workflow:project-init
```

已有脚手架、复制来的项目或任意非空既有代码库:

```text
/project-workflow:project-personalize
```

预期结果:在功能开发前,项目里已有 `AGENTS.md`、路径级规则语义、hook adapter 和 ADR 模板。只有确认了安全、快速的单文件命令时 edit hook 才标 active;否则明确是 scaffold/inactive,端点检查仍由 `feature-done` 执行。Feature spec 模板保留在 plugin 内,由 `feature-init` 在创建具体 `docs/specs/changes/<NNN>-<slug>/` 时复制;目标项目默认不保留 `docs/specs/changes/_template/`。Claude Code adapter 默认把路径级规则 materialize 为 `.claude/rules/`;Codex adapter 优先通过嵌套 `AGENTS.md` 和显式规则章节承载同一语义,并用 `.codex/hooks.json` 映射 runtime enforcement。必要时只把 `.claude/rules/` 当兼容输入读取。

## 2. 判断是否需要 feature artifact

小 bugfix、文案、样式、局部测试修复、低风险文档编辑,以及已确认 spec 下的实施任务,不要启动 project-workflow;直接做,遵守 `AGENTS.md` / path rules,最后说明改动和验证结果。

需要持久追踪、验证记录或规约保护时,再运行:

```text
/project-workflow:feature-init <feature-slug>
```

全道 feature 然后补全:

- `docs/specs/changes/<NNN>-<slug>/spec.md`:结果、范围、约束、验证方式
- `docs/specs/changes/<NNN>-<slug>/plan.md`:模块影响、Sibling Alignment、技术决策
- `docs/specs/changes/<NNN>-<slug>/tasks.md`:可验证的实施步骤

轻车道小改只有 `tasks.md`,补全目标/边界、验证、任务和 proof bundle;不跑 `spec-quality-check`。

全道写代码前先跑:

```text
/project-workflow:spec-quality-check <feature-slug>
```

如果还有 failed 项,先修 spec / plan / tasks,不要直接开始实施。borderline 项可以继续,但必须在 `plan.md` 风险 / open issues 或 `tasks.md` 实施说明里显式记录接受理由和后续处理。轻车道不跑 `spec-quality-check`。

## 3. 按 spec 边界实施

全道让 AI 基于 `spec.md` + `plan.md` + `tasks.md` 写代码。轻车道基于 `tasks.md` 写代码。未启动 project-workflow 的小任务直接按当前上下文实施。

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
- current-truth check(仅当 `docs/specs/<area>.md` 存在)
- proof bundle 写入 `tasks.md`

需要局部复查某一层时重跑 `feature-done`(幂等,复用有效缓存),或在主会话直接 dispatch reviewer sub-agent;没有独立的 helper 命令。

交付合并后,周期性跑一次生命周期清扫(不必每个 feature 都立刻跑,攒几个一起也行):

```text
/project-workflow:feature-archive
```

它把所有已交付 feature 的目录整体移入 `docs/specs/changes/archive/`(活动区只留进行中的工作,历史 spec 不再污染检索),对标了 "current truth 更新 pending" 的 feature 先把持久结论合并进 `docs/specs/<area>.md`,被取代的老 spec 标 `已取代` / `已废弃`。带 slug 可以只收尾单个 feature。

## 4.5 存量项目 spec 已经积累混乱时

老项目引入生命周期管理,或某产品域积累了多份互相矛盾的 spec 时,先做一次性修复再动工:

```text
/project-workflow:spec-reconcile <area-or-module>
```

它输出冲突矩阵、指定 source of truth、经你确认后修正生命周期状态并归档失效 spec。稳态下(archive 清扫常态化后)很少需要它。

## 5. 发现约定漂移时刷新

周期性、重大依赖/框架变更后,或你发现自己反复提醒 AI 同一件事时,运行:

```text
/project-workflow:agents-md-revise
```

它会让 `AGENTS.md` 和路径级规则语义跟真实项目保持接近,避免约定只留在聊天记录里。Claude Code adapter 会检查 `.claude/rules/`;Codex adapter 会优先检查嵌套 `AGENTS.md` 和显式规则章节。

## 什么时候可以跳过完整流程

| 场景 | 简化做法 |
|---|---|
| 大约 50 行以内的小改动 | 跳过 feature spec,依赖 hooks + review;例外:改动改变 `docs/specs/<area>.md` 已声明的当前行为或持久规则时至少走轻车道(current truth 只经管线更新) |
| 探索性 spike | 在临时 branch / worktree 做;决策留下来时再写 ADR |
| 生产 hotfix | 先修;之后补测试并记录后续技术债 |
| 架构 / API / 数据模型变更 | 不要跳过 spec;使用 feature spec + ADR |
