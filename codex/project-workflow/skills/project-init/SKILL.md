---
name: project-init
description: "Set up project-workflow in a new or existing repository. Inspect the target and complete neutral initialization or existing-project adaptation."
---

# Project Init (Codex)

Match the user's language. Read [`../../docs/actions/project-init.md`](../../docs/actions/project-init.md) completely before acting. Apply [runtime conventions](../../docs/actions/README.md#shared-runtime-conventions).

1. Resolve the target from the argument or cwd and apply the canonical target classification and route.
   For existing-project adaptation, continue with the native $project-personalize skill for this target.
   End this action after that handoff or an already-initialized result. For neutral setup:
2. Resolve the plugin root as the nearest ancestor containing `.codex-plugin/plugin.json` and require its
   template and `scripts/materialize-project-baseline.cjs`.
3. Run the canonical staging, preview, no-clobber apply, validation, and result handoff with that materializer.

During neutral setup, preserve incidental content without interpreting or merging it. Generate only the canonical six-file baseline; do not run agents or commit.
