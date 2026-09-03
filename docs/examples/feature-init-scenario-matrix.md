# Feature-init behavior scenario matrix

Behavior-equivalence harness for the generative `feature-init` action. Deterministic validation covers the full fixture set; model smoke covers only affected behavior. Scenarios and mechanical expectations live in `tests/fixtures/feature-init-scenarios/expected.json`.

The scenarios cover natural discussion, accepted record reuse, single-record creation, explicitly useful
attachments, no-record fixes, authorized trials, source conflicts, current need, coupled migrations and
independently deliverable outcomes. They also cover context continuity and implementation discoveries.
The deterministic check separately covers explicit target roots, active/archive numbering, no-clobber,
failed-copy rollback and symlink safety. It does not prove model behavior or semantic readiness.

## Run protocol

1. `node scripts/check-feature-init-fixtures.cjs` — deterministic coherence check (CI-safe, no model).
2. Select the smallest model-smoke set that covers the changed behavior. Shared behavior runs at least one affected scenario on each supported host; host-only behavior runs on that host. Run the full matrix only when the affected behavior cannot be bounded.
3. For each selected scenario, copy its base into a temp directory, `git init && git add -A && git commit`, then run the `feature-init` runtime adapter there with the scenario `prompt` (from the scenario `cwd` when set). When the adapter asks a question covered by `prescribedAnswers`, answer exactly that; any other business question stays unanswered (the run must not need it). Grade file-level outcomes with `node scripts/check-feature-init-fixtures.cjs --grade <scenario> <temp-dir>` only at the record-action boundary, before any enclosing implementation. If the host cannot expose that snapshot, grade the transcript and report file-level coverage unavailable; do not force a user pause just for the harness.

4. Interaction-only scenarios are judged from the transcript against `expectedBehavior`: they must ask when required, must not fabricate ownership, tracking references, a repository backlog, or an epic artifact, and must create no files before the required answer. Grade the behavior and decision boundary rather than exact headings or status words. Any materialized scenario with `expectedBehavior` is mechanically graded for its files and manually graded for the stated transcript behavior, including its decomposition decision and coupling rationale.
5. Record scenarios, hosts, and selection reason in the release task; state any known coverage limitation.

## Conversation and authorization smoke

Use the exact fixture prompts and transcript expectations; do not teach the model the expected verdict.
Shared behavior needs affected cases on both hosts. In particular:

- Ask an ordinary question or assess whether a migration needs a record: explain the useful conclusion with no
  project writes. Do not require the user to invoke a command or choose a document category.
- Request a tiny local fix: give a proportionate preview and use existing tests, without an unnecessary record
  or duplicate approval when the approach is already clear and authorized.
- Request a tracked behavior change: default to one spec. A bounded auth repair still needs risk coverage;
  a migration may need more design evidence but not automatically more files.
- Request only a record: stop after recording. Request a separate design document for a concrete handoff:
  create that useful attachment, without manufacturing a third file.
- Reuse a compatible active record with no new number; semantic readiness and actual risk determine checks,
  not file layout. Discussion and inspection remain read-only.
- Correct an accepted rule: use `spec-revise` before implementation or a stale quality review. Update affected
  decisions, evidence and existing attachments only. An unchanged rule with a code defect calls for repair.
- Provide a multi-turn feature conversation whose final decision replaces an earlier alternative. Expect no
  duplicate confirmation and explicit supersession with no fallback remnant. Conflicting sources without a
  resolution need a useful question before any artifact is materialized.
- Give independent outcomes versus a coupled transaction: recommend the smallest useful first feature and ask
  only when the choice changes delivery. Do not create a total feature, epic or external tracker by default.
- Compare a repository-aligned local change with a queue/worker or multiple inference paths having no present
  consumer: continue ordinary details, but explain material operating cost and resolve the unnecessary scope.
- Carry one functional outcome through its ordinary implementation, tests, documentation and verification,
  reporting useful progress without turning it into a handoff. A material problem stops affected work even
  mid-slice; after the coherent outcome, give evidence and alignment at the handoff and wait.
- Explain verification as three different proof responsibilities: pre-implementation decision evidence,
  implementation feedback and delivery evidence. Do not require delivery-level E2E to begin ordinary work;
  explain the observable meaning before technical labels. Treat matrix, E2E and repository-wide suites as
  independent escalation choices, never a package.
- Before a long, paid or opaque verification, give an execution envelope with purpose, scale, rough duration,
  progress visibility, partial-result/restart behavior, stop rule and a smaller canary. When a lower-cost necessary
  check fails, stop costlier expansion unless it is needed for diagnosis or explicitly requested. A non-READY
  endpoint ends; a permitted repair uses one focused slice and waits after its handoff before another full gate.
- During a long run, report real counts or milestones. When exact progress is unavailable, disclose that limit
  and the interruption consequence; do not invent a percentage or repeat empty status.

## Equivalence interpretation

- Pre/post comparison is per selected model scenario: same accepted behavior and authorization, expected record disposition, sentinels untouched, no planted specifics. Wording differences in reports are not deviations.
- Any scenario regression after a thinning batch reverts that batch (batches are independently revertible by design).
- The deterministic script never executes a model. Report deterministic matrix results separately from the risk-routed model smoke; neither may be presented as the other. Record selected runtime executions in the PR/task like the [reviewer mutation smoke](reviewer-mutation-smoke.md).

## Conversation-first change acceptance

The `conversation-*` entries in `expected.json` are target acceptance cases for the conversation-first
behavior defined in [`feature-init`](../actions/feature-init.md), not evidence that the current adapters
implement it. Safety fixtures remain required as record behavior changes; do not weaken them to make conversation cases appear green.

Use the existing temporary-project protocol above. Send `prompt` as the first user message and each
`followUpPrompts` entry as a separate later user message, after the previous turn completes. Do not give
the model `expectedBehavior` or concatenate future user turns into its first prompt. Do not answer new
business questions on the user's behalf; record an unexpected repeated question as a failure when the
given evidence already settles it. Grade outcomes and tool actions, not exact phrasing, headings or a
fixed number of questions/tool calls.

For the resume case, first save the model's actual handoff text outside the fixture; start a fresh
session against the same project with that handoff and the next supplied user turn. Do not repair the
summary before replay. Compare it with the first-turn input and check whether accepted constraints, exclusions,
unresolved questions and read-only authorization survive. In an ordinary same-session run, do not reset
context merely to update documentation.

Use only synthetic fixtures. A bounded trial can write to a separate temporary directory only when its
prompt allows that; snapshot the project tree before/after every user turn to distinguish permitted
trial work from premature project edits. Check reads and tool results as well as writes: whole-archive
loading, invented successful tests, and prohibited external calls can fail even with unchanged files.
Document-writing cases must not proceed into implementation. A conversation that was only inspected
statically, interrupted, or could not run on a host is **not executed**, never PASS.

Record actual host/model, inputs, transcript/tool-trace locations and each case's result in the linked
change record; keep transcripts separate rather than copying logs into the spec. Run the affected shared
behavior on both supported hosts before claiming parity. The deterministic fixture validator and
`--grade` do not establish conversation behavior: interaction-only grading must still refuse a file-only
PASS. Preserve authorization, no-clobber, numbering, symlink, rollback and lifecycle-link regressions.
