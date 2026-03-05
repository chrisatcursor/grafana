# PR Reviewer Sub-agent Design (2026-02-27)

## Overview
The `pr-reviewer` sub-agent is a specialized assistant for evaluating GitHub Pull Requests. It focuses on identifying architectural issues, pattern violations, and potential bugs from the PR diff and metadata.

## Workflow
1. **Parse & Fetch**: Identify the PR URL or ID. Use `gh pr view` for metadata and `gh pr diff` to retrieve the code changes.
2. **Contextualize**: Fetch existing review comments and threads via the GitHub API to avoid redundant feedback.
3. **Analyze**: 
    - Check the diff against project-specific rules (e.g., `AGENTS.md` patterns for `pkg/` or `public/app/`).
    - Identify potential architectural issues, security vulnerabilities (using `security-scanner` if needed), and pattern violations.
4. **Synthesize**: Categorize findings by severity (Critical, Major, Minor, Nit) and map them to specific lines in the diff.

## Output Format
The agent will provide feedback in a structured, actionable format:

| Severity | File/Line | Issue | Recommendation |
| :--- | :--- | :--- | :--- |
| **Critical** | `pkg/api/handler.go:45` | Missing authorization check. | Add `authorize(context, ...)` before processing the request. |
| **Major** | `public/app/feature/UI.tsx` | Redundant state management. | Use the existing `useStyles2` hook instead of custom styles. |
| **Nit** | `pkg/util/helper.go:12` | Typo in comment. | Fix "recieved" to "received". |

## Guardrails
- **Static Only**: Do not check out branches or run local commands (this keeps the review fast and isolated).
- **Consensus First**: If a reviewer has already raised a point, do not duplicate it; instead, highlight it as "unresolved."
- **Focus**: Only review the files changed in the PR, not the entire codebase.
