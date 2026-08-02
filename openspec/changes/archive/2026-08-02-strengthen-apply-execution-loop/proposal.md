## Why

Users repeatedly have to restate the same execution contract when applying an OpenSpec change: implement in verified steps, keep `tasks.md` current after every completed step, use sub-agents for suitable independent work, and finish the repository closeout instead of stopping after code edits. The current apply guidance mentions these concerns, but treats task updates and sub-agent use as optional orchestration details and only suggests archive at the end.

## What Changes

- Make `tasks.md` an active execution checkpoint: after each verified task, update its checkbox immediately and re-read the plan before selecting the next task.
- Require agents to actively identify and use suitable sub-agent work throughout implementation while retaining integration ownership in the main agent.
- When user confirmation is genuinely required, present concrete options with tradeoffs instead of an open-ended prompt.
- Extend successful apply completion through validation, necessary documentation updates, proposal archive, and a scoped Git commit unless the user or repository policy explicitly limits the requested scope.
- Keep the generated skill and `/opsx:apply` command on one shared instruction body and align schema-provided apply guidance with the same contract.

## Capabilities

### New Capabilities
- `opsx-apply-skill`: Defines the default end-to-end execution contract for applying OpenSpec changes.

### Modified Capabilities
- None.

## Architecture Impact

The change updates the existing shared `APPLY_BODY` template and schema apply instructions. It adds focused parity assertions so generated skill and command surfaces cannot silently lose the execution contract.

## Impact

- `src/core/templates/workflows/apply-change.ts`
- `schemas/spec-driven/schema.yaml`
- `schemas/workspace-planning/schema.yaml`
- template parity and artifact-workflow tests
- release notes and generated package output
