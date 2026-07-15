# Framework rules starter examples

> 复制对应 `.example.md` 文件到上层 `.claude/rules/`(去掉 `.example` 后缀),按你项目实际改 `paths:` YAML 列表和规则正文。

## 现有 starter

- [`fastapi.example.md`](fastapi.example.md) — FastAPI + SQLAlchemy 2.0 + Pydantic v2(🐍 Python backend)
- [`gin.example.md`](gin.example.md) — Gin + sqlx(🐹 Go backend)
- [`react.example.md`](react.example.md) — React 18+ + Vite + React Router(⚛️ TypeScript frontend)
- [`vue.example.md`](vue.example.md) — Vue 3 + Vite + Pinia(💚 TypeScript frontend)

## 怎么用

1. **复制**:`cp _examples/fastapi.example.md ../fastapi.md`(去 `.example` 后缀)
2. **改 paths**:按你 tier 命名调整 YAML list item(如默认 `backend/**/*.py`;若你 tier 叫 `server/` 改成 `server/**/*.py`)
3. **改 description**:starter 自带的 description 字段适配你项目 tier 名 / 栈版本，保持简洁、具体
4. **改正文**:这是 starter,**不是完整 best practices**。按项目实际筛选 / 增删，在顶部注释记录来源；仅命中项目的 `ADR_REQUIRED` 条件时才写 ADR

## 写新 starter 的格式约定

- path-scoped rule frontmatter 使用 `paths:` YAML 列表；global rule 不写 `paths:`。`description:` 保持简洁、具体即可，见 [`workflow.md §1.6`](../../../../docs/workflow.md#16-路径级规则claude-rules官方支持)
- `description:` 写**这条规则管什么**(范围 + 关键栈名),不写"是什么 / 怎么用"——后者写在正文 `<!-- 来源 -->` 注释里
- 规则按"违反频率"排序:最常违反的写最前
- 保持单文件职责聚焦；过长时按规则职责拆分
- 顶部留一行注释指向 ADR 或社区 source(可追溯)
