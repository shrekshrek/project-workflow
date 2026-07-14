# WP3 Phase A — Claude skills 逐步骤四分类盘点

> Date: 2026-07-14
> Status: **implemented, release validation pending**。Phase B/C 已按本盘点落地,但 generative model scenario matrix 尚未留下可复核的实际 adapter 运行记录;deterministic fixture/materializer 通过不等于模型等价验证。上游:[capability-shift assessment](2026-07-13-capability-shift-assessment.md) Decision 4 / WP3。基线:WP2 去重后的 skill 版本(auditor boundary / M 表 / feature 定位 / PLUGIN_ROOT 已指针化,不再出现在本表)。

## 四分类

| 码 | 类别 | Phase B/C 处置 |
|---|---|---|
| **D** | 可删复述(canonical 是强制先读,复述无独立价值) | 删,替换为指针 |
| **P** | 保留复述(执行点邻近性 / 合规锚定 / contract-marker 钉死) | 显式保留,不自动删 |
| **I** | 事故级不变量,只存在于 skill 层 | 提升进 `docs/actions/`(Codex 同获保护),skill 留指针 |
| **R** | Claude runtime 专属(bash / dispatch / 交互 / 文件路径) | 保留 |

## project-init(194 行,canonical: actions/project-init.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| 前言 / canonical Read 指令 / reference.md 强制读点 | R | reference.md 本身是已完成的 relocation |
| Use when / Not for / Output structure | P | 压缩复述 action Use When/Outputs;Claude 靠 description 路由 |
| Step 0 target 解析 + staging 纪律 | R+P | staging/一次 approval 是 canonical invariant 的复述 |
| Step 1 状态检测表 | R | 重定向逻辑 |
| Step 1 安全检查(target 像 workflow 仓库本身 → 警告) | **I** | canonical 无此守卫;Codex 端同样适用 |
| Step 2 Q&A 轮次 / 命令推导 / tech-researcher dispatch | R | canonical 只说 interactive cadence |
| Step 2 Greenfield 隔离原则 | P | 复述 workflow §1.12 Anti-cargo-cult,执行点锚定 |
| Step 3 staging bash(含 PLUGIN_ROOT 块) | R | 可执行内容 |
| Step 4 填表 + 4.5 rules 自动发现 | R | Claude 文件机制 |
| Step 4.5b / 5.3b audit dispatch + Block 规则 | R+P | dispatch 是 R;Block 规则复述 auditor Caller Obligations |
| Step 4.6 / 5.4 Preview(不追加 approval) | P | 复述 canonical 单一 approval invariant |
| Step 5 tier 复制 + 5.3 framework split 四规则 | R+P | split 规则复述 workflow §1.3 |
| Step 6 hook 判定 + 6.5 apply gate | P+R | hook invariant 复述 canonical;脚本调用是 R |
| Step 7 / 7.5 行数检查 + V1-V8 self-verify | R | canonical Validation 的 runtime 物化 |
| Step 8 报告 / Failure modes | R | |

## project-personalize(171 行,canonical: actions/project-personalize.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 0-1 检测 + 三分类(complete/partial/missing) | P | 复述 canonical Use When/Invariant,contract marker 钉死部分字符串 |
| Step 2 path 选择菜单 | R | 交互 |
| Step 3 rules 自动加载检查 | R | Claude 机制 |
| Step 4.0 baseline 补齐 | P+R | 复述 canonical invariants;脚本调用 R |
| Step 4.A/B/C 扫描 bash + codebase-explorer dispatch | R | |
| Step 4.D audit + 4.E gate | R+P | gate 语义复述 canonical(marker 钉死"one consolidated diff"级语义) |
| Step 5 self-verify / Step 6 summary | R | |

## feature-init(195 行,canonical: actions/feature-init.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 0 TARGET_ROOT 解析(cwd→父→子→问) | P | 近逐字物化 canonical invariant 1 |
| Step 1 输入解析表 | R | |
| Step 2 NNN bash + 前缀冲突三分支(=auto/大于/≤) | R+**I** | 冲突解析细节 canonical 只有半句("non-conflicting number");建议提升 |
| Step 3 context 必读/选读 + tier-aware 扫描 | P+R | 必读集复述 canonical Inputs;扫描命令 R |
| Step 3.5 域(E)判定 5 条 | P | 复述 canonical Inputs bullet + brownfield/greenfield 语义 |
| Step 4 module setup 表 | P | 复述 workflow §2 |
| Step 4.5 入口分流 + 3 道 trip + 不确定分级 + Bundle rule | P | 复述 canonical Lane Classification(近全量);contract marker 钉死"无需新 artifact/轻车道/全道"。Phase B pilot 首要对象 |
| Step 5 模板复制 bash + brownfield pre-fill | R | |
| Chat pre-fill 纪律(只填明确事实 / inline 标注来源) | P | 复述 canonical invariants(plant 禁令 + mark source) |
| Step 6 报告 / 6.2 reminders 块 / 6.3 audit / 6.4 收尾 | R | reminders 是 Claude UX 资产 |
| Failure modes / Notes | R | |

