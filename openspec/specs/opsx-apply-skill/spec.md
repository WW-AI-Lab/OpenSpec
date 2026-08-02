# opsx-apply-skill Specification

## Purpose

Define the default end-to-end execution contract for applying an OpenSpec change, including verified task checkpoints, plan refresh, sub-agent delegation, bounded confirmation, and repository closeout.

## Requirements
### Requirement: Apply maintains verified task checkpoints

The generated apply Skill and command SHALL require the agent to update the tracked tasks file immediately after each task has objective completion evidence and SHALL require the agent to re-read the task file before selecting subsequent work.

#### Scenario: A task is verified

- **WHEN** an agent completes and verifies one implementation task
- **THEN** it marks that task complete in the tracked tasks file immediately
- **AND** it re-reads the task file before selecting the next task or parallel batch

### Requirement: Apply uses sub-agents for suitable work

The generated apply Skill and command SHALL require the main agent to repeatedly identify suitable independent work for sub-agents while preserving main-agent ownership of shared architecture, integration, verification, and progress state.

#### Scenario: Independent work exists

- **WHEN** pending work can be isolated without conflicting edits or shared-contract ownership
- **THEN** the agent delegates suitable research, test, validation, or implementation slices to sub-agents
- **AND** the main agent reviews and integrates the result

### Requirement: Apply presents bounded confirmation choices

The generated apply Skill and command SHALL instruct the agent to present concrete options and tradeoffs when user confirmation is required.

#### Scenario: A direction requires user confirmation

- **WHEN** the agent cannot safely continue without a user decision
- **THEN** it presents two or three concrete options
- **AND** it identifies the recommended option and relevant tradeoff

### Requirement: Apply completes repository closeout by default

After every implementation task is complete, the generated apply Skill and command SHALL require relevant validation, necessary documentation updates, proposal archive, and a scoped Git commit unless the user explicitly limits scope, repository policy forbids an action, or a blocker prevents completion.

#### Scenario: All tasks are complete and no closeout blocker exists

- **WHEN** all tracked tasks have objective completion evidence
- **THEN** the agent runs relevant validation
- **AND** updates necessary documentation
- **AND** archives the completed change
- **AND** creates a scoped Git commit that preserves unrelated worktree changes

#### Scenario: Closeout is blocked or excluded

- **WHEN** repository policy, user scope, validation failure, or missing authorization prevents a closeout action
- **THEN** the agent stops that action
- **AND** reports the specific blocker and concrete next options
