# Nick Setup Guide

This document is for Nick, or for Nick's Codex agent, to get this project working in a local environment with GitHub pull and push access.

## Project Details

- Repository: `https://github.com/clubraori/Interactive-Prototype.git`
- Default branch: `master`
- Package manager: `pnpm`
- Main app folders: `artifacts/alchemy-unlimited` and `artifacts/manifesto`

## Outcome

Nick should be able to:

- clone the repository to his machine
- open the local folder in Codex
- run the site on a local host such as `http://localhost:5173/`
- pull from GitHub
- commit and push changes back to GitHub

## Important Notes

- Nick must already have GitHub access to the `clubraori/Interactive-Prototype` repository.
- If Nick can read the repo in the browser but cannot push, that is a GitHub permissions issue rather than a repo setup issue.
- If Terminal authentication is awkward, GitHub Desktop is the easiest way to handle pull and push.

## Recommended Setup Path

The easiest setup for Nick is:

1. Install Codex.
2. Install GitHub Desktop.
3. Sign into GitHub in GitHub Desktop.
4. Clone the repo locally using GitHub Desktop.
5. Open the cloned folder in Codex.
6. Ask Codex to verify Git, Node, `pnpm`, and local dev server setup.
7. Ask Codex to verify pull and push access.

## Official Codex References

Use the current OpenAI Codex docs for product-specific setup because install flows can change:

- Codex docs: [developers.openai.com/codex](https://developers.openai.com/codex)
- Codex local environments: [developers.openai.com/codex/app/local-environments](https://developers.openai.com/codex/app/local-environments)
- Codex GitHub integration docs: [developers.openai.com/codex/integrations/github](https://developers.openai.com/codex/integrations/github)

Based on the current OpenAI docs, Codex supports local environments and stores shared project configuration in a `.codex` folder at the project root, which can be checked into the repo and shared with collaborators.

## Step 1: Confirm GitHub Access

Before anything else, Nick should sign into GitHub in the browser and confirm he can open:

`https://github.com/clubraori/Interactive-Prototype`

If that page does not load, he needs repo or org access before moving on.

## Step 2: Install the Required Tools

Nick needs:

- Codex
- GitHub Desktop or Git in Terminal
- Node.js
- `pnpm`

### macOS tooling install

If Nick uses Homebrew:

```bash
brew install node
brew install pnpm
```

### Verify the tools

```bash
node -v
pnpm -v
git --version
```

## Step 3: Clone the Repo Locally

### Option A: GitHub Desktop

1. Open GitHub Desktop.
2. Sign into the correct GitHub account.
3. Choose `File` -> `Clone Repository`.
4. Choose the `URL` tab.
5. Paste:

```text
https://github.com/clubraori/Interactive-Prototype.git
```

6. Pick a local folder.
7. Clone the repository.

### Option B: Terminal

```bash
git clone https://github.com/clubraori/Interactive-Prototype.git
cd Interactive-Prototype
git checkout master
git pull origin master
```

## Step 4: Open the Repo in Codex

Once the repo is cloned, Nick should open the local `Interactive-Prototype` folder in Codex.

That gives Codex direct access to:

- the full codebase
- the local shell
- the local dependency install
- the local Vite development server

## Step 5: Install Dependencies

From the repo root:

```bash
pnpm install
```

## Step 6: Run a Local Host

This project uses Vite, so the local development server should run on a localhost URL.

### Main local run command for `alchemy-unlimited`

```bash
pnpm --filter @workspace/alchemy-unlimited run dev
```

### Alternate local run command for `manifesto`

```bash
pnpm --filter @workspace/manifesto run dev
```

Expected result:

- Vite starts successfully
- Codex or Terminal prints a URL such as `http://localhost:5173/`
- Nick opens that URL in his browser to review the site locally

To stop the local host:

- press `Ctrl+C` in the terminal that is running the Vite dev server

## Step 7: Verify Pull and Push Access

Nick should verify GitHub sync works from his machine.

### Verify pull

```bash
git checkout master
git pull origin master
```

### Verify push

The safest check is:

1. Create a tiny non-destructive edit, or let Codex make a harmless documentation change.
2. Commit it.
3. Push it.

Commands:

```bash
git status
git add .
git commit -m "Test local GitHub push access"
git push origin master
```

If Nick prefers not to authenticate in Terminal, he should do the commit and push in GitHub Desktop instead.

## Step 8: Daily Local Workflow

Normal flow:

```bash
git checkout master
git pull origin master
pnpm install
pnpm --filter @workspace/alchemy-unlimited run dev
```

When finished with a change:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin master
```

## Prompts Nick Can Give to Codex

These are copy-paste prompts Nick can use directly.

### Prompt 1: Initial setup

```text
This repo should connect to GitHub at https://github.com/clubraori/Interactive-Prototype.git. Please inspect the repo, verify the git remote, verify the current branch, confirm Node, pnpm, and git are installed, install dependencies, and tell me whether this machine is ready for local development.
```

### Prompt 2: Start the local site

```text
Please run the main site locally for this repo, using the correct pnpm workspace command, and tell me the localhost URL I should open in my browser.
```

### Prompt 3: Verify GitHub pull and push readiness

```text
Please verify that this local clone is set up correctly for pulling and pushing to GitHub. Check the remote, branch, git status, and whether authentication or permissions look like blockers. If push cannot be verified automatically, tell me exactly what I need to do in GitHub Desktop.
```

### Prompt 4: Prepare a safe first change

```text
Please make a tiny safe documentation-only change, show me what changed, and prepare it so I can commit and push it as a test of my GitHub workflow.
```

### Prompt 5: Get the project ready for work

```text
Please get this project ready for local work: install dependencies, run the main app on localhost, explain which app package is the primary one, and summarize the usual pull-edit-commit-push workflow for me.
```

## What Nick's Codex Agent Should Check

Nick's Codex agent should:

1. Confirm the repo opens locally.
2. Confirm `origin` matches `https://github.com/clubraori/Interactive-Prototype.git`.
3. Confirm the active branch is correct.
4. Confirm `node`, `pnpm`, and `git` are installed.
5. Run `pnpm install`.
6. Start the main app locally with a `pnpm --filter ... run dev` command.
7. Report the localhost URL.
8. Verify whether pull works.
9. Verify whether push is blocked by permissions or authentication.
10. Explain whether GitHub Desktop should be used for authentication on that machine.

## Quick Verification Commands

```bash
git remote -v
git branch --show-current
git pull origin master
node -v
pnpm -v
pnpm install
pnpm --filter @workspace/alchemy-unlimited run build
pnpm --filter @workspace/alchemy-unlimited run dev
```

## If Something Fails

- If clone fails: check GitHub login and repo access.
- If pull fails: check Nick is signed into the correct GitHub account.
- If push fails: check Nick has write access, or switch to GitHub Desktop for authentication.
- If `pnpm` fails: reinstall Node and `pnpm`.
- If the local host fails: run `pnpm install` again and confirm commands are being run from the repo root.