## spec-quality-check(104 行,canonical: actions/spec-quality-check.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 1 定位 / Step 2 M 表 | — | WP2 已指针化 |
| Step 3 reviewer dispatch prompt | R | |
| Step 4 aggregate 报告模板 | R | 输出格式 |
| Step 5 verdict 语义 + 不自动翻 `已确认` | P | 复述 canonical Verdict/status handling |
| Failure modes / Notes | R | |

## spec-revise(173 行,canonical: actions/spec-revise.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 1 定位 | — | WP2 已指针化 |
| Step 2 §3.5 判断表(6 行 inline 复制) | **D** | skill 已说"walk through the §3.5 judgment table"仍整表内联;workflow §3.5 是强制对照物 |
| ADR_REQUIRED 判据 | P | 复述 canonical Outputs 条件;高频判定点 |
| Step 3 ADR 编号 bash + 模板路径 + 3.5 反向 supersede | R+P | supersede 复述 canonical invariant(marker 部分钉死) |
| Step 4/5/6 改三件套细则 | R+P | 修订记录格式是 R;5.4 current-truth 联动复述 canonical invariant |
| Step 6.5 audit / 6.6 Diff Review Gate | R+P | 两次 approval 复述 canonical Validation(marker 钉死"proposed diff") |
| Step 7 / Failure modes / Notes | R+P | Notes 的 goal-driven 段复述 workflow §0.1 |

## feature-done(157 行,canonical: actions/feature-done.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 1 定位 + 车道/形态判定 | P | 定位已指针化;形态判定复述 canonical L3 bullet |
| Step 2 缓存规则 7 条 | R+**I** | 大部分 R;条 5(untracked 目录强制 fresh + mtime 兜底)是事故级规则,canonical invariant 4 未覆盖,建议提升 |
| Step 3 L1 命令发现优先级 | R | |
| Step 4 L2 收集 + dispatch + verdict 解释 | R+P | verdict 解释复述 reviewer canonical(marker 钉死"100% applicable coverage"级语义) |
| Step 5 / 5.5 L3 + domain check | R+P | 检查焦点复述 canonical Review Layers |
| Step 6 receipt 字段表 + schema self-check | P | 复述 canonical Delivery Receipt;多处 contract marker 钉死 |
| Step 6 Drift ledger 机制(自由文本 append / 读取端聚类 / 不算指纹) | R+**I** | 文件路径是 R;"写入端自由文本 + 读取端语义聚类"设计决定跨 adapter,canonical 未记,建议提升 |
| Step 7 verdict 表 + Verdict contract 行 | P | Verdict contract 由脚本强制三处一致(受控复述) |
| Notes | P | 复述 canonical READY≠关闭语义 |

## feature-archive(104 行,canonical: actions/feature-archive.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 1 sweep/单模式判据 + legacy receipt | P | 复述 canonical Use When/legacy candidate(marker 钉死) |
| Step 2 current-truth 合并 5 条(150 行纪律 / 新鲜度行 / ADR 一致性) | P | 复述 canonical Current-Truth Discipline,执行点邻近 |
| Step 3 已取代/已废弃标记 | P | 复述 canonical Outputs 3 |
| Step 4 git mv + relocate bash | R | |
| Step 5 报告 | R | |
| Invariants 节(5 条) | **D** | 与 canonical Invariants 近 1:1;canonical 强制先读 |
| Failure modes | R+P | |

## spec-reconcile(88 行,canonical: actions/spec-reconcile.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 1 圈定 / Step 2 冲突矩阵格式 | R | 输出模板 |
| Step 3 逐条裁决(≤5 条/轮) | R+P | 裁决语义复述 canonical |
| Step 4 应用 + gaps | P+R | 复述 canonical Outputs;bash R |
| Step 5 verdict 三档 | P | 复述 canonical Verdict |
| Invariants 节(5 条) | **D** | 与 canonical Invariants 近 1:1 |
| Failure modes | R | |

## agents-md-revise(166 行,canonical: actions/agents-md-revise.md)

| 步骤 | 类 | 备注 |
|---|---|---|
| Step 1 读约定全集 + statement 提取表 | R | canonical Inputs 的执行细化 |
| Step 2 客观状态扫描 bash | R | |
| Step 3 drift 对比表 + 证据格式 + ❌ 不输出清单 | R+P | "只客观 drift"复述 canonical invariant(marker 反向钉死主观项) |
| refresh-ignore / drift-ledger 聚类 | R | Claude 文件机制;canonical 已有抽象句 |
| Step 4 y/n/i/q 交互 | R | |
| Step 4.5 audit + retrofit 模式 | R+P | retrofit 标注规则复述 auditor baseline 语义 |
| Step 5 apply + commit 草稿 / Failure modes / Notes | R | |

