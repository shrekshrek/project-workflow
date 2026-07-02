# Framework rules starter examples

> 复制对应 `.example.md` 文件到上层 `.claude/rules/`(去掉 `.example` 后缀),按你项目实际改 `globs:` 和规则正文。

## 现有 starter

- [`fastapi.example.md`](fastapi.example.md) — FastAPI + SQLAlchemy 2.0 + Pydantic v2(🐍 Python backend)
- [`gin.example.md`](gin.example.md) — Gin + sqlx(🐹 Go backend)
- [`react.example.md`](react.example.md) — React 18+ + Vite + React Router(⚛️ TypeScript frontend)
- [`vue.example.md`](vue.example.md) — Vue 3 + Vite + Pinia(💚 TypeScript frontend)

## 缺失 starter(欢迎 PR)

按用户群 / 主流度倒序,首批待补:

- `django.example.md` — Django REST Framework(🐍 Python backend,Django ORM + DRF serializers)
- `nextjs.example.md` — Next.js 14+ App Router(⚛️ TypeScript fullstack,RSC / Server Actions)
- `springboot.example.md` — Spring Boot 3+(☕ Java/Kotlin backend,JPA / 3 layer)
- `express.example.md` — Express + Prisma / TypeORM(📦 Node backend)
- `flask.example.md` — Flask + SQLAlchemy(🐍 Python sync backend)
- `nuxt.example.md` — Nuxt 4(💚 Vue meta-framework,SSR)
- `axum.example.md` 或 `actix.example.md` — Rust backend
- `svelte.example.md` 或 `sveltekit.example.md` — Svelte 5+(🔥 frontend)

走 PR 流程:fork plugin 仓库,加 `<framework>.example.md` 文件 + 在本表挪到"现有 starter" 列。


## 怎么用

1. **复制**:`cp _examples/fastapi.example.md ../fastapi.md`(去 `.example` 后缀)
2. **改 globs**:按你 tier 命名调整(如默认 `backend/**/*.py`;若你 tier 叫 `server/` 改成 `server/**/*.py`)
3. **改 description**:starter 自带的 description 字段适配你项目 tier 名 / 栈版本(< 80 字符,Claude Code `/rules` 列表展示用)
4. **改正文**:这是 starter,**不是完整 best practices**。按项目实际筛选 / 增删,并在 `docs/adr/` 写 ADR 留来源(如"采纳 zhanymkanov/fastapi-best-practices 的 N 条")

## 写新 starter 的格式约定

- frontmatter 必须含 `description:`(一句话 < 80 字符)+ `globs:`(comma-separated 字符串,**不要**用 `paths:` YAML 列表,见 [`workflow.md §1.6`](../../../../docs/workflow.md#16-路径级规则claudrules官方支持))
- `description:` 写**这条规则管什么**(范围 + 关键栈名),不写"是什么 / 怎么用"——后者写在正文 `<!-- 来源 -->` 注释里
- 规则按"违反频率"排序:最常违反的写最前
- 单文件 200-300 行内,超过拆多个文件
- 顶部留一行注释指向 ADR 或社区 source(可追溯)
