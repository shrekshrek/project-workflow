---
name: project-init
description: "Initialize the neutral six-file project-workflow baseline in an empty target without guessing the future stack. Treat the exact baseline as already initialized; use project-personalize when other project content exists."
---

# Project Init (Codex)

Match the user's language. Read [`../../../../docs/actions/project-init.md`](../../../../docs/actions/project-init.md) completely before acting; it is the canonical contract.

1. Resolve the target from the argument or cwd plus the plugin root as the nearest ancestor containing `.codex-plugin/plugin.json`, and require its template. Enumerate the complete target population including dotfiles, excluding version-control metadata from content classification. Only the six mapped paths with byte-matching template contents are already initialized; report that state and stop before staging or materializer invocation. Redirect a target with other project content to `$project-personalize`.
2. For an empty target, require the plugin root's baseline materializer.
3. Stage with `scripts/materialize-project-baseline.cjs --stage <staging> --target <target>` while leaving the target unchanged.
4. Show the six target-mapped files, then apply once with `--apply-staged <staging> <target>`; explicit invocation already authorizes this deterministic no-clobber baseline.
5. Validate the exact file set, alias, placeholder absence, and deferred commands/paths. Report that the neutral workflow baseline is ready for a scaffold, direct work, or `$feature-init`; application structure may still be undecided and personalization is not a required follow-up. If it is undecided, present but do not invoke two next paths: keep minimum architecture inside the first feature, or use a separate architecture-shaped full change only when it governs several later features or has its own durable consumer.

Do not ask stack questions, generate code/rules/hooks/tier files, run agents, or commit.
