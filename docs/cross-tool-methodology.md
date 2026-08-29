# Cross-tool methodology

> project-workflow 的目标不是绑定某一个 AI coding tool,而是让同一套工程方法可以在 Claude Code、Codex,以及手工流程中保持一致。工具可以换,但方法论核心不能漂。

---

## 1. Core vs adapter

project-workflow 分两层:

| 层 | 定义 | 是否工具绑定 | 例 |
|---|---|---|---|
| **Methodology core** | 项目长期资产和流程契约 | 否 | `AGENTS.md`, `docs/specs/`, `docs/specs/changes/`, conditional ADR, delivery receipt, L1/L2/L3 review model, `docs/actions/`, `docs/reviewers/` |
| **Runtime adapter** | 把 core 自动化到某个工具里的封装 | 是 | Claude Code plugin skills, Codex skills/plugins, shell scripts |

**判断规则**:

- 如果换工具后仍应该保留,它属于 methodology core。
- 如果只是某个工具如何触发、加载、分发、授权,它属于 runtime adapter。
- Core 文档只能引用 adapter 作为"可选执行方式",不能把 adapter 行为写成方法论前提。

---

## 2. Methodology core invariants

无论使用 Claude Code、Codex,还是手工执行,以下不变量保持不变:

1. **A 类约定是项目当前规则源**
   `AGENTS.md` 是跨工具 canonical 入口。项目自有的工具配置 可以增强本地体验,但不构成第二套 portable core,其他 adapter 也不必翻译或读取它们。

2. **无需新 artifact 的任务不启动 project-workflow**
   是否需要新 artifact由 [`feature-init`](actions/feature-init.md) 判断；直接实施仍遵守适用的 `AGENTS.md` 和相关检查，复用已有 feature 时沿用其接受规则与生命周期。

3. **默认一份功能记录**
   需要追踪时只创建 `docs/specs/changes/<NNN>-<slug>/spec.md`；可复用已有记录，长内容确有用途才拆出。不按文档套餐分类。

4. **实施依据先澄清**
   先沟通，关键未知按需试验，再确认方案与验收。就绪检查关注语义、来源和可验证性，独立审查按风险/项目要求，缺少可选文件不构成失败。

5. **实现中继续发现与沟通**
   普通细节直接推进；重要新发现先暂停相关工作，解释影响和建议，确认后局部更新再继续。文档更新保留上下文，不逐轮打断或重开整个流程。

6. **交付验证按规则源分层**
   必要 L1 先行，适用的独立 L2/L3 依据实际风险运行；一份最终收据记录真实结果，不以文档数量决定验证深度。

7. **Drift refresh 只处理 A 类约定**
   P4 更新 `AGENTS.md` 以及本次明确纳入范围的 host-specific convention files,不回写历史 spec,也不把 backlog 放进 repo 文件。

8. **Workflow action 有唯一权威层**
   `docs/actions/` 定义每个 public workflow action 的触发、输入、输出、不变量和验证。Claude Code skills、Codex skills、shell scripts、手工流程只能增加 runtime 执行细节,不能重新定义 action。

9. **Reviewer 方法有唯一权威层**
   `docs/reviewers/` 定义 reviewer、auditor、researcher 的任务边界、输入、检查方法和输出形状。Claude `adapters/claude/agents/` 与 Codex plugin skills 只是 adapter,不能各自维护一套 reviewer 方法。

10. **所有 adapter 暴露同一组 public action,没有第二套 surface**
   默认跨工具 action 是 `project-init` / `project-personalize` / `feature-init` / `spec-quality-check` / `spec-revise` / `feature-done` / `feature-archive` / `spec-reconcile` / `agents-md-revise`。`feature-init` 把记录需要与 PREVIEW/APPLY 写入授权分开;显式 feature 路由评估触发只读 PREVIEW,普通讨论、诊断和检查不触发。`feature-done` 内聚交付门禁和 receipt,不再设独立 helper 命令;其复查与证据规则由 canonical action 定义。

11. **`已实现` 不等于"仍是产品现状"**
   交付后的生命周期语义是跨工具的:`docs/specs/changes/` 活动区只放进行中的变更,已交付的整目录归档到 `docs/specs/changes/archive/`(检索现状时排除);被取代的 change 标 `已取代` / `已废弃`;current truth(`docs/specs/<area>.md`)是产品域现状的唯一权威。任何 adapter 在长周期产品域取 context 时,应优先读 current truth,不把 archive 内容当有效基线。

---

## 3. Adapter mapping

| Methodology need | Claude Code adapter | Codex adapter | Manual fallback |
|---|---|---|---|
| Persistent project guidance | `AGENTS.md` + `CLAUDE.md` 1 行 alias | `AGENTS.md` discovery | 读 `AGENTS.md` |
| Host-specific scoped rules | 可选 `.claude/rules/*.md`;由 Claude adapter 原生加载 | 使用 root/nested `AGENTS.md`;不读取或翻译 Claude-private rules | 在 `AGENTS.md` 放置 portable guidance |
| Reusable workflows | Generated Claude package from `adapters/claude/`, with skills referencing `docs/actions/` | Generated Codex package from `adapters/codex/`; skills reference bundled copies of the same `docs/actions/` semantics | 按 `docs/actions/` 手工执行 |
| Sub-agent review | Applicable boundary 必须 dispatch `adapters/claude/agents/` 的具名 agent;不可用/失败/无容量时有据 fallback | Applicable boundary 必须由 Codex general subagent 跑 bundled `docs/reviewers/`;不要求 custom-agent name | 无 dispatch capability 时主会话按 `docs/reviewers/` 执行并记录原因 |
| Plugin distribution | Claude plugin marketplace | Codex plugin marketplace | Copy `template/` and docs |

Codex supports additional instruction override filenames, but project-workflow does not generate or recommend them. Native persistent guidance remains the `AGENTS.md` hierarchy. Claude-private `.claude/rules/` remain optional project-owned convention files; Codex does not treat them as portable convention input. Codex `.codex/rules/*.rules` files remain command-approval policy and are not an A-class coding-convention carrier.

Adapter 设计必须遵守一个约束:**不要复制 methodology core**。例如 Claude 和 Codex 各有原生 skill 入口,但 action 的触发/输入/输出/不变量只能在 `docs/actions/` 定义一次;reviewer 的任务方法只能在 `docs/reviewers/` 定义一次;L1/L2/L3 的含义只能在 core 文档定义一次。

Runtime adapter 本身则应保持 **host-native 且薄**:`adapters/claude/skills/` 使用 Claude Code 的交互、具名 agent 和 slash-command 语义;`adapters/codex/skills/` 使用 Codex 的 `$skill`、通用 subagent 和 Codex 工具语义。两端在 canonical dispatch boundary 都遵守“能力与容量存在则必须调度;否则有据 fallback;缺证据 fail closed”,同时保持同一 action 集合并引用同名 canonical spec,但不得把一端 SKILL.md 原样复制给另一端。源仓库的 [`scripts/check-adapter-parity.js`](../scripts/check-adapter-parity.js) 机械校验 action parity、canonical 引用、行数和 runtime marker 隔离。

`feature-done` 是交付端点的唯一入口。快照、修复、复验和证据复用遵循其 [canonical action](actions/feature-done.md)。

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

Before adding or changing a skill or plugin feature, answer:

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
