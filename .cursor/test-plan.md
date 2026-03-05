# Demo Test Plan

Run through each test in order. Each one validates a specific piece of the demo flow.
Mark pass/fail and note anything you want to tweak.

---

## Pre-flight

- [ ] Reset repo: `git reset --hard fork/cdiaz/unified-migration-status-reporter`
- [ ] Clear all agent panels (fresh conversations)
- [ ] Confirm agent-first layout is active
- [ ] Confirm `.cursor/agents/` has all 6 agents: api-designer, code-explorer, docs-updater, feature-flag-cleaner, security-scanner, test-writer
- [ ] Set model to your preferred default

---

## Test 1: Exploration with subagents (Act 1)

**Prompt (agent mode):**
> explore the unified storage migration system and what work is in progress

**What to verify:**
- [ ] Agent spawns at least one subagent (likely explore or code-explorer)
- [ ] Summary is returned to the parent agent
- [ ] Summary mentions the MigrationStatusReporter, MigrationRegistry, or migration definitions
- [ ] Total time: under 60 seconds

**Notes:**
_________________________________

---

## Test 2: Momentum prompt — ask mode (filler test)

**Switch to ask mode, then prompt:**
> what pattern do existing admin endpoints follow for authorization?

**What to verify:**
- [ ] Responds in under 15 seconds
- [ ] References `authorize()`, `ac.EvalPermission`, or the admin route group in `pkg/api/api.go`
- [ ] Does NOT try to edit any files (ask mode is read-only)

**Notes:**
_________________________________

---

## Test 3: Plan mode generates a multi-workstream plan (Act 2)

**Switch to plan mode (shift+tab), then prompt:**
> create a plan for adding an admin API endpoint to report unified storage migration status

**What to verify:**
- [ ] Plan has 3+ distinct workstreams (e.g., service layer, API endpoint, Wire DI, tests, docs)
- [ ] Plan references real files/packages in the codebase (not generic placeholders)
- [ ] Plan mentions auth/authorization for the endpoint
- [ ] Plan mentions running `make gen-go` for Wire
- [ ] You can review the plan and it makes sense — no hallucinated packages or wrong patterns

**Notes:**
_________________________________

---

## Test 4: Build from plan → subagents auto-spawn (Act 3 — THE BIG ONE)

**From the plan in Test 3, hit "Build" to switch to agent mode.**

**What to verify:**
- [ ] Agent begins executing the plan
- [ ] At least 2 custom subagents spawn automatically (check for: test-writer, api-designer, security-scanner, docs-updater)
- [ ] You did NOT prompt it to use specific subagents — it chose them based on descriptions
- [ ] Subagents complete and return results to the parent
- [ ] Code changes are made to the repo

**Which subagents fired?**
- [ ] test-writer
- [ ] api-designer
- [ ] security-scanner
- [ ] docs-updater
- [ ] code-explorer
- [ ] other: __________

**Notes:**
_________________________________

---

## Test 5: Explicit subagent invocation (fallback test)

**If Test 4 didn't auto-spawn enough subagents, test explicit invocation. New agent panel:**
> /security-scanner review the changes on this branch

**What to verify:**
- [ ] security-scanner subagent launches
- [ ] It runs in readonly mode (does not edit files)
- [ ] It produces a vulnerability report or "no issues found" summary
- [ ] It checks the admin endpoint for auth middleware

**Notes:**
_________________________________

---

## Test 6: Second momentum prompt (architecture)

**Ask mode:**
> trace the request flow from an admin API call to the database

**What to verify:**
- [ ] Responds in under 20 seconds
- [ ] Traces through: route registration → handler → service → db session
- [ ] Mentions specific files (api.go, admin.go, status.go)

**Notes:**
_________________________________

---

## Test 7: Review / find issues (Act 4)

**Open the diff panel (click "Review" on changes), then click "Find Issues".**

**What to verify:**
- [ ] Find issues runs without errors
- [ ] If issues are found, they have actionable descriptions
- [ ] If no issues, it completes cleanly (also a valid outcome)

**Notes:**
_________________________________

---

## Test 8: Create PR command (Act 5)

**New agent panel, type:**
> /create-pr

**What to verify:**
- [ ] Command triggers the create-pr workflow
- [ ] It checks git status, runs relevant checks
- [ ] It drafts a PR title and description
- [ ] It does NOT actually push (unless you want it to — you can cancel before push)

**Notes:**
_________________________________

---

## Test 9: Nested subagent (bonus — validates feature-flag-cleaner)

**New agent panel:**
> /feature-flag-cleaner clean up any stale feature flags related to unified storage migrations

**What to verify:**
- [ ] feature-flag-cleaner launches
- [ ] It spawns an explore subagent for usage discovery (nested subagent)
- [ ] It reports findings (even if no stale flags found — the workflow is what matters)

**Notes:**
_________________________________

---

## Test 10: Full cold run (timing test)

**Reset everything. Run Tests 1 → 4 → 7 → 8 back to back as you would in the demo.**

**What to verify:**
- [ ] Total wall clock time for the sequence: _______ minutes
- [ ] No test required manual intervention to recover from an error
- [ ] The narrative felt continuous (no long dead silences without something on screen)

**Notes:**
_________________________________

---

## Results summary

| Test | Pass/Fail | Key observation |
|------|-----------|-----------------|
| 1. Exploration | | |
| 2. Momentum (ask) | | |
| 3. Plan mode | | |
| 4. Auto subagents | | |
| 5. Explicit invoke | | |
| 6. Momentum (arch) | | |
| 7. Find issues | | |
| 8. Create PR | | |
| 9. Nested subagent | | |
| 10. Full cold run | | |

## What to tune after testing

- Subagents that didn't auto-fire → strengthen their `description` with more trigger phrases
- Prompts that took too long → simplify or switch to a different momentum prompt
- Plan that missed a workstream → adjust the plan prompt to hint at scope
- Timing off → identify which act to cut or compress
