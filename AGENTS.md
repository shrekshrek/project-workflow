# AGENTS.md

> Project-level instructions for any AI coding agent (Claude Code, Codex, OpenCode, Cursor).
> Claude Code reads `CLAUDE.md` which is `@AGENTS.md`.

## 仓库性质

**project-workflow v3** —— spec-driven feature development blueprint + runtime adapters。

四层资产(本仓库):
1. `docs/` —— 方法论文档(5 阶段、4 支柱、canonical actions、spec 三件套、10 工程陷阱)
2. `template/` —— starter scaffold(方法论核心 + Claude compatibility assets,语言中立但非 tool-empty)
3. `.claude-plugin/` + `skills/` —— Claude Code adapter 资产(当前最成熟)
4. `plugins/project-workflow/` + `.agents/plugins/` —— Codex plugin 分发资产(installable plugin package + local marketplace)

**遵循 project-workflow 方法论的一个具体项目示例**:[`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4) —— FastAPI + Nuxt 4 全栈脚手架,公开。仅作 example-of-one,方法论自身的论据不依赖它。

## 文档索引

```
README.md              v3 总览 + 安装 + skill 清单
.claude-plugin/        plugin 资产
├── plugin.json        manifest
└── marketplace.json   marketplace 注册
skills/                Claude Code skills(9 个,与 Codex 同一 action surface,无 helper 层)
├── project-init/         /project-workflow:project-init        (P0 greenfield)
├── project-personalize/  /project-workflow:project-personalize (P0 scaffold-cloned/retrofit)
├── feature-init/         /project-workflow:feature-init        (P2 起 feature spec/plan/tasks)
├── spec-quality-check/   /project-workflow:spec-quality-check  (P2 pre-impl gate,§3.7 7 问 + M6 current-truth)
├── spec-revise/          /project-workflow:spec-revise         (P2 mid-impl 修订,§3.5/§2.6)
├── feature-done/         /project-workflow:feature-done        (P2 端点:L1/L2/L3/current-truth/proof 一体,幂等)
├── feature-archive/      /project-workflow:feature-archive     (交付后生命周期收尾:current truth + 老 spec 标记)
├── spec-reconcile/       /project-workflow:spec-reconcile      (多 spec 漂移诊断 + 状态修正)
└── agents-md-revise/     /project-workflow:agents-md-revise    (P4 主动 refresh A 类约定)

.agents/plugins/      Codex local marketplace metadata
└── marketplace.json
plugins/
└── project-workflow/ Codex installable plugin package
    ├── .codex-plugin/plugin.json
    ├── skills/       Codex-native skills(9 个,与 Claude 同 action surface,独立 runtime adapter)
    ├── docs/
    └── template/      release artifact copied from root template/

agents/                Claude Code sub-agent adapters(thin wrappers over docs/reviewers/)
├── agents-md-reviewer.md            L2 AGENTS.md 合规 review(by /feature-done L2 层)
├── spec-reviewer.md                 L3 spec.md 合规 review(by /feature-done L3 层)
├── spec-quality-reviewer.md         spec 自身质量主观二审(by /spec-quality-check)
├── tech-researcher.md               技术选型调研(by /project-init Q&A,opt-in)
├── codebase-explorer.md             既有 codebase 结构扫描(by /project-personalize Path C)
└── decision-completeness-auditor.md plant 决策追溯审计(by /project-init / /project-personalize / /feature-init / /spec-revise / /agents-md-revise,Preview Gate 之前)— 实施 workflow.md §1.12
docs/                  方法论文档
├── actions/           workflow action canonical specs
├── reviewers/         reviewer/auditor/researcher canonical specs
├── workflow.md        ⭐ 5 阶段 + 4 支柱(核心)
├── cross-tool-methodology.md  core vs runtime adapter 边界
├── gotchas.md         ⭐ 10 工程陷阱
├── spec-driven.md     spec/plan/tasks 详解
└── tooling.md         工具链对比
template/              starter scaffold(core files + Claude compatibility assets)
scripts/
├── sync-codex-plugin.js  sync/check Codex core release artifacts
├── check-adapter-parity.js  check 9+9 action parity + runtime isolation
├── check-template-contracts.js  check Claude rule frontmatter + shared hook input handling
├── relocate-markdown-links.cjs  preserve local links after feature archive moves
└── check-lifecycle-links.cjs  regression-check archive link relocation
```

## 修改纪律

- **方法论 vs 工程化分层**:本仓库**只放方法论与 adapter 资产**(`docs/` + `template/` + plugin / skills)。工程化样例(具体栈代码)放在另一个仓库,不进本仓库
- **Action source of truth**:workflow action 的触发、输入、输出、不变量、验证写在 `docs/actions/`;修改 Claude/Codex skill 前先改对应 action spec
- **Reviewer source of truth**:L2/L3/research/audit 的方法写在 `docs/reviewers/`;修改 `agents/` 或 Codex plugin reviewer 调用前先改对应 reviewer spec
- **Codex plugin release artifact**:`plugins/project-workflow/docs/` 和 `plugins/project-workflow/template/` 是安装包副本,不要手改;改源目录后运行 `node scripts/sync-codex-plugin.js`
- **双端 native adapter**:根 `skills/` 是 Claude-native;`plugins/project-workflow/skills/` 是 Codex-native。两边必须保持同一 9-action 集合并引用同名 `docs/actions/`,但 runtime 交互 / subagent / 命令写法分别维护;禁止把一边的 SKILL.md 原样同步到另一边
- **Adapter parity**:修改任一端 skill 或 action 后运行 `node scripts/check-adapter-parity.js`;Codex skill 不得出现 Claude-only 交互、具名 agent dispatch 或 `/project-workflow:*` 命令
- **Template contracts**:修改 `.claude/rules/` 模板或共享 hook 后运行 `node scripts/check-template-contracts.js`;规则只接受官方 `paths:` YAML list,description 无字符硬门槛,malformed hook input 必须安全退出
- **Lifecycle links**:修改 `feature-archive` / `spec-reconcile` 后运行 `node scripts/check-lifecycle-links.cjs`;归档移动必须重定位并验证本地 Markdown links
- **不在方法论里塞栈细节**(workflow.md / gotchas.md 通用,具体命令样例引用外部仓库)
- **plugin skill 简洁**:每个 SKILL.md < 200 行,职责单一;超长的静态查表** relocation** 到同目录 `reference.md`(如 `skills/project-init/reference.md`)—— 不是删内容;SKILL.md 标出强制 Read 点,执行时必须先读对应节再填表
- **skill description 写好**:Claude 据此判断何时自动调用
- **文档先于工具**:任何新 skill / 命令想法,先问 "这是 workflow SOP 的哪一步自动化?SOP 写过没?"。SOP 不清晰时做工具是把混乱固化(对应 workflow.md §7.2 反模式)
- **Skill Step 编号约定**:Step 0 仅用于 **scope-changing pre-work**(cwd 切换 / 全局 setup,影响所有 Step 1+ 的运行环境)。普通输入解析(slug / identifier 等)从 **Step 1** 起。`project-init` / `project-personalize` 用 Step 0(cwd 切换);`feature-init` / `spec-quality-check` 从 Step 1 起(parse 不改 cwd)
- **Skill vs Agent 文件语言原则**(避免误判 drift):
  - **Claude-native skills**(`skills/`,user 直接见 → bilingual mix):Title / Use when / Not for / User input 标签 = 英文;Step heading 中文动词;Step body 中文 prose;技术术语 / `Notes` / `Failure modes` 节标题 = 英文
  - **Codex-native skills**(`plugins/project-workflow/skills/`):instruction prose 保持英文,以维持现有 adapter prompt 一致性;user-facing 输出仍必须匹配用户语言
  - **Agents**(LLM-only system prompts → 由内容性质决定):
    - **结构化 methodology**(4-phase / Phase 1/2/3 / mandatory rules)= **英文**(LLM instruction following 在英文 prompt 上更稳)
    - **User-facing 输出模板 / Q&A 措辞 / 推荐内容**(Agent 生成后直给用户看)= **可中文**(match user 语言)
    - **引用项目内中文 anchor / 概念**(如 spec-driven §3.7 中文 7 问)= **中文**(原文保真)
    - 现状的语言占比差异(agents-md-reviewer 95% 英文 vs tech-researcher 50/50)**是内容性质差异,不是 drift** —— 前者纯 methodology,后者大量 user-facing template

## Boundaries

- ✅ Always:加 skill / 改文档 / 加 example
- ⚠️ Ask first:改 workflow.md §0 / §2 / §6 (核心方法论结构);改 plugin.json `name` 字段;改目录大结构
- 🚫 Never:committing secrets
