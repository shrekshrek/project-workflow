# Claude Code 智能体协作手册 (Agent Team Manual)

> **版本**: 2026.02.06 (Refined Edition)
> **目标**: 将 Claude Code 打造为全栈、全能、全流程的虚拟研发团队。
> **技能总数**: 36

---

## 1. 核心架构与技能来源 (Core Architecture & Sources)

本环境集成了目前开源社区最强的组件，共同构成了您的 AI 结对编程伙伴。我们在后文的技能矩阵中，使用以下标签来标识技能的来源：

### 🧬 来源分类 (Sources Legend)

| 标签 | 来源 | 仓库/安装方式 | 技能数 |
| :--- | :--- | :--- | :---: |
| **`Anthropic`** | Anthropic 官方 | `npx skills add anthropics/skills` | 11 |
| **`Antigravity`** | 硬核工程技能库 | `git sparse-checkout` from `sickn33/antigravity-awesome-skills` | 4 |
| **`Vercel`** | Vercel 官方 | `vercel-labs/agent-skills` + `agent-browser` + `skills` | 4 |
| **`Supabase`** | Supabase 官方 | `npx skills add supabase/agent-skills` | 1 |
| **`Expo`** | Expo 官方 | `npx skills add expo/skills` | 1 |
| **`Jeffallan`** | 全栈技能合集 (65 skills) | `npx skills add Jeffallan/claude-skills` | 5 |
| **`onmax`** | Nuxt/Vue 生态 | `npx skills add onmax/nuxt-skills` | 2 |
| **`vuejs-ai`** | Vue 调试 | `npx skills add vuejs-ai/skills` | 1 |
| **`obra`** | Superpowers 工作流 | `npx skills add obra/superpowers` | 1 |
| **`squirrelscan`** | 网站审计工具 | `npx skills add squirrelscan/skills` | 1 |
| **`Vibeship`** | 3D/创意技能 | `npx skills add vibeforge1111/vibeship-spawner-skills` | 1 |
| **`wshobson`** | Tailwind 设计系统 | `npx skills add wshobson/agents` | 1 |
| **`softaworks`** | Mermaid 绘图 | `npx skills add softaworks/agent-toolkit` | 1 |
| **`coreyhaines`** | 营销文案 | `npx skills add coreyhaines31/marketingskills` | 1 |
| **`brettdavies`** | Crawl4AI 爬虫 | `npx skills add brettdavies/crawl4ai-skill` | 1 |
| **`MCP`** | Model Context Protocol | `~/.claude/settings.json` 配置 | - |
| **`Core`** | everything-claude-code | `npx everything-claude-code@latest` | - |


---

## 2. 内置能力 (Built-in Capabilities)

由 `everything-claude-code` 插件直接提供，无需额外调用，根据指令自动触发。

### 🤖 虚拟角色 (Agents)
AI 会根据上下文自动切换身份。触发方式分两种：**斜杠命令**显式调用，或**自动触发**（AI 检测到相关上下文时主动介入）。

所有 agent 定义文件位于 `~/.claude/plugins/cache/everything-claude-code/.../agents/`。

#### 命令触发 (10 个)

| 角色 | 触发命令 | 职责 |
| :--- | :--- | :--- |
| **Planner** (规划师) | `/plan` | 拆解任务、评估风险、生成实施计划 |
| **TDD Guide** (测试导师) | `/tdd` | 指导"红-绿-重构"开发流程 |
| **Code Reviewer** (审查员) | `/code-review` | 代码质量检查、风格规范审查 |
| **Refactor Cleaner** (重构员) | `/refactor-clean` | 分析死代码、安全删除、测试验证 |
| **Build Error Resolver** (构建修复) | `/build-fix` | 构建失败、TypeScript 类型错误的最小化修复 |
| **E2E Runner** (端到端测试) | `/e2e` | Playwright 测试生成、运行、截图与 Trace 管理 |
| **Doc Updater** (文档员) | `/update-docs` | 更新代码地图、README 与技术文档 |
| **Go Build Resolver** | `/go-build` | Go 构建错误、go vet、linter 修复 |
| **Go Reviewer** | `/go-review` | Go 代码审查 (并发、错误处理、惯用模式) |
| **Python Reviewer** | `/python-review` | Python 代码审查 (PEP 8、类型提示、安全) |

