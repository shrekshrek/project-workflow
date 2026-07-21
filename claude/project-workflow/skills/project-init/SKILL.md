---
name: project-init
description: Initialize the neutral six-file project-workflow baseline in an empty greenfield directory without guessing the future stack. Use project-personalize after any scaffold or code exists.
---

# Project Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-init.md` completely before acting; it is the canonical contract.

1. Resolve the optional target from `$ARGUMENTS` or use cwd. Inspect it read-only and redirect non-empty codebases to `/project-workflow:project-personalize`.
2. Require `${CLAUDE_PLUGIN_ROOT}/template` and `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs`; do not search another runtime's cache.
3. Create a disposable staging directory and run `node "${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs" --stage "$STAGING_DIR" --target "$TARGET_DIR"`.
4. Show the six target-mapped files, then apply once with `--apply-staged "$STAGING_DIR" "$TARGET_DIR"`; explicit invocation already authorizes this deterministic no-clobber baseline.
5. Validate the exact file set, no placeholders, the one-line alias, and deferred commands/paths. Recommend `/project-workflow:project-personalize` after the scaffold exists.

Do not ask stack questions, generate code/rules/hooks/tier files, dispatch agents, or commit.
