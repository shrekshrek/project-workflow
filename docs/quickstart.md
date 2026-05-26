# project-workflow 快速开始

当你想在真实项目里按最短路径使用 project-workflow 时,读这份。完整方法论见 [`workflow.md`](workflow.md)。

## 1. 初始化项目约定

新项目:

```text
/project-workflow:project-init
```

已有脚手架 / 复制来的项目:

```text
/project-workflow:project-personalize
```

预期结果:在功能开发前,项目里已有 `AGENTS.md`、`.claude/rules/`、hooks、ADR 模板和 spec 模板。

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

如果还有 failed 项,先修 spec / plan / tasks,不要直接开始实施。

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

它会组合执行:

- L1 机械检查
- L2 项目约定 review
- L3 code-vs-spec review
- proof bundle 写入 `tasks.md`

如果你已经手动跑过 review,只需要装配交付证据:

```text
/project-workflow:proof-bundle <feature-slug>
```

## 5. 发现约定漂移时刷新

周期性、重大依赖/框架变更后,或你发现自己反复提醒 AI 同一件事时,运行:

```text
/project-workflow:agents-md-revise
```

它会让 `AGENTS.md` 和 `.claude/rules/` 跟真实项目保持接近,避免约定只留在聊天记录里。

## 什么时候可以跳过完整流程

| 场景 | 简化做法 |
|---|---|
| 大约 50 行以内的小改动 | 跳过 feature spec,依赖 hooks + review |
| 探索性 spike | 在临时 branch / worktree 做;决策留下来时再写 ADR |
| 生产 hotfix | 先修;之后补测试并记录后续技术债 |
| 架构 / API / 数据模型变更 | 不要跳过 spec;使用 feature spec + ADR |
