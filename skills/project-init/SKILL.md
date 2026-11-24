---
name: project-init
description: "Set up project-workflow in a new or existing repository. Inspect the target and complete neutral initialization or existing-project adaptation."
metadata:
  version: "4.0.0"
---

# Project Init

Match the user's language. Read [`resources/docs/actions/project-init.md`](resources/docs/actions/project-init.md) completely before acting. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

1. Resolve the target from the argument or cwd and apply the canonical target classification and route.
   For existing-project adaptation, continue with the project-personalize skill for this target.
   End this action after that handoff or an already-initialized result. For neutral setup:
2. Use the bundled `resources/` directory and require its
   template and `scripts/materialize-project-baseline.cjs`.
3. Run the canonical staging, preview, no-clobber apply, validation, and result handoff with that materializer.

During neutral setup, preserve incidental content without interpreting or merging it. Generate only the canonical six-file baseline; do not run agents or commit.
