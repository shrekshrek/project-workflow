# Cross-tool methodology

> project-workflow 的目标不是绑定某一个 AI coding tool,而是让同一套工程方法可以在 Claude Code、Codex,以及手工流程中保持一致。工具可以换,但方法论核心不能漂。

---

## 1. Core vs adapter

project-workflow 分两层:

| 层 | 定义 | 是否工具绑定 | 例 |
|---|---|---|---|
| **Methodology core** | 项目长期资产和流程契约 | 否 | `AGENTS.md`, `docs/specs/`, `docs/specs/changes/`, conditional ADR, delivery receipt, L1/L2/L3 review model, `docs/actions/`, `docs/reviewers/` |
| **Runtime adapter** | 把 core 自动化到某个工具里的封装 | 是 | Claude Code plugin skills, Codex skills/plugins/hooks, shell scripts |

**判断规则**:

- 如果换工具后仍应该保留,它属于 methodology core。
- 如果只是某个工具如何触发、加载、分发、授权,它属于 runtime adapter。
- Core 文档只能引用 adapter 作为"可选执行方式",不能把 adapter 行为写成方法论前提。

---

## 2. Methodology core invariants

无论使用 Claude Code、Codex,还是手工执行,以下不变量保持不变:

1. **A 类约定是项目当前规则源**
   `AGENTS.md` 是跨工具 canonical 入口。路径级规则可以有工具适配形式,但规则内容仍属于 A 类约定。

2. **无需新 artifact 的任务不启动 project-workflow**
   小 bugfix、文案、样式、局部测试修复、低风险文档编辑,以及已确认 spec 下的实施任务,不新建 feature artifact;直接做时仍遵守 `AGENTS.md` / path rules 和相关检查。

3. **Feature artifact 只有 Full / Light 两类**
   全道 feature 使用 `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md`;轻车道使用同目录下的 `tasks.md`。

4. **Spec quality gate 在实施前发生**
   全道 feature 开始实现前必须通过 7 问质量检查。Failed 项阻断实施;borderline 项允许继续,但要显式记录风险和修法。

5. **中途改 frozen spec 走修订 SOP**
   已确认并开始实施后,修改 `spec.md` 必须有修订记录和 plan/tasks 同步;只有架构/模块边界、持久跨功能技术决定或取代既有 ADR 时才创建 ADR。Draft 阶段自由编辑。

6. **交付验证按规则源分层**
   L1 机械检查、L2 项目约定、L3 feature spec 分开跑,紧凑 delivery receipt 负责聚合决策所需证据和 verdict。

7. **Drift refresh 只处理 A 类约定**
   P4 更新 `AGENTS.md` / 路径规则,不回写历史 spec,也不把 backlog 放进 repo 文件。

8. **Workflow action 有唯一权威层**
   `docs/actions/` 定义每个 public workflow action 的触发、输入、输出、不变量和验证。Claude Code skills、Codex skills、shell scripts、手工流程只能增加 runtime 执行细节,不能重新定义 action。

9. **Reviewer 方法有唯一权威层**
   `docs/reviewers/` 定义 reviewer、auditor、researcher 的任务边界、输入、检查方法和输出形状。Claude `agents/` 与 Codex plugin skills 只是 adapter,不能各自维护一套 reviewer 方法。

10. **所有 adapter 暴露同一组 public action,没有第二套 surface**
   默认跨工具 action 是 `project-init` / `project-personalize` / `feature-init` / `spec-quality-check` / `spec-revise` / `feature-done` / `feature-archive` / `spec-reconcile` / `agents-md-revise`。`feature-done` 内聚 L1/L2/L3/current-truth check/delivery receipt 全部端点步骤;局部复查通过重跑 `feature-done` 或直接按 `docs/reviewers/` 跑 reviewer 完成,不再设独立 helper 命令。

11. **`已实现` 不等于"仍是产品现状"**
   交付后的生命周期语义是跨工具的:`docs/specs/changes/` 活动区只放进行中的变更,已交付的整目录归档到 `docs/specs/changes/archive/`(检索现状时排除);被取代的 change 标 `已取代` / `已废弃`;current truth(`docs/specs/<area>.md`)是产品域现状的唯一权威。任何 adapter 在长周期产品域取 context 时,应优先读 current truth,不把 archive 内容当有效基线。

---

## 3. Adapter mapping

