<!--
PR description 模板。本 template 内嵌 proof bundle 检查项(workflow.md §3.3)。
-->

## Summary

<!-- 1-3 行说明这个 PR 做了什么,从用户视角 -->

## Spec

<!-- 链到对应的功能 spec 目录 -->

- Spec:`docs/specs/<NNN>-<slug>/spec.md`
- Plan:`docs/specs/<NNN>-<slug>/plan.md`
- Tasks:`docs/specs/<NNN>-<slug>/tasks.md`

## Proof Bundle(P2.3 端点交付)

按 [project-workflow §3.3](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#33-交付阶段proof-bundle) 提供证据:

- [ ] **Tests pass** —— 单测 / 集成测,贴失败列表(如有)
- [ ] **L2 合规**:Reviewer agent 提供 `AGENTS.md` 作 context 跑过(项目约定合规)
- [ ] **L3 合规**:Reviewer agent 提供 `spec.md` 作 context 跑过(功能规约合规)
- [ ] **AGENTS.md drift**(如有):本次工作产生了哪些可能值得沉淀的项目级约定?(列建议项,本 PR 不直接改 AGENTS.md;走单独的 refresh PR)
- [ ] **开放问题**(如有):做了什么取舍、有没有 TODO

## 测试方式

<!-- 怎么验证这个 PR 是对的?手测脚本 / curl 命令 / 截图 -->

## 关联

<!-- 相关 Issue / ADR / 上游 PR -->

- Closes #
- Related ADR:`docs/adr/<NNNN>-...md`(如有)
