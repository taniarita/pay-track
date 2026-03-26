---
name: implement-plan
description: Implements a phased plan from the ./plans/ directory, one phase at a time. Reads the plan file, identifies priorities and dependencies, explores the codebase, then executes incrementally — aligning with existing patterns. Use when user wants to implement a plan, execute a plan file, start working on a phase, or mentions "implement the plan" or references a file in ./plans/.
---

# Implement Plan

Execute a phased implementation plan from `./plans/`, one phase at a time.

## Process

### 1. Load the plan

Read the plan file specified by the user from `./plans/`. If no file is specified, list available plans and ask the user to choose.

Parse:
- Overall goal and architectural decisions
- All phases with their titles, dependencies, and acceptance criteria
- Phase order and any explicit priority markers

### 2. Identify the current phase

Start from the highest-priority incomplete phase. A phase is incomplete if any acceptance criteria are unchecked.

- Never skip phases unless the user explicitly instructs it
- Respect dependencies: do not start a phase if a prerequisite phase is incomplete
- If all phases are complete, report that the plan is fully implemented

### 3. Explore the codebase

Before writing any code, explore the relevant parts of the codebase:

- Identify files, modules, and patterns related to this phase
- Understand the existing architecture and conventions
- Note integration points that this phase will touch

Align your implementation approach with what already exists. Do not introduce new patterns when existing ones are sufficient.

### 4. Plan the steps

Break the current phase into a short ordered list of actionable steps. Present this list to the user before executing, unless the phase is straightforward.

Ask a targeted question only if a critical ambiguity would block safe implementation. Skip questions when a reasonable assumption can be made.

### 5. Execute incrementally

Implement one step at a time:

- Make the change
- Verify it is coherent (compiles, tests pass, no regressions if testable)
- Confirm it aligns with the phase's acceptance criteria
- Move to the next step

Do not implement the entire phase or plan in a single pass unless it contains only one step.

### 6. Update acceptance criteria

After each criterion is met, mark it as complete in the plan file:

```diff
- - [ ] Criterion
+ - [x] Criterion
```

### 7. Phase completion

When all criteria for the current phase are checked:

- Summarize what was built
- Suggest a commit message for the user to use (do not run `git commit` or any git write command)
- Ask the user whether to proceed to the next phase or pause

**Suggested commit message format:**

```
<type>(<scope>): <short description>

<optional body summarizing what changed and why>
```

## Behavior rules

- One phase at a time — do not jump ahead
- Prefer existing codebase patterns over new ones
- Do not assume unclear requirements are safe to guess — ask once, then proceed
- Keep explanations concise: what is being implemented and why, not a full narrative
- If a step fails or produces unexpected results, stop and surface the issue rather than working around it silently
- **Never create git commits.** The user reviews and commits changes manually after each phase. At phase completion, suggest a commit message but do not run any git write commands.

## Output format per step

```
**Phase N – <Title> | Step X of Y**
<What is being changed and why>
[tool calls]
<Result or next action>
```
