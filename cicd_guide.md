# CI/CD Guide

This repository uses a GitHub Actions workflow at `.github/workflows/main.yml` that performs verification and deploys to Vercel.

## What the workflow does

- `verify` job (runs on push and PRs targeting `main`) performs:
  - `npm ci`
  - `npm run typecheck` (repo script: runs `tsc --noEmit`)
  - `npm run build` (Next.js build)
- `deploy-preview` (runs after `verify` for pull requests) - deploys to Vercel preview using the GitHub Action `vercel/action`.
- `deploy-production` (runs after `verify` on pushes to `main`) - deploys to Vercel with `--prod`.

## Required repository secrets

Add the following GitHub repository secrets (Settings → Secrets → Actions):

- `VERCEL_TOKEN` — a personal token generated in your Vercel account (Team or Personal) with deployment permissions.
- `VERCEL_ORG_ID` — your Vercel organization or team ID.
- `VERCEL_PROJECT_ID` — the Vercel project ID for this repository.

If you don't have these values, get them from Vercel (Project Settings → General / Tokens).

## Local verification (before pushing)

Run these locally to mirror what CI will do:

```powershell
npm ci
npm run typecheck
npm run build
```

If `npm run build` succeeds, Vercel deploys should also succeed when the action runs (assuming secrets are configured).

## Notes & recommendations

- The workflow intentionally omits a test step because this repository currently has no test runner configured. Add a test job to the workflow once you introduce a runner (Jest, Vitest, Playwright).
- If you'd like PR preview URLs commented back to the PR, we can re-enable that step after confirming the official `vercel/action` outputs the preview URL (different action implementations expose different outputs).
- You can protect the `main` branch and require the `verify` job to pass before merging.

## How to change the action behavior

- To deploy previews without creating a comment on the PR, keep the `deploy-preview` job as-is.
- To change deploy arguments for production, edit the `vercel-args` input in `.github/workflows/main.yml` for the production deploy step.

If you want, I can also:
1. Add PR-commenting of preview URLs (I’ll detect and wire the correct output name from the official action).
2. Add a test job scaffold (Vitest/Jest) and update the workflow to run it.

---
Generated: May 11, 2026
