# Nick Start Here

Nick, the only thing you need to ask Codex is:

```text
Read NICK_START_HERE.md, set this repo up locally, run the site, and confirm I can push changes safely.
```

## What Codex Should Do First

1. Confirm this repo is connected to:
   `https://github.com/clubraori/Interactive-Prototype.git`
2. Confirm the branch is `master`.
3. Run:

```bash
pnpm install
pnpm run hooks:install
```

4. Start the main site:

```bash
pnpm --filter @workspace/alchemy-unlimited run dev
```

5. Tell Nick the localhost URL.

## The Push Guardrail

Before any push to `master`, Codex must create a new planning doc:

```bash
pnpm run planning:new
```

That creates a file like:

```text
docs/PlanningDoc07Jul2026_SiteVersion2.1.md
```

Codex should edit that planning doc first, then make the site changes, then commit the planning doc and the site changes together.

If Codex tries to push to `master` without a newly added planning doc, the repo blocks the push.

## Normal Change Workflow

```bash
git checkout master
git pull origin master
pnpm run planning:new
```

Then:

1. Fill in the new planning doc.
2. Make the site change.
3. Run the relevant check, usually:

```bash
pnpm --filter @workspace/alchemy-unlimited run typecheck
pnpm --filter @workspace/alchemy-unlimited run build
```

4. Commit and push:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin master
```

## If Push Fails

If the message says a planning doc is missing, run:

```bash
pnpm run planning:new
```

Then fill it in, commit it with the changes, and push again.

If the message is about GitHub authentication or permissions, use GitHub Desktop to sign in and push.
