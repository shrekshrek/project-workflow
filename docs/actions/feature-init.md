# feature-init

Canonical action for understanding a proposed change and preparing only the durable record it needs.

## Use When

Use when a requested implementation needs tracked acceptance, cross-session handoff, current-truth
synchronization, or contract/risk protection, or the user explicitly asks whether a feature record is useful.
Ordinary questions, diagnosis and discussion remain conversation; do not force an action invocation or
artifact just to answer them. A feature name, several files or multiple implementation steps do not by
themselves require a record. Proceed directly when outcome and acceptance are clear and no tracked acceptance,
handoff, current-truth synchronization or material risk protection is needed. Reuse a compatible active record.

A change to durable behavior already declared in `docs/specs/` needs a traceable record and eventual
current-truth synchronization. This does not require additional files or a document-size category.
The action owns discovery and record preparation, not production implementation. Returning from it preserves
the enclosing request and its existing authorization.

These anchors calibrate that judgment; match the reason, not the surface resemblance:

- No record: fixing a bug whose correct behavior is already declared; renaming, extracting or reorganizing
  internals with unchanged behavior; adding a test for existing behavior; a routine dependency refresh or
  internal documentation edit that changes no accepted behavior or operational boundary.
- Record: adding or changing persistent data; changing a default, limit or error that existing users or
  callers can observe; a new endpoint, permission or scheduled job; work that must survive a session break or
  be handed off; anything that makes an existing statement in `docs/specs/` wrong.

Volume never decides: a one-line change to an authorization default needs a record, and a large mechanical
refactor with unchanged behavior does not. When both lists seem to apply, the durable consequence decides.

## Inputs

Resolve the explicit target root and applicable `AGENTS.md` before writes; never use an incidental cwd.
Read relevant current-truth headings and the selected active record, then only the source/tests needed
to answer the current question. Use filenames/indexes to locate relevant records; do not open every active
feature or optional reviewer merely to begin a discussion. Exclude `docs/specs/changes/archive/` unless tracing a specific historical decision.
Carry forward the latest accepted user decisions, their reasons, explicit exclusions and unresolved questions.
A dirty path is not automatically owned by this change.

### Optional Blueprint context

If the target supplies an approved Blueprint handoff, read its `read_first` artifacts and the referenced slice,
decision and contract IDs before preparing the feature record. Carry confirmed boundaries, exclusions and accepted
assumptions into the feature without copying the Blueprint narrative; cite the upstream IDs where they affect this
change. A missing, draft, stale or unresolved handoff is context only, not implementation authority. Without a
handoff, continue the normal feature flow. If the proposed change contradicts an accepted upstream Blueprint
decision about project goals, project-wide scope, cross-system responsibilities, authoritative data or trust
boundaries, or requires a previously uncovered project-level decision about responsibilities, authoritative
data or trust boundaries before implementation can safely proceed, stop the affected work and resolve that
decision first. Revise the affected Blueprint when present; otherwise clarify the decision and recommend a
bounded rebaseline only when needed, without requiring a complete Blueprint. An undocumented feature detail
alone does not qualify. Feature-local scope,
architecture and contract changes remain in this workflow, using `spec-revise` when an accepted feature
contract changes; touching architecture or data alone does not require project re-planning.
Apply the shared project planning gap rule as soon as the first feature exposes a missing shared decision, or when repeated corrections reveal one.
Do not trigger it for ordinary repairs or layout iteration, or create upstream artifacts without authorization.

## Conversation and discovery

Start with the problem, present consumer and observable outcome. Use repository evidence to resolve facts;
ask only what can change the outcome, approach, boundary, material cost, risk or acceptance. Settled choices
remain settled unless new evidence exposes a material consequence. Do not re-interview the user to fill a
form, choose a lane, invent a slug during discussion, or satisfy a fixed question count.

Assume no prior knowledge of the repository, workflow or testing vocabulary, while preserving the user's
authority over product intent, risk and cost. Explain the observable consequence first and introduce technical
labels only when they help the decision. Before asking for a decision, make the available choices, material
trade-offs and recommendation understandable; do not hide scope behind terms such as unit, integration, E2E,
shadow or regression testing, and do not patronize the user or replace their business judgment.

