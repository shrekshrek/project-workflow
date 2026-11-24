# Cross-tool methodology

> project-workflow 的目标不是绑定某一个 AI coding tool,而是让同一套工程方法可以在 Claude Code、Codex,以及手工流程中保持一致。工具可以换,但方法论核心不能漂。

---

## 1. Core vs adapter

project-workflow 分两层:

| 层 | 定义 | 是否工具绑定 | 例 |
|---|---|---|---|
| **Methodology core** | 项目长期资产和流程契约 | 否 | `AGENTS.md`, `docs/specs/`, `docs/specs/changes/`, conditional ADR, delivery receipt, L1/L2/L3 review model, `docs/actions/`, `docs/reviewers/` |
| **Runtime adapter** | 把 core 自动化到某个工具里的封装 | 是 | 技能加载、子代理调度、shell scripts |

**判断规则**:

- 如果换工具后仍应该保留,它属于 methodology core。
- 如果只是某个工具如何触发、加载、分发、授权,它属于 runtime adapter。
- Core 文档只能引用 adapter 作为"可选执行方式",不能把 adapter 行为写成方法论前提。

---

## 2. Methodology core invariants

无论使用 Claude Code、Codex,还是手工执行,以下不变量保持不变:

1. **A 类约定是项目当前规则源**
   `AGENTS.md` 是跨工具 canonical 入口。项目自有的工具配置可以增强本地体验,但不构成第二套 portable core,其他 adapter 也不必翻译或读取它们。

2. **按记录需要选择工作方式**
   是否创建、复用或省略记录由 [`feature-init`](actions/feature-init.md) 判断；无论是否写记录，都按已同意的方案和适用的 `AGENTS.md` 实施、验证，复用已有 feature 时沿用其接受规则与生命周期。

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
   `docs/actions/` 定义每个 public workflow action 的触发、输入、输出、不变量和验证。各端技能、shell scripts、手工流程只能增加 runtime 执行细节,不能重新定义 action。

9. **Reviewer 方法有唯一权威层**
   `docs/reviewers/` 定义 reviewer、auditor、researcher 的任务边界、输入、检查方法和输出形状。技能入口按适用条件引用角色契约。

10. **所有 adapter 暴露同一组 public action,没有第二套 surface**
   默认跨工具 action 是 `project-init` / `project-personalize` / `feature-init` / `spec-quality-check` / `spec-revise` / `feature-done` / `feature-archive` / `spec-reconcile` / `agents-md-revise`。`feature-init` 把记录需要与 PREVIEW/APPLY 写入授权分开;显式 feature 路由评估触发只读 PREVIEW,普通讨论、诊断和检查不触发。`feature-done` 内聚交付门禁和 receipt,不再设独立 helper 命令;其复查与证据规则由 canonical action 定义。

11. **`已实现` 不等于"仍是产品现状"**
   交付后的生命周期语义是跨工具的:`docs/specs/changes/` 活动区保留进行中及已验证待关闭的变更；确认关闭后，整目录归档到 `docs/specs/changes/archive/`(检索现状时排除);被取代的 change 标 `已取代` / `已废弃`;current truth(`docs/specs/<area>.md`)是产品域现状的唯一权威。任何 adapter 在长周期产品域取 context 时,应优先读 current truth,不把 archive 内容当有效基线。

12. **Blueprint handoff 是可选的上游输入**
   `project-workflow` 可以独立运行。目标项目若提供已批准的 Blueprint handoff，feature actions 可读取其 `read_first`、slice、decision 和 contract 引用，并在当前 spec 中保持可追溯；Blueprint 默认位于目标项目的 `docs/blueprint/`，但以 handoff 和 `manifest.yaml` 的实际引用为准。没有 handoff 时按现有 feature 规则工作。未批准、过期或无法解析的 handoff 不能成为实现依据。若 feature 发现项目目标、范围、长期架构、数据所有权或安全边界需要改变，应暂停受影响工作并回到 Blueprint 修订；Workflow 不静默改写上游规划。

---

## 3. Adapter mapping

各端加载相同的 Agent Skills。用户可以直接说出动作名，例如 `feature-init`。项目约定仍由根目录和适用子目录的 `AGENTS.md` 维护；Claude 项目可另选本机专用规则。

独立审查使用宿主的子代理能力。角色、证据和无法调度时的处理见[审查契约](reviewers/README.md#reviewer-execution-contract)。交付和归档遵循 [feature-done](actions/feature-done.md)。

入口源文件在 `entries/`。构建生成各技能的 `SKILL.md` 和运行所需资料；安装、升级及旧插件迁移见[项目说明](../README.md#install)。
