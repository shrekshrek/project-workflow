# project-workflow v2 Quickstart

> **5 分钟操作版**。Methodology 详解见 [`workflow.md`](workflow.md);
> spec/plan/tasks 详细写法见 [`spec-driven.md`](spec-driven.md)。

---

## 60 秒版

```
项目第一天 ──> 每个 feature ──> 持续 ──> 周期
   P0        P2(+sub-flow)    P3      P4
```

每一阶段服务的 Tier 1 命题:

| 阶段 | 主服务命题 | 你的动作 |
|---|---|---|
| **P0** | Drift(锚基线)+ Verification | 建 starter kit(once) |
| **P2** | Verification(每功能验证) | spec → plan → 实施 → proof bundle |
| **P3** | 全部命题(实时拦截) | 几乎零——hooks 自动跑 |
| **P4** | Drift(周期修正) | 每 2 周 refresh AGENTS.md |

---

## P0:项目第一天(约 30 分钟,**only once**)

### P0 路径选择(先看你的起点状态)

| 起点状态 | 跑哪个 skill | 做什么 |
|---|---|---|
| **空目录 / 从零起** | `/project-workflow:project-init` | Q&A 生成完整 v2 starter kit |
| **clone 了 v2 scaffold**(已有 AGENTS.md) | `/project-workflow:project-personalize` | 替换 scaffold default 值 + 补 tier-level AGENTS.md + 扫已有 codebase 推 Project Structure |
| **既有项目想 retrofit 到 v2** | 先跑 `/project-init` 起骨架,再跑 `/project-personalize` 扫已有 codebase | 两步走 |

### Greenfield 路径:`/project-init`

```
/project-workflow:project-init
```

跑完生成 10+ 个文件:`AGENTS.md` + `CLAUDE.md` + `.claude/{rules,hooks,settings.json}` + `docs/{specs/_template,adr,gotchas.md}` + `.github/...` + `.gitignore`。Fullstack 项目还会自动生成 `<tier>/AGENTS.md` + `<tier>/CLAUDE.md`(差量于根)。

**Q&A 中答 "不确定" / "帮我选"** → AI 会主动调研推荐(类似 v1 tech-researcher)。

详见 [`skills/project-init/SKILL.md`](../skills/project-init/SKILL.md)。

### Scaffold-cloned 路径:`/project-personalize`

```
/project-workflow:project-personalize
```

适用 clone 已有 v2 scaffold 后想替换具体值。提供 4 条 path(可多选):

- **A** 替换 scaffold default 值(项目名 / DB 名 / etc.)
- **B** 补齐 tier-level AGENTS.md(中庸方案)
- **C** 扫 codebase 推 `## Project Structure`(类似 v1 codebase-explorer)
- **D** 啥都不补,直接进 `/feature-init`

详见 [`skills/project-personalize/SKILL.md`](../skills/project-personalize/SKILL.md)。

### 手工路径(不装 plugin 时)

按顺序做 6 件事:

1. **`AGENTS.md`** —— 项目级约定,< 200 行,Addy Osmani 六要素结构(Commands / Testing / Project Structure / Code Style / Git Workflow / Boundaries)
2. **`CLAUDE.md`** —— 1 行:`@AGENTS.md`(别复制内容,会 drift)
3. **`.claude/`** —— `rules/` + `hooks/lint-on-edit.js` + `settings.json`
4. **`docs/specs/_template/`** —— 复制 spec/plan/tasks 三文件模板
5. **`docs/gotchas.md`** —— 复制 [project-workflow 仓库的 10 工程坑](gotchas.md)
6. **`.github/PULL_REQUEST_TEMPLATE.md`** —— 含 proof bundle 5 项 checklist

