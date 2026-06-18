---
name: agents-md-revise
model: sonnet
description: P4 phase tool — scan A 类约定 (AGENTS.md 多层嵌套 + .claude/rules/*.md) against actual project state, detect objective drift (commands / deps / dir structure / framework versions / config), generate diff suggestions, apply approved patches with a commit message draft. Critical-only (no subjective suggestions, no hook auto-trigger). Use periodically (every 2-4 weeks / month) or when sensing reproducible drift signal.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, drift descriptions, decisions. Code, commands, file paths stay as-is.

# Agents-md Revise

P4 phase 工具 —— 主动 audit **A 类约定全集**(`AGENTS.md` 多层嵌套 + `.claude/rules/*.md`,见 [workflow.md §0.3](../../docs/workflow.md#03-概念区分钉死再读后续) / [§1.3](../../docs/workflow.md#13-a-类约定的内容标准agentsmd--claude-rules))跟项目实际状态的**客观 drift**,生成 diff 提议,用户决定后 apply。

**Use when**: P4 phase — 周期(每 2-4 周 / 月)主动 audit;或感知到 "反复跟 AI 提醒同一件事 ≥ 2 次" 的 drift 信号。仅做**客观可验证 drift**(命令 / 依赖 / 目录 / 版本 / 配置不一致),零误报。

**Not for**:
- A 类约定**创建** → 用 `/project-workflow:project-init`(greenfield)或 `/project-workflow:project-personalize`(retrofit)
- in-feature 调整(模块边界 / framework rules codify 当下) → 用 `/project-workflow:spec-revise`
- feature-driven backlog(per-feature 建议)→ 已由 `/project-workflow:proof-bundle` Item 5b 覆盖
- code vs A 类约定合规检查 → 用 `/project-workflow:l2-review`
- **主观模式信号 / hook 自动触发** → v2 不做(per [workflow.md §0.5](../../docs/workflow.md#05-实现策略的核心信念))

User input: `$ARGUMENTS` — optional scope filter(如 `backend` 限定 tier;`rules` 限定 `.claude/rules/`);空 = 全项目。

> Full P4 context: [workflow.md §5](../../docs/workflow.md#5-p4drift-refresh主动修正)。

## Step 1 — 读 A 类约定全集

收集所有 A 类约定文件:

- `AGENTS.md`(root)—— 必读;缺失则报错退出 "项目无 v2 baseline,先跑 `/project-init` 或 `/project-personalize`"
- `<tier>/AGENTS.md`(若多 tier 项目)
- `<module>/AGENTS.md`(仅"反常"模块,见 [§2.3](../../docs/workflow.md#23-反常判定何时该写模块-agentsmd))
- `.claude/rules/*.md`(全集;读每个文件的 frontmatter `globs:` + 正文。**globs 用来限定 drift 作用域**:Step 3 比对时,只对 globs 命中的项目路径计算 drift;无 `globs:` 的规则按全局适用)

若 `$ARGUMENTS` 给了 scope filter:
- `backend` / 其他 tier 名 → 只读 root + `<tier>/AGENTS.md` + globs 命中该 tier 的 `.claude/rules/`
- `rules` → 只读 `.claude/rules/*.md` 全集

读完所有文件,提取每条**具体可验证** statement:

| 类别 | 示例 statement |
|---|---|
| 命令 | "起服务:`pnpm dev`" / "跑测试:`pnpm test`" |
| 依赖版本 | "FastAPI ≥ 0.110" / "Pydantic v2" |
| 目录结构 | "`backend/src/<module>/` 五件套" |
| 端口 / 配置 | "后端跑 8000" / "前端 5173" |
| Framework 约定 | "用 SQLAlchemy 2.0 `select()`,禁 1.x `query()`" |

主观 statement(如 "代码要简洁" / "命名清晰")**不进列表** —— 它们不在本 skill scope。

## Step 2 — 扫项目客观状态

平行收集项目实际状态:

```bash
# 依赖 / 命令(逐栈)
cat package.json 2>/dev/null          # JS / TS scripts + deps
cat pyproject.toml 2>/dev/null         # Python deps + tool config
cat Cargo.toml 2>/dev/null             # Rust
cat go.mod 2>/dev/null                 # Go
cat .tool-versions .nvmrc .python-version 2>/dev/null  # tool versions

# 实际目录结构(maxdepth 3,排除常见 build / dep dirs)
find . -maxdepth 3 -type d \
  -not -path '*/\.*' \
  -not -path '*/node_modules*' \
  -not -path '*/__pycache__*' \
  -not -path '*/.venv*' \
  -not -path '*/dist*' \
  -not -path '*/build*'

# 配置项
cat .env.example 2>/dev/null

# (可选)近 30 天 git log 主题摘要
git log --since="30 days ago" --pretty=format:"%s" 2>/dev/null | head -30
```

如有 lockfile(`pnpm-lock.yaml` / `poetry.lock` / `Cargo.lock` / `go.sum`),解析出实际依赖版本备 Step 3 用。

## Step 3 — 计算客观 drift + 生成报告

逐条对比 Step 1 statements vs Step 2 状态。**只输出客观可验证 drift**:

| 对比 | 例 drift |
|---|---|
| AGENTS.md 命令 vs package.json scripts | AGENTS.md "`pnpm test`" → package.json `"test"` 不存在,实际是 `"test:unit"` |
| AGENTS.md / rules 依赖版本 vs lockfile | rules "FastAPI 0.110+" → 实际 0.115,声明可升级 |
| AGENTS.md Project Structure vs 实际目录 | AGENTS.md "`backend/src/`" → 实际改名 `backend/app/` |
| AGENTS.md 端口 / 配置 vs .env.example | AGENTS.md "后端 8000" → .env.example 新加 `BACKEND_PORT=8080` |
| `.claude/rules/<framework>.md` 版本约定 vs deps | rules "SQLAlchemy 2.0 select" 但 lockfile 是 1.4 |

**❌ 不输出**:
- "建议考虑" / "可能要" / "模式信号"
- 主观判断("近 20 个 PR 都用 X,该 codify?")
- 弱关联("这条规则**可能**过时")
- hook 触发的自动检测

每条 drift 报告带证据:

```
[Drift #N] <类别>:<简述>
  - 旧值(<file>:L<line>):<old>
  - 新值(<source>):<new>
  - 建议 patch:改 <file>:L<line>
  - 证据:<grep / git hash / file mtime>
```

**`.claude/refresh-ignore` 跳过列表**:若存在该文件,每行是一条 drift fingerprint(`<file>:<line>:<old>→<new>` 的哈希)。Step 3 计算时跳过 fingerprint 命中的项。

## Step 3.5 — ADR 孤儿 advisory(只读,不进 apply 流)

> 范围:只抓**被遗忘的孤儿 ADR**(零引用 + 老)—— 客观事实,非弱关联。只读 advisory,**不进 Step 4 的客观 drift apply 流**,供人判。
> (「被反复 defer 但未实现」那类是"可能过时"的弱关联,本 skill 明确不做,见下 ❌ 列表。)

`ls docs/adr/*.md`(无目录则跳过本步)。逐个解析 frontmatter `状态`;`Deprecated` / `Superseded by NNNN` → 已闭环,跳过。对 `Accepted` / `Proposed`:全仓库 grep 反向引用(`ADR-NNNN` / `ADR NNNN` / `<NNNN>-<topic>` 文件名,扫 docs/specs、plan、源码)。**零反向引用 AND age(ADR 日期或 mtime)> 60 天** → 列入 advisory:
```
🗂️ ADR 孤儿 advisory(N 条,需人判,非客观 drift):
   · ADR-0003「<title>」Accepted,60+ 天无引用 —— 仍有效?该 Superseded?
```
零孤儿则不输出。

## Step 4 — 用户逐条决定

报告全部 drift(≤ 5 条 / 轮,多就分批)。每条问:

```
动作?
  (y)es              → 加入 apply 列表
  (n)o               → 本次 skip(下次还问)
  (i)gnore-forever   → 写 .claude/refresh-ignore,以后不问
  (q)uit             → 中止本次 refresh(已 y 的保留,未决的丢弃)
```

收齐答案。

## Step 4.5 — 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

应用 patches 之前,dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md)(input/output 详见 agent doc)审待打 patch 内容:

- `files_to_audit`: 每个待 patch 文件的**应用后 inline content**(用 Step 4 用户答 y 的 patches 模拟 apply,**不实际改盘**)
- `baseline`: 每个待 patch 文件的 **pre-patch on-disk 内容** —— 让 auditor 只审 patch 新增决策,不误判既有 baseline(如既有 `--concurrency=50`)
- `qa_answers`: Step 3 drift 报告里的"为什么改"原因 + Step 4 用户 y/n 决定 + Step 2 扫到的项目客观状态(commands / deps / dir structure / etc.)dot-path keyed
- `language_conventions`: null
- `plugin_hardcoded_defaults`: 跟项目原 AGENTS.md baseline 一致(项目自身约定就是 hardcode);此外加 workflow §1.10 plugin policy(branch naming / GitHub / 等,若项目沿用)
- **Retrofit 模式**:既有 AGENTS.md 里的特定字符串决策来自历史,agent 标 `(existing baseline)` 视同 ✅;**只审 patch 引入的新决策**

**典型 plant**(audit 应 catch):
- Patch 引入新模块名 / 新 broker / 新路径 — 但 Step 3 drift 报告没说为什么改 → 🚫
- Patch 修了命令但版本数字凭空(`pytest 8.x` 当前装的可能是 7.x)→ 🚫(应 trace 回 Step 2 扫到的实际版本)
- 跨文件 patch 引用对方未存在的新概念 → 🚫

**Block 规则**:🚫 > 0 不进 Step 5,要么(a) 改 patch 写法补 trace / deferred,要么(b) 把对应 drift 项答 (n) 跳过本轮;⚠️ 不 block,Step 5 commit msg 草稿同时附 ⚠️ 摘要。

## Step 5 — 应用 patches + commit 草稿

用 Edit 工具 atomic 改文件(每条 y 的 drift 一次 Edit):

```
✅ 应用 N 条 patches:
   - AGENTS.md L<X>: <旧> → <新>
   - .claude/rules/fastapi.md L<Y>: <旧> → <新>
   - ...
```

输出 diff 预览 + commit msg 草稿:

```bash
git diff AGENTS.md .claude/rules/  # 或受影响文件列表
```

```
📝 建议 commit msg:

chore: refresh A 类约定(N 条 Critical drift)

- AGENTS.md: <一行摘要,如"命令同步 package.json scripts">
- .claude/rules/fastapi.md: <一行摘要>

⚠️ 不自动 commit —— 你审 diff 后跑 git commit。
```

**不直接 commit** —— 留给用户最终确认。

## Failure modes

| 错误 | 应对 |
|---|---|
| `AGENTS.md` 缺失 | 报 "项目无 v2 baseline。先跑 `/project-init` 或 `/project-personalize`。" 退出 |
| `.claude/rules/` 目录不存在 | 跳过该层,只 audit AGENTS.md(部分项目可能没用 rules) |
| 项目栈状态文件全缺(无 `package.json` / `pyproject.toml` / 等) | 报 "栈识别失败,无客观状态可对比。是新项目?" 退出 |
| 找不到任何 drift | 报 "✅ A 类约定跟项目实际状态一致,无客观 drift。" 退出 |
| 用户 (q)uit | 已 y 的保留 apply;未决的丢弃;不写 `.claude/refresh-ignore` |
| Step 3 计算的 drift 全部命中 `.claude/refresh-ignore` | 报 "所有候选 drift 在 ignore 列表;若想重新评估,删 `.claude/refresh-ignore` 对应行。" 退出 |

## Notes

- **可中断**(`q`uit):已 apply 的保留,未决的丢弃
- **`.claude/refresh-ignore` 默认进 git**(团队共享 ignored drift 决策);需要私有时手动加 `.gitignore`
- **互补**:`/spec-revise` = in-feature reactive;`/proof-bundle` Item 5b = per-feature backlog;本 skill = project-wide phase audit
