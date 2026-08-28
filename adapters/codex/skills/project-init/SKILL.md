---
name: project-init
description: "Initialize the neutral six-file project-workflow baseline when its destinations are absent and existing content, if any, does not require personalization. Preserve incidental files; route project evidence or baseline conflicts to project-personalize."
---

# Project Init (Codex)

Match the user's language. Read [`../../../../docs/actions/project-init.md`](../../../../docs/actions/project-init.md) completely before acting; it is the canonical contract.

1. Resolve the target from the argument or cwd and apply the canonical target classification and route.
2. Resolve the plugin root as the nearest ancestor containing `.codex-plugin/plugin.json` and require its
   template and `scripts/materialize-project-baseline.cjs`.
3. Run the canonical staging, preview, no-clobber apply, validation, and result handoff with that materializer.

Preserve incidental content without interpreting or merging it. Generate only the canonical six-file baseline; do not run agents or commit.
