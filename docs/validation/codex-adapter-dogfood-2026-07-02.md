# Codex adapter dogfood — 2026-07-02

## Scope

Validated the repo-scoped Codex skills in `.agents/skills/` against an isolated project at:

`/private/tmp/project-workflow-codex-dogfood-20260702`

Goal: verify the action-complete lean Codex adapter is executable as real workflow guidance, not only as documentation.

Boundary: this was a manual dogfood of the skill instructions in isolated projects. It did not prove fresh-session `$skill` invocation behavior inside Codex.

## Scenario

Created a small dependency-free Node ESM project:

- Source: `src/greeting.js`
- Tests: `tests/greeting.test.js`
- Check command: `npm run check`
- Feature: `001-excited-greeting`

## Skill Coverage

| Skill | Validation | Result |
|---|---|---|
| `$project-init` | Copied starter template, filled `AGENTS.md`, path rules, commands, tests, and gotchas reference | PASS with one finding |
| `$project-personalize` | Smoke-tested in the first project; separately validated against scaffold defaults in a second temp project | PASS |
| `$feature-init` | Created `docs/specs/001-excited-greeting/{spec,plan,tasks}.md` from templates and filled the full-lane spec | PASS |
| `$spec-quality-check` | Ran the seven-question gate manually against the generated spec | PASS / Ready |
| `$spec-revise` | Added ADR-0001 and synchronized spec revision record, plan prior decision, and task updates | PASS |
| `$feature-done` | Ran L1, reviewed L2/L3, and wrote proof bundle into `tasks.md` | PASS / READY |
| `$agents-md-revise` | Detected objective drift: testing rule referenced missing `npm run test:coverage`; updated rule to N/A | PASS |

## Evidence

L1 command:

```bash
npm run check
```

Result:

- `node --check src/greeting.js`
- `node --check tests/greeting.test.js`
- `node --test tests/*.test.js`
- 5 tests passed, 0 failed

Manual verification:

```bash
node src/greeting.js Codex --excited
```

Output:

```text
Hello, Codex!!
```

## Findings

### F1 — Template copy needs explicit example exclusion

Directly copying `template/.` brought example-only assets into the target project:

- `_multi_tier_examples/`
- `.claude/rules/_examples/`

Claude `project-init` had explicit cleanup logic; the Codex `$project-init` skill only said "exclude example-only folders", which was correct but not mechanical enough.

Resolution: updated `.agents/skills/project-init/SKILL.md` to name both directories explicitly and to remind Codex to copy `docs/gotchas.md` if the template output does not contain it.

### F2 — Placeholder scan must ignore intentional templates

A broad `rg '{{'` scan reports expected TODO markers in `docs/specs/_template/`. This is not a project-init failure.

Resolution: updated `$project-init` verification wording to exclude intentional templates and example-only assets.

### F3 — `$project-personalize` should include path-rule placeholder cleanup

The first dogfood run only smoke-tested project-personalize because the target was freshly initialized and had no scaffold defaults to replace.

Follow-up validation constructed a scaffold-shaped project at:

`/private/tmp/project-workflow-codex-personalize-20260702`

It verified:

- `sample-app` / `sample_app_db` / `sample_app_postgres` defaults were replaced by confirmed `customer-tools` values.
- backend/frontend CLAUDE-only tier files were converted to tier `AGENTS.md` + one-line `CLAUDE.md` alias.
- app code and tests still passed after replacing confirmed project identity values.
- leftover `.claude/rules/*` placeholders needed explicit cleanup as part of personalize.

Resolution: updated `.agents/skills/project-personalize/SKILL.md` to include path-rule placeholder cleanup using actual manifests and explicit `N/A` / deferred wording when values are absent.

## Adapter Assessment

The 7-skill Codex adapter is structurally sound as a repo-scoped instruction adapter:

- Public workflow actions are complete for P0 / P2 / P4.
- Internal helper layers are not redundantly exposed.
- Methodology core now has a canonical action layer in `docs/actions/`; adapter skills reference it and add execution guidance.
- Proof bundle and P4 drift refresh both worked in a real file tree.
- `$project-personalize` has follow-up coverage against scaffold defaults.

At this stage the adapter was not packaged as a `.codex-plugin` yet. Later sections record the follow-up runtime smoke and plugin packaging validation.

---

## Cross-adapter structure validation — 2026-07-02

### Scope

Validated the current project-workflow repo after extracting canonical reviewer specs and adding Codex custom agents.

