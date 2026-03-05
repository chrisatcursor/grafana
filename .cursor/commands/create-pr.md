---
description: Create a well-structured pull request for the current branch. Runs checks, writes a clear description, and opens the PR via GitHub CLI.
---

# Create a Pull Request

Help me create a clean, well-documented pull request for my current branch. Follow these steps carefully.

## Step 1: Pre-Flight Checks

Before creating the PR, verify the branch is in good shape:

1. **Check for uncommitted changes** — run `git status`. If there are unstaged changes, ask me if I want to commit them first.
2. **Run linting** — execute `make lint-go` and `yarn lint` to catch issues before CI does. Fix any problems or flag them.
3. **Run relevant tests** — based on what files changed, run the appropriate test commands:
   - Go changes: `go test ./pkg/services/...` for affected packages
   - Frontend changes: `yarn test` for affected files
   - Both: run both
4. **TypeScript check** — if frontend files changed, run `yarn typecheck`.

## Step 2: Analyze the Changes

Review the full diff and commit history for this branch:

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
```

Understand the scope:
- Is this a **bug fix**, **new feature**, **refactor**, or **chore**?
- Which areas of the codebase are affected?
- Are there any breaking changes?

## Step 3: Write the PR Description

Draft a PR using this structure:

**Title**: A concise, descriptive title (not just the branch name). Use conventional format:
- `fix: resolve dashboard panel flickering on resize`
- `feat: add SAML SSO configuration UI`
- `chore: upgrade React to v19`

**Body**:
```markdown
## What changed
<1-3 sentences explaining the change and why it's needed>

## How to test
<Steps a reviewer can follow to verify the change works>

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (or migration guide included)
```

## Step 4: Push and Create the PR

```bash
git push -u origin HEAD
gh pr create --title "<title>" --body "<body>"
```

Use a HEREDOC for the body to preserve formatting.

## Step 5: Post-Creation

After the PR is created:
- Share the PR URL with me
- Check if CI is running with `gh pr checks`
- If there are required reviewers or labels, let me know

## Guidelines

- **Keep PRs small** — under 400 lines of diff when possible. Large PRs are hard to review and slow to merge.
- **Separate frontend and backend** — if a change spans both, consider splitting into two PRs since they deploy at different cadences.
- **Don't mix concerns** — a PR should be either a feature, a bug fix, or a refactor, not all three.
- **Link issues** — if this addresses a GitHub issue, include `Closes #1234` in the description.