Choose a coherent solution by balancing correctness, clarity, implementation and verification cost,
compatibility and maintenance. A justified refactor may be simpler overall than a smaller patch. Proceed
with a well-supported approach within authorization; when alternatives materially change scope, cost, risk
or long-term direction, explain the recommendation and trade-offs for the user to decide. Investigate
missing facts before asking the user to choose. If a consequential assumption can be checked,
propose a bounded trial with a question, inputs and a success/failure criterion before executing it. Reuse
existing tests, scripts and synthetic fixtures. Perform only the specifically authorized trial; external
calls, private data, paid work and other restricted operations retain their own approval boundaries. An
isolated trial is not authorization to implement the feature. If a trial cannot run, identify the evidence
gap and continue permitted analysis; never invent a result or present a synthetic result as production proof.

Record observed results separately from accepted expected behavior. An experiment that disproves the
criterion informs the next decision; do not rewrite the criterion to make it pass. No trial is required when
existing evidence already settles the relevant question. Low-level implementation details can be discovered
later without making every idea an upfront experiment.

When several outcomes can deliver value, be accepted or be reverted independently, explain the natural
decomposition and recommend a coherent first feature based on value, dependencies and risk; let the user
choose when it is not already clear. Keep a coupled transaction, security outcome or rollout together. Explain real coupling/rollback risks;
do not infer scope from file count or technical keywords.
For work depending on existing data or another system, choose an early slice that traces available source
facts through required initialization or maintenance to a usable consumer result. If foundational work must
come first, explain the dependency and the result that will prove it useful; an empty interface is not that
proof. Use the smallest representative example, not an automatic full-system build or E2E gate.
Every new [declarable surface](README.md#shared-runtime-conventions) must serve the selected outcome and name
its affected actor, owner or consumer. Exclude speculative capability. External tracking is never a prerequisite for the selected
outcome; creating external items requires separate authorization.

## Record and authorization

A clear user confirmation establishes the current implementation baseline, even before it is written to a
file. The record preserves that decision; its absence or draft status does not reopen it. Changing an
accepted boundary requires a new user decision, which may already be explicit in the current request.

Decide whether to create, reuse or omit a record independently of verification depth. There are no LIGHT/FULL
packages or replacement lane labels. Match documentation to decision and coordination needs, and verification
to actual risk.

- `PREVIEW`: an assessment or discussion request creates no project files and changes no implementation.
- `APPLY`: an explicit record-creation or implementation request permits necessary record work within its
  accepted boundary. Automatic skill invocation is not write authorization. A request only to record a
  decision does not authorize coding. A separately approved temporary trial follows its own narrow scope.

Default new record: `docs/specs/changes/<NNN>-<slug>/spec.md`, and only that file. Do not precreate any
attachment, evidence directory, domain document or index that has no content yet. Use the packaged
materializer with `--target`, `--number` and `--slug`; it creates only spec.md and preserves no-clobber,
numbering and symlink safety.
Use the shared [NNN numbering](README.md#shared-runtime-conventions) rule. Confirm a requested unused number
above the computed next number; an occupied/older number cannot be reused via a different slug.

The record explains what changes, why this approach, concrete acceptance examples and expected outcomes,
and later the actual verification. For new or explicitly reorganized records, keep the template's four
level-two headings in order, omitting sections with no useful content; use level-three headings for domain
subtopics. Change this structure only for an explicit user/project convention or a concrete content/navigation
need, not stylistic preference. Do not reformat existing readable records merely for consistency or reject
an actionable record solely for different headings. Preserve references and the actual delta when current
truth already explains the unchanged behavior. Keep accepted constraints and
explicit exclusions. Keep both spec and design notes concise. Spec owns requirements, acceptance and verification.
Before implementation, use a brief example to show who acts, what changes and what the user sees. When branches
or handoffs matter, prefer a small flow diagram for sequence or a decision table for conditions and outcomes.
Explain only what the visual leaves open, distinguishing accepted rules from choices the user still needs to make.
Include file or module details only when they clarify a material choice. For a proposed setting, identify who needs
different values and why. Implement the single accepted behavior directly when it suffices. Keep short designs in spec. Split supporting content when it materially helps reading or handoff.
Create or reuse a linked design note such as `design.md` in that case. An explicit request for a separate handoff document qualifies. Reference the accepted rules there. Test code belongs in existing project test locations.
Long reproducible trial material can live separately when needed; keep conclusions and references in spec.

An active feature uses `spec.md` as its accepted record. Optional design/work notes may support it but do not
own acceptance or delivery status; `READY`, the delivery receipt, status writes and archive eligibility are
endpoint and lifecycle outputs, so do not restate them as checklist items. Archived directories remain history
and do not participate in active execution. The canonical delivery receipt location is owned by `feature-done`.

Give the execution preview in the conversation before implementation. Explain the proposed behavior in the order the user would experience it. Where a choice matters,
show who or what decides, what the decision uses, what happens if it fails, and why you recommend
that approach. Surface any decision the user could reasonably make differently while it can still
change the plan. A sentence can be enough. Use an example, diagram, list or table when it makes
the behavior or choice easier to understand. The user should be able to judge the approach
from the conversation alone. For work with dependent outcomes, show an early inspectable result
while feedback can still change the next step. Revisit only what has materially changed.
If the visible result could look right even with a wrong internal design, walk through one case that
would expose the difference (for example, retrying after a partial save). Show which component acts,
which data it relies on and how to tell whether it acted correctly. Use the agreed case as an
acceptance example and check it in the first implementation slice where it can run.
For approach alignment, seek confirmation only for unresolved choices that materially affect the outcome,
scope or acceptance. A feature request or agreement with the problem does not accept an undisclosed material
design choice. A clear request may already authorize the approach. An accepted preview is reused;
do not insert duplicate confirmation for ordinary implementation details within that scope.

The preview distinguishes pre-implementation decision evidence, implementation feedback and delivery evidence;
it does not present every planned check as an upfront gate. For a materially long, paid, external, opaque,
high-volume or restart-costly run, give a plain-language execution envelope before starting: the decision it
supports, what it does and does not cover, knowable units/calls/rounds, a rough duration and uncertainty,
external cost or permission, observable progress, partial-result persistence, failure/restart consequence,
stop rule and the smallest useful canary or sample alternative. Fast local checks need no such ceremony.
An accepted envelope covers ordinary work inside the current useful slice; it does not suppress informative handoffs
or the feedback and stop boundaries in [Implementation Scope Stop](#implementation-scope-stop).

## Document updates and context

Answer the current question first. Batch writeback when a conclusion is reached, before implementation or at
handoff; do not write after each sentence or interrupt conversation with bookkeeping. During a long exchange,
save a short supported summary early if an important decision could be lost. Preserve accepted decisions and
reasons, exclusions, unresolved questions, permission limits and the next useful action. Do not copy entire
transcripts or logs, turn assumptions into decisions, or erase a relevant rejected alternative's rationale.

On resume, read the relevant accepted record and unfinished work, then necessary linked evidence. Do not
restart planning, reload every guideline/archive, or clear the session merely because a document changed.
Reopen a decision only when a material contradiction or new finding requires it. Keep one content owner;
source traces are needed for non-obvious external interpretations, conflicts or supersessions, not duplicate
rows for every ordinary requirement. Use dates and stable source references where useful. Keep routine
creation mechanics and inapplicable-review explanations in the response or execution log.
The current contract, authorization, acceptance, status and next action must be understandable without
reconstructing revision history. Update affected sections in place; condense superseded plans and progress
into dated reasons and evidence references, not another competing contract. Preserve material decisions,
exclusions, authorization limits, failures and evidence applicability; historical protection does not freeze
obsolete prose inside an active record. Keep one owner per fact and do not split files or impose a length
limit merely to hide accumulation. Receipt preservation follows [feature-done](feature-done.md#completion-preflight).

## Implementation Scope Stop

Discovery continues during implementation. A task split, implementation-order change, necessary test or
coherent internal refactoring that preserves the accepted behavior can proceed without approval or a
formal revision. Record only details useful to later work. Do not require all tasks to be known upfront.

Stop the affected implementation before deepening rework when evidence reveals infeasibility, a materially
better direction, an undeclared outcome/contract, ownership, authorization, data disposition, operating cost,
migration, release boundary, or changed acceptance. Explain the finding, consequences and recommended options;
ask the smallest useful question. Safe authorized investigation can continue. Existing code never justifies
absorbing scope or making the user accept it.

After confirmation, use [`spec-revise`](spec-revise.md) to update only affected decisions, work and acceptance,
then continue the authorized implementation. Do not restart the feature or rewrite unaffected evidence. An
independent outcome becomes a successor/child only if the user wants it; do not automatically create a backlog.
A failed test with unchanged requirements calls for implementation repair, not changed expectations.

Organize implementation into coherent functional slices around real dependencies and risks. A slice normally
carries one outcome through its needed code, tests, documentation and ordinary verification; module and layer
boundaries only shape implementation order. A small or tightly coupled task may be one slice.
If you made a material choice the user might decide differently, explain its effect on the observed behavior. Show the
result in the conversation and wait for user feedback before starting the next outcome. If the
user explicitly requests continuous execution across those outcomes, report progress and continue
within that authorization. A status question preserves a pending checkpoint. Material changes and
separate permission or cost limits still stop the affected work.

During implementation and post-gate repair, if repair/verification keeps cycling without converging, explain
the unresolved problem and recommended next step, then wait for the user's decision. Preserve unaffected valid
evidence; rerun the affected closure.

Progress reports must help the user judge the work, not merely announce activity. Report new evidence and its meaning:
what is usable, what remains, deviations or risks, and the next action or changed plan. Use real counts or
observable milestones; tests support the result rather than replace it. If the runtime cannot observe exact
progress, disclose that limitation before a long run; never invent percentages or repeat empty "still running"
updates. Explain partial-result loss or restart consequences when interruption changes the user's choice.
Persist useful conclusions under the document-update rules above.

## Readiness and conditional guidance

Use [`spec-quality-check`](spec-quality-check.md) to check semantic readiness, without demanding file sets or
repeating a completed check on unchanged inputs. Independent review is conditional on risk or an explicit
request, not record size. For real architecture/ownership changes, read only the applicable
[architecture guidance](../architecture-design.md). A durable convention-placement decision uses the
[Guidance Placement Contract](agents-md-revise.md#guidance-placement-contract); ordinary changes skip it.
Create an ADR only for architecture/module boundaries, durable cross-feature decisions or superseding an ADR.

Normalize accepted material decisions and explicit supersessions before drafting. Use a compact source trace.
Dispatch a fresh [decision-completeness auditor](../reviewers/decision-completeness-auditor.md) only for an
unconfirmed material choice or conflicting/weak evidence under its dispatch boundary. Directly traceable
values do not need another reviewer. Applicable dispatch follows the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract); missing required evidence
blocks a reliable handoff, not permission to invent the decision.

## Verification

Match verification to its stage and proof obligation:

- Before implementation, use existing evidence or the smallest bounded trial needed for a consequential
  decision. Use E2E only when it is the smallest reliable baseline, reproduction or decision evidence.
- During implementation, use focused checks for the changed boundary and the shortest useful actor-to-result
  path only when it adds a distinct signal.
- Before delivery, let accepted obligations, actual scope and project/release conventions select the necessary
  acceptance, integration, E2E, regression and risk-specific evidence.

Focused evidence is the default; follow the shared
[verification escalation](README.md#shared-runtime-conventions) rule.
A necessary lower-cost failure stops unrelated costlier expansion unless needed
for diagnosis or an explicitly requested full sweep; a final READY candidate still completes every applicable
delivery obligation without lowering a failed expectation absent a confirmed behavior change.

## Outputs and validation

Report the useful conclusion, create/reuse/no-record disposition, actual evidence or gap, and next action in
natural language. Do not output a required lane/form or an empty checklist. Read-only assessment stops without
materialization. Record-only work stops after recording; authorized implementation continues from its accepted
approach. Validate correct target, no-clobber, traceability, accepted constraints and exclusions, and actionable
acceptance before handoff. Report tests actually executed separately from planned tests and static fixtures.