Covered:

- Claude skills in `skills/`
- Codex repo skills in `.agents/skills/`
- Claude sub-agent adapters in `agents/`
- Codex custom agents in `.codex/agents/`
- Claude hook template in `template/.claude/hooks/lint-on-edit.js`
- Codex hook mapping in `template/.codex/hooks.json`
- Four document classes: conventions, specs, ADR, runtime enforcement
- Full-lane and light-lane feature scaffold behavior in an isolated temp project

### Checks Run

Static validation:

- Parsed all Claude/Codex `SKILL.md` YAML frontmatter.
- Parsed all Claude agent YAML frontmatter.
- Parsed all Codex `.codex/agents/*.toml`.
- Parsed all Codex `agents/openai.yaml` files and verified `interface.display_name`, `interface.short_description`, and `interface.default_prompt`.
- Verified every Codex public skill references its canonical `docs/actions/<action>.md`.
- Verified every Claude and Codex agent adapter references its canonical `docs/reviewers/<role>.md`.
- Ran `git diff --check`.

Hook validation:

- Parsed `template/.claude/settings.json`.
- Ran `node --check template/.claude/hooks/lint-on-edit.js`.
- Ran the hook with empty input.
- Ran the hook with a non-git target file.
- Parsed `template/.codex/hooks.json`.
- Ran the Codex hook wrapper with a simulated `apply_patch` payload.

Workflow scaffold validation:

