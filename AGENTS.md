# Project Workflow 协作约定

`docs/actions/` 维护动作契约，`docs/reviewers/` 维护审查方法，`template/` 存放项目模板。九个跨端技能的入口位于 `entries/`。宿主按能力调度角色，适用的回退规则由审查契约定义。

运行 `node scripts/check-all.cjs` 验证源码、打包、模板和行为约定。修改运行资料后执行 `node scripts/build-skills.cjs --sync`，随源码提交生成的 `skills/`。正式发布时更新 `VERSION` 并重新生成，CI 验证后为 release commit 打标签。

## 修改纪律

- **方法论 vs 工程化分层**:本仓库**只放方法论与技能资产**(`docs/` + `template/` + skills)。工程化样例(具体栈代码)放在另一个仓库,不进本仓库
- **Action source of truth**:workflow action 的触发、输入、输出、不变量、验证写在 `docs/actions/`;变更动作语义先改对应 action spec。同一关注点只保留一个 normative owner;新增行为先合并或替换已有规则,技能入口、template 和外围文档只保留必要引用或摘要,不复制决策逻辑、条件表或解释;提交前检查第二权威来源和无谓净增。
- **Template contracts**:修改 baseline 或 `.claude/rules/` 模板后运行 `node scripts/check-template-contracts.js`;保留 no-clobber 安全检查，规则使用 `paths:` YAML list
- **Lifecycle links**:修改 `feature-archive` / `spec-reconcile` 后运行 `node scripts/check-lifecycle-links.cjs`;归档移动必须重定位并验证本地 Markdown links
- **Workflow contracts**:修改 conversation / record rules / retrofit / verdict / feature templates 后运行 `node scripts/check-workflow-contracts.cjs`
- **Docs links**:修改或移动 Markdown 后运行 `node scripts/check-markdown-links.cjs`
- **不在方法论正文塞栈细节**:workflow.md §0-§7/§9-§10、`docs/actions/`、`docs/reviewers/`、`template/` 保持栈中立;`template/docs/gotchas.md` 是生成项目用的空 ledger,必须栈中立。两处显式豁免:`docs/gotchas.md` 是 plugin 自身的 example-of-one 证据库(允许栈偏向,只收真实复现过的坑);workflow.md §8 是栈适配示范附录(换栈只重写该节)
- **plugin skill 简洁**:每个 SKILL.md < 200 行,职责单一;先删除过期内容、合并重复规则,再按实际使用条件引用已有 owner。只有独立维护或按需读取确有收益时才拆分,不得仅靠搬文件满足行数;必要运行时参考从 skill/agent 入口直接定位并注明条件和章节范围;跨 action 链接不触发递归全文读取,流程跳转和背景资料不作为预读依赖。
- **skill description 写好**:宿主据此判断何时自动调用
- **文档先于工具**:任何新 skill / 命令想法,先问 "这是 workflow SOP 的哪一步自动化?SOP 写过没?"。SOP 不清晰时做工具是把混乱固化(对应 workflow.md §7.2 反模式)
- **Skill Step 编号约定**:Step 0 仅用于 **scope-changing pre-work**(cwd / 写入根解析、全局 setup,影响所有 Step 1+ 的运行环境)。普通输入解析(slug / identifier 等)从 **Step 1** 起。`project-init` / `project-personalize`(cwd 切换)与 `feature-init`(TARGET_ROOT 解析)用 Step 0;`spec-quality-check` 从 Step 1 起(parse 不改 cwd / 写入根)
- **Runtime prompt 语言**:各端共用 `entries/` 中的英文指令
  - 每个 Skill 必须明确 `Match the user's language`；每个 Agent 必须明确匹配 calling skill/user 的语言
  - user-facing 回复使用用户的语言；项目文件、引用内容、代码、命令、路径和 schema key 保留 source/canonical 语言
  - `docs/`、`template/` 和用户内容不因 runtime prompt 英文化而批量翻译

## Boundaries

- ✅ Always:加 skill / 改文档 / 加 example
- ⚠️ Ask first:改 workflow.md §0 / §2 / §6 (核心方法论结构);改对外发布的技能名;改目录大结构
- 🚫 Never:committing secrets