#### 自动触发 (3 个)

| 角色 | 触发条件 | 职责 |
| :--- | :--- | :--- |
| **Architect** (架构师) | 涉及架构决策时 | 系统设计、技术选型、模块划分 |
| **Security Reviewer** (安全员) | 代码涉及认证、用户输入、API、敏感数据时 | OWASP Top 10 检测、密钥泄露扫描 |
| **Database Reviewer** (数据库审查) | 编写 SQL、设计 Schema、数据库调优时 | PostgreSQL 查询优化、RLS 策略、索引设计 |

### ⚡ 核心指令 (Commands)
在 Claude CLI 输入框中直接使用的斜杠命令：

#### 规划与开发
*   **`/plan "需求"`**: **[轻量级]** 启动规划，生成详细步骤 (基于 everything-claude-code)。
*   **`/feature-dev "需求"`**: **[重量级]** 启动 7 阶段全流程开发 (基于 Anthropic 官方插件)，包含深度代码探索与多方案架构设计。
*   **`/tdd "功能"`**: 进入测试驱动开发模式（先写测试，再实现）。

#### 质量保障
*   **`/code-review`**: 快速代码审查 (ECC 内置，适合日常检查)。
*   **`/review-pr`**: 深度 PR 审查 (PR Review Toolkit，6 维度专家，适合合并前的正式审查)。
*   **`/e2e`**: 生成并运行 Playwright 端到端测试。
*   **`/fix`**: 自动修复当前的报错或构建失败。

#### 提交与协作
*   **`/commit`**: 智能分析变更，自动生成规范的 Commit Message 并提交。
*   **`/commit-push-pr`**: 一键完成 Commit → Push → 创建 PR。
*   **`/clean_gone`**: 清理已从远端删除的本地分支。

#### 学习与维护
*   **`/learn`**: 提取当前会话的经验教训并持久化保存。
*   **`/update-codemaps`**: 更新代码地图文档。
*   **`/verify`**: 验证实现是否符合预期。

---

## 3. 全局技能矩阵 (Skill Matrix)

以下技能均已全局安装至 `~/.agents/skills/`，Claude 可随时调用。（来源标签说明请见第一章）

### 🔥 官方增强 (Official Power-Ups)
| 技能名称 | 来源 (Source) | 作用与能力 |
| :--- | :--- | :--- |
| **Feature Dev** | `Anthropic` | 7 阶段全流程功能开发智能体 (Discovery → Exploration → Clarification → Architecture → Implementation → Review → Summary) |
| **PR Review Toolkit** | `Anthropic` | 包含 6 个维度的深度审查专家 (注释、测试覆盖率、错误处理、类型设计等) |
| **Commit Commands** | `Anthropic` | 智能生成符合项目风格的 Commit Message |

### 🎨 前端与交互 (Frontend & Design)
| 技能名称 | 来源 (Source) | 作用与能力 |
| :--- | :--- | :--- |
| **Frontend Design** | `Anthropic` | 生成高质量、符合现代审美的前端 UI 代码 |
| **Vercel React/Next.js** | `Vercel` | Vercel 官方工程规范：Server Actions, RSC, 性能优化 (Rank 1) |
| **Tailwind Design System** | `wshobson` | 构建可扩展的 Tailwind 原子化设计系统 |
| **3D Web Experience** | `Vibeship` | 打造 Three.js / React Three Fiber 3D 交互体验 |
| **Nuxt 4 Expert** | `onmax` | 掌握 Nuxt 4 服务端路由、中间件与配置最佳实践 |
| **Nuxt UI** | `onmax` | 熟练使用 Nuxt UI v4 组件库构建界面 |
| **Vue Debug Guides** | `vuejs-ai` | 解决 Vue 3 / Nuxt 复杂响应式丢失、Hydration Mismatch 问题 |
| **Expo/React Native UI** | `Expo` | 构建原生级移动端 UI (Expo Router, Animations, Native Tabs) |
| **Canvas Design** | `Anthropic` | 编程式绘图与设计哲学驱动的视觉创作 |
| **Web Design Guidelines** | `Vercel` | 审查 UI 是否符合 Web 界面设计规范 |

