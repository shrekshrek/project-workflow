---
name: project-init
description: Set up project-workflow in a new or existing repository. Inspect the target and complete neutral initialization or existing-project adaptation.
---

# Project Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-init.md` completely before acting. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

1. Resolve the optional target from `$ARGUMENTS` or cwd and apply the canonical target classification and route.
   For existing-project adaptation, invoke /project-workflow:project-personalize for this target.
   End this action after that handoff or an already-initialized result. For neutral setup:
2. Require `${CLAUDE_PLUGIN_ROOT}/template` and
   `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs`; do not search another runtime's cache.
3. Use a disposable staging directory and run the canonical staging, preview, no-clobber apply, validation, and
   result handoff with that materializer.

During neutral setup, preserve incidental content without interpreting or merging it. Generate only the canonical six-file baseline; do not dispatch agents or commit.
