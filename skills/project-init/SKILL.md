---
name: project-init
description: Initialize a project's v3 starter kit (AGENTS.md + .claude/ + tier-level AGENTS.md if fullstack). Q&A driven, language/stack agnostic. Dispatches tech-researcher sub-agent for "不确定" answers. Accepts optional `$ARGUMENTS` = target directory path (defaults to current working directory). Claude Code-native. Use at P0 (project's first day). Not for adding features mid-project — use /feature-init for that.
---

**Response language**: Match the user's prompt language (中文 / English / etc.) for all natural-language output. Generated file content stays in the language of the source template.

# Project Init

Canonical action spec: `docs/actions/project-init.md`. Follow that file for methodology rules; this skill adds Claude Code execution details. **静态查表(placeholder 映射 / globs 推导 / mini-Q&A 题库 / defaults 清单)在同目录 [`reference.md`](reference.md)—— 是 relocation 不是删减;Step 4 开始前必须 Read R1-R4+R6,Step 5.1 开始前必须 Read R5,Step 8 报告前 Read R7。不得凭记忆填表。**

**Use when**: P0 — project's first day, no AGENTS.md yet.
**Not for**: starting a feature (`/feature-init`) / refreshing existing A 类约定 (`/agents-md-revise`) / scaffold-cloned or retrofit 项目(`/project-personalize`,它处理替换 scaffold defaults、补 tier-level、扫既有代码)。

**Output structure**(写到 target 目录):根 `AGENTS.md` + `CLAUDE.md`(1 行 @AGENTS.md)、`.claude/{rules/{code-style,testing,security}.md, hooks/lint-on-edit.js, settings.json}`、`.codex/{hooks.json,hooks/lint-on-edit.js}`、`docs/specs/index.md`(E 类索引)、`docs/adr/{README,0000-template}.md`、`docs/gotchas.md`、`.gitignore`;fullstack 追加各 `<tier>/AGENTS.md` + `<tier>/CLAUDE.md`。

## Step 0 — 解析 target 目录(可选 `$ARGUMENTS`)

空 → target = cwd;相对路径基于 cwd 解析;绝对路径直接用。目录不存在 → 问用户是否 `mkdir -p`,n 则中止。然后 `cd "$TARGET_DIR"`——**后续所有 Step 的 bash / Edit / Write 都对此目录操作**。

## Step 1 — 检测 target 状态

`ls -la` 后分支:

| 当前状态 | 处理 |
|---|---|
| 空目录 / 几乎空 | 进 Step 2(greenfield 流程) |
| 已有 `AGENTS.md` | 不适合本 skill —— 重定向 `/project-workflow:project-personalize` |
| 已有 `.claude/` 但无 AGENTS.md | 问:"(a) 全部覆盖 / (b) 中止?" |

**安全检查**:若 target 像 project-workflow 仓库本身(有 `docs/workflow.md` + `skills/feature-init/`)→ 警告误用,确认才继续。

## Step 2 — Q&A:栈 + 约定

**默认逐轮推进,等用户回答再继续**。关键决策一轮一答;紧密耦合的小问题可同轮合并;能从已答内容、manifest 或栈默认值客观推导的不硬问,推导歧义时再确认。答案存本地变量等 Step 4 用。

### ⚠️ Greenfield 隔离原则(critical)

Q&A 选项 + 默认值必须**语言/栈中立**,不引用任何具体已存在项目:
- 选项 label / description **不写** "跟 X 项目一致" 这类 cross-reference(即使父目录 CLAUDE.md 提到那些项目)
- 默认值只基于 (a) 本会话已答 Q&A + (b) 栈社群通用 default,**不基于** target 父级 / 兄弟项目偏好
- 想说"跟 ... 一致"时 → 改用栈通用描述("Python async 主流" / "Vue 3 生态契合最深")

### 委托 tech-researcher

用户答 "不确定" / "推荐一个" / "帮我选" 时 dispatch [`tech-researcher`](../../agents/tech-researcher.md),prompt 至少含:
- `Choice context`: 用户在选什么(如 ORM for FastAPI backend)
- `Project context`: 从已答 Q&A 推断的项目类型 / 主语言 / 主框架
- `Constraints`: 用户已知约束(如 team has Python only)
→ 返回 2-3 candidates + recommendation,展示给 user 确认后回填。**不 dispatch**: 用户直接给答案;或问的是命令 / 路径 / 数值等事实(不需研究)。

