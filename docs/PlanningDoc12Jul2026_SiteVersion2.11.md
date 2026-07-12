# PlanningDoc12Jul2026_SiteVersion2.11

## Purpose

Test a quieter editorial background treatment for the homepage by replacing the full-bleed video with sparse cropped footage fragments and more negative space around the mission statement.

## Source Notes

- Ravin wants the footage to behave less like a full-bleed background and more like editorial image fragments.
- Only one fragment should appear at a time, using three different shapes: square, horizontal rectangle, and vertical rectangle.
- Fragments should pop up for a few seconds in different parts of the screen.
- The footage should be desaturated and secondary so the mission statement remains the focus.
- Crops should favor portions of the placeholder footage without visible text.

## Planned Changes

- Remove the current full-screen video layer and clarity-wipe treatment from the homepage background.
- Add an editorial media-fragment layer that cycles through three cropped video fragments.
- Use three fragment formats: square, horizontal rectangle, and vertical rectangle.
- Desaturate, dim, and soften the video fragments so they sit behind the mission without competing.
- Preserve the existing cursor-driven mission word changes, accent color changes, and sticky-note behavior.
- Keep a dark negative-space field with subtle texture/rhythm so the page does not feel empty.

## Mission Statement Changes

- No mission sentence or variable-bank changes.
- Current structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`

## Page And Wireframe Changes

- Home: replace full-bleed footage with sparse editorial fragments.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `artifacts/alchemy-unlimited/src/index.css`
- `docs/PlanningDoc12Jul2026_SiteVersion2.11.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Verify a local desktop screenshot and a narrow mobile screenshot.
- Confirm only one media fragment is visible at a time.
- Confirm the new planning doc is committed with the site change.

## Open Questions

- Whether the fragment timings, positions, and crop choices should later be content-directed once final footage replaces this placeholder.
- Whether SiteVersion3 should convert the media fragments into reusable data/content configuration rather than hard-coded homepage constants.
