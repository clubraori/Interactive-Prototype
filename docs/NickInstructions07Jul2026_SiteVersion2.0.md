# NickInstructions07Jul2026_SiteVersion2.0

These notes are for Nick to work with the SiteVersion2.0 build and the planning-document workflow in Codex.

## Repo

```text
https://github.com/clubraori/Interactive-Prototype.git
```

Default branch:

```text
master
```

## Planning Doc Workflow

The planning document for this build is:

```text
docs/PlanningDoc07Jul2026_SiteVersion2.0.md
```

Use it as the shared brief before changing the site.

Future planning docs should stay in `docs/` and follow this naming pattern:

```text
PlanningDocDDMonYYYY_SiteVersionX.Y.md
```

Examples:

```text
PlanningDoc14Jul2026_SiteVersion2.1.md
PlanningDoc21Jul2026_SiteVersion3.0.md
```

Do not overwrite old planning docs. They are the site history.

## How To Work With The Planning Doc In Codex

Suggested Codex prompt:

```text
Please read docs/PlanningDoc07Jul2026_SiteVersion2.0.md and summarize the intended changes before editing code. Do not change code until you have identified which section of the plan you are working from.
```

For follow-up edits, use targeted prompts like:

```text
Please use the Lenses section of docs/PlanningDoc07Jul2026_SiteVersion2.0.md and propose refinements to the five lens titles before making code changes.
```

or:

```text
Please update only the mission statement variables from docs/PlanningDoc07Jul2026_SiteVersion2.0.md. Keep the rest of the site unchanged.
```

## Running The New Site Locally

From the repo root:

```bash
pnpm install
pnpm --filter @workspace/alchemy-unlimited run dev
```

Open the localhost URL printed by Vite, usually:

```text
http://localhost:5173/
```

If that port is already busy, Vite may use another port. Use the URL printed in Terminal.

## What To Review In SiteVersion2.0

Pages:

- Home
- About
- Lenses
- Works
- Contact

Mission statement structure:

```text
An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].
```

Key review questions:

- Does the merged What + How variable feel right?
- Are the Why phrases short and legible enough?
- Should the navigation label be Works or Portfolio?
- Does the sticky note feel useful as a navigation/perspective layer?
- Which Works projects should be real before launch?
- Should "Alchemy" remain the name?

## Making Changes

Before editing:

```bash
git checkout master
git pull origin master
git status
```

After editing:

```bash
pnpm --filter @workspace/alchemy-unlimited run typecheck
pnpm --filter @workspace/alchemy-unlimited run build
git status
```

If everything looks right:

```bash
git add .
git commit -m "Describe the change"
git push origin master
```

If Terminal authentication fails, use GitHub Desktop to commit and push.
