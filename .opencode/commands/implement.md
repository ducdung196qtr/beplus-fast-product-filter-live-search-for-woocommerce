---
description: Full agent pipeline — plan, build, review, and QA in sequence
subtask: true
---

## Agent Pipeline: Implement

Run the following pipeline **in order** using the Task tool to invoke each subagent. Pass the output of each stage as input to the next. Do NOT skip or reorder stages.

### Stage 1 — Plan (`@planner`)

Invoke the `planner` subagent to analyze the task and produce a detailed implementation plan. Give it:

```
Analyze the following task and create a detailed implementation plan:

$ARGUMENTS
```

Read the planner's response and use it as the plan for the next stage.

### Stage 2 — Build (`@builder`)

Invoke the `builder` subagent with the plan from Stage 1. Give it:

```
Here is the implementation plan. Execute every step in order:

[PLAN FROM STAGE 1]

Do NOT skip any steps. After implementing, run the build and any relevant lint checks.
```

Wait for the builder to complete and note any issues it reports.

### Stage 3 — Review (`@reviewer`)

Invoke the `reviewer` subagent to review the changes from Stage 2. Give it:

```
Review all changes made by the previous implementation step. Check for:
- Correctness, edge cases
- Security (escaping, nonces)
- Style and project conventions
- Accessibility (WCAG 2.1 AA)
- Performance

[BUILDER'S SUMMARY FROM STAGE 2]
```

### Stage 4 — QA (`@qa`)

Invoke the `qa` subagent to run all quality gates. Give it:

```
Run all quality gates in order (typecheck, build, lint:php:all, composer test).
```

### Final Report

After all 4 stages complete, summarize:
- What was planned
- What was built
- Review findings (critical issues / warnings)
- QA gate results (pass/fail per gate)

If any stage fails, note it and do not proceed to the next stage without the user's approval.