### 🧱 后端、架构与运维 (Backend, Architecture & DevOps)
| 技能名称 | 来源 (Source) | 作用与能力 |
| :--- | :--- | :--- |
| **FastAPI Expert** | `Jeffallan` | 异步 API 开发、Pydantic V2 验证、依赖注入模式 |
| **Supabase Best Practices**| `Supabase` | Postgres 数据库性能优化、RLS 安全策略设计 |
| **Backend Architect** | `Jeffallan` | 后端微服务拆分、高可用系统设计、DDD 落地 |
| **Architect Review (DDD)** | `Antigravity`| 真正的软件架构师专家，精通 Clean Architecture、微服务与 DDD 评审 |
| **Docker Expert** | `Antigravity`| 编写最佳实践 Dockerfile、多阶段构建、镜像瘦身 |
| **GitHub Actions Templates**| `Antigravity`| 生成生产级 CI/CD 工作流，自动化构建、测试与部署 |
| **Testing Patterns** | `Antigravity`| Jest 测试模式、TDD 工作流、Mock 策略专家 |
| **API Security** | `Jeffallan` | OWASP Top 10 防护、JWT 鉴权、速率限制实现 |

### 🤖 AI 工程与大模型 (AI Engineering)
| 技能名称 | 来源 (Source) | 作用与能力 |
| :--- | :--- | :--- |
| **AI Engineer** | `Jeffallan` | 构建 RAG 系统、Agent 编排、Prompt 优化、向量库设计 |
| **MCP Builder** | `Anthropic` | 指导构建自定义 Model Context Protocol (MCP) 服务器 |
| **Skill Creator** | `Anthropic` | 指导编写新的 Claude Skill |

### 🛠️ 办公与通用工具 (Utilities & Office)
| 技能名称 | 来源 (Source) | 作用与能力 |
| :--- | :--- | :--- |
| **Brainstorming** | `obra` | 头脑风暴模式，辅助 `/plan` 前的发散性思维与创意构思 |
| **PDF / Docx / PPTX / XLSX** | `Anthropic` | 读取、分析、生成 PDF/Word/PPT/Excel 文档 |
| **Mermaid Diagrams** | `softaworks` | 自动生成架构图、流程图、时序图、ER 图 |
| **Copywriting** | `coreyhaines`| 撰写营销文案、润色技术文档、优化 UX 文案 |
| **GitHub** | `Jeffallan` | (需配置 `gh` CLI) 管理 Issue、PR、查看 Actions 状态 |
| **Find Skills** | `Vercel` | 查找和发现更多适合当前任务的技能 (来源: vercel-labs/skills) |

### 🌐 审计、爬虫与网络 (Audit, Crawling & Web)
| 技能名称 | 来源 (Source) | 作用与能力 |
| :--- | :--- | :--- |
| **Crawl4AI (Skill)** | `brettdavies`| 基于 Crawl4AI SDK 开发爬虫工具时的参考指南 (Schema 生成、提取策略、会话管理) |
| **Crawl4AI (MCP)** | `MCP` | 批量爬取整站、Markdown 输出、结构化 JSON 提取、JS 渲染、自适应停止 (17 个工具) |
| **Agent Browser** | `Vercel` | 自动化网页浏览、截图、表单填充、数据提取、调试 (50+ CLI 命令) |
| **Browser Use (MCP)** | `MCP` | 全自动网页智能体，支持复杂交互与视觉识别 (本地模式免费) |
| **Audit Website** | `squirrelscan`| 全面网站审计 (SEO、性能、安全等 20 类 150+ 规则) |

---

## 4. 标准工作流 (SOP)

根据任务的复杂度，在以下三种模式中选择。

> **调用方式说明**: 带 `/` 前缀的是**斜杠命令**，在输入框直接输入即可执行；不带前缀的（如 Brainstorming、Testing Patterns）是**上下文技能**，通过自然语言描述需求时自动触发，也可用 "用 XXX 技能帮我..." 显式调用。

### 模式 A：直接编码 (Direct Coding)
**适用**: 单文件修改、拼写修正、样式微调、添加简单函数。

