## Context

The current 1.5.0 worktree consolidates generated Skill and command guidance into shared contract-style bodies. `apply` already mentions checkbox updates and optional sub-agent delegation, but it does not require re-reading the task plan after each checkpoint, does not make sub-agent opportunity discovery a recurring obligation, and stops at suggesting archive.

## Goals / Non-Goals

**Goals:**
- Preserve agent-owned orchestration while making progress synchronization and closeout mandatory defaults.
- Keep one source of truth for generated Skill and command text.
- Align dynamic schema instructions with the generated apply contract.
- Add tests for the behaviorally important phrases rather than only refreshing hashes.

**Non-Goals:**
- Add a new CLI executor that performs Git or archive operations itself.
- Force unsafe parallel writes or delegate shared-contract integration.
- Bypass user confirmation, repository policy, validation failures, or unavailable credentials.

## Decisions

### Decision: Treat `tasks.md` as a checkpoint and context refresh

After a task has objective completion evidence, the agent updates its checkbox immediately, re-reads the task file, and only then selects the next task or parallel batch. This keeps persisted status accurate and refreshes the remaining plan in model context.

### Decision: Require recurring sub-agent opportunity checks

The apply contract requires agents to look for suitable independent research, test, validation, and isolated implementation work before each task group. The main agent retains architecture decisions, shared files and interfaces, integration, verification, and checkbox ownership.

### Decision: Make closeout the default success path

When all tasks are complete, apply continues through relevant validation, necessary documentation updates, archive, and a scoped Git commit. It stops only when the user limited scope, repository policy forbids an action, or a real blocker requires a decision. Remote publication remains request-dependent and is not made a universal apply default.

### Decision: Offer bounded confirmation choices

When a direction or risky action genuinely needs user input, the agent presents two or three concrete options, recommends one, and explains the tradeoff. Routine recoverable errors should be handled without unnecessary confirmation.

## Risks / Trade-offs

- Automatic closeout can be inappropriate in dirty worktrees. The contract therefore requires scoped staging and preserves unrelated changes.
- Over-delegation can create conflicts. The main agent must keep shared boundaries serial and review returned work.
- Phrase-based tests can be brittle, but they are intentional guardrails for generated prompt contracts and complement content hashes.

## Migration Plan

No data migration is required. Rebuild and reinstall the package so generated agent Skills and commands receive the updated defaults.
