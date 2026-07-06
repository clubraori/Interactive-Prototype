# PlanningDoc07Jul2026_SiteVersion2.1

## Purpose

Make Nick's onboarding simpler and add repo guardrails that require a fresh planning doc before any push to `master`.

## Source Notes

- Ravin wants Nick's only instruction to be: open the repo and ask his Codex agent to read one specific file.
- Ravin wants the planning-doc habit built into the repo rather than relying on memory.
- Each future site cycle should create a dated planning doc using the existing naming convention:
  `PlanningDocDDMonYYYY_SiteVersionX.Y.md`.

## Planned Changes

- Add a simple `NICK_START_HERE.md` file at the repo root.
- Add a planning-doc generator command: `pnpm run planning:new`.
- Add a repo-managed pre-push hook that blocks pushes to `master` or `main` unless the push includes a newly added planning doc.
- Update collaborator/agent instructions to point to the simpler workflow.

## Mission Statement Changes

- No mission statement changes in this cycle.
- Current SiteVersion2.0 structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`

## Page And Wireframe Changes

- Home: no visual change.
- About: no visual change.
- Lenses: no visual change.
- Works: no visual change.
- Contact: no visual change.

## Files Likely To Change

- `NICK_START_HERE.md`
- `AGENTS.md`
- `README_FOR_NICK.md`
- `package.json`
- `.githooks/pre-push`
- `scripts/check-planning-doc-before-push.mjs`
- `scripts/create-planning-doc.mjs`

## Checks Before Push

- Run the planning-doc check against the new commit range.
- Run the planning-doc generator once to confirm it creates the expected filename.
- Run typecheck for the workspace.
- Confirm this planning doc is committed with the guardrail changes.

## Open Questions

- Whether to add GitHub branch protection or a workflow validation later so GitHub can also reject unplanned changes server-side.
- Whether planning docs should always map to site versions, or whether process-only changes should use a separate version track later.
