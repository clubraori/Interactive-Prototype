# PlanningDoc07Jul2026_SiteVersion2.2

## Purpose

Refine the home mission sentence so the fixed words act as stable visual anchors while the variable phrases continue to animate around them.

## Source Notes

- Ravin noticed the spacing between the What + How variable and `for` can visually collapse during typing.
- Ravin wants `for` to stay spatially locked while the text to the left and right can change.
- Ravin also wants `working toward` to stay spatially locked, with a paragraph break before and after it.
- Replace the `Live statement` label with a simpler `Mission` label.

## Planned Changes

- Change the mission sentence layout from one flowing inline sentence to anchored lines.
- Keep `for` in the first sentence line, fixed between the What + How and Who phrases.
- Put `working toward` on its own line with spacing above and below.
- Keep the Why variable on its own line beneath `working toward`.
- Change the small section label from `Live statement` to `Mission`.

## Mission Statement Changes

- No variable-bank changes.
- No conceptual sentence change.
- Current sentence structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual layout changes to:
  - `An assembly of creative producers specializing in [WHAT + HOW]` / `for` / `[WHO]`
  - `working toward`
  - `[WHY]`

## Page And Wireframe Changes

- Home: refine mission label and mission typography/layout.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.2.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the layout change.

## Open Questions

- Does `Mission` feel like the right label, or should it become even quieter later?
- Should the fixed anchor line use `working toward` or `working towards` in the final copy?
