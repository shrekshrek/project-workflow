---
name: feature-archive
model: sonnet
description: Lifecycle closure for delivered features. Default sweep mode finds all delivered-but-unarchived features and closes them as a batch; merges durable conclusions into docs/specs/<area>.md when the proof bundle marked "current truth 更新 pending" (P0 creates only docs/specs/index.md; new area docs are created from the plugin domain template only for durable domains; replace-not-append, size-disciplined, freshness header), marks superseded older specs 已取代/已废弃, then git-mv's every closed feature directory into docs/specs/changes/archive/. Use periodically after feature-done READY features accumulate, or with a slug for single-feature closure.
---

> **Response language**: Match the user's prompt language in all natural-language output. File contents follow each file's existing language. Code, commands, file paths stay as-is.

# Feature Archive

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

交付后的生命周期收尾:合并持久结论进 current truth(E 类),然后把已交付 feature **整目录移入 `docs/specs/changes/archive/`** —— 活动区只留进行中的工作,历史 spec 物理离场,不再污染检索([spec-driven.md §5.1](../../docs/spec-driven.md#51-生命周期状态全集--物理归档))。

**Use when**: 周期性清扫(推荐,攒几个 feature 一起);或 `/feature-done` READY 后单独收尾某个 feature。
**Not for**: 未过 `feature-done` 的 feature(先跑端点门禁)/ 存量多 spec 冲突的一次性 retrofit(先 `/spec-reconcile` 裁决,再回来归档)。

User input: `$ARGUMENTS` — 空 = 清扫模式;或 feature slug / NNN / "current"。

## Step 1 — 圈定收尾对象

**清扫模式**(空参数):扫 `docs/specs/changes/<NNN>-*/`(排除 `archive/`),对每个目录检查:
- `tasks.md` 的 `## Proof Bundle` 已填且 verdict READY
- `spec.md` 状态为 `已实现`(或已被 `spec-reconcile` 标 `已取代` / `已废弃`);轻车道无 spec.md 则只看 proof bundle
- 工作已 commit(`git status` 该目录及相关代码无未提交改动)

列出候选清单(编号 + 标题 + current-truth pending 与否)让用户确认;空清单 → 报 "无待归档 feature" 退出。

**单 feature 模式**:输入解析同 `/feature-done`;不满足上述条件 → 报 "先跑 `/project-workflow:feature-done <slug>` 拿到 READY" 退出。**进行中的 feature(草稿/已确认)永不归档。**

## Step 2 — Current truth 合并(仅 pending 的 feature)

对 proof bundle 标了 "current truth 更新 pending" 的每个 feature:

1. 从 spec §1 Outcomes / plan §1 模块影响 / proof bundle diff 判定产品域;不明 → 问用户。
2. 提取**持久结论**(交付后长期成立的行为 / 契约 / IA / 默认值;不是实施过程或临时方案),向用户确认。
3. 写入 `docs/specs/<area>.md`:
   - 已存在 → **替换式更新**:改写相关段落、删被推翻的旧句,不追加堆叠
   - 不存在 → 仅当这是新的持久产品域时,从 `$PLUGIN_ROOT/template/docs/specs/_template/domain.md` 创建并替换 area / date / source;更新 `docs/specs/index.md`
4. **纪律自检**:更新后目标控制在约 **150 行**;明显超出时检查是否该拆域或删过时细节,但复杂 domain 内容仍是当前态、结构清晰、有用时可超过。标题下第一行更新为 `> 最后核对:YYYY-MM-DD`。feature 编号 / 来源写进 archive note、proof bundle 或 commit message,不要写进 E 类文件头部。E 正文不得长期保留 `docs/specs/changes/archive/*` 引用或大段 `NNN-<slug>` 清单;把仍有效事实提炼成当前行为。
5. **ADR 一致性**:合并的结论与某 `Accepted` ADR 矛盾 → 停,报冲突(需要新 ADR supersede 或结论有误);跨 feature 方向变更无 ADR → 提示先补。

无 pending 的 feature 跳过本步直接归档。

`$PLUGIN_ROOT` 解析同其他 skill:优先 `PROJECT_WORKFLOW_PLUGIN_ROOT` / `CLAUDE_PLUGIN_ROOT` / `CODEX_PLUGIN_ROOT`;否则在 `~/.claude/plugins/cache` 与 `~/.codex/plugins/cache` 下查找包含 `template/` 的 project-workflow plugin 根目录。解析不到则停止,不要临时在目标项目创建模板。

## Step 3 — 被取代老 spec 标记(如有)

本次交付**取代**了某早期 spec 方向(不只是叠加)时,跟用户逐份确认:
- `已取代`:方向被替代 → 状态行挪标记 + 状态行下加 `> ⚠️ 已取代 by <NNN>-<slug> / ADR-NNNN / docs/specs/<area>.md — <1 句原因>`
- `已废弃`:方向错误 / 不再需要 → 同上格式

老 spec 里仍有效的数据模型 / API / 基础设施事实 → **提炼进 current truth**(回 Step 2 补),spec 本身照常归档;没有"历史基础"状态。被标记的老 spec 一并加入本轮归档清单。

## Step 4 — 物理归档

对每个收尾 feature:

```bash
mkdir -p docs/specs/changes/archive
git mv docs/specs/changes/<NNN>-<slug> docs/specs/changes/archive/<NNN>-<slug>
node "$PLUGIN_ROOT/scripts/relocate-markdown-links.cjs" \
  docs/specs/changes/<NNN>-<slug> \
  docs/specs/changes/archive/<NNN>-<slug>
```

- 归档前在 `tasks.md` 末尾追加:`## Archive Note\n- YYYY-MM-DD: archived;<若有>持久结论已合并 → docs/specs/<area>.md`
- link relocation 必须在每次 `git mv` 后立即执行;它按旧/新文件位置重算 feature 外部链接,保留 feature 内部相对链接,并验证目标存在。任一 missing local target → 停止并修复,不得报告归档完成。
- `docs/specs/changes/index.md` 存在 → 更新对应行的位置/状态(编号 → 标题 / 状态 / active|archive);不存在 → 不主动创建
- 编号全局唯一(active + archive 共用 NNN 序列),`/feature-init` 取号时两边都查

## Step 5 — 报告

```markdown
## /project-workflow:feature-archive — <sweep | slug>

- 归档:<N> features → docs/specs/changes/archive/(列编号)
- Current truth:<K> 份 <created / updated>(各 <area>.md,行数)
- 老 spec 标记:<list 或 无>
- ADR follow-up:<需要新 ADR 的冲突 / 无>

📋 下一步:git diff --stat 审阅 → commit(建议 `chore(specs): archive <N> delivered features`)
```

## Invariants(强制)

- **不改实施代码**;归档是 `git mv` 不是删除;archive 内容只读
- 进行中 feature(草稿 / 已确认 / proof bundle 非 READY)**永不归档**
- Current truth 更新后必须不与已交付行为矛盾、尺寸受控或有合理 domain 复杂度理由、新鲜度行已更新
- 状态标记与归档清单逐份经用户确认,不静默批量执行
- archive 内所有本地 Markdown link 必须可解析;移动后必须运行统一 relocation 工具,不得手算或只给所有链接机械加 `../`

## Failure modes

| 错误 | 应对 |
|---|---|
| Proof bundle 缺失 / 非 READY | 该 feature 跳过(清扫模式)或指向 `/feature-done`(单模式) |
| 未提交改动涉及该 feature | 跳过并提示先 commit |
| 产品域判定不明 | 问用户,不猜 |
| 老 spec 是否被取代拿不准 | 列证据让用户裁决;拿不准且冲突多 → 建议 `/spec-reconcile` |
| 持久结论与 Accepted ADR 矛盾 | 停,报冲突;需新 ADR supersede 旧的 |
