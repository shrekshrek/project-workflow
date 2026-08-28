---
name: project-init
description: Initialize the neutral six-file project-workflow baseline when its destinations are absent and existing content, if any, does not require personalization. Preserve incidental files; route project evidence or baseline conflicts to project-personalize.
---

# Project Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-init.md` completely before acting; it is the canonical contract.

1. Resolve the optional target from `$ARGUMENTS` or cwd and apply the canonical target classification and route.
2. Require `${CLAUDE_PLUGIN_ROOT}/template` and
   `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs`; do not search another runtime's cache.
3. Use a disposable staging directory and run the canonical staging, preview, no-clobber apply, validation, and
   result handoff with that materializer.

Preserve incidental content without interpreting or merging it. Generate only the canonical six-file baseline; do not dispatch agents or commit.
