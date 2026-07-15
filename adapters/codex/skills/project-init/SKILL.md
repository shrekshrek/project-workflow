---
name: project-init
description: "Initialize the neutral six-file project-workflow baseline in an empty greenfield directory without guessing the future stack. Use project-personalize after any scaffold or code exists."
---

# Project Init (Codex)

Match the user's language. Read [`../../../../docs/actions/project-init.md`](../../../../docs/actions/project-init.md) completely before acting; it is the canonical contract.

1. Resolve the target from the argument or cwd. Redirect a non-empty codebase to `$project-personalize`.
2. Resolve the plugin root as the nearest ancestor containing `.codex-plugin/plugin.json` and require its template and baseline materializer.
3. Stage with `scripts/materialize-project-baseline.cjs --stage <staging> --target <target>` while leaving the target unchanged.
4. Show the six target-mapped files, then apply once with `--apply-staged <staging> <target>`; explicit invocation already authorizes this deterministic no-clobber baseline.
5. Validate the exact file set, alias, placeholder absence, and deferred commands/paths. Recommend `$project-personalize` after the scaffold exists.

Do not ask stack questions, generate code/rules/hooks/tier files, run agents, or commit.
