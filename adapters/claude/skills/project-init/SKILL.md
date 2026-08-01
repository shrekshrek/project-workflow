---
name: project-init
description: Initialize the neutral six-file project-workflow baseline in an empty target without guessing the future stack. Treat the exact baseline as already initialized; use project-personalize when other project content exists.
---

# Project Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-init.md` completely before acting; it is the canonical contract.

1. Resolve the optional target from `$ARGUMENTS` or use cwd, and require `${CLAUDE_PLUGIN_ROOT}/template`; do not search another runtime's cache. Enumerate the complete target population including dotfiles, excluding version-control metadata from content classification. Only the six mapped paths with byte-matching template contents are already initialized; report that state and stop before staging or materializer invocation. Redirect targets with other project content to `/project-workflow:project-personalize`.
2. For an empty target, require `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs`.
3. Create a disposable staging directory and run `node "${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs" --stage "$STAGING_DIR" --target "$TARGET_DIR"`.
4. Show the six target-mapped files, then apply once with `--apply-staged "$STAGING_DIR" "$TARGET_DIR"`; explicit invocation already authorizes this deterministic no-clobber baseline.
5. Validate the exact file set, no placeholders, the one-line alias, and deferred commands/paths. Report that the neutral workflow baseline is ready for a scaffold, direct work, or `/project-workflow:feature-init`; application structure may still be undecided and personalization is not a required follow-up. If it is undecided, present but do not invoke two next paths: keep minimum architecture inside the first feature, or use a separate architecture-shaped full change only when it governs several later features or has its own durable consumer.

Do not ask stack questions, generate code/rules/hooks/tier files, dispatch agents, or commit.
