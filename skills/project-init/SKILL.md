---
name: project-init
description: Initialize an empty greenfield project's v3 starter kit (AGENTS.md, scoped rules, optional verified hooks, ADR guide and domain index). Q&A driven and stack-neutral. Accepts an optional target path. Use project-personalize for every non-empty existing codebase or copied scaffold.
---

**Response language**: Match the user's prompt language (中文 / English / etc.) for all natural-language output. Generated file content stays in the language of the source template.

# Project Init

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-init.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details. **静态查表(placeholder 映射 / paths 推导 / mini-Q&A 题库 / defaults 清单)在同目录 [`reference.md`](reference.md)—— 是 relocation 不是删减;Step 4 开始前必须 Read R1-R4+R6,Step 5.1 开始前必须 Read R5,Step 8 报告前 Read R7。不得凭记忆填表。**

**Use when**: P0 — empty or genuinely new target with no existing codebase/scaffold assets.
**Not for**: starting a feature (`/feature-init`) / refreshing existing A 类约定 (`/agents-md-revise`) / scaffold-cloned or retrofit 项目(`/project-personalize`,它处理替换 scaffold defaults、补 tier-level、扫既有代码)。

**Output structure**(写到 target 目录):根 `AGENTS.md` + `CLAUDE.md`(1 行 @AGENTS.md)、`.claude/rules/{code-style,testing,security}.md`、`docs/specs/index.md`、`docs/adr/README.md`、`docs/gotchas.md`、`.gitignore`;fullstack 追加 tier files。所有 `*_template` 保留在 plugin;只有 hook active + verified 时才生成 `.claude/hooks` / `.claude/settings.json` / `.codex/hooks*`。

## Step 0 — 解析 target 目录(可选 `$ARGUMENTS`)

空 → target = cwd;相对路径基于 cwd 解析;绝对路径直接用。目录不存在时先按“空 target”记录,不得提前 `mkdir`;target 目录本身也只在 Step 6.5 approval 后由 strict apply 创建。已有 target 的 inspection 在该目录只读执行;生成/编辑先写 disposable staging。

## Step 1 — 检测 target 状态

`ls -la` 后分支:

| 当前状态 | 处理 |
|---|---|
| 空目录 / 几乎空 | 进 Step 2(greenfield 流程) |
| 已有 `AGENTS.md` | 不适合本 skill —— 重定向 `/project-workflow:project-personalize` |
| 无 AGENTS.md 但已有源码、manifest、配置或 scaffold 资产 | 不适合本 skill —— 重定向 `/project-workflow:project-personalize` |

**安全检查**:若 target 像 project-workflow 仓库本身(有 `docs/workflow.md` + `skills/feature-init/`)→ 警告误用,确认才继续。

## Step 2 — Q&A:栈 + 约定

**默认逐轮推进,等用户回答再继续**。关键决策一轮一答;紧密耦合的小问题可同轮合并;能从已答内容、manifest 或栈默认值客观推导的不硬问,推导歧义时再确认。答案存本地变量等 Step 4 用。

### ⚠️ Greenfield 隔离原则(critical)

Q&A 选项 + 默认值必须**语言/栈中立**,不引用具体既有项目。默认值只基于本会话答案和栈社群通用 default,不基于 target 父级/兄弟项目偏好;把“跟 X 一致”改成栈通用描述。

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

## Step 3 — 在一次性 staging 中生成 baseline

```bash
PLUGIN_ROOT="${PROJECT_WORKFLOW_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-}}}"
if [ -z "$PLUGIN_ROOT" ] || [ ! -d "$PLUGIN_ROOT/template" ]; then
  PLUGIN_ROOT="$(find "$HOME/.claude/plugins/cache" "$HOME/.codex/plugins/cache" -type d -path '*/project-workflow*/template' -print 2>/dev/null | sort | tail -1 | sed 's#/template$##')"
fi
[ -n "$PLUGIN_ROOT" ] && [ -d "$PLUGIN_ROOT/template" ] || { echo "Cannot resolve project-workflow plugin root"; exit 1; }

STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/project-workflow-init.XXXXXX")"
node "$PLUGIN_ROOT/scripts/materialize-project-baseline.cjs" \
  --stage "$STAGING_DIR" --target "$TARGET_DIR"
```

target 此时必须保持不变。后续生成/编辑都在 `$STAGING_DIR` 完成,展示路径时映射成将来的 target 路径。脚本会预检 target symlink/no-clobber 边界;staging 中不得出现 reusable template、examples 或未启用 hook assets。

## Step 4 — 填 placeholder(根 AGENTS.md + `.claude/rules/`)

用 Edit 逐文件填齐。**填齐或删行,不允许留 `{{...}}`**(no aspirational)。

