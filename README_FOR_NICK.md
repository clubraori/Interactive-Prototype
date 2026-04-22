# Nick Onboarding

This file is meant to be shared directly with Nick.

If you are Nick, the goal is simple:

- get the repo onto your machine
- open it in Codex
- run it on localhost
- make sure you can pull from and push to GitHub

## Repo

- GitHub repo: `https://github.com/clubraori/Interactive-Prototype.git`
- Default branch: `master`

## What To Install

Install these first:

- Codex
- GitHub Desktop
- Node.js
- `pnpm`

Official Codex references:

- Codex docs: [https://developers.openai.com/codex](https://developers.openai.com/codex)
- Codex local environments: [https://developers.openai.com/codex/app/local-environments](https://developers.openai.com/codex/app/local-environments)
- Codex GitHub integration: [https://developers.openai.com/codex/integrations/github](https://developers.openai.com/codex/integrations/github)

## Recommended Setup

Use GitHub Desktop for GitHub authentication if Terminal auth is annoying.

1. Sign into GitHub Desktop.
2. Clone:

```text
https://github.com/clubraori/Interactive-Prototype.git
```

3. Open the cloned folder in Codex.
4. Ask Codex to verify the environment and run the app locally.

## Tooling Install

If needed on macOS:

```bash
brew install node
brew install pnpm
```

Then verify:

```bash
node -v
pnpm -v
git --version
```

## Run The Site Locally

From the repo root:

```bash
pnpm install
pnpm --filter @workspace/alchemy-unlimited run dev
```

Expected result:

- a local URL such as `http://localhost:5173/`
- the site opens in your browser

## Pull And Push

Pull latest changes:

```bash
git checkout master
git pull origin master
```

Push changes:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin master
```

If push fails in Terminal, use GitHub Desktop for commit and push.

## Prompts For Codex

### Setup prompt

```text
Please inspect this repo, verify the GitHub remote, confirm the current branch, confirm node, pnpm, and git are installed, install dependencies, and tell me if this machine is ready for local development.
```

### Localhost prompt

```text
Please run the main site locally for this repo and tell me the localhost URL I should open.
```

### GitHub readiness prompt

```text
Please verify whether this repo is correctly set up for pull and push access on this machine. If there is an authentication issue, tell me exactly whether I should use GitHub Desktop or another GitHub login flow.
```

### Safe first task prompt

```text
Please make a tiny safe documentation-only change, explain it, and prepare it so I can test commit and push.
```

## Main Rule

If GitHub push is blocked, that is usually:

- a GitHub permissions issue
- or a local authentication issue

It is usually not a codebase issue.

## More Detailed Guide

See [`docs/NICK_SETUP.md`](/Users/ravinraori/Desktop/club%20Raori/Work/Art/Alchemy/Website%202026/Interactive-Prototype/docs/NICK_SETUP.md) for the full version.
