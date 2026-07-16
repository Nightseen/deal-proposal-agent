---
target: plantilla_propuestas.html
total_score: 22
p0_count: 0
p1_count: 3
timestamp: 2026-07-16T18-51-11Z
slug: plantilla-propuestas-html
---
Method: dual-agent (A: general-purpose design-review sub-agent · B: general-purpose detector/browser sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Scroll-progress bar + reveal nav give good feedback; silent-fail on Telegram notify is acceptable by design |
| 2 | Match System / Real World | 3/4 | Nav link "Contacto" points to `#cierre`, whose actual heading is "Próximo paso" — label mismatch |
| 3 | User Control and Freedom | 3/4 | Anchor nav lets users jump freely; mostly n/a for a read-only page |
| 4 | Consistency and Standards | 4/4 | `.card`/`.scope-card__title` reused identically across sections; single-CTA rule strictly enforced |
| 5 | Error Prevention | n/a | No form inputs on this artifact |
| 6 | Recognition Rather Than Recall | 3/4 | Fixed nav only covers 4 of 9 sections (Visión, Exclusiones, Fases, Confianza have no jump link) |
| 7 | Flexibility and Efficiency | 3/4 | Anchor jumps serve skimming/returning readers well |
| 8 | Aesthetic and Minimalist Design | 3/4 | Investment card stacks glow + top edge + ROI line + payment band — several ornaments converging on one element |
| 9 | Error Recovery | n/a | No user-triggered error states on this page |
| 10 | Help and Documentation | n/a | Not applicable to a one-pager sales artifact |
| **Total (applicable)** | | **22/28** | 3 heuristics n/a (no forms, no errors, no help surface on a static one-pager) |

**Rating: Good** — solid foundation, two P1s to fix before the next batch of proposals ships.

## Anti-Patterns Verdict

**LLM assessment**: The template works unusually hard to avoid standard AI-slop tells — one enforced dominant accent, alternating section backgrounds, a hand-built icon sprite, real named ROI copy instead of filler, a bespoke timeline animation. It mostly succeeds. But the reveal-on-scroll + word-by-word hero title + circle-and-line timeline, stacked together, is exactly the animation vocabulary of a Bolt/v0/Lovable output — individually restrained, but as a set it reads as "agent built this from a design-system prompt." More concretely: **section 08's five stat cards are the hero-metric template DESIGN.md explicitly bans, just relocated out of the hero into its own section rather than eliminated.**

**Deterministic scan**: `detect.mjs` found 31 findings (22 `design-system-font-size` advisories, 5 `design-system-color`, 1 `overused-font`, 1 `broken-image`, 1 `numbered-section-markers`, 1 `dark-glow`). Live browser overlay independently found 7 anti-patterns, including **`icon-tile-stack`** flagged on all 5 of section 08's cards — corroborating Assessment A's "hero-metric relocated" finding from a completely independent tool. That convergence is the strongest signal in this report.

False positives: `broken-image` (line 455 is a code comment mentioning `<img>`, not an actual image tag), `dark-glow` (the flagged `.timeline__node` glow sits on a plain white section, not a dark one — likely a proximity-match against the genuinely-dark `.section--ink` rules defined a few lines above), `numbered-section-markers` and the `#C15B4F`/`#FBEEEC` color flags (both documented, intentional decisions in DESIGN.md — the clay-red Exclusiones hover and the section-number label device). Real, not-yet-documented drift: `#0E1A33`/`#22D3EE` (used in the section-09 gradient/eyebrow, absent from DESIGN.md's color table) and the 22 font-size advisories (genuine literal values off DESIGN.md's 3-entry typographic ramp — the ramp is under-specified, not the CSS wrong).

## Overall Impression

This is a well-disciplined system fighting its own completeness: the named rules (Acento Único, Tinta no Negro) are genuinely enforced in the shipped CSS, which is rare. The biggest opportunity isn't more polish — it's closing two accessibility/IA gaps (invisible-but-tabbable nav, nav/heading label mismatch) and deciding, on purpose, whether section 08 gets to keep the exact pattern the design system was written to forbid.

## What's Working

1. **La Regla del Acento Único is enforced in the CSS, not just documented** — cyan appears in exactly two places and nowhere else, which is why the page doesn't read as a two-tone SaaS site.
2. **Semantic hover contrast in Exclusiones** (cards sink + redden vs. Alcance/Confianza lifting + bluing) encodes meaning rather than decorating for its own sake.
3. **The investment card treats the price as the smallest thing on the page**, subordinated to the ROI line and proof — directly serving the stated goal of getting past sticker shock.

## Priority Issues

- **[P1] Fixed nav is keyboard-focusable before it's visible.** `<nav id="site-nav">` sits right after `<body>`, hidden only via `transform: translateY(-100%)` — not `display`/`visibility`/`inert`. A keyboard user tabbing from page load lands on 5 invisible links before reaching the hero CTA.
  **Why it matters**: breaks visibility-of-status for exactly the users who rely on tab order most.
  **Fix**: add `tabindex="-1"` to the nav's focusable children while `site-nav--visible` is absent; restore it via JS when the class toggles on.
  **Suggested command**: `$impeccable harden`

- **[P1] Nav label doesn't match the section it points to.** `site-nav__links` promises "Contacto" but `#cierre`'s heading reads "Próximo paso" with no contact block visible there.
  **Why it matters**: violates match-between-system-and-real-world for a user scanning specifically for contact info.
  **Fix**: rename the nav link to "Cierre"/"Siguiente paso", or add a small "Contacto" label near the WhatsApp button.
  **Suggested command**: `$impeccable clarify`

- **[P1] Section 08's stat-card grid is the hero-metric pattern relocated, not eliminated — corroborated by two independent methods.** Assessment A flagged it as a design contradiction; the detector's live overlay independently flagged `icon-tile-stack` on the same 5 cards.
  **Why it matters**: DESIGN.md's own Don'ts ban this pattern; shipping it in section 08 means the system fails its own rule the moment a reviewer checks that section in isolation.
  **Fix**: vary the card treatment (different sizes, or an inline stat strip instead of a uniform grid), or explicitly amend DESIGN.md's Do's and Don'ts to carve out proof-bar stats as a deliberate exception to the hero-metric ban, since the intent (post-purchase proof, not headline bait) genuinely differs from the banned pattern.
  **Suggested command**: `$impeccable distill`

- **[P2] Chunking violation in Alcance.** DESIGN.md sanctions up to 8 Alcance cards; the working demo renders 6 — both exceed the ≤4-per-group cognitive-load guideline the rest of the page respects (nav capped at 4, exclusions typically 2-3).
  **Why it matters**: on a page whose whole thesis is "resolve objections without a follow-up call," an 8-item grid is the one place a rushed prospect is most likely to skim past detail.
  **Fix**: default-collapse to the top 4-5 items with a "ver todo" toggle when the generator produces more than 5.
  **Suggested command**: `$impeccable layout`

- **[P2] Undocumented color drift.** `#0E1A33` and `#22D3EE` (section-09 gradient/eyebrow) aren't in DESIGN.md's color table.
  **Why it matters**: token-system hygiene — future edits can't tell if these are intentional or accidental.
  **Fix**: add both to DESIGN.md's Colors section (or replace with an existing token if they were meant to be one).
  **Suggested command**: `$impeccable document`

## Persona Red Flags

**Jordan (First-Timer / forwarded partner)**: Per PRODUCT.md, the prospect "reenvía la propuesta a un socio antes de confirmar" — but the hero gives that second reader zero orientation: title is "Propuesta comercial - Implementación agentes IA para [Cliente]" and subtitle is just "[Cliente] + ClaryTree." A cold reader scrolls past the entire hero animation before learning what ClaryTree actually does (section 02).

**Riley (Stress Tester)**: The invisible-but-focusable `#site-nav` (P1 above) is exactly what a keyboard-only pass surfaces first — the first five tab-stops go nowhere visible.

**Casey (Mobile)**: `.site-nav__links{ display:none }` below 640px removes all in-page jump navigation on mobile — only the thin progress bar remains. Given PRODUCT.md's own framing ("probablemente la abre en el celular justo después de la llamada"), losing quick-jump nav on the exact device most prospects use is a real gap. The autoplaying hero video also adds data weight for a persona opening the link right after a call, possibly on cellular data.

## Minor Observations

- `.investment-card__payments-label`/`.pay-logos` hardcode `#94A3B8` instead of a `--color-*` token (documented as intentional, but still a token-system inconsistency).
- Stat card titles in Confianza (`<h3>~617</h3>`) put a bare number in a heading with no unit context for screen readers until the next sibling `<p>`.
- `.hero__title{visibility:hidden}` until JS re-renders it word-by-word — good no-JS fallback, but on a slow connection there's a longer-than-expected flash where the meta bar/subtitle are visible and the title stays invisible.
- Footer social icons measure 36×36px, below the common 44×44px touch-target guideline (a documented deliberate compact-footer tradeoff, not an oversight).
- `[NOTA_TIEMPOS]`/`[FORMA_DE_PAGO]` optional fields have no visual QA pass confirming the layout looks right when omitted.

## Questions to Consider

1. If section 08 was built specifically to avoid hero-metric clichés, why does it end up structurally identical to the pattern it was meant to avoid — just moved further down the page?
2. The nav caps at 4 links "for minimal cognitive load," but mobile removes all 4 — is the nav solving a discoverability problem, or is it decorative desktop chrome the primary device (mobile, per PRODUCT.md) never gets to use?
3. Given each proposal is read once by a warm prospect, is the three-system animation budget (reveal-on-scroll, word-by-word hero, timeline node) earning its complexity cost, or would a calmer page trade marginal "wow" for a faster, more confident read on a phone right after a sales call?
