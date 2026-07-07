# Editorial Typography Scale

Use this guide before making editorial or statement-style type changes on the Alchemy site.

## Principles

- Use one clear left edge by default. Centering, staggered indents, and locked anchor words need an explicit design reason.
- Keep one type size inside a single editorial sentence unless hierarchy is intentional.
- Let spacing come from one rhythm system, not individual line tweaks.
- Avoid masking text to solve layout problems. The words should occupy real space and should not overlap.
- Test the longest real variable values, not only the current visible phrase.

## Type Tokens

| Token | Size | Weight | Leading | Use |
| --- | --- | --- | --- | --- |
| Editorial display | 30-38px desktop, fit down on mobile | 600 | 1.02-1.08 | Large statement moments and page-leading editorial text |
| Editorial statement | 22-32px measured fit | 600 base, 700 highlight | 1.04-1.12 | Interactive mission statements and variable sentence systems |
| Editorial label | 11-12px | 600 | 1.2-1.4 | Uppercase labels such as `MISSION` and sticky-note section labels |
| Body | 16-18px | 400 | 1.55-1.7 | Paragraph copy and page body text |
| Note / caption | 13-14px | 400-500 | 1.45-1.6 | Secondary notes, captions, and interface helper text |

Avoid viewport-width font sizing for editorial text. Use measured fit, breakpoints, or container-aware sizing instead.

## Layout Checklist

- Legibility: verify desktop and mobile text can be read without squinting, clipping, or accidental compression.
- Contrast: target WCAG AA contrast, using at least 4.5:1 for normal text and 3:1 for large text. Text over media needs enough overlay strength to stay readable.
- Rhythm: use one line-height and one line-gap per editorial unit.
- Alignment: confirm all intended lines share the same left edge unless a deliberate grid exception is documented.
- Orphans: avoid one-word or visibly stranded final lines. If a phrase causes a straggler, adjust copy, line structure, or measured fit.
- Highlights: variable text can use a color or stronger weight, but the size should remain consistent with the surrounding sentence.
- Motion: typewriter or interactive text should reserve space for the longest value so the layout does not jump.
- Verification: inspect at least one narrow mobile viewport and one desktop viewport before pushing.

## Current Mission Rule

The homepage mission statement uses a five-line editorial structure:

1. `An assembly of creative producers specializing in`
2. `[WHAT + HOW]`
3. `for`
4. `[WHO],`
5. `working toward [WHY].`

All five lines should stay left-aligned, share one measured type size, and use one vertical gap. The word `for` is isolated as its own static line so it remains legible without awkward phrase spacing on either side.

## References

- Material Design typography guidance: https://m3.material.io/styles/typography/overview
- IBM Carbon typography guidance: https://carbondesignsystem.com/elements/typography/overview/
- W3C WCAG contrast minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- USWDS typography guidance: https://designsystem.digital.gov/components/typography/
