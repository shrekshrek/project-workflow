# spec-quality-reviewer

Check that a proposed or accepted feature record matches its requirement sources and is ready to guide
implementation. Include existing attachments only when they help assess the feature.

## Scope

Assess whether a feature record still matches its accepted requirement sources and is good enough
to implement. Apply Requirements Reconciliation followed by Review below, whether called in the main
session or as an independent reviewer. The calling action owns dispatch, verdict and continuation.

Check whether the proposed outcomes can be delivered independently. Do not assess code-level feasibility,
project-convention compliance or file-presence checks that the calling action can perform directly.

Check architecture only when the agreed work spans several boundaries or carries high risk, and
changes component responsibilities, cross-component contracts, data/state ownership, lasting trust or
permission ownership, or deployment ownership. Ordinary permission changes within existing boundaries
and internal refactors skip this check.

Keep this check inside Q5/Q7c/Q7d and within the agreed delivery scope. Check that the proposed responsibilities,
contracts, state handling, trust and deployment ownership can support the required outcome and quality.
Include important failure, migration and recovery behavior. Do not start a separate architecture review.

## Requirements Reconciliation

Use the caller's Requirements Source Map and artifact paths. An applicable ADR or project
contract can establish a requirement. When a user supplies a spec, distinguish a proposal for review
from a section the user explicitly accepted. Cite the relevant section or exchange. If it is missing,
identify the missing source rather than reconstructing the conversation from memory.

For a material choice recorded as agreed, check what the user saw and what their reply covered.
Compare who is affected, which existing records change and which consumers will rely on it.
If only the author's design or summary supports a broader effect, report `SOURCE GAP` and identify
the choice the caller needs to discuss. For a correction, check the replacement and the superseded
rule against the user's statement or a durable decision source.

Before Q3-Q7, check both that requirements are recorded and that recorded behavior has a source.
Keep trial observations, agreed expected behavior and delivery evidence distinct. A failed or unavailable
trial does not establish an agreed result. Condensed records must retain exclusions, open questions and
limits on what the user authorized.

- Requirements to artifacts: locate every material accepted outcome, rule, constraint, exclusion, fallback,
  and supersede decision in the record and any affected attachments.
- Artifacts to requirements: check the source of important behavior, ownership, permissions, data states,
  lasting workflows and scope commitments. Each must come from the user, an applicable external source,
  or be clearly proposed for the user's decision. This includes retention, retry, overwrite and failure
  behavior when it changes the result. Ordinary implementation details need no separate decision if they
  add no behavior or scope. Accepted spec content needs no duplicate Prior decisions row.