### 轮 1:项目类型?

`(a) Fullstack / (b) Web Backend / (c) Web Frontend / (d) CLI-Library / (e) Mobile / (f) 其他`。
选 (a) 追加**轮 1.5 tier 命名**:默认 `backend + frontend`,或自定义 tier 名 + 路径(如 `server + web`)。

### 轮 2:语言 + 跨 tier 共性(auto-derive)

- 主语言?(多语言列 2-3 个)
- **(Fullstack only)** 据主语言 auto-derive:mixed-lang → **per-tier**(test / lint / pkg-mgr 挪 Step 5.1 mini-Q&A 各 tier 问);single-lang → **shared**(本轮追加问这 3 项,所有 tier 共享)。告知推断结果,user 可 override 为 per-tier。

### 命令推导主声明

起服务 / 测试 / lint / migration / E2E 命令**不单独问**——据 framework + pkg-mgr + tier 名 + mini-Q&A 推导;填文件时 agent 生成具体命令字符串,**推导歧义则问用户确认**。部署命令 P0 不收集,`{{DEPLOY_COMMAND}}` 填 deferred 占位。

## Step 3 — 复制 template + gotchas.md(从本地 plugin)

```bash
PLUGIN_ROOT="${PROJECT_WORKFLOW_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-}}}"
if [ -z "$PLUGIN_ROOT" ] || [ ! -d "$PLUGIN_ROOT/template" ]; then
  PLUGIN_ROOT="$(find "$HOME/.claude/plugins/cache" "$HOME/.codex/plugins/cache" -type d -path '*/project-workflow*/template' -print 2>/dev/null | sort | tail -1 | sed 's#/template$##')"
fi
[ -n "$PLUGIN_ROOT" ] && [ -d "$PLUGIN_ROOT/template" ] || { echo "Cannot resolve project-workflow plugin root"; exit 1; }

# template/ 复制,排除 _multi_tier_examples/(plugin asset,Step 5 直接从 $PLUGIN_ROOT 读)
find "$PLUGIN_ROOT/template" -mindepth 1 -maxdepth 1 ! -name '_multi_tier_examples' -exec cp -r {} . \;

# docs/specs/_template/ + docs/specs/changes/_template/ + .claude/rules/_examples/ 是 plugin asset,清掉
find ./docs/specs/_template ./docs/specs/changes -type f -delete 2>/dev/null; rmdir ./docs/specs/_template ./docs/specs/changes/_template ./docs/specs/changes 2>/dev/null
find ./.claude/rules/_examples -type f -delete 2>/dev/null; rmdir ./.claude/rules/_examples 2>/dev/null

mkdir -p docs && cp "$PLUGIN_ROOT/docs/gotchas.md" docs/gotchas.md
```

复制后 ls 验证:`AGENTS.md` / `CLAUDE.md` / `.claude/rules/…` / `.codex/hooks.json` / `docs/specs/index.md` / `docs/adr/…` / `docs/gotchas.md` / `.gitignore` 存在;`docs/specs/_template/` 和 `docs/specs/changes/_template/` **不**出现。

## Step 4 — 填 placeholder(根 AGENTS.md + `.claude/rules/`)

用 Edit 逐文件填齐。**填齐或删行,不允许留 `{{...}}`**(no aspirational)。

- **4.1 根 AGENTS.md**:按 [reference.md R1](reference.md) 映射表填(含模块组织 / Git 平台两个 default 的写入位置)。
- **4.2 `.claude/rules/`**:按 [R2](reference.md) 填;每个 rule frontmatter 必含 `description:`(< 80 字符)。
- **4.3 globs 推导**:按 [R3](reference.md)(comma-separated 字符串,**不要** `paths:` YAML 列表——silently fails,workflow §1.6)。
- **4.4 STYLE_HIGHLIGHT**:按 [R4](reference.md)——只写项目级真正特殊的点,栈通用 default 不写。

### 4.5 `@imports` 启用判断(强制)