- **4.1 根 AGENTS.md**:按 [reference.md R1](reference.md) 映射表填(含模块组织 / Git 平台 default);`{{HOOK_INDEX}}` 严格按最终实际文件渲染,未安装 hook 就删行。
- **4.2 `.claude/rules/`**:按 [R2](reference.md) 填;每个 rule 的 `description:` 保持简洁、具体。
- **4.3 paths 推导**:按 [R3](reference.md)填 `paths:` YAML 列表;禁止生成历史 scope key 或 scalar scope(workflow §1.6)。
- **4.4 STYLE_HIGHLIGHT**:按 [R4](reference.md)——只写项目级真正特殊的点,栈通用 default 不写。

### 4.5 `.claude/rules/` 自动发现判断(强制)

确认根 AGENTS.md 不手工 `@import` `.claude/rules/`:Claude Code 会自动递归发现规则,有 `paths:` 的按路径加载,无 `paths:` 的 `security.md` 全局加载。改动累积在内存,**不立即 Write**(等 4.6 preview)。

### 4.5b 决策完整性 audit(强制,workflow §1.12)

Preview 前 dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md):
- `files_to_audit`: 根 AGENTS.md + `.claude/rules/{code-style,testing,security}.md`(inline,未落盘)
- `qa_answers`: Step 2 全部答案(dot-path keyed);`language_conventions`: null
- `plugin_hardcoded_defaults`: [reference.md R6](reference.md) 清单

**Block 规则**:🚫 > 0 不进 4.6,按修正选项处理后重跑本 step;⚠️ 不 block,4.6 一并展示。vendor docs 钉死的 idiom(Vue `PascalCase.vue` 等)归 ⚠️ 不归 🚫。

### 4.6 Root Draft Preview(强制,不追加 approval)

展示根 AGENTS.md + 三个 rules 文件草稿、audit 摘要与 ⚠️ 明细。用户主动要求修正就重跑 audit/preview;否则继续组装,不在这里再问一次“接受吗”。本步不写 target,唯一 approval 在 Step 6.5。

## Step 5 — Fullstack:per-tier AGENTS.md + CLAUDE.md

**仅轮 1 答 (a) 时执行**。对每个 tier:

### 5.1 分类 + mini-Q&A

先分类:**Service-style**(跑后台逻辑 / API / 任务:backend / api / worker / inference-server ...)vs **UI-style**(给用户看的界面:frontend / web / admin / mobile ...);不确定问用户。然后按 [reference.md R5](reference.md) 题库跑 mini-Q&A(✅ Required 必问、⚪️ Optional 可省;跑前扫本 session 对话跳过已 hint 的题)。

### 5.2 据类别复制模板

```bash
mkdir -p "$STAGING_DIR/$TIER_NAME"
cp "$PLUGIN_ROOT/template/_multi_tier_examples/${TIER_CATEGORY}.AGENTS.md.example" "$STAGING_DIR/$TIER_NAME/AGENTS.md"
cp "$PLUGIN_ROOT/template/_multi_tier_examples/${TIER_CATEGORY}.CLAUDE.md.example" "$STAGING_DIR/$TIER_NAME/CLAUDE.md"
```

模板按**类别**不按 tier 名(`worker/` 也用 service-tier.example)。

### 5.3 填 tier-level placeholder + framework split

逐个替换 `{{TIER_*}}`(详见 `$PLUGIN_ROOT/template/_multi_tier_examples/README.md`)。三条关键规则:

1. **Framework 规则强制 split**(workflow §1.3):`{{TIER_*_CRITICAL_LABELS}}` 只填 ≤ 5 个短标签(单行 ≤ 80 字符,如 FastAPI:`APIRouter 分组 / Depends DI / async I/O ...`;Vue 3:`Composition API only / ref vs reactive / useXxx 命名 ...`);**完整 detail 禁止进 tier AGENTS.md**,必走 `.claude/rules/<framework>.md` —— 有 `$PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md` 则复制到 staging 并改 `paths:` YAML list + `description:`;无 starter 时只根据用户答案或客观配置写 concrete rules,证据不足就不创建 framework rule。tier critical 段不得重复 rules 正文。
2. **删除不适用的整个章节**(如不用 ORM 时 `### {{TIER_ORM}}` 整节删,不留空章节)。
3. **Module Structure 节按主语言渲染**:保留对应语言的文件名行,删其他语言示例;Q&A 答没有的层(如无 ORM → repository 层)也删。
4. **Source Layout 是 SOT**:`{{TIER_SRC_DIR}}` 等据 R5 题 4 答案渲染一处,其他节统一引用指针,防多处独立 plant(workflow §1.12 Cross-file consistency)。

### 5.3b 决策完整性 audit(强制)

每填完一个 tier,单 tier 一组 dispatch auditor:`files_to_audit` = `<tier>/AGENTS.md` + 该 tier cp 出的 `.claude/rules/<framework>.md`;`qa_answers` = Step 2 + 本 tier mini-Q&A;defaults 同 R6。Block 规则同 4.5b。

### 5.4 Tier-level Draft Preview(强制,不追加 approval)

