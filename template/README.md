# Project Starter Template

> **What this is**:project-workflow v2 blueprint 的 P0 starter kit —— **纯方法论模板**(AGENTS.md 骨架 / spec 三文件 / ADR / Issue·PR 模板 / hook 骨架)。给任何已有项目或新项目接入 AI 协作层。
>
> **What this is NOT**:不是工程脚手架,**不包含**:Dockerfile / docker-compose / package.json scripts / 后端模块结构 / 前端框架代码 等。
>
> **想避免"AI 第一次搭项目踩的坑"**:看 [`docs/gotchas.md`](../docs/gotchas.md)(10 条,从真实搭建过程沉淀)。

## 怎么用

### 方式 A:全量复制(整体接入)

```bash
# 在你已有的项目根目录
cd <your-project>
cp -r <path-to-template>/. .
```

然后:
1. 编辑 `AGENTS.md`,把 `{{PLACEHOLDER}}` 替换为你的项目信息
2. 编辑 `.claude/rules/*.md`,按你的栈调整规则
3. 编辑 `.claude/hooks/lint-on-edit.js`,**取消注释**对应栈的 lint 命令(eslint / ruff / gofmt 等)
4. 编辑 `.gitignore`,加你栈特定的 ignore 项(node_modules / __pycache__ 等)
5. **(新项目)还要补工程化骨架** —— Dockerfile / docker-compose / 包管理 / 测试基建。参照 [`gotchas.md`](../docs/gotchas.md) 自己写
6. `git add` + 第一次 commit("setup: 接入 project-workflow v2 starter kit")

### 方式 B:选择性复制(按需接入)

只复制你需要的部分。比如:
- 想要 spec 三文件:`cp -r docs/specs/_template <your-project>/docs/specs/`
- 想要 hooks 配置:`cp -r .claude <your-project>/`
- 想要 PR template:`cp .github/PULL_REQUEST_TEMPLATE.md <your-project>/.github/`

## 内容总览

```
template/
├── AGENTS.md                 # 项目级 spec(Anthropic / cross-tool 标准)
├── CLAUDE.md                 # 1 行:@AGENTS.md(Claude Code 入口)
├── .claude/
│   ├── rules/                # 路径级规则(按 Anthropic 官方 .claude/rules/ 机制)
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── security.md
│   ├── hooks/
│   │   └── lint-on-edit.js   # PostToolUse hook:文件保存后自动 lint
│   └── settings.json         # hook 挂载配置
├── docs/
│   ├── specs/
│   │   └── _template/        # 功能级 spec 三文件模板(WHAT/HOW/STEPS)
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── tasks.md
│   └── adr/                  # 架构决策记录
│       ├── README.md
│       └── 0000-template.md
├── .github/                  # 平台原生协作流程(替代 docs/backlog.md)
│   ├── ISSUE_TEMPLATE/
│   │   ├── proposal.md
│   │   ├── feature_request.md
│   │   └── bug_report.md
│   └── PULL_REQUEST_TEMPLATE.md  # 内嵌 proof bundle 检查项
└── .gitignore                # 含 CLAUDE.local.md / .env / 常见 IDE 项
```

> 用 GitLab? 把 `.github/` 整个目录改成 `.gitlab/`,并把 `ISSUE_TEMPLATE/` → `issue_templates/`,`PULL_REQUEST_TEMPLATE.md` → `merge_request_templates/`。结构等价。

## 接入后的下一步

按 [workflow.md §1.11 校验](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#111-校验) 跑一遍:

- AI 工具能加载 AGENTS.md(`/memory` 或类似命令验证)
- 改一个文件,看 hook 自动跑(lint / format)
- 把 AGENTS.md 给 AI 读,问"基于本文件总结这个项目",看理解是否准确

然后进入 [P2 Feature Development](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#3-p2feature-development每个功能):每个新功能复制 `docs/specs/_template/` 起新功能目录。

## 关键约定

- `AGENTS.md` 是 **canonical**(任何 AI 工具都读这个),`CLAUDE.md` 只是 Claude Code 的 thin pointer
- `CLAUDE.local.md` **不在 template 里**,需要时手动 touch(已在 `.gitignore` 里)
- `<module>/CLAUDE.md` **仅模块反常时**才建(差量原则,见 workflow.md §2.3)
