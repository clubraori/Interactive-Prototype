# PlanningDoc07Jul2026_SiteVersion2.0

Planning document based on Ravin and Nick's 29 June 2026 meeting notes.

Note: the Granola URL was not accessible to Codex from this environment because it returned `403 Forbidden`, so this plan uses the pasted meeting notes as the source of truth.

## Purpose

This document is the pre-build plan for SiteVersion2.0. It should stay in the repo as a dated historical planning artifact so Ravin, Nick, and future Codex sessions can understand why the site changed.

No future implementation cycle should overwrite this file. Instead, create a new planning document using the same naming convention:

```text
PlanningDocDDMonYYYY_SiteVersionX.Y.md
```

Example:

```text
PlanningDoc14Jul2026_SiteVersion2.1.md
```

## Key Interpretation

The mission statement variables have changed from four categories to three.

The merged column is **What + How**, not Why + How.

New variable structure:

- **What + How**: the capability, practice, method, or lens Alchemy specializes in.
- **Who**: the audience, partner, client, community, or context.
- **Why**: the intended outcome, kept short for scannability.

The old separate **How** category should not remain as a fourth box or phrase in the mission statement.

## Mission Statement V2

Opening language from the notes:

```text
An assembly of creative producers specializing in...
```

Implemented SiteVersion2.0 sentence template:

```text
An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].
```

Reasoning:

- "Assembly" implies gathering, action, and flexibility without making the group feel fixed.
- "Specializing in" naturally absorbs the merged What + How variable.
- "Working toward" can hold short Why phrases that are noun-like, such as "deeper audience engagement" or "public cultural connection."
- The sentence avoids a fourth phrase, keeping the interaction cleaner and closer to the agreed structure.

### Variable Guidance

**What + How examples**

- participatory cultural strategy
- creative producing frameworks
- public-facing narrative systems
- curatorial facilitation
- workshops and situated activations
- emerging technology translation
- interdisciplinary creative practice

**Who examples**

- public-facing arts organizations
- creative communities
- academic institutions
- cultural institutions
- artists and creatives
- community organizations
- cultural conveners

**Why examples**

Keep these to roughly three to five words.

- deeper audience engagement
- public cultural connection
- equitable creative access
- shared creative momentum
- legible emerging worlds
- stronger collective imagination

### Yellow And Orange Flags

Phrases to revisit before locking the content:

- "innovation institutions" may feel abstract.
- "cultural conveners" may need clearer definition.
- "facilitation" is useful but too generic alone.
- "Foster sustainable practices" may accidentally imply a climate/sustainability organization.
- "Equalize access to creative capital" is conceptually interesting but may need clearer wording.

## Home Page Plan

The home page should keep the current polished interactive direction, but simplify the mission statement layer.

Planned changes:

- Replace the current four-variable mission structure with the three-variable V2 structure.
- Remove the extra supporting text currently sitting below the mission statement.
- Keep the background interaction as the primary discovery mechanic.
- Keep the sticky note/node as a movable process object, but do not make it load-bearing.
- Use placeholder copy only where secondary information is needed.
- Preserve the clean, slick visual field with the sticky note as a deliberate contrast.

Home page wireframe:

```text
[Top navigation]
Alchemy / About / Lenses / Works / Contact

[Primary interactive field]
Background media with cursor-driven visual layers.

[Mission statement]
An assembly of creative producers specializing in [WHAT + HOW]
for [WHO], working toward [WHY].

[Node / sticky note]
Movable menu or perspective layer.
Role still open: menu, assistive layer, overlay, or personal/shared perspective.
```

## Site Map

Agreed pages for SiteVersion2.0:

- Home
- About
- Lenses
- Works
- Contact

Deferred:

- Community

The Community idea should stay in the planning language, but it does not need to be a top-level page yet. It may later become events, activations, mailing list, or collaborator network infrastructure.

## Page Wireframes

### About

Purpose:

Explain who Alchemy is as a collection of humans, not only as a studio or service provider.

Wireframe:

