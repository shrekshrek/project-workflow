# Cross-tool methodology

> project-workflow 的目标不是绑定某一个 AI coding tool,而是让同一套工程方法可以在 Claude Code、Codex,以及手工流程中保持一致。工具可以换,但方法论核心不能漂。

---

## 1. Core vs adapter

project-workflow 分两层:

| 层 | 定义 | 是否工具绑定 | 例 |
|---|---|---|---|
| **Methodology core** | 项目长期资产和流程契约 | 否 | `AGENTS.md`, `docs/specs/`, ADR, proof bundle, L1/L2/L3 review model, `docs/actions/`, `docs/reviewers/` |
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

2. **Feature 以 spec artifact 承载**  
   全道 feature 使用 `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md`;轻车道使用同目录下的 `tasks.md`。

3. **Spec quality gate 在实施前发生**  
   全道 feature 开始实现前必须通过 7 问质量检查。Failed 项阻断实施;borderline 项允许继续,但要显式记录风险和修法。

4. **中途改 frozen spec 走修订 SOP**  
   已确认并开始实施后,修改 `spec.md` 必须有 ADR、修订记录、plan/tasks 同步。Draft 阶段自由编辑。

5. **交付验证按规则源分层**  
   L1 机械检查、L2 项目约定、L3 feature spec 分开跑,proof bundle 负责聚合证据和 verdict。

6. **Drift refresh 只处理 A 类约定**  
   P4 更新 `AGENTS.md` / 路径规则,不回写历史 spec,也不把 backlog 放进 repo 文件。

7. **Workflow action 有唯一权威层**  
   `docs/actions/` 定义每个 public workflow action 的触发、输入、输出、不变量和验证。Claude Code skills、Codex skills、shell scripts、手工流程只能增加 runtime 执行细节,不能重新定义 action。

8. **Reviewer 方法有唯一权威层**  
   `docs/reviewers/` 定义 reviewer、auditor、researcher 的任务边界、输入、检查方法和输出形状。Claude `agents/` 与 Codex plugin skills 只是 adapter,不能各自维护一套 reviewer 方法。

9. **Public action 和 helper surface 分开**  
   默认跨工具 action 是 `project-init` / `project-personalize` / `feature-init` / `spec-quality-check` / `spec-revise` / `feature-done` / `agents-md-revise`。L1/L2/L3/proof-bundle 可以作为某个 adapter 的调试或局部复查入口存在,但不能变成第二套默认流程。

---

## 3. Adapter mapping

| Methodology need | Claude Code adapter | Codex adapter | Manual fallback |
|---|---|---|---|
| Persistent project guidance | `AGENTS.md` + `CLAUDE.md` 1 行 alias | `AGENTS.md` discovery | 读 `AGENTS.md` |
| Path-scoped rules | `.claude/rules/*.md` with `globs:` | Nested `AGENTS.md` plus explicit scoped rule sections; `.claude/rules/` may be read as compatibility input but is not Codex-native | 在 `AGENTS.md` 引用相关规则 |
| Reusable workflows | `.claude-plugin` + `skills/`, each referencing `docs/actions/` | Installable `plugins/project-workflow/` Codex plugin; skills reference bundled copies of the same `docs/actions/` semantics | 按 `docs/actions/` 手工执行 |
| Hooks | `.claude/settings.json` + `.claude/hooks/` | `.codex/hooks.json` or `.codex/config.toml` | 端点手动跑 check |
| Sub-agent review | Claude Code sub-agent files in `agents/`, each referencing `docs/reviewers/` | Prefer a Codex subagent running bundled `docs/reviewers/`; custom-agent name dispatch is optional and not part of the core package | 主会话按 `docs/reviewers/` 执行 |
| Plugin distribution | Claude plugin marketplace | Codex plugin marketplace | Copy `template/` and docs |

Codex supports additional instruction override filenames, but project-workflow does not generate or recommend them. Use nested `AGENTS.md` for scoped guidance so Claude Code, Codex, and manual flows share the same four documentation surfaces: feature specs, ADRs, `AGENTS.md`, and `.claude/rules/` as the Claude path-scoped adapter.

Adapter 设计必须遵守一个约束:**不要复制 methodology core**。例如 Claude 和 Codex 可以各有 hook 配置,但 action 的触发/输入/输出/不变量只能在 `docs/actions/` 定义一次;reviewer 的任务方法只能在 `docs/reviewers/` 定义一次;L1/L2/L3 的含义只能在 core 文档定义一次。

Helper surfaces 只能拆开某个 action 的内部步骤,例如 Claude Code 的 `/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle` 是 `feature-done` 的局部入口。它们可以保留用于调试、缓存复用或只重跑一层 review,但文档默认路径和其他 adapter 不需要逐个复制这些 helper。

---

## 4. Command naming rule

Core docs should name the **workflow action**, then list adapter commands.

Preferred:

```text
Action: feature init
Canonical: docs/actions/feature-init.md
Claude Code: /project-workflow:feature-init <slug>
Codex: $feature-init <slug> (or plugin-provided command)
Manual: create docs/specs/<NNN>-<slug>/ from template
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
3. Package the installable Codex distribution in `plugins/project-workflow/`; it may duplicate core docs and templates as a release artifact, but must reference the same `docs/actions/` and `docs/reviewers/` semantics.
4. Do not keep a second repo-local Codex skills tree once the plugin package exists; duplicate runtime entry points make discovery and maintenance worse.
5. Do not make Codex custom-agent name dispatch required for correctness. Codex skills should run the same reviewer spec through any available subagent or the main session.

This keeps the project from turning into two diverging tools that happen to share a name.
