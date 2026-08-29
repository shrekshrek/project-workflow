# AGENTS.md

> Project-level instructions for any AI coding agent (Claude Code, Codex, OpenCode, Cursor).
> Claude Code reads `CLAUDE.md` which is `@AGENTS.md`.

## 仓库性质

**project-workflow v3** —— conversation-and-evidence-led feature development workflow + runtime adapters。

四层资产(本仓库):
1. `docs/` —— 方法论文档(四个运行阶段、4 支柱、canonical actions、按需单份 spec、gotchas 示范 ledger)
2. `template/` —— starter scaffold(方法论核心 + Claude compatibility assets,语言中立但非 tool-empty)
3. `adapters/claude/` —— Claude Code-native skills / named agents / manifest
4. `adapters/codex/` —— Codex-native skills / manifest;两端安装包由构建脚本生成

**遵循 project-workflow 方法论的一个具体项目示例**:[`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4) —— FastAPI + Nuxt 4 全栈脚手架,公开。仅作 example-of-one,方法论自身的论据不依赖它。

## 文档索引

```
README.md              v3 总览 + 安装 + skill 清单
.claude-plugin/        Claude marketplace 注册(指向 plugin-dist)
.agents/plugins/       Codex marketplace 注册(指向 plugin-dist)
adapters/
├── claude/
│   ├── .claude-plugin/plugin.json
│   ├── agents/        6 个 Claude named-agent thin adapters
│   └── skills/        Claude Code skills(9 个,与 Codex 同一 action surface,无 helper 层)
└── codex/
    ├── .codex-plugin/plugin.json
    └── skills/        Codex-native skills(9 个,可调度时强制通用 subagent + 有据 fallback)

adapters/claude/skills/
├── project-init/         /project-workflow:project-init        (P0 baseline-compatible / already-initialized target)
├── project-personalize/  /project-workflow:project-personalize (P0 project evidence / partial-custom baseline)
├── feature-init/         /project-workflow:feature-init        (P2 沟通、试验与按需记录)
├── spec-quality-check/   /project-workflow:spec-quality-check  (P2 语义就绪与需求对账)
├── spec-revise/          /project-workflow:spec-revise         (P2 mid-impl 修订,§3.5/§2.6)
├── feature-done/         /project-workflow:feature-done        (P2 端点:L1/L2/L3/current-truth/proof 一体,幂等)
├── feature-archive/      /project-workflow:feature-archive     (交付后生命周期收尾:current truth + 老 spec 标记)
├── spec-reconcile/       /project-workflow:spec-reconcile      (多 spec 漂移诊断 + 状态修正)
└── agents-md-revise/     /project-workflow:agents-md-revise    (P4 主动 refresh A 类约定)

adapters/claude/agents/ Claude Code sub-agent adapters(thin wrappers over docs/reviewers/)
├── agents-md-reviewer.md            L2 AGENTS.md 合规 review(by /feature-done L2 层)
├── spec-reviewer.md                 L3 spec.md 合规 review(by /feature-done L3 层)
├── spec-quality-reviewer.md         需求对账 + spec 质量与条件式架构充分性复核(by /spec-quality-check)
├── tech-researcher.md               技术选型调研(by /project-personalize;spec 填写时仅作可选研究,不为覆盖率强制调用)
├── codebase-explorer.md             非平凡 codebase 结构扫描(by /project-personalize 按需调用)
└── decision-completeness-auditor.md plant 决策追溯审计(by /project-personalize / /feature-init / /spec-revise / /agents-md-revise,Preview Gate 之前)— 实施 workflow.md §1.12
docs/                  方法论文档
├── actions/           workflow action canonical specs
├── reviewers/         reviewer/auditor/researcher canonical specs
├── architecture-design.md  architecture change 的按需设计指南
├── workflow.md        ⭐ 四个运行阶段 + 4 支柱(核心)
├── cross-tool-methodology.md  core vs runtime adapter 边界
├── gotchas.md         example-of-one gotchas 证据库(示范短版)
├── spec-driven.md     沟通、记录与验证详解
└── tooling.md         工具链对比
template/              starter scaffold(core files + Claude compatibility assets)
scripts/
├── check-all.cjs  run the complete local validation suite and summarize failures
├── build-plugin-packages.cjs  generate/check Claude + Codex self-contained packages
├── check-adapter-parity.js  check 9+9 action parity + runtime isolation
├── check-template-contracts.js  check baseline safety + Claude rule frontmatter
├── check-reviewer-fixtures.cjs  check reviewer smoke fixture inputs + verdict truth tables
├── check-feature-init-fixtures.cjs  check/grade feature-init behavior scenario matrix
├── materialize-feature-artifact.cjs  atomically create a no-clobber feature artifact from the single spec template
├── materialize-project-baseline.cjs  stage/apply P0 baseline (used by project-init / project-personalize)
├── relocate-markdown-links.cjs  preserve local links after feature archive moves
├── check-lifecycle-links.cjs  regression-check archive link relocation
├── check-markdown-links.cjs  verify local Markdown destinations across source + runtime adapters + release docs
└── check-workflow-contracts.cjs  check conversation / records / retrofit / verdict / neutral-template semantics
```

## 修改纪律

- **方法论 vs 工程化分层**:本仓库**只放方法论与 adapter 资产**(`docs/` + `template/` + plugin / skills)。工程化样例(具体栈代码)放在另一个仓库,不进本仓库
- **Action source of truth**:workflow action 的触发、输入、输出、不变量、验证写在 `docs/actions/`;修改 Claude/Codex skill 前先改对应 action spec。同一关注点只保留一个 normative owner;新增行为先合并或替换已有规则,adapter、template 和外围文档只保留必要引用或摘要,不复制决策逻辑、条件表或解释;提交前检查第二权威来源和无谓净增。
- **Reviewer source of truth**:L2/L3/research/audit 的方法写在 `docs/reviewers/`;修改 `adapters/claude/agents/` 或 Codex reviewer 调用前先改对应 reviewer spec
- **Generated release artifacts**:主分支不保留自包含安装包副本;运行 `node scripts/build-plugin-packages.cjs --check` 验证两端生成包,版本化 release commit 通过全部 CI 后发布到 `plugin-dist`
- **双端 native adapter**:`adapters/claude/skills/` 是 Claude-native;`adapters/codex/skills/` 是 Codex-native。两边必须保持同一 9-action 集合并引用同名 `docs/actions/`,但 runtime 交互 / subagent / 命令写法分别维护;禁止把一边的 SKILL.md 原样同步到另一边
- **Adapter parity**:修改任一端 skill 或 action 后运行 `node scripts/check-adapter-parity.js`;Codex skill 不得出现 Claude-only 交互、具名 agent dispatch 或 `/project-workflow:*` 命令
- **Template contracts**:修改 baseline 或 `.claude/rules/` 模板后运行 `node scripts/check-template-contracts.js`;保留 no-clobber 安全检查，规则使用 `paths:` YAML list
- **Lifecycle links**:修改 `feature-archive` / `spec-reconcile` 后运行 `node scripts/check-lifecycle-links.cjs`;归档移动必须重定位并验证本地 Markdown links
- **Workflow contracts**:修改 conversation / record rules / retrofit / verdict / feature templates 后运行 `node scripts/check-workflow-contracts.cjs`
- **Docs links**:修改或移动 Markdown 后运行 `node scripts/check-markdown-links.cjs`
- **不在方法论正文塞栈细节**:workflow.md §0-§7/§9-§10、`docs/actions/`、`docs/reviewers/`、`template/` 保持栈中立;`template/docs/gotchas.md` 是生成项目用的空 ledger,必须栈中立。两处显式豁免:`docs/gotchas.md` 是 plugin 自身的 example-of-one 证据库(允许栈偏向,只收真实复现过的坑);workflow.md §8 是栈适配示范附录(换栈只重写该节)
- **plugin skill 简洁**:每个 SKILL.md < 200 行,职责单一;超长的静态查表** relocation** 到同目录 `reference.md`—— 不是删内容;SKILL.md 标出强制 Read 点,执行时必须先读对应节再填表
- **skill description 写好**:Claude 据此判断何时自动调用
- **文档先于工具**:任何新 skill / 命令想法,先问 "这是 workflow SOP 的哪一步自动化?SOP 写过没?"。SOP 不清晰时做工具是把混乱固化(对应 workflow.md §7.2 反模式)
- **Skill Step 编号约定**:Step 0 仅用于 **scope-changing pre-work**(cwd / 写入根解析、全局 setup,影响所有 Step 1+ 的运行环境)。普通输入解析(slug / identifier 等)从 **Step 1** 起。`project-init` / `project-personalize`(cwd 切换)与 `feature-init`(TARGET_ROOT 解析)用 Step 0;`spec-quality-check` 从 Step 1 起(parse 不改 cwd / 写入根)
- **Runtime prompt 语言**:`adapters/claude/skills/`、`adapters/claude/agents/` 和 `adapters/codex/skills/` 的 instruction prose 统一使用英文，但两端 runtime/subagent/command 写法仍分别维护，不得原样同步
  - 每个 Skill 必须明确 `Match the user's language`；每个 Agent 必须明确匹配 calling skill/user 的语言
  - user-facing 回复使用用户的语言；项目文件、引用内容、代码、命令、路径和 schema key 保留 source/canonical 语言
  - `docs/`、`template/` 和用户内容不因 runtime prompt 英文化而批量翻译

## Boundaries

- ✅ Always:加 skill / 改文档 / 加 example
- ⚠️ Ask first:改 workflow.md §0 / §2 / §6 (核心方法论结构);改 plugin.json `name` 字段;改目录大结构
- 🚫 Never:committing secrets
