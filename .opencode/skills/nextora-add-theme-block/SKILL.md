---
name: nextora-add-theme-block
description: Adds or extends a Nextora theme block under blocks/ using block.json, editor source, render.php, and esbuild output. Use when creating a block, editing block registration, block.json, block editor UI, ServerSideRender, render.php, view.ts/view.js, or running npm run gen/build:blocks for Nextora.
compatibility: opencode
metadata:
  audience: developers
  workflow: block-development
---

# Nextora — add or change a theme block

## Before you edit

- Read `AGENTS.md` § **Theme blocks** and `docs/blocks.md` (tokens, scroll animation, JS init loading, consistent controls).
- Registration: `blocks/blocks.php` — one folder with `block.json` per block.

## Scaffold

1. `npm run gen -- --name=slug --ns=nextora` (`scripts/gen-block.mjs`).
2. Set `block.json`: `textdomain` `nextora`, `category` (`theme` for chrome, `media`/`design` for content), `supports.color` / `spacing` / `typography` as needed.

## Design system

1. **Default look** — `theme.json` presets + `get_block_wrapper_attributes()`; CSS via `var(--wp--preset--color--*)` and `@theme` tokens (`resources/css/app.css`).
2. **Overrides (optional)** — Only if Global Styles are not enough: sidebar panel **Colors** / **Appearance**, consistent attribute names and help text (`docs/blocks.md`).

## Scroll animation (most content blocks)

1. `block.json`: `"enableScrollAnimation": { "type": "boolean", "default": true }`.
2. `edit.tsx`: **Animation** panel → **Animate on scroll** (`ToggleControl`) with standard help text.
3. `render.php`: if enabled, `data-nextora-scroll-reveal="1"` on root.
4. `view.ts`: GSAP ScrollTrigger, `once: true`, guard with init attribute; **no animation** when `prefers-reduced-motion: reduce`. Pattern: `blocks/image-gallery-grid/view.ts`.

## JS layout (carousel / slider)

1. `viewScript` in `block.json`; bundle in `view.ts`.
2. CSS: reserve space (`aspect-ratio` / `min-height`); **`nextora-{slug}--loading`** → **`--ready`**.
3. Init: pending/inited `data-*` attributes; idempotent init. Pattern: `blocks/image-gallery-slide/view.ts`.

## Editor & render

1. Editor: `@wordpress/*` → built to `window.wp.*` (`scripts/build-blocks.mjs`).
2. `render.php`: escape output; `get_block_wrapper_attributes()`; align classes with `style.css`.
3. Match **labels, panel titles, and help** to the closest existing block.

## Build and verify

1. `npm run build:blocks` (or `npm run build`).
2. Site Editor: block loads, scroll toggle works, JS blocks show loading → ready without layout jump.

## Reference blocks

| Block | Use for |
|-------|---------|
| `blocks/hero-section/` | Layout, supports, save.tsx |
| `blocks/spotlight-search/` | Modal + REST |
| `blocks/image-gallery-grid/` | Scroll reveal (GSAP) |
| `blocks/image-gallery-slide/` | Swiper init / loading |
| `blocks/header/` | Utilities, tokens via `currentColor` |
| `blocks/scrolling-promotion/` | CSS-only loop, `render.php`, repeater |
| `blocks/call-to-action/` | Override attributes, scroll reveal, save.tsx |
| `blocks/testimonial-carousel/` | Fade Swiper, `testimonials[]` repeater, trust avatars |
| `blocks/page-title/` | Dynamic heading, server-rendered save |
| `docs/blocks/Arc Gallery Section.md` §17 | Arc gallery: `arc-math.ts` + PHP mirror |
| `docs/blocks/Our Team Section Block.md` §15 | Team section: Swiper via `view.ts`, `members[]` repeater |

## Checklist

- [ ] Follows `docs/blocks.md` (tokens, animation toggle, JS init if applicable, consistent UI).
- [ ] `render.php` escaped; `npm run build:blocks` run.
- [ ] No hand-edits to generated `index.js` / `index.asset.php` / `view.js`.
- [ ] `npm run lint:php:all` passes after `render.php` edits.