多 tier 项目(fullstack 等)额外加:
7. **`<tier>/AGENTS.md` + `<tier>/CLAUDE.md`** —— 每个 tier 差量于根 AGENTS.md,见 [`workflow.md §1.4`](workflow.md#14-claudemd-嵌套层次子级覆盖父级)

---

## P2:每个功能(每个 feature 跑一次)

新建 `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md`,然后:

```
1. spec.md (WHAT,冻结)
   ├── Outcomes / Scope("不做"必写)/ Constraints / Verification
   └── 不写细节技术决策

2. plan.md (HOW,实施中可补)
   ├── §1 模块影响范围
   ├── §1.1 Sibling Alignment ★ Align/Deviate/Codify
   ├── §1.2 跨模块依赖(运行时)
   ├── §2 架构决策 / §3 Prior decisions / §4 风险
   └── 涉及多模块时 §1.1 必填(防空间 drift)

3. tasks.md (任务拆分)

4. 实施 — AI 写代码,环境层(hooks + LSP)自动检
   ├── 别每步打断(§3.2)
   └── 跑偏才停

5. proof bundle (交付前,§3.3)
   ├── L1 lint/test 通过
   ├── L2 agents-md-reviewer(AGENTS.md 合规,Cite-or-skip,Fresh-read)
   ├── L3 spec-reviewer (spec.md 合规)
   ├── AGENTS.md drift 建议(本次发现该 codify 的事)
   └── 开放问题 + diff 摘要

6. PR / commit
```

工具(可选):
- `/project-workflow:feature-init <slug>` 起骨架
- `/project-workflow:feature-done` 一键跑 L1+L2+L3+proof-bundle
- 或分开:`/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle`

**模块组织建议** ([§2.5](workflow.md#25-模块组织建议领域优先不要技术分层)):按领域切(`backend/src/<bounded-context>/`),**不按技术分层**(controllers/services/...)。

---

## P3:开发期间(自动,零成本)

环境层接管,**你不必做事**:

- Hook on save → `eslint --fix` / `ruff` / `vue-tsc` / etc.(L1 机械检查)
- LSP 实时类型反馈

只在 P2 端点(proof bundle 那一刻)集中做 review,不要中途盯。

---

## P4:周期性 / 主动 refresh(每 2 周或感觉到 drift)

3 种触发模式 ([§5.2](workflow.md#52-三种触发模式)):

| 模式 | 触发 | 动作 |
|---|---|---|
| **A** 主动 refresh | `/refresh-agents-md`(或手动) | 对比 AGENTS.md vs 实际,提 diff |
| **B** 端点反思 | feature 完成时 | proof bundle "AGENTS.md drift 建议"里 |
| **C** 信号触发 | hook 检测"记得 X" >= 2 次 | 自动开 Issue |

**演进 drift 应对**([§5.6](workflow.md#56-演进-drift-的应对策略)):
- 老代码违反新规则 → **默认 grandfather**,不主动回填
- changelog 走 git history,不另写
- 例外:安全 / 合规相关 → 必须回填

---

## Cheatsheet(一页参考)

| 阶段 | 触发时机 | 核心产物 | 工具(可选) | 主要文档 |
|---|---|---|---|---|
| P0 | 新项目 | AGENTS.md + hooks + specs/_template | `/feature-init` | [§1](workflow.md#1-p0project-setup项目第一天) |
| P2 | 每 feature | spec+plan+tasks+proof-bundle | `/feature-init` / `/feature-done` | [§3](workflow.md#3-p2feature-development每个功能) |
| Module Setup | P2 内嵌(需新模块时)| `<module>/` 骨架 + 极少时模块 CLAUDE.md | (无独立工具) | [§2](workflow.md#2-module-setupp2-内的-sub-flow非独立-phase) |
| P3 | 自动 | hook 日志 + LSP | hooks | [§4](workflow.md#4-p3continuous-maintenance开发期间持续) |
| P4 | 每 2 周 / drift | AGENTS.md diff | `/refresh-agents-md` | [§5](workflow.md#5-p4drift-refresh主动修正) |

---

## 何时偏离手册([§9](workflow.md#9-何时偏离手册))

- 改动 < 50 行 → 跳 spec,直接做
- 探索性 spike → worktree + vibe coding,事后写 ADR
- 紧急 hotfix → 直接修,事后补 spec + 测试
- 改文档 → 跳所有 gate

**架构变更**例外:**不要偏离**,必须 spec + ADR + worktree。

---

## 进一步阅读

按需深入:

- [`workflow.md`](workflow.md) ⭐ 5 阶段 + 4 支柱完整方法论(1200 行)
- [`spec-driven.md`](spec-driven.md) spec/plan/tasks 详细写法
- [`gotchas.md`](gotchas.md) 10 工程陷阱清单(P0 前必扫)
- [`dev-deploy.md`](dev-deploy.md) 本地开发 + 同步部署模式
- [`tooling.md`](tooling.md) v2 vs Superpowers/Spec Kit/ECC 对比
