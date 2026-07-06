# AGENTS.md

This repository contains onboarding instructions for collaborators and for Codex agents helping them.

## First Step

Before doing any setup or code changes, read these files:

- `NICK_START_HERE.md`
- `README_FOR_NICK.md`
- `docs/NICK_SETUP.md`

## Purpose

If you are a Codex agent opening this repo for Nick, your first job is not to change the code. Your first job is to make sure the local environment is ready for work.

## What To Do First

1. Confirm the local repo opens correctly.
2. Confirm the Git remote is:
   `https://github.com/clubraori/Interactive-Prototype.git`
3. Confirm the current branch.
4. Confirm `git`, `node`, and `pnpm` are installed.
5. Run `pnpm install` from the repo root if dependencies are not installed.
6. Start the main local site with:
   `pnpm --filter @workspace/alchemy-unlimited run dev`
7. Report the localhost URL to the user.
8. Verify whether pull and push access to GitHub are working.
9. If push fails, explain whether the blocker is authentication or permissions.
10. Recommend GitHub Desktop if local Terminal auth is the blocker.

## Local Development

Primary local run command:

```bash
pnpm --filter @workspace/alchemy-unlimited run dev
```

Alternate local run command:

```bash
pnpm --filter @workspace/manifesto run dev
```

Expected local host:

`http://localhost:5173/`

## Git Workflow

Default branch:

`master`

Common commands:

```bash
git checkout master
git pull origin master
pnpm install
pnpm --filter @workspace/alchemy-unlimited run dev
```

When committing:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin master
```

## Planning Doc Guardrail

Before pushing any change to `master`, create and commit a new planning doc:

```bash
pnpm run planning:new
```

The repo's pre-push hook blocks pushes to `master` and `main` unless the push includes a newly added file matching:

```text
docs/PlanningDocDDMonYYYY_SiteVersionX.Y.md
```

Commit the planning doc together with the site change it describes.

## Important

- Do not assume GitHub push access is available until it is verified.
- If clone, pull, or push fails, check the setup docs before changing code.
- Prefer safe setup verification before editing the project.