每 tier 展示一组草稿(`<tier>/AGENTS.md` + alias + 关联 rules)。用户主动修正才重跑该组 audit/preview;否则继续,所有内容仍只在 staging。唯一 approval 在 Step 6.5。

## Step 6 — 判定是否 materialize hook

二选一:
- 有 <5 秒、支持单文件参数且不扩大写范围的已确认命令 → 从 `$PLUGIN_ROOT/template/` 复制 Claude/Codex hook assets 到 staging,按 extension 裁剪,用 `execFileSync(binary,args)` 对 staging 中匹配文件验证;同步把 staged 根 AGENTS.md `{{HOOK_INDEX}}` 渲染为最终 hook 路径。
- 只有全量/长跑、未安装或参数不确定的命令 → **不生成 hook 文件或 mapping**,报告 `hook: not installed + reason`;L1 由 `feature-done` 承担。
激活验证失败时删除本轮新建 hook assets并报告原因,不得留下 no-op skeleton 或声称 runtime enforcement。

### Step 6.5 — Consolidated Apply Gate(唯一 target write gate)

列出 staging 的完整最终文件集与相对 target 路径,展示 root/tier/hook preview 及 audit 摘要。用户一次确认后运行:

```bash
node "$PLUGIN_ROOT/scripts/materialize-project-baseline.cjs" \
  --apply-staged "$STAGING_DIR" "$TARGET_DIR"
```

apply 先做 strict no-clobber/symlink preflight;任一路径出现新冲突就整批拒绝、复制数为 0。用户拒绝或 audit 阻断则删除 staging,target 不得有本 action 产生的文件。复制期异常执行本轮文件回滚并显式报告;成功后删除 staging。

## Step 7 — 生成文件清单 + 行数检查(强制)
列生成文件清单,然后:

```bash
wc -l AGENTS.md $(find . -maxdepth 2 -name 'AGENTS.md' -not -path './AGENTS.md' 2>/dev/null) 2>/dev/null
```

每文件报具体行数 + 状态:< 100 ✅ / 100-200 ⚠️ / > 200 🚫(长尾搬 `.claude/rules/` 或 ADR)。**不允许跳过或凭印象描述**。

## Step 7.5 — Self-verify(强制,workflow §1.11)

```bash
# V1 placeholder 残留(只检查本 action 生成的文件;目标原有 README 等外部文件不计)
grep -rn '{{' --include='*.md' --include='*.js' --include='*.cjs' --include='*.json' .
# V2 frontmatter(path-scoped rule 含 description + paths YAML list;security.md 仅 description)
head -10 .claude/rules/*.md
```

结合 Q&A 答案判断:**V3** paths 有效;**V4/V4.5** 命令与分层一致;**V5** `/memory` 加载齐;V6 endpoint command 能跑;V7 必须是 `active + verified` 或 `not installed + reason`,后者还要确认项目内无新 hook mapping/script;**V8** 栈与命令总结正确。任一 ❌ → 回头改。报告:`V1✅ V2✅ V3✅ V4✅ V4.5✅ V5✅ V6✅/deferred(reason) V7✅active/⚪not-installed(reason) V8✅`

## Step 8 — 用户报告

**还需手工 review**:AGENTS.md `## Boundaries` 项目特定的 ⚠️ Ask first 项(只有用户知道,P0 不收集);`.claude/rules/code-style.md` 各章节按项目实践补;想加 framework rules → 从已安装插件的 `template/.claude/rules/_examples/<framework>.example.md` 复制并改 paths 列表。

**⚠️ Aspirational refs**:AGENTS.md 引用了 P0 不生成的文件(docker-compose / app 主入口 / CI 等)——按 Q&A 答案从 [reference.md R7](reference.md) 动态列举"文件 → 怎么获得"表。提醒:想要 ready-to-run 全栈 → clone scaffold 后跑 `/project-personalize`;`/project-init` 是**约定层 init**,不是 code scaffolder。

**📋 下一步**:1) `git init && git add . && git commit -m "P0: initial project setup"` 2) 仅当决定改变架构/模块边界、形成持久跨 feature 技术决定或取代既有 ADR 时写 ADR;普通 framework / ORM / DB / 前端栈 / pkg-mgr 选择不因名称本身自动起 ADR,拿不准可引用 tech-researcher 报告 3) `/project-workflow:feature-init <first-feature-slug>`。`docs/gotchas.md` 只在项目真实踩坑后追加。方法论见 workflow.md §1 P0。

## Failure modes

| 错误 | 应对 |
|---|---|
| `PLUGIN_ROOT` 解析为空 | plugin 安装异常,让用户 `/plugin uninstall` + `install` 重装后重试 |
| 目录非空有冲突 / 在 workflow 仓库本身跑 | 按 Step 1 分支处理或警告确认 |
| Q&A 中途退出 | 保存已答部分,重跑不再问 |
| Fullstack 但某 tier 不存在 | 询问是否实际是 (b) Web Backend |
| `find -delete` / `rmdir` 被 sandbox 拦 | 改单文件 `rm` 循环 + `rmdir` |
