# PlanningDoc07Jul2026_SiteVersion2.10

## Purpose

Resolve the remaining mission typography awkwardness by moving the anchor word `for` onto its own line, using one consistent left edge, and adding a reusable editorial typography scale for future text-layout work.

## Source Notes

- Ravin reviewed SiteVersion2.9 and noted that line spacing still felt uneven, especially around the third and fourth lines.
- Phrase length variance still creates awkward gaps around `for` when `[WHAT + HOW] for [WHO]` has to share one line.
- The clearest next experiment is a five-line version where `for` becomes its own static line.
- The statement should feel like a normal editorial paragraph system: one size, one rhythm, one left edge, no accidental masks or word overlap.
- Future editorial work needs a reusable typography guardrail that checks legibility, contrast, spacing, indentation, and orphan/straggler lines before implementation.

## Planned Changes

- Change the mission block to a five-line structure.
- Put `for` on its own static line so it no longer competes with variable phrase lengths.
- Keep all mission lines left-aligned with one consistent type size and vertical rhythm.
- Increase the mission's maximum type size from the smaller cleanup pass, while keeping measured fit on narrow screens.
- Use one flex-column gap instead of per-line margin tweaks so spacing remains even.
- Add explicit small-screen width constraints so the measured fit uses the visible viewport width.
- Add `docs/EDITORIAL_TYPOGRAPHY_SCALE.md`.
- Update `AGENTS.md` so future editorial/text-layout changes must read and apply the typography scale first.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual structure becomes:
  1. `An assembly of creative producers specializing in`
  2. `[WHAT + HOW]`
  3. `for`
  4. `[WHO],`
  5. `working toward [WHY].`

## Page And Wireframe Changes

- Home: mission typography structure and editorial rhythm only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `AGENTS.md`
- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/EDITORIAL_TYPOGRAPHY_SCALE.md`
- `docs/PlanningDoc07Jul2026_SiteVersion2.10.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Visually inspect the mission at a narrow mobile viewport and desktop viewport.
- Confirm this new planning doc is committed with the mission typography cleanup.

## Open Questions

- Whether SiteVersion3.0 should make the typography scale into shared CSS tokens rather than documentation plus component constants.
- Whether future mission copy should be edited to keep all `[WHY]` values short enough for the fifth line without shrinking the whole statement too aggressively.