直接描述需求即可，无需启动任何工作流。完成后：

```
/code-review  → /commit
```

### 模式 B：轻量级迭代 (Plan → TDD → Review → Commit)
**适用**: Bug 修复、小功能开发、已有模块的维护。

1. **Plan**: `/plan "修改登录页样式"` — 生成实施步骤，确认后开始
2. **Code**: `/tdd "功能描述"` — 先写测试再实现 (红 → 绿 → 重构)
3. **Review**: `/code-review` — 快速质量检查
4. **Commit**: `/commit` — 自动生成规范 Commit Message
5. **Learn**: `/learn` — 提取经验教训 (可选)

> **构建失败?** 随时使用 `/fix` 自动诊断修复。

### 模式 C：深度功能开发 (Agentic Feature-Dev)
**适用**: 全新功能开发、复杂模块重构、涉及多个文件修改的大任务。

1. **Brainstorm** (可选): 用自然语言触发 Brainstorming 技能，如 "帮我头脑风暴一下 XXX 的方案"
2. **Start**: `/feature-dev "实现 OAuth 第三方登录"`
3. **7 阶段自动流程**:
   - **Phase 1 - Discovery**: AI 追问需求细节，明确边界。
   - **Phase 2 - Exploration**: 派遣 2-3 个 Agent 并行扫描代码库。
   - **Phase 3 - Clarifying Questions**: 基于代码分析结果，提出关键歧义问题 (需你确认)。
   - **Phase 4 - Architecture**: 提供 2-3 种技术方案供你选择 (需你确认)。
   - **Phase 5 - Implementation**: 确认后自动编写代码 (需你批准启动)。
   - **Phase 6 - Quality Review**: 3 个审查 Agent 并行检查 (简洁性、正确性、规范性)。
   - **Phase 7 - Summary**: 文档化成果与后续建议。
4. **Commit**: `/commit` 或 `/commit-push-pr` — 提交并推送

### 工作流选择速查

| 改动规模 | 推荐模式 | 关键指令 |
| :--- | :--- | :--- |
| 1-2 个文件，逻辑简单 | **A** 直接编码 | 直接写 → `/commit` |
| 3-5 个文件，已知方案 | **B** 轻量迭代 | `/plan` → `/tdd` → `/commit` |
| 5+ 个文件，需要设计 | **C** 深度开发 | `/feature-dev` → 自动流程 |

---

## 5. 技能选用指南 (Skill Usage Guide)

### 易混淆技能的使用场景

| 场景 | 应使用的指令/技能 | 说明 |
| :--- | :--- | :--- |
| 日常代码检查 (写完就查) | **`/code-review`** | ECC 内置轻量审查，适合模式 A/B 的快速检查 |
| 合并前正式审查 | **`/review-pr`** | PR Review Toolkit 6 维度深度审查，适合合并到主分支前 |
| 设计新系统架构 | **Backend Architect** | 从零开始的服务拆分、API 设计、技术选型 |
| 审查已有架构 | **Architect Review** | 评审现有代码的 SOLID/DDD 合规性 |
| 写测试 (日常开发) | **`/tdd`** | ECC 内置 TDD 导师，引导红-绿-重构流程 |
| 测试策略与 Mock 设计 | **Testing Patterns** | Jest 测试模式、复杂 Mock 策略的参考指南 |
| 发散性构思 (开发前) | **Brainstorming** | 在 `/plan` 或 `/feature-dev` 之前探索可能性 |
| 批量爬取整站内容 | **Crawl4AI (MCP)** | 自动发现链接、深度爬取、输出 Markdown/JSON |
| 开发爬虫工具 | **Crawl4AI (Skill)** | SDK 参考、Schema 模板、提取策略指南 |
| 网页自动化交互 | **Agent Browser** | 点击、填表、截图、调试 (50+ CLI 命令) |
| 智能网页浏览 | **Browser Use (MCP)** | 需要视觉理解的复杂网页任务 |
| 网站全面体检 (含 SEO) | **Audit Website** | 20 类审计规则，已覆盖 SEO 审计 |

### 按技术栈选择前端技能