- Consistency over time and across records: apply [document maintenance](../actions/feature-init.md#document-updates-and-context).
  Flag conflicting or outdated instructions in prose, verification, tasks, fallback or migration handling.
  A “history” label does not help if the reader still has to reconstruct revisions to know what applies now.
- Exclusion and ownership semantics: when an authoritative source says "remove", "no longer", "only",
  "single source", or equivalent, flag any retained optional, conditional, fallback, or compatibility path as
  `superseded-remnant` unless that source explicitly preserves it.
- Counterexamples: when ownership, authorization, hierarchy, fallback, unknown-data, or migration rules can
  change the result, test at least one materially different case rather than accepting only the happy path.

Report exactly one `Requirements Reconciliation` status before the Q findings:

- `ALIGNED` when both directions agree and material decisions have authoritative sources.
- `MISMATCH` with one of `missing-from-artifact`, `unsupported-artifact`, `superseded-remnant`, or
  `cross-artifact-conflict`, citing both source and artifact evidence.
- `SOURCE GAP` when the supplied evidence cannot establish a material claim, its accepted scope or
  which decision supersedes an earlier one. Name the missing decision or source.

Latest wins only when a later authoritative source explicitly replaces the earlier decision. Otherwise a
conflict is `SOURCE GAP`. `MISMATCH` and `SOURCE GAP` are blocking regardless of the later Q results. Continue
Q3-Q7 in the same invocation so the caller receives one consolidated repair set.

## Review

Fresh-read the relevant record and assess every applicable item, regardless of layout. Preserve accepted
constraints, exclusions and open questions; do not require a `Delta` heading, optional files, exhaustive tasks
or an alignment table merely because several modules are touched. Apply the
[writing and maintenance rules](../actions/feature-init.md#document-updates-and-context): cite unclear or needlessly repeated
passages and suggest a local correction. Block only when the issue
makes requirements, decisions or verification unreliable; wording preferences are advisory.
Check material choices and handoffs against [execution preview](../actions/feature-init.md#record-and-authorization).

Before implementation, require a practical verification plan and enough evidence to choose the approach,
not completed delivery evidence. Keep only checks needed to prove the agreed behavior and relevant risks.
Failed or unavailable trials leave critical questions open. Details that can safely wait, including choices
that depend on runtime facts, do not block implementation. State known significant costs and permission limits.

When the spec cites a Blueprint handoff, verify its slice, decision and contract references resolve and the
change stays within the accepted upstream boundary. A material contradiction or project-level impact routes
to `spec-revise` and the upstream Blueprint; with no Blueprint reference, skip this check.

- **Q3 verification**: each important behavior or risk has a practical way to check it. A documented, repeatable manual
  observation can count; distinguish planned checks from results already obtained. Uncheckable claims fail.
  Remove checks based only on generic edge-case habits or unspecified inputs unless an agreed requirement,
  project convention or concrete risk calls for them. Follow [verification escalation](../actions/README.md#shared-runtime-conventions).
  One command can prove several requirements; unnecessary or duplicate layers fail Q3 and should be removed
  or combined. Optional implementation ideas remain suggestions. When a user flow is part of verification,
  put the shortest meaningful path from action to result first.
- **Q4 outcomes**: identify who acts, what they do and what counts as success. This passes; vague aspirations
  fail. An outcome with no success condition is borderline.
- **Q5 constraints**: hard limits, external requirements or measurable constraints pass; wishes fail.
  Label preferences as preferences. An unresolved preference blocks only when it changes acceptance or
  significant risk. When the architecture check applies, verify that responsibilities, contracts, state,
  trust, deployment and failure/recovery decisions can meet important quality constraints. A clear,
  proportionate explanation passes; a required supporting decision that is missing fails.
- **Q6 sibling/guidance alignment**: `Align` uses an applicable existing rule. `Deviate` explains why an
  exception stays local. `Codify` identifies a lasting difference, its evidence/source and the exact place
  to record or enforce it. These pass. When Q6 includes such a placement decision, read the
  [Guidance Placement Contract](../actions/agents-md-revise.md#guidance-placement-contract); otherwise skip it.
  A violation, missing promised target/alias task or unclear owner is fail or borderline depending on
  whether it can change implementation.
- **Q7a next work**: the next step and how to check it must be clear, with or without a checklist.
  A useful checklist item produces something that can be independently implemented or reviewed and checked before
  `feature-done`. A broad item that hides separate decisions or an important dependency checkpoint fails;
  work without verification is borderline. READY, Proof Bundle/status writes and archive eligibility are
  endpoint/lifecycle outputs, not task checkboxes. A checklist item that depends on them is circular and
  fails Q7a. At each real dependency or risk checkpoint, produce a result the user can inspect and run
  its smallest relevant check before dependent work. Use [feature-init's discovery rule](../actions/feature-init.md#conversation-and-discovery)
  and [execution preview](../actions/feature-init.md#record-and-authorization) to assess the first slice:
  can the user judge a representative result before more work builds on a mistaken interpretation?
  Do not require all layers at once.
- **Q7b delivery coherence**: one outcome, including work that must ship together, passes when its
  coordination and rollback risks are resolved. Significant residual risk is borderline. Bundling
  independently deliverable outcomes is borderline if the user accepted that risk and fails otherwise.
- **Q7c current necessity**: every [declarable surface](../actions/README.md#shared-runtime-conventions)
  identifies who needs it now and why the selected outcome requires it. That passes; possible future need
  alone fails. An unclear current need, affected party or simpler safe alternative is borderline.
  Remove or defer speculative capability instead of making its implementation more complete.
- **Q7d impact completeness**: scope, constraints, responsibilities and acceptance must agree across the
  record and affected attachments. That is enough for ordinary work within existing boundaries.
  Work across boundaries, architecture changes or high risk also needs relevant dependencies,
  rollback limits and conditions that would expand scope. Missing applicable decisions about cross-component
  contracts/state, lasting trust/permission ownership, deployment or important failure/migration/recovery
  behavior fail. So do undisclosed high-impact changes or unresolved data handling/ownership.

Report the reconciliation status, reviewed items, skipped items with reasons, blocking ambiguity, citations,
and concise rewrites. Use a pass/borderline/fail matrix only when several items fail. A mostly empty artifact
is not a reliable pass.

## Rules

- Cite exact file/section/line when possible.
- Cite the Requirements Source Map entry as well as the artifact location for every reconciliation mismatch.
- Suggest rewrites but do not edit files.
- A material unresolved decision blocks affected implementation; a safely deferred low-level detail does not. Do not require empty chapters or reject clear prose solely for lacking template headings.
- Changes across responsibilities, migrations and external contracts call for review; their presence alone
  does not decide the verdict.
- If a dispatched artifact is mechanically complete but substantively mostly empty, mark the applicable Q
  items `fail` with blocking evidence. Never return `N/A` after dispatch; the owning action alone records N/A
  when no independent review is needed or required inputs are unavailable.