根 AGENTS.md 末尾 3 行 `@import` 注释:**有 `globs:` 的规则保留注释**(globs 管加载);**无 `globs:` 的 `security.md` 取消注释**改 `@.claude/rules/security.md`(always-on 走 @import,避开 globs 不触发 Write 的 limitation)。改动累积在内存,**不立即 Write**(等 4.6 preview)。

### 4.5b 决策完整性 audit(强制,workflow §1.12)

Preview 前 dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md):
- `files_to_audit`: 根 AGENTS.md + `.claude/rules/{code-style,testing,security}.md`(inline,未落盘)
- `qa_answers`: Step 2 全部答案(dot-path keyed);`language_conventions`: null
- `plugin_hardcoded_defaults`: [reference.md R6](reference.md) 清单

**Block 规则**:🚫 > 0 不进 4.6,按修正选项处理后重跑本 step;⚠️ 不 block,4.6 一并展示。vendor docs 钉死的 idiom(Vue `PascalCase.vue` 等)归 ⚠️ 不归 🚫。

### 4.6 落盘前 Preview Gate(强制,workflow §1.10)

一次性 stdout preview 全部最终文件内容(根 AGENTS.md 含 4.5 的 @import 行 + 三个 rules 文件)+ audit 摘要(`✅ N / ⚠️ M / 🚫 0`)+ ⚠️ 项明细。AskUserQuestion:
- **接受所有(含 ⚠️ 项)→ 落盘**
- **某 ⚠️ 项要 fix → 改完重 4.5b audit + 重 preview**
- **第 N 个文件要改 → 用户指定,改完重 audit + 重 preview**
- **全 revert → 回 Step 4.1 重填**
**用户 confirm 才 Write**。

## Step 5 — Fullstack:per-tier AGENTS.md + CLAUDE.md

**仅轮 1 答 (a) 时执行**。对每个 tier:

### 5.1 分类 + mini-Q&A

先分类:**Service-style**(跑后台逻辑 / API / 任务:backend / api / worker / inference-server ...)vs **UI-style**(给用户看的界面:frontend / web / admin / mobile ...);不确定问用户。然后按 [reference.md R5](reference.md) 题库跑 mini-Q&A(✅ Required 必问、⚪️ Optional 可省;跑前扫本 session 对话跳过已 hint 的题)。

### 5.2 据类别复制模板

```bash
mkdir -p "$TIER_NAME"
cp "$PLUGIN_ROOT/template/_multi_tier_examples/${TIER_CATEGORY}.AGENTS.md.example" "$TIER_NAME/AGENTS.md"
cp "$PLUGIN_ROOT/template/_multi_tier_examples/${TIER_CATEGORY}.CLAUDE.md.example" "$TIER_NAME/CLAUDE.md"
```

模板按**类别**不按 tier 名(`worker/` 也用 service-tier.example)。

### 5.3 填 tier-level placeholder + framework split

逐个替换 `{{TIER_*}}`(详见 `$PLUGIN_ROOT/template/_multi_tier_examples/README.md`)。三条关键规则:

1. **Framework 规则强制 split**(workflow §1.3):`{{TIER_*_CRITICAL_LABELS}}` 只填 ≤ 5 个短标签(单行 ≤ 80 字符,如 FastAPI:`APIRouter 分组 / Depends DI / async 内禁 sync I/O ...`;Vue 3:`Composition API + <script setup> / ref vs reactive / useXxx 命名 ...`);**完整 detail 禁止进 tier AGENTS.md**,必走 `.claude/rules/<framework>.md` —— 有 `$PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md` 则 cp 并改 `globs:` + `description:`,无 starter 则建空壳带 frontmatter + TODO。tier critical 段 verbatim 重复 rules 内容 = 违反"差量于根"。
2. **删除不适用的整个章节**(如不用 ORM 时 `### {{TIER_ORM}}` 整节删,不留空章节)。
3. **Module Structure 节按主语言渲染**:保留对应语言的文件名行,删其他语言示例;Q&A 答没有的层(如无 ORM → repository 层)也删。
4. **Source Layout 是 SOT**:`{{TIER_SRC_DIR}}` 等据 R5 题 4 答案渲染一处,其他节统一引用指针,防多处独立 plant(workflow §1.12 Cross-file consistency)。

### 5.3b 决策完整性 audit(强制)

