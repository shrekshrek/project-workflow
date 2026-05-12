---
name: l1-review
description: Run the project's L1 review — mechanical/automated checks (lint, typecheck, tests). Reads the project's `check` command from AGENTS.md (or package.json scripts) and reports pass/fail with a concise summary, not the full stdout dump.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and tool output stay as-is.

# L1 Review

L1 in the project-workflow methodology = the **mechanical layer**: lint, type checks, unit tests. Stuff that machines can verify with zero ambiguity. This skill runs the project's defined "everything check" command and gives a focused report.

User input: `$ARGUMENTS` (optional — usually empty; could be a sub-scope like "backend only")

## Step 1 — Find the project's check command

Look for the command in this priority:

1. **`AGENTS.md` § Commands section** — look for a line/row containing `check`, `提交前`, `pre-commit`, or similar
2. **`package.json` scripts** — look for `"check"`, `"test"`, or `"verify"` (in that order)
3. **`Makefile`** — look for `check:` / `test:` target
4. **Convention by stack**:
   - Python: `pytest` (+ `ruff check` + `mypy` if present)
   - Go: `go vet ./... && go test ./...`
   - Rust: `cargo check && cargo test`

If you can't find it, ask the user: "How do you run L1 in this project? (e.g., `pnpm check`)"

If `$ARGUMENTS` mentions a sub-scope (`backend`, `frontend`), narrow accordingly (e.g., `pnpm be:lint && pnpm be:test`).

## Step 2 — Run it

Use the Bash tool. **Pipe stdout/stderr together** so failures are visible:

```bash
<the-check-command> 2>&1
```

Don't add `--verbose`, don't add flags the project didn't ask for. Use exactly what AGENTS.md says.

## Step 3 — Parse and report

Don't dump the entire stdout. Extract:

- **lint**: errors count (per linter if multiple)
- **typecheck**: errors count
- **tests**: passed/failed/skipped counts + duration
- **coverage**: percentage (if shown)
- **exit code**: 0 = green; non-0 = something failed

Format the report as a tight table or bullet list. Example:

```
✅ L1 Review — pnpm check (12.3s)
  ruff check ........... 0 errors
  pytest ............... 18/18 passed, coverage 87%
  vue-tsc --noEmit ..... 0 errors
  eslint ............... 0 errors
```

Or for failure:

```
❌ L1 Review — pnpm check (8.1s)
  ruff check ........... 2 errors
    - src/auth/service.py:42: E501 line too long (108 > 100)
    - src/todos/router.py:15: F401 'fastapi.status' imported but unused
  pytest ............... 17/18 passed (1 failed)
    - tests/auth/test_router.py::test_login_wrong_password FAILED
  vue-tsc / eslint ..... skipped (pytest failed first)
```

Include **just enough detail** for the user to act (file:line + 1-line cause). Full stack traces only if the failure is opaque without them.

## Step 4 — Next-step hint

If green:
> ✅ L1 green. Proceed to `/project-workflow:l2-review` (AGENTS.md compliance).

If red:
> ❌ L1 has N issues. Fix them before L2/L3. Failed items listed above; full output saved to `/tmp/l1-<timestamp>.log` if needed.

## Notes

- **Don't auto-fix**. L1 reports; user (or another skill) fixes.
- **Don't run sub-scopes the user didn't ask for**. If they said "backend", don't run frontend checks.
- **Stack-agnostic**: skill works on any project that has a defined check command in AGENTS.md.
- If the check command needs the container/server running (e.g., `docker compose exec backend pytest`), and it's not running, fail fast with: "Container `backend` not running. Start with `pnpm dev` first, then retry."
