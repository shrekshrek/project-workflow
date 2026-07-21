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
   `AGENTS.md` 是跨工具 canonical 入口。工具私有的 rules/hooks 可以增强本地体验,但不构成第二套 portable core,其他 adapter 也不必翻译或读取它们。

2. **无需新 artifact 的任务不启动 project-workflow**
   小 bugfix、文案、样式、局部测试修复、低风险文档编辑、未被 current truth 声明且局部/可逆/无契约/可在当前任务完成的行为小改,以及已确认 spec 下的实施任务,不新建 feature artifact;直接做时仍遵守适用的 `AGENTS.md` 和相关检查。只有持久清单存在交接、多步验收、审计/发布或 current-truth 消费者时,低风险小改才进入 light lane。

3. **Feature artifact 只有 Full / Light 两类**
   全道 feature 使用 `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md`;轻车道使用同目录下的 `tasks.md`。

4. **Spec quality gate 在实施前发生**
   全道 feature 开始实现前必须通过 7 问质量检查。Failed 项阻断实施;borderline 项允许继续,但要显式记录风险和修法。

5. **中途改 frozen spec 走修订 SOP**
   已确认并开始实施后,修改 `spec.md` 必须有修订记录和 plan/tasks 同步;只有架构/模块边界、持久跨功能技术决定或取代既有 ADR 时才创建 ADR。Draft 阶段自由编辑。

6. **交付验证按规则源分层**
   L1 机械检查、适用的 L2 项目约定与 L3 feature spec 独立运行;full lane 的 L2/L3 在容量允许时并行 dispatch,紧凑 delivery receipt 负责聚合证据和 verdict。

7. **Drift refresh 只处理 A 类约定**
   P4 更新 `AGENTS.md` 以及本次明确纳入范围的 host-specific convention files,不回写历史 spec,也不把 backlog 放进 repo 文件。

8. **Workflow action 有唯一权威层**
   `docs/actions/` 定义每个 public workflow action 的触发、输入、输出、不变量和验证。Claude Code skills、Codex skills、shell scripts、手工流程只能增加 runtime 执行细节,不能重新定义 action。

9. **Reviewer 方法有唯一权威层**
   `docs/reviewers/` 定义 reviewer、auditor、researcher 的任务边界、输入、检查方法和输出形状。Claude `adapters/claude/agents/` 与 Codex plugin skills 只是 adapter,不能各自维护一套 reviewer 方法。

10. **所有 adapter 暴露同一组 public action,没有第二套 surface**
   默认跨工具 action 是 `project-init` / `project-personalize` / `feature-init` / `spec-quality-check` / `spec-revise` / `feature-done` / `feature-archive` / `spec-reconcile` / `agents-md-revise`。`feature-done` 内聚 L1、适用的 L2/L3、current-truth check 和 delivery receipt;focused re-review 仅限同一任务保留完整证据时,不再设独立 helper 命令。

11. **`已实现` 不等于"仍是产品现状"**
   交付后的生命周期语义是跨工具的:`docs/specs/changes/` 活动区只放进行中的变更,已交付的整目录归档到 `docs/specs/changes/archive/`(检索现状时排除);被取代的 change 标 `已取代` / `已废弃`;current truth(`docs/specs/<area>.md`)是产品域现状的唯一权威。任何 adapter 在长周期产品域取 context 时,应优先读 current truth,不把 archive 内容当有效基线。

---

## 3. Adapter mapping

| Methodology need | Claude Code adapter | Codex adapter | Manual fallback |
|---|---|---|---|
| Persistent project guidance | `AGENTS.md` + `CLAUDE.md` 1 行 alias | `AGENTS.md` discovery | 读 `AGENTS.md` |
| Host-specific scoped rules | 可选 `.claude/rules/*.md`;由 Claude adapter 原生加载 | 使用 root/nested `AGENTS.md`;不读取或翻译 Claude-private rules | 在 `AGENTS.md` 放置 portable guidance |
| Reusable workflows | Generated Claude package from `adapters/claude/`, with skills referencing `docs/actions/` | Generated Codex package from `adapters/codex/`; skills reference bundled copies of the same `docs/actions/` semantics | 按 `docs/actions/` 手工执行 |
| Hooks | `.claude/settings.json` + `.claude/hooks/` | `.codex/hooks.json` or `.codex/config.toml` | 端点手动跑 check |
| Sub-agent review | Applicable boundary 必须 dispatch `adapters/claude/agents/` 的具名 agent;不可用/失败/无容量时有据 fallback | Applicable boundary 必须由 Codex general subagent 跑 bundled `docs/reviewers/`;不要求 custom-agent name | 无 dispatch capability 时主会话按 `docs/reviewers/` 执行并记录原因 |
| Plugin distribution | Claude plugin marketplace | Codex plugin marketplace | Copy `template/` and docs |

Codex supports additional instruction override filenames, but project-workflow does not generate or recommend them. Native persistent guidance remains the `AGENTS.md` hierarchy. Claude-private `.claude/rules/` and hooks remain optional project-owned adapter assets; Codex does not treat them as portable convention input. Codex `.codex/rules/*.rules` files remain command-approval policy and are not an A-class coding-convention carrier.

Adapter 设计必须遵守一个约束:**不要复制 methodology core**。例如 Claude 和 Codex 可以各有 hook 配置,但 action 的触发/输入/输出/不变量只能在 `docs/actions/` 定义一次;reviewer 的任务方法只能在 `docs/reviewers/` 定义一次;L1/L2/L3 的含义只能在 core 文档定义一次。

Runtime adapter 本身则应保持 **host-native 且薄**:`adapters/claude/skills/` 使用 Claude Code 的交互、具名 agent 和 slash-command 语义;`adapters/codex/skills/` 使用 Codex 的 `$skill`、通用 subagent 和 Codex 工具语义。两端在 canonical dispatch boundary 都遵守“能力与容量存在则必须调度;否则有据 fallback;缺证据 fail closed”,同时保持同一 action 集合并引用同名 canonical spec,但不得把一端 SKILL.md 原样复制给另一端。源仓库的 [`scripts/check-adapter-parity.js`](../scripts/check-adapter-parity.js) 机械校验 action parity、canonical 引用、行数和 runtime marker 隔离。

Adapter 不设 helper 命令层:`feature-done` 是端点的唯一入口,其内部层(L1/适用的 L2/L3/delivery receipt)的局部重跑通过重跑该 action、同一任务内有证据的 result reuse,或在会话内直接 dispatch `docs/reviewers/` 定义的 reviewer 完成。历史上 Claude Code 曾有 `/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle` 四个 helper skill,已在 v3.0 合并进 `feature-done`。

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
5. Does the adapter fail closed and record the exact reason when native reviewer dispatch cannot run?
6. If Claude and Codex differ, is the difference isolated to adapter docs?

If the answer to 1 or 2 is unclear, update the methodology docs before changing the adapter.

---

## 6. Maintenance stance

The maintained state is:

1. Keep methodology docs adapter-neutral and authoritative.
2. Keep the Claude and Codex native sources under `adapters/`; generate both self-contained distributions only at build/release time.
3. Do not commit generated package trees on `main`; release duplication belongs only in `plugin-dist` and installed caches.
4. Keep both adapters on the same nine-action surface without copying runtime bodies between hosts.
5. Do not make Codex custom-agent name dispatch required for correctness. Codex skills must run the same reviewer spec through a general subagent when dispatch and capacity exist; only unavailable/failed dispatch or exhausted capacity permits an evidenced main-session fallback. Claude named-agent wrappers stay outside the Codex package.

This keeps the project from turning into two diverging tools that happen to share a name.