每填完一个 tier,单 tier 一组 dispatch auditor:`files_to_audit` = `<tier>/AGENTS.md` + 该 tier cp 出的 `.claude/rules/<framework>.md`;`qa_answers` = Step 2 + 本 tier mini-Q&A;defaults 同 R6。Block 规则同 4.5b。

### 5.4 Tier-level Preview Gate(强制)

每 tier 一组 preview(`<tier>/AGENTS.md` + 关联 rules 文件)+ AskUserQuestion 接受 / 改 / revert。CLAUDE.md 单行 alias 无 preview 价值,自动落盘。

## Step 6 — 裁剪 `.claude/hooks/lint-on-edit.js`

template 是 if-else by extension 骨架:按 Q&A 保留对应语言 case branch,删其他。

## Step 7 — 生成文件清单 + 行数检查(强制)

列生成文件清单,然后:

```bash
wc -l AGENTS.md $(find . -maxdepth 2 -name 'AGENTS.md' -not -path './AGENTS.md' 2>/dev/null) 2>/dev/null
```

每文件报具体行数 + 状态:< 100 ✅ / 100-200 ⚠️ / > 200 🚫(长尾搬 `.claude/rules/` 或 ADR)。**不允许跳过或凭印象描述**。

## Step 7.5 — Self-verify(强制,workflow §1.11)

```bash
# V1 placeholder 残留(唯一允许命中:README.md 的 instruction 文本)
grep -rn '{{' --include='*.md' --include='*.js' --include='*.json' .
# V2 frontmatter(path-scoped rule 含 description + globs;security.md 仅 description)
head -10 .claude/rules/*.md
```

结合 Q&A 答案判断:**V3** globs path prefix 真存在;**V4** 根 AGENTS.md 指针 ↔ tier Commands 节对应、命令 verb 跟 pkg-mgr 对齐;**V4.5** tier framework 各节 ≤ 5 条、深度内容在 rules 文件。运行时:**V5** `/memory` 加载齐(缺 → 嵌套层次错)、**V8** 自问一句话总结栈 + 命令(4 要素全对);V6 命令能跑 / V7 hook 触发 → 🟡 deferred(B 层未起)。任一 ❌(V6/V7 除外)→ 回头改,不能 self-report done。

报告格式:`V1✅ V2✅ V3✅ V4✅ V4.5✅ V5✅ V6🟡def V7🟡def V8✅`

## Step 8 — 用户报告

**还需手工 review**:AGENTS.md `## Boundaries` 项目特定的 ⚠️ Ask first 项(只有用户知道,P0 不收集);`.claude/rules/code-style.md` 各章节按项目实践补;想加 framework rules → cp `_examples/<framework>.example.md` 改 globs。

**⚠️ Aspirational refs**:AGENTS.md 引用了 P0 不生成的文件(docker-compose / app 主入口 / CI 等)——按 Q&A 答案从 [reference.md R7](reference.md) 动态列举"文件 → 怎么获得"表。提醒:想要 ready-to-run 全栈 → clone scaffold 后跑 `/project-personalize`;`/project-init` 是**约定层 init**,不是 code scaffolder。

**📋 下一步**:1) `git init && git add . && git commit -m "P0: initial project setup"` 2) 写 ADR 捕获 P0 重大决策(framework / ORM / DB / 前端栈 / pkg-mgr;Context 可引 tech-researcher 报告) 3) 扫 `docs/gotchas.md` 4) `/project-workflow:feature-init <first-feature-slug>`。方法论见 workflow.md §1 P0。

## Failure modes

| 错误 | 应对 |
|---|---|
| `PLUGIN_ROOT` 解析为空 | plugin 安装异常,让用户 `/plugin uninstall` + `install` 重装后重试 |
| 目录非空有冲突 | 按 Step 1 分支处理 |
| 在 project-workflow 仓库本身跑 | Step 1 警告 + 询问 |
| Q&A 中途退出 | 保存已答部分,重跑不再问 |
| Fullstack 但某 tier 不存在 | 询问是否实际是 (b) Web Backend |
| 推不出 STYLE_HIGHLIGHT(冷门栈) | 填 1-2 条,删第 3 行 |
| `find -delete` / `rmdir` 被 sandbox 拦 | 改单文件 `rm` 循环 + `rmdir` |
