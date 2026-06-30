---
name: nextora-theme-styling-and-tokens
description: Aligns Nextora design tokens between theme.json, Tailwind v4 @theme in app.css, and CSS modules so the block editor and front match. Use when changing colors, fonts, spacing, layout widths, or adding feature CSS under resources/css/modules.
compatibility: opencode
metadata:
  audience: developers
  workflow: styling-tokens
---

# Nextora — styling and design tokens

## Principles

1. **Theme blocks** follow `docs/blocks.md` (scroll animation toggle, JS init loading, consistent sidebar controls).
2. **Canonical presets** live in `theme.json` (palette, typography, spacing, layout).
3. **Tailwind utilities** read from **`@theme`** in `resources/css/app.css`, which maps to `--wp--preset--*` with fallbacks.
4. **Preflight is disabled** — do not rely on Tailwind's global reset; scope changes so core/editor UI is unaffected.

## Workflow

1. Edit **`theme.json`** for new colors, font families, font sizes, spacing steps, or `layout.contentSize` / `wideSize`.
2. Mirror critical tokens in **`@theme`** inside `resources/css/app.css` so classes like `text-primary` / `bg-base` stay in sync with the editor.
3. Add or extend **feature CSS** as slices under `resources/css/modules/` and **import them in the right band** in `app.css`: base → components → prose → overrides.
4. Prefer **Nextora-specific tokens** in `@theme` (e.g. `--nextora-nav-*`, `--nextora-pagination-*`, `--nextora-comments-*`) for areas that already use them instead of scattering raw colors in modules.
5. Run **`npm run build:css`** or **`npm run build`**; never edit `assets/css/app.css` directly.

## CSS import order in app.css

```
@import "./modules/base/body.css";
@import "./modules/base/nav-menus.css";
@import "./modules/base/layout-shell.css";
@import "./modules/base/search-form.css";
@import "./modules/base/articles-shell.css";
@import "./modules/base/comments.css";
@import "./modules/base/pagination.css";
@import "./modules/base/entry-column.css";
@import "./modules/components/buttons.css";
@import "./modules/components/form-fields.css";
@import "./modules/components/form-subscribe.css";
@import "./modules/components/modal.css";
@import "./modules/components/spotlight-search.css";
@import "./modules/components/scroll-animations.css";
@import "./modules/components/hero-section.css";
@import "./modules/prose/entry-content.css";
@import "./modules/overrides/layout-tweaks.css";
```

## Tailwind scanning

`app.css` **`@source`** already includes `parts/`, `templates/`, `blocks/`, `inc/`, `functions.php`, `blocks/**/*.tsx`. If you introduce a **new glob** of markup for utilities, add a matching `@source` line.

## Checklist

- [ ] `theme.json` updated for user-facing preset changes.
- [ ] `@theme` in `app.css` updated where utilities must match presets (mirror all palette colors, font families, and critical spacing tokens).
- [ ] New module imported in correct **base / components / prose / overrides** section.
- [ ] `@source` globs extended if new markup directories introduced.
- [ ] `npm run build:css` (or `npm run build`) executed.
- [ ] Do not edit `assets/css/app.css` directly.
