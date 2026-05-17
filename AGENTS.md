# AGENTS.md

> Project-level instructions for any AI coding agent (Claude Code, Codex, OpenCode, Cursor).
> Claude Code reads `CLAUDE.md` which is `@AGENTS.md`.

## 仓库性质

**project-workflow v2** —— spec-driven feature development blueprint + Claude Code plugin。

三件套(本仓库):
1. `docs/` —— 方法论文档(5 阶段、4 支柱、spec 三件套、10 工程陷阱)
2. `template/` —— 纯方法论 starter(语言中立)
3. `.claude-plugin/` + `skills/` —— Claude Code 插件资产

**工程参考实现**(Vue 3 + Element Plus + FastAPI 全栈、Docker、Alembic、18 个测试)在另一个仓库(待发布,目前在私有 dev playground 中)。

**v1 → v2**:完全重写。v1 是 5 个 process-owning slash command,v2 是文档主导 + 可选辅助命令。v1 保留在 git tag `v1.1.0`。

## 文档索引

```
README.md              v2 总览 + 安装 + skill 清单
.claude-plugin/        plugin 资产
├── plugin.json        manifest
└── marketplace.json   marketplace 注册
skills/                Claude Code skills
├── project-init/         /project-workflow:project-init        (P0 greenfield)
├── project-personalize/  /project-workflow:project-personalize (P0 scaffold-cloned/retrofit)
├── feature-init/         /project-workflow:feature-init        (P2 起 feature spec/plan/tasks)
├── spec-quality-check/   /project-workflow:spec-quality-check  (P2 pre-impl gate,§3.7 7 问)
├── spec-revise/          /project-workflow:spec-revise         (P2 mid-impl 修订,§3.5/§2.6)
├── l1-review/            /project-workflow:l1-review
├── l2-review/            /project-workflow:l2-review
├── l3-review/            /project-workflow:l3-review
├── proof-bundle/         /project-workflow:proof-bundle
├── feature-done/         /project-workflow:feature-done        (P2 端点 orchestrator)
└── agents-md-revise/     /project-workflow:agents-md-revise    (P4 主动 refresh A 类约定)

agents/                Sub-agents(被 skills dispatch)
├── agents-md-reviewer.md            L2 AGENTS.md 合规 review(by /l2-review)
├── spec-reviewer.md                 L3 spec.md 合规 review(by /l3-review)
├── spec-quality-reviewer.md         spec 自身质量主观二审(by /spec-quality-check)
├── tech-researcher.md               技术选型调研(by /project-init Q&A,opt-in)
├── codebase-explorer.md             既有 codebase 结构扫描(by /project-personalize Path C)
└── decision-completeness-auditor.md plant 决策追溯审计(by /project-init / /project-personalize / /feature-init / /agents-md-revise,Preview Gate 之前)— 实施 workflow.md §1.12
docs/                  方法论文档
├── workflow.md        ⭐ 5 阶段 + 4 支柱(核心)
├── gotchas.md         ⭐ 10 工程陷阱
├── spec-driven.md     spec/plan/tasks 详解
├── dev-deploy.md      本地开发 + 同步部署
├── tooling.md         工具链对比
├── backlog.md         待办
└── proposals/         详细提案
template/              方法论 starter
```

## 修改纪律

- **方法论 vs 工程化分层**:本仓库**只放方法论**(`docs/` + `template/` + plugin)。工程化样例(具体栈代码)放在另一个仓库,不进本仓库
- **不在方法论里塞栈细节**(workflow.md / gotchas.md 通用,具体命令样例引用外部仓库)
- **plugin skill 简洁**:每个 SKILL.md < 200 行,职责单一
- **skill description 写好**:Claude 据此判断何时自动调用
- **文档先于工具**:任何新 skill / 命令想法,先问 "这是 workflow SOP 的哪一步自动化?SOP 写过没?"。SOP 不清晰时做工具是把混乱固化(对应 workflow.md §7.2 反模式)
- **Skill Step 编号约定**:Step 0 仅用于 **scope-changing pre-work**(cwd 切换 / 全局 setup,影响所有 Step 1+ 的运行环境)。普通输入解析(slug / identifier 等)从 **Step 1** 起。`project-init` / `project-personalize` 用 Step 0(cwd 切换);`feature-init` / `spec-quality-check` 从 Step 1 起(parse 不改 cwd)
- **Skill vs Agent 文件语言原则**(避免误判 drift):
  - **Skills**(user 直接见 → bilingual mix):Title / Use when / Not for / User input 标签 = 英文;Step heading 中文动词;Step body 中文 prose;技术术语 / `Notes` / `Failure modes` 节标题 = 英文
  - **Agents**(LLM-only system prompts → 由内容性质决定):
    - **结构化 methodology**(4-phase / Phase 1/2/3 / mandatory rules)= **英文**(LLM instruction following 在英文 prompt 上更稳)
    - **User-facing 输出模板 / Q&A 措辞 / 推荐内容**(Agent 生成后直给用户看)= **可中文**(match user 语言)
    - **引用项目内中文 anchor / 概念**(如 spec-driven §3.7 中文 7 问)= **中文**(原文保真)
    - 现状的语言占比差异(agents-md-reviewer 95% 英文 vs tech-researcher 50/50)**是内容性质差异,不是 drift** —— 前者纯 methodology,后者大量 user-facing template

## v1 弃用说明

v1 commands(`/project-plan` / `/module-plan` / `/module-dev` / `/module-done` / `/plan-review`)**不再支持**。若用户问起,指向 git tag `v1.1.0`。

## Boundaries

- ✅ Always:加 skill / 改文档 / 加 example
- ⚠️ Ask first:改 workflow.md §0 / §2 / §6 (核心方法论结构);改 plugin.json `name` 字段;改目录大结构
- 🚫 Never:把 v1 commands 加回来;committing secrets