| Methodology need | Claude Code adapter | Codex adapter | Manual fallback |
|---|---|---|---|
| Persistent project guidance | `AGENTS.md` + `CLAUDE.md` 1 行 alias | `AGENTS.md` discovery | 读 `AGENTS.md` |
| Path-scoped rules | `.claude/rules/*.md` with official `paths:` YAML-list frontmatter; no `paths:` means global | Native `AGENTS.md` hierarchy; project-workflow actions explicitly resolve matching `.claude/rules/` through the [Codex scoped-rule bridge](adapters/codex-scoped-rule-bridge.md) when compatibility files exist | 在 `AGENTS.md` 引用相关规则 |
| Reusable workflows | `.claude-plugin` + `skills/`, each referencing `docs/actions/` | Installable `plugins/project-workflow/` Codex plugin; skills reference bundled copies of the same `docs/actions/` semantics | 按 `docs/actions/` 手工执行 |
| Hooks | `.claude/settings.json` + `.claude/hooks/` | `.codex/hooks.json` or `.codex/config.toml` | 端点手动跑 check |
| Sub-agent review | Claude Code sub-agent files in `agents/`, each referencing `docs/reviewers/` | Prefer a Codex subagent running bundled `docs/reviewers/`; custom-agent name dispatch is optional and not part of the core package | 主会话按 `docs/reviewers/` 执行 |
| Plugin distribution | Claude plugin marketplace | Codex plugin marketplace | Copy `template/` and docs |

Codex supports additional instruction override filenames, but project-workflow does not generate or recommend them. Native persistent guidance remains the `AGENTS.md` hierarchy. Within project-workflow actions, the Codex adapter also resolves matching `.claude/rules/` files explicitly before implementation handoff or L2; this is a compatibility bridge, not Codex-native auto-loading, and it does not change Claude runtime behavior. Codex `.codex/rules/*.rules` files remain command-approval policy and are not an A-class coding-convention carrier.

Adapter 设计必须遵守一个约束:**不要复制 methodology core**。例如 Claude 和 Codex 可以各有 hook 配置,但 action 的触发/输入/输出/不变量只能在 `docs/actions/` 定义一次;reviewer 的任务方法只能在 `docs/reviewers/` 定义一次;L1/L2/L3 的含义只能在 core 文档定义一次。

Runtime adapter 本身则应保持 **host-native 且薄**:根 `skills/` 使用 Claude Code 的交互、具名 agent 和 slash-command 语义;`plugins/project-workflow/skills/` 使用 Codex 的 `$skill`、通用 subagent/main-session fallback 和 Codex 工具语义。两端保持同一 action 集合并引用同名 canonical spec,但不得把一端 SKILL.md 原样复制给另一端。源仓库的 [`scripts/check-adapter-parity.js`](https://github.com/shrekshrek/project-workflow/blob/main/scripts/check-adapter-parity.js) 机械校验 action parity、canonical 引用、行数和 runtime marker 隔离。

Adapter 不设 helper 命令层:`feature-done` 是端点的唯一入口,其内部层(L1/L2/L3/delivery receipt)的局部重跑通过重跑该 action(幂等 + 缓存复用)或在会话内直接 dispatch `docs/reviewers/` 定义的 reviewer 完成。历史上 Claude Code 曾有 `/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle` 四个 helper skill,已在 v3.0 合并进 `feature-done`。

---

## 4. Command naming rule

Core docs should name the **workflow action**, then list adapter commands.

Preferred:

```text
Action: feature init
Canonical: docs/actions/feature-init.md
Claude Code: /project-workflow:feature-init <slug>
Codex: $feature-init <slug> (or plugin-provided command)
Manual: create docs/specs/changes/<NNN>-<slug>/ from template
```

Avoid:

```text
Run /project-workflow:feature-init, therefore the methodology starts.
```

The action is the method. The command is just one runtime entry point.

---

## 5. Portability checklist

Before adding or changing a skill, hook, or plugin feature, answer:

1. Which methodology action or invariant does this automate?
2. Is the action already documented in `docs/actions/`?
3. Is the invariant already documented in `workflow.md` / `spec-driven.md`?
4. Is the adapter duplicating core logic that should be referenced instead?
5. Does the adapter have a manual fallback?
6. If Claude and Codex differ, is the difference isolated to adapter docs?

If the answer to 1 or 2 is unclear, update the methodology docs before changing the adapter.

---

## 6. Migration stance

The near-term target is:

1. Keep Claude Code plugin as the first mature adapter.
2. Make the methodology docs adapter-neutral.
3. Package the installable Codex distribution in `plugins/project-workflow/`; it may duplicate core docs and templates as release artifacts, while its skills remain a separate Codex-native adapter referencing the same `docs/actions/` and `docs/reviewers/` semantics.
4. Do not keep a second repo-local Codex skills tree once the plugin package exists; duplicate runtime entry points make discovery and maintenance worse.
5. Do not make Codex custom-agent name dispatch required for correctness. Codex skills run the same reviewer spec through any available general subagent or the main session; Claude named-agent wrappers stay outside the Codex package.

This keeps the project from turning into two diverging tools that happen to share a name.