| 技术栈 | 激活的技能 |
| :--- | :--- |
| **React + Next.js** | Vercel React/Next.js, Frontend Design, Tailwind Design System |
| **Vue + Nuxt** | Nuxt 4 Expert, Nuxt UI, Vue Debug Guides |
| **React Native** | Expo/React Native UI |
| **3D 交互** | 3D Web Experience |

> **注意**: React/Next.js 系列技能与 Vue/Nuxt 系列技能面向不同框架，不会同时触发。

---

## 6. 环境配置 (Configuration)

### 全局路径
*   **Skills**: `~/.agents/skills/` (所有技能源码都在这里，可手动修改 `SKILL.md` 定制)
*   **Rules**: `~/.claude/rules/` (ECC 的核心规则文件，定义 AI 角色与行为)
*   **Config**: `~/.claude/settings.json` (Claude Code 的主配置文件，含插件开关与环境变量)

### 推荐 MCP 配置
为了获得最强体验，建议在 `~/.claude/settings.json` 中添加以下 MCP：

#### 1. Context7 (文档增强)
让 AI 实时查阅最新技术文档。
```json
{
  "enabledPlugins": {
    "context7@claude-plugins-official": true
  },
  "env": {
    "CONTEXT7_API_KEY": "sk-xxxxxxxxx"
  }
}
```

#### 2. Browser Use (全自动浏览器)
让 AI 拥有一个真实的浏览器（需安装 `uv`）。
```json
{
  "mcpServers": {
    "browser-use": {
      "command": "uvx",
      "args": ["browser-use", "--mcp"]
    }
  }
}
```