- Copied `template/` into `/private/tmp/project-workflow-quickstart-verify`.
- Verified required baseline files exist: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/lint-on-edit.js`, `.claude/rules/*.md`, `docs/adr/`, and `docs/specs/_template/`.
- Simulated full-lane feature creation at `docs/specs/001-demo-feature/{spec,plan,tasks}.md`.
- Simulated light-lane feature creation at `docs/specs/002-light-polish/tasks.md`.
- Verified full-lane has three files and light-lane has no `spec.md` / `plan.md`.
- Verified `<NNN>`, `<slug>`, and `<TODAY>` substitutions leave no stale markers.
- Ran a minimal spec-quality gate simulation and confirmed the untouched template is correctly `BLOCKED` because TODO placeholders remain.

### Result

PASS with one fixed finding.

The structure now has one method source per concern:

- `docs/actions/`: workflow action source of truth
- `docs/reviewers/`: reviewer / auditor / researcher source of truth
- `skills/` + `agents/`: Claude runtime adapters
- `.agents/skills/` + `.codex/agents/`: Codex runtime adapters
- template `AGENTS.md` / `docs/specs/` / `docs/adr/` / `.claude/` / `.codex/`: four project-document classes materialized for a target project

### Fixed Finding

#### F4 — Hook leaked git stderr outside git repos

The hook comment said non-git directories should be skipped, but `git branch --show-current` printed:

```text
fatal: not a git repository (or any of the parent directories): .git
```

even though the hook exited successfully.

Resolution: changed the branch probe to use `stdio: ['ignore', 'pipe', 'ignore']`, so non-git checks are silent and match the documented behavior.

### Residual Limits

- This validation did not prove actual fresh-session `$skill` invocation inside Codex UI.
- This validation did not execute Codex custom agents as separate runtime subagents; it verified their TOML structure and canonical reviewer references.
- Codex hook behavior was smoke-tested by direct Node invocation with a simulated payload, not inside a live Codex hook lifecycle.

---

## Runtime subagent smoke — 2026-07-02

### Scope

Validated project-workflow Codex runtime behavior in a fresh isolated project at:

`/private/tmp/project-workflow-fresh-codex-runtime-verify-20260702`

The temp project included:

- `template/` output
- `.agents/skills/`
- `.codex/agents/`
- `docs/actions/`
- `docs/reviewers/`
- `docs/spec-driven.md`, `docs/workflow.md`, and `docs/cross-tool-methodology.md`

### Codex CLI Status

Attempted local Codex CLI checks:

```bash
codex --help
codex exec --help
codex --version
```

All failed because the installed Node wrapper pointed at a missing native binary:

```text
@openai/codex-darwin-arm64/.../vendor/aarch64-apple-darwin/codex/codex ENOENT
```

Result: true `codex exec` fresh-session testing was blocked by local CLI installation state, not by project-workflow files.

### Subagent Runtime Checks

Used the current Codex app subagent runtime to test project-local skill behavior.

#### `$feature-init`

First worker ran the project-local `.agents/skills/feature-init/SKILL.md` and created:

- `docs/specs/001-runtime-smoke/spec.md`
- `docs/specs/001-runtime-smoke/plan.md`
- `docs/specs/001-runtime-smoke/tasks.md`

It correctly replaced `<NNN>`, `<slug>`, and `<TODAY>`, preserved `{{TODO ...}}`, and did not implement application code.

Finding: the Codex repo skill said the template source was `template/docs/specs/_template/`, but a target project initialized from the template has local templates at `docs/specs/_template/`.

Resolution: updated `.agents/skills/feature-init/SKILL.md` to prefer target-project `docs/specs/_template/`, falling back to `template/docs/specs/_template/` only when running from the project-workflow repository.

Second worker reran `$feature-init` after the fix and created:

- `docs/specs/002-runtime-smoke-two/spec.md`
- `docs/specs/002-runtime-smoke-two/plan.md`
- `docs/specs/002-runtime-smoke-two/tasks.md`

Result: PASS. The worker used local `docs/specs/_template/` and reported no scaffold-flow friction.

#### `$spec-quality-check`

Explorer ran the project-local `.agents/skills/spec-quality-check/SKILL.md` read-only against `002-runtime-smoke-two`, using `docs/actions/spec-quality-check.md` and `docs/reviewers/spec-quality-reviewer.md`.

Result: PASS. The gate returned `BLOCKED` because the untouched scaffold still contained TODO placeholders in outcomes, scope, constraints, verification, plan, sibling alignment, and tasks.

Finding: canonical `docs/actions/spec-quality-check.md` used `NEEDS WORK` for failed checks while the Codex skill used `BLOCKED`.

Resolution: updated the canonical action verdict to `BLOCKED` for `Failed > 0`, because this is a pre-implementation gate and failed checks block implementation.

#### `$feature-done`

Explorer ran the project-local `.agents/skills/feature-done/SKILL.md` read-only against `002-runtime-smoke-two`, using `docs/actions/feature-done.md`, `docs/reviewers/agents-md-reviewer.md`, and `docs/reviewers/spec-reviewer.md`.

Result: PASS. It returned `NEEDS WORK`, not `READY`, because the temp project had no runnable check command, no implementation, TODO spec artifacts, and a placeholder-only proof bundle.

### Hook Runtime Checks

Ran the Codex hook wrapper directly from the temp project with a simulated `apply_patch` payload:

```bash
node .codex/hooks/lint-on-edit.js
```

Also tested the hook command shape from a subdirectory after `git init`, using:

```bash
node "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.codex/hooks/lint-on-edit.js"
```

Result: PASS. The hook resolved the project root and exited cleanly.

### Custom Agent Runtime Limit

Attempted to spawn the project custom agent type directly:

```text
agent_type = "spec-quality-reviewer"
```

The current exposed subagent tool rejected it:

```text
unknown agent_type 'spec-quality-reviewer'
```

Result: the project-local `.codex/agents/*.toml` files are schema-valid and match official Codex custom-agent documentation, but this session's exposed subagent API only supports built-in roles (`default`, `explorer`, `worker`). Direct custom-agent name dispatch is therefore not a required execution path for project-workflow's Codex adapter.

Follow-up test in the project-workflow repo also returned:

```text
unknown agent_type 'spec-quality-reviewer'
```

Resolution: updated Codex skill wording to prefer a separate subagent running the relevant `docs/reviewers/` spec, using `.codex/agents` custom names only when the current Codex surface exposes them. Built-in subagents and main-session review are the portable fallback.

### Updated Assessment

- Codex repo skills work as project-local runtime instructions when invoked by a fresh subagent.
- `feature-init`, `spec-quality-check`, and `feature-done` produced the expected guardrail behavior.
- Codex hook materialization is present and smoke-tested.
- The remaining gap is not methodology structure; it is optional product-surface support for custom agent name dispatch and a healthy local Codex CLI install. The adapter's correctness now depends on `docs/reviewers/`, not on custom-agent name dispatch.

---

## Codex plugin packaging validation — 2026-07-02

### Scope

Packaged the Codex adapter as an installable local plugin at:

`plugins/project-workflow/`

and exposed it through the repo-local marketplace:

`.agents/plugins/marketplace.json`

The package includes:

- `.codex-plugin/plugin.json`
- `skills/` with the 7 public workflow actions
- bundled `docs/actions/`
- bundled `docs/reviewers/`
- bundled `docs/workflow.md`, `docs/spec-driven.md`, `docs/cross-tool-methodology.md`, `docs/gotchas.md`, `docs/tooling.md`, and `docs/quickstart.md`
- bundled `template/`

### Checks Run

- Ran the Codex plugin validator.
- Ran `quick_validate.py` for each plugin-bundled skill.
- Parsed:
  - `plugins/project-workflow/.codex-plugin/plugin.json`
  - `.agents/plugins/marketplace.json`
  - `plugins/project-workflow/template/.codex/hooks.json`
  - `plugins/project-workflow/template/.claude/settings.json`
- Ran `node --check` on bundled Claude and Codex hook scripts.
- Compared packaged `docs/actions/`, `docs/reviewers/`, and `template/` against the source directories with `diff -qr`.
- Ran `git diff --check`.

### Result

PASS.

The Codex plugin package is structurally valid and installable as a local marketplace plugin. The package duplicates `docs/` and `template/` as a release artifact, but methodology ownership remains in the source-level `docs/actions/` and `docs/reviewers/`.

### Residual Limits

- The local Codex CLI binary is still broken in this machine's current install state, so plugin install was not validated through `codex plugin add`.
- Codex App installation should be tested by opening the local marketplace in the app, installing **Project Workflow**, and starting a new thread in a target repository.
- Plugin-bundled skills are validated statically; the previous runtime smoke covered the same skill logic through repo-local `.agents/skills`.

---

## Structure convergence — 2026-07-02

### Change

After Codex plugin packaging passed validation, the repo-local Codex development surfaces were removed from the main source structure:

- removed `.agents/skills/`
- removed `.codex/agents/`

The remaining Codex source structure is:

- `.agents/plugins/marketplace.json` for the local marketplace
- `plugins/project-workflow/` for the installable Codex plugin
- `plugins/project-workflow/skills/` for the 7 Codex workflow skills

### Rationale

The repo-local skills and optional custom-agent files were useful while discovering Codex behavior, but keeping them after plugin packaging created three costs:

- duplicate workflow entry points in the same repo
- unclear user guidance about whether to use repo skills or install the plugin
- extra adapter files that looked like a second source of truth

Codex custom-agent name dispatch was also not a proven portability requirement. The current plugin skills run reviewer specs through any available Codex subagent, with main-session execution as the fallback.

### Added Guardrail

Added:

`scripts/sync-codex-plugin.js`

Use it to sync source-level docs/template into the Codex plugin package, and use `--check` in validation to detect release-artifact drift.

### Result

The source structure is now:

- methodology source: `docs/actions/`, `docs/reviewers/`, `docs/workflow.md`, `docs/spec-driven.md`
- project materialization source: `template/`
- Claude adapter: `.claude-plugin/`, `skills/`, `agents/`
- Codex adapter: `.agents/plugins/`, `plugins/project-workflow/`

This keeps Claude and Codex install packages separate while preserving one methodology source.

---

## Structure cleanup — 2026-07-02

### Fixed

- Added `template/docs/gotchas.md` as a synced template materialization file so manual `template/` copies do not produce a broken `AGENTS.md` / testing-rule link.
- Kept `template/docs/spec-driven.md` out of the template. The light-lane task template links to the source GitHub doc instead, avoiding a large copied doc with source-only links.
- Updated `scripts/sync-codex-plugin.js` to:
  - sync `docs/gotchas.md` into `template/docs/gotchas.md`
  - remove stale `template/docs/spec-driven.md`
  - post-process Codex plugin copied docs so source-only links to `../agents/`, Claude-only helper skills, and `../README.md` do not break inside the installable package
  - validate these release artifacts in `--check` mode
- Updated `.github/workflows/version-sync-check.yml` to check both Claude and Codex plugin manifest versions, and to run `node scripts/sync-codex-plugin.js --check`.
- Removed local-only files:
  - `.DS_Store`
  - root `.claude/settings.json`

### Checks Run

- Markdown local link check across all `.md` files, excluding external URLs.
- `node scripts/sync-codex-plugin.js --check`.
- Codex plugin validator.
- `quick_validate.py` for all 7 Codex plugin skills.
- JSON parse for Claude/Codex manifests, marketplace, and hook settings.
- `node --check` for hook scripts and sync script.
- `git diff --check`.

### Result

PASS.

The remaining duplicate-looking files under `plugins/project-workflow/docs/` and `plugins/project-workflow/template/` are intentional release artifacts for Codex installation, guarded by the sync script.