```text
[Intro]
Longer "who we are" statement.

[People]
Ravin
Nick
Links to individual sites.

[Collaborator layer]
Recurring collaborators / network / family members.
Placeholder copy acceptable for now.

[Year One invitation]
Short placeholder section explaining the future invitation to prospective members.
```

Notes:

- This page should help the collective model feel transparent.
- It should make room for recurring collaborators without overstating the structure too early.
- The "Alchemy" name may change, so avoid over-investing in final brand language here for now.

### Lenses

Purpose:

Frame capabilities as ways of seeing creative challenges, not as a conventional services page.

Wireframe:

```text
[Intro]
Alchemy works through lenses: different ways of reading, shaping, and activating creative problems.

[Lens list]
Five lens modules, each with:
- title
- one-line definition
- placeholder paragraph
- optional example context
```

Possible lenses:

- Creative Producing
- Public Engagement
- Narrative Systems
- Curatorial Strategy
- Emerging Technology + Culture

Notes:

- Each lens should be broad enough to invite interpretation.
- Each lens should still be specific enough to feel legible.
- Lorem ipsum can be used temporarily below the one-line definitions.

### Works

Purpose:

Create trust by showing polish, identity, and proof of prior work without requiring deep case studies yet.

Wireframe:

```text
[Intro]
Lightweight portfolio framing.

[Work grid]
Project cards for selected work.

[Lightbox]
Clicking a project opens image/title/context.
No deep case-study pages required yet.
```

Initial examples from notes:

- Digital Futures
- Bond

Notes:

- These should be framed as projects where Ravin and Nick came together as Alchemy.
- The page should feel polished and verifiable, even if the content remains lightweight.

### Contact

Purpose:

Give visitors two clear routes into conversation.

Wireframe:

```text
[Intro]
Simple contact invitation.

[Path 1]
Interested in the collective.

[Path 2]
Interested in a project.

[Contact details]
Email / form / external link placeholder.
```

Notes:

- Keep this page simple.
- The two-path structure should make it easy to distinguish collaborators from clients or project partners.

### Community Deferred

Purpose:

Hold the idea for later without forcing a page before the activity exists.

Possible future forms:

- mailing list
- early preview circle
- events and activations
- producer cohort network
- collaborator family page

Near-term action:

Define the "Year One invitation" before or around launch.

## Node / Sticky Note Open Question

The node's role is still unresolved.

Options discussed:

- menu
- overlay
- assistive layer
- Clippy-like guide
- surface-level reveal
- shared perspective beneath the content
- personal process object

Planning recommendation:

For the next wireframe, keep the node as a movable navigation/perspective object. Do not make it required for understanding the site. Revisit its role after the full page map exists.

## Name And Identity Action Item

Ravin and Nick should revisit the name "Alchemy" before the visual identity is pushed much further.

Current position:

- Neither person is strongly attached to the name.
- This is the right moment to change it if it is going to change.
- Any new name should retain the same essence and work with the existing visual direction.

Visual direction for now:

- clean
- slick
- polished
- interactive
- media-forward
- sticky-note/process layer as juxtaposition

Do not over-build a final brand system until the naming question has been revisited.

## Implementation Sequence

1. Update the mission statement data model from four variables to three:
   `whatHow`, `who`, `why`.
2. Replace the current sentence template with:
   `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
3. Remove the extra supporting text beneath the home mission statement.
4. Add route/page scaffolding for:
   About, Lenses, Works, Contact.
5. Fill pages with the wireframe content above, using lorem ipsum where final text is not ready.
6. Keep Community out of the main navigation for now.
7. Keep the sticky note/node present but non-essential.
8. Run typecheck and build.
9. Review locally before pushing live.

## Open Questions For Next Review

- Is the proposed mission sentence exactly right, or should "working toward" become another phrase?
- Should Works or Portfolio be the navigation label?
- What are the final five Lenses?
- Which specific projects should appear in Works beyond Digital Futures and Bond?
- Should the sticky note behave as navigation, guide, or ambient process object in the next wireframe?
- Should the name Alchemy be revisited before the next visual polish pass?