## 汇总

- **D(可删复述)**:3 处 —— spec-revise Step 2 判断表、feature-archive Invariants 节、spec-reconcile Invariants 节(合计约 40-50 行)。
- **I(待提升不变量)**:4 条 —— project-init 的 workflow-仓库误用守卫;feature-init 的 NNN 前缀冲突三分支;feature-done 缓存条 5(untracked 目录);feature-done drift-ledger 写读分工设计。提升进对应 `docs/actions/` 后 Codex 同获保护;skill 改指针。
- **P 占比最高**:大部分"厚"来自 canonical 契约在执行点的受控复述,其中相当部分被 `check-workflow-contracts.cjs` 的 marker 钉死 —— 删除需先调整 marker,属 Phase B/C 范畴。
- **Phase B 前置不变**:feature-init 行为场景矩阵(lane 分类 / TARGET_ROOT / NNN / 形态检测 / no-clobber / TODO 保留 / module 不猜 / PLUGIN_ROOT fallback)先建,再动 P/D 类内容;见 assessment WP3 Phase B/C。

## Phase B/C 执行记录(2026-07-14)

**测试基建(Phase B 前置)**:`docs/examples/feature-init-scenario-matrix.md` + `tests/fixtures/feature-init-scenarios/`(9 场景:full-brownfield / light / no-artifact / NNN 空序列 / 高爆破 greenfield / no-clobber 冲突 / subdir target-root / cached PLUGIN_ROOT fallback / module 不猜 interaction-only)+ `scripts/check-feature-init-fixtures.cjs`(fixture 一致性、materializer 机械回归 + `--grade` 产物评分),已入 CI。

**Phase B — feature-init 试点**:
- I 提升:NNN 前缀冲突三分支 + no-clobber → `docs/actions/feature-init.md` Outputs(Codex 同获保护);skill 改指针。
- P 指针化:Step 0 TARGET_ROOT 四分支表 → canonical Invariants 指针;Step 4 module setup 表 → workflow §2 指针 + 一句执行摘要;Step 4.5 分流 → canonical Lane Classification 指针 + Claude 执行点残留(marker 字符串保留)。
- 薄化结果:skill 195 → 169 行。deterministic fixture/materializer 检查通过;尚未记录真实 Claude/Codex adapter 的 pre/post 模型运行,因此不声称产物级模型等价已完成。

**Phase C — 其余 skill**:
- D 删除:spec-revise Step 2 §3.5 判断表内联副本(改为强制 Read 原表)、feature-archive Invariants 节(canonical + Claude 补充一句)、spec-reconcile Invariants 节(全指针)。
- I 提升:project-init workflow-仓库误用守卫 → `docs/actions/project-init.md` Use When;feature-done 缓存条 5(untracked 目录强制 fresh + mtime 兜底)与 drift-ledger 写读分工(自由文本 append / 读取端语义聚类 / 不算指纹)→ `docs/actions/feature-done.md` Invariants;对应 skill 原文保留(执行点邻近,canonical 现在是权威源)。
- feature-archive 用户逐份确认不变量补进 canonical Invariants(原 canonical 未覆盖)。

全量静态/机械回归(sync / parity / contracts / links / reviewer fixtures / feature-init fixtures)全绿。实际 generative adapter matrix 仍是发布前 gate;不得用 fixture coherence 或 materializer smoke 替代。

**体积口径**:发布运行时与执行面是收缩指标;维护者 fixture/checker 单独报告,不靠删测试抵数。相对 `HEAD`:Codex package `6768 → 6652`(`-116`),Claude skills `1403 → 1307`(`-96`),canonical actions `513 → 557`(`+44`),skills + actions 合计 `-52`;完整 source working tree 因本次可复核测试/计划资产而增长,不再误写成 repo-wide contraction。

**2026-07-14 correctness follow-up**:
- 新增 packaged `scripts/materialize-feature-artifact.cjs`:目标根、NNN、lane/shape 校验,最终目录原子 no-clobber,模板 exclusive copy,复制失败回滚;Claude/Codex 两端统一调用。
- `feature-done` canonical + 双端 adapter 明确:L1 失败阻断 verdict,但继续所有 independently executable 层;只对自身输入/环境不可用的层记录 non-execution。
- feature-init fixtures、runner、scenario 说明保持 source-repo/CI-only;Codex release package 只携带运行时必需的 materializer,避免把维护者测试资产塞进用户安装包。