#### 3. Crawl4AI (批量爬虫)
让 AI 拥有批量爬取整站的能力（基于 [walksoda/crawl-mcp](https://github.com/walksoda/crawl-mcp)，需安装 `uv`）。
```json
{
  "mcpServers": {
    "crawl4ai": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/walksoda/crawl-mcp", "crawl-mcp"]
    }
  }
}
```

### 常见问题
*   **权限错误**: 如果安装 Skill 报错 `EPERM`，请手动创建目录: `mkdir -p ~/.agents/skills`
*   **插件加载**: 在 Claude Code 中使用 `/plugin list` 查看已加载的插件和技能。

---

## 7. 一键安装指南 (Quick Start for New Machines)

如果您需要在另一台电脑上复刻这套环境，请按以下步骤操作。

### 第一步：基础环境准备

确保安装了 Node.js (v18+), Git, 和 Python (用于 Browser Use)。

```bash
# 1. 安装 uv (Python 包管理器，用于运行 browser-use)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. 安装 GitHub CLI (用于 GitHub 技能)
brew install gh

# 3. 创建全局技能目录 (解决权限问题)
mkdir -p ~/.agents/skills
mkdir -p ~/.claude/rules

# 4. 安装 squirrelscan CLI (用于 Audit Website 技能)
curl -fsSL https://squirrelscan.com/install | bash
```

### 第二步：安装 everything-claude-code (工作流引擎)

```bash
npx everything-claude-code@latest
```

### 第三步：安装 Antigravity 工程技能 (4 个)

来源: [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)
安装: architect-review, testing-patterns, github-actions-templates, docker-expert

```bash
mkdir -p /tmp/install_skills && cd /tmp/install_skills
git init
git remote add origin https://github.com/sickn33/antigravity-awesome-skills.git
git config core.sparseCheckout true
echo "skills/architect-review/" >> .git/info/sparse-checkout
echo "skills/testing-patterns/" >> .git/info/sparse-checkout
echo "skills/github-actions-templates/" >> .git/info/sparse-checkout
echo "skills/docker-expert/" >> .git/info/sparse-checkout
git fetch --depth 1 origin main
git checkout main
cp -r skills/* ~/.agents/skills/
cd ~ && rm -rf /tmp/install_skills
```

### 第四步：安装 Anthropic 官方技能 (11 个)

来源: [anthropics/skills](https://github.com/anthropics/skills)
安装: canvas-design, docx, frontend-design, mcp-builder, pdf, pptx, xlsx, skill-creator, feature-dev, pr-review-toolkit, commit-commands

```bash
# 文档处理套件
npx skills add anthropics/skills --skill docx -g -y
npx skills add anthropics/skills --skill pdf -g -y
npx skills add anthropics/skills --skill pptx -g -y
npx skills add anthropics/skills --skill xlsx -g -y

# 设计与创作
npx skills add anthropics/skills --skill canvas-design -g -y
npx skills add anthropics/skills --skill frontend-design -g -y

# 开发工具
npx skills add anthropics/skills --skill mcp-builder -g -y
npx skills add anthropics/skills --skill skill-creator -g -y

# 工作流插件 (feature-dev, pr-review-toolkit, commit-commands)
# 这三个插件使用 commands/ 和 agents/ 结构，可能需要通过
# Claude Code 插件市场安装: /plugin marketplace add anthropics/skills
# 如果市场方式失败，尝试:
npx skills add anthropics/skills --skill feature-dev -g -y
npx skills add anthropics/skills --skill pr-review-toolkit -g -y
npx skills add anthropics/skills --skill commit-commands -g -y
```

### 第五步：安装厂商最佳实践 (5 个)

```bash
# Vercel: React/Next.js 性能优化 + Web 设计规范
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -g -y
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -g -y

# Supabase: Postgres 优化
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices -g -y

# Expo: React Native
npx skills add expo/skills --skill building-native-ui -g -y

# Vercel: 浏览器自动化
npx skills add vercel-labs/agent-browser -g -y
```

### 第六步：安装 Vue/Nuxt 生态技能 (3 个)

```bash
# Nuxt 4 + Nuxt UI (来源: onmax/nuxt-skills)
npx skills add onmax/nuxt-skills --skill nuxt -g -y
npx skills add onmax/nuxt-skills --skill nuxt-ui -g -y

# Vue 3 调试指南 (来源: vuejs-ai/skills)
npx skills add vuejs-ai/skills --skill vue-debug-guides -g -y
```

### 第七步：安装全栈开发技能 (5 个)

来源: [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) (65 技能合集)

```bash
npx skills add Jeffallan/claude-skills --skill fastapi-expert -g -y
npx skills add Jeffallan/claude-skills --skill ai-engineer -g -y
npx skills add Jeffallan/claude-skills --skill api-security-best-practices -g -y
npx skills add Jeffallan/claude-skills --skill backend-architect -g -y
npx skills add Jeffallan/claude-skills --skill github -g -y
```

### 第八步：安装社区精选技能 (8 个)

```bash
# 头脑风暴 (来源: obra/superpowers)
npx skills add obra/superpowers --skill brainstorming -g -y

# Tailwind 设计系统 (来源: wshobson/agents)
npx skills add wshobson/agents --skill tailwind-design-system -g -y

# 3D Web 体验 (来源: vibeforge1111/vibeship-spawner-skills)
npx skills add vibeforge1111/vibeship-spawner-skills --skill 3d-web-experience -g -y

# 网站审计 (来源: squirrelscan/skills, 需先安装 squirrel CLI)
npx skills add squirrelscan/skills -g -y

# 文案写作 (来源: coreyhaines31/marketingskills)
npx skills add coreyhaines31/marketingskills --skill copywriting -g -y

# Mermaid 绘图 (来源: softaworks/agent-toolkit)
npx skills add softaworks/agent-toolkit --skill mermaid-diagrams -g -y

# 技能发现 (来源: vercel-labs/skills)
npx skills add vercel-labs/skills --skill find-skills -g -y

# Crawl4AI 爬虫 SDK 参考 (来源: brettdavies/crawl4ai-skill)
npx skills add brettdavies/crawl4ai-skill -g -y
```

### 第九步：配置 MCP 与插件

复制以下内容到 `~/.claude/settings.json`：

```json
{
  "mcpServers": {
    "browser-use": {
      "command": "uvx",
      "args": ["browser-use", "--mcp"]
    },
    "crawl4ai": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/walksoda/crawl-mcp", "crawl-mcp"]
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true,
    "context7@claude-plugins-official": true
  }
}
```

### 安装验证

```bash
# 检查已安装技能数量 (应为 36 个)
ls ~/.agents/skills/ | wc -l

# 列出所有技能名称
ls ~/.agents/skills/
```

---

> **祝您编码愉快！**
> This guide is maintained by your AI Pair Programmer.
