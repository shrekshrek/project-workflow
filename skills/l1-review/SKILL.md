---
name: l1-review
model: sonnet
description: Run the project's L1 review — mechanical/automated checks (lint, typecheck, tests). Reads the project's `check` command from AGENTS.md (or package.json scripts) and reports pass/fail with a concise summary, not the full stdout dump.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and tool output stay as-is.

# L1 Review

L1 = mechanical layer: lint / typecheck / unit tests。Runs the project's check command + 给 focused report。

**Use when**: P2 endpoint, or ad-hoc mechanical check during implementation. Typically invoked by `/feature-done` (Step 3) but standalone-runnable.
**Not for**: convention compliance (use `/l2-review`) / spec compliance (use `/l3-review`) / proof bundle assembly (use `/proof-bundle`).

User input: `$ARGUMENTS` (optional — usually empty; could be a sub-scope like "backend only")

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角).

## Step 1 — 找项目的 check 命令

按以下优先级找命令:

1. **`AGENTS.md` § Commands 节** —— 找含 `check` / `提交前` / `pre-commit` 等关键词的行
2. **`package.json` scripts** —— 按顺序找 `"check"` / `"test"` / `"verify"`
3. **`Makefile`** —— 找 `check:` / `test:` target
4. **按栈惯例**:
   - Python:`pytest`(+ `ruff check` + `mypy` 若有)
   - Go:`go vet ./... && go test ./...`
   - Rust:`cargo check && cargo test`

找不到 → 问用户:"How do you run L1 in this project?(e.g., `pnpm check`)"

若 `$ARGUMENTS` 指定了 sub-scope(`backend` / `frontend`),按此 narrow(如 `pnpm be:lint && pnpm be:test`)。

## Step 2 — 跑命令

用 Bash 工具。**stdout / stderr 合并输出**,确保失败可见:

```bash
<the-check-command> 2>&1
```

**别加** `--verbose` 或项目没要求的 flag。用 AGENTS.md 写的命令原文。

## Step 3 — 解析 + 报告

不要全文 dump stdout。提取:

- **lint**:错误数(多 linter 时每个分别报)
- **typecheck**:错误数
- **tests**:passed / failed / skipped 数 + 时长
- **coverage**:百分比(若有)
- **exit code**:0 = 绿,非 0 = 有失败

把报告排成紧凑表格或 bullet 列表。例:

```
✅ L1 Review — pnpm check (12.3s)
  ruff check ........... 0 errors
  pytest ............... 18/18 passed, coverage 87%
  vue-tsc --noEmit ..... 0 errors
  eslint ............... 0 errors
```

失败示例:

```
❌ L1 Review — pnpm check (8.1s)
  ruff check ........... 2 errors
    - src/auth/service.py:42: E501 line too long (108 > 100)
    - src/todos/router.py:15: F401 'fastapi.status' imported but unused
  pytest ............... 17/18 passed (1 failed)
    - tests/auth/test_router.py::test_login_wrong_password FAILED
  vue-tsc / eslint ..... skipped (pytest failed first)
```

**信息密度刚够用户行动即可**(file:line + 1 行原因)。完整 stack trace 仅在"不给就看不懂"时附上。

## Step 4 — 下一步提示

绿:
> ✅ L1 green. Proceed to `/project-workflow:l2-review` (A 类约定合规)。

红:
> ❌ L1 has N issues. Fix them before L2/L3. 失败项列在上方;完整输出可存到 `/tmp/l1-<timestamp>.log`。

## Notes

- **不自动 fix**。L1 只报,用户(或别的 skill)修
- **不跑用户没要求的 sub-scope**。用户说 "backend",别顺手跑 frontend
- **Stack-agnostic**:任何在 AGENTS.md 里定义了 check 命令的项目都适用
- 若 check 命令需要 container / server 跑(如 `docker compose exec backend pytest`)而当前没起,fail fast:"Container `backend` not running. Start with `pnpm dev` first, then retry."
- **跟 hooks 的关系**:hook(`lint-on-edit.js`)做保存时单文件 lint+format 且**自动改文件**(`eslint --fix` / `ruff format` / `gofmt -w`);本 skill 做端点全项目 lint+typecheck+test 且**只读报告(不改)**。同属 L1 机械层、两个交付节奏。**检测覆盖**上本 skill 是 hook 超集(hook 查的 lint 它都查 + 加 type/test/全项目);**但 hook 另含 auto-fix(本 skill 不做)**。共享同一份 linter config,所以保存时过的 lint 端点不矛盾报红(workflow.md §4.2 时间尺度层叠 / §6.4)。
