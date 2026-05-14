# Framework rules starter examples

> 复制对应 `.example.md` 文件到上层 `.claude/rules/`(去掉 `.example` 后缀),按你项目实际改 `globs:` 和规则正文。

## 现有 starter

- [`fastapi.example.md`](fastapi.example.md) — FastAPI + SQLAlchemy 2.0 + Pydantic v2 项目级约定 starter

## 怎么用

1. **复制**:`cp _examples/fastapi.example.md ../fastapi.md`(去 `.example` 后缀)
2. **改 globs**:按你 tier 命名调整(如默认 `backend/**/*.py`;若你 tier 叫 `server/` 改成 `server/**/*.py`)
3. **改正文**:这是 starter,**不是完整 best practices**。按项目实际筛选 / 增删,并在 `docs/adr/` 写 ADR 留来源(如"采纳 zhanymkanov/fastapi-best-practices 的 N 条")

## 写新 starter 的格式约定

- frontmatter 用 `globs:` comma-separated 字符串(**不要**用 `paths:` YAML 列表,见 [`workflow.md §1.6`](../../../../docs/workflow.md#16-路径级规则claudrules官方支持))
- 规则按"违反频率"排序:最常违反的写最前
- 单文件 200-300 行内,超过拆多个文件
- 顶部留一行注释指向 ADR 或社区 source(可追溯)
