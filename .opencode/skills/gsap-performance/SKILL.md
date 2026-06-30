---
name: gsap-performance
description: Official GSAP skill for performance — prefer transforms over layout props, will-change, batching, gsap.quickTo(). Use when optimizing GSAP animations in Nextora theme blocks or front-end TS, reducing jank, or ensuring smooth 60fps scroll reveals.
license: MIT
compatibility: opencode
metadata:
  audience: all
  workflow: gsap-performance
---

# GSAP Performance

## When to Use This Skill

Apply when optimizing GSAP animations in Nextora theme blocks or the scroll-animations library for smooth 60fps. Use when the user asks about jank, FOUC during scroll reveals, or animation performance.

**Related skills:** Build animations with **gsap-core**; for ScrollTrigger performance patterns see **gsap-scrolltrigger**.

## Prefer Transform and Opacity

Animating **transform** and **opacity** keeps work on the compositor and avoids layout thrashing.

- ✅ Prefer: **x**, **y**, **scale**, **rotation**, **opacity** (use **autoAlpha** for fade in/out).
- ❌ Avoid: **width**, **height**, **top**, **left**, **margin**, **padding**.

GSAP's **x** and **y** use transforms by default; use them instead of `left`/`top`.

## will-change

Use **will-change** in CSS on elements that will animate:

```css
will-change: transform;
```

Only apply to elements that are actually animating — not globally.

## ScrollTrigger and Performance

- **pin: true** promotes the pinned element; pin only what's needed.
- **scrub** with a small value (e.g. `scrub: 1`) can reduce work during scroll.
- Call **ScrollTrigger.refresh()** only when layout actually changes, not on every resize.

## Reduce Simultaneous Work

- Pause or kill off-screen or inactive animations when not visible.
- Avoid animating many properties on many elements at once; simplify or sequence.
- Use **stagger** instead of many separate tweens with manual delays.

## Nextora-specific patterns

### FOUC guard for scroll reveals
CSS: `[data-nextora-scroll-reveal] { opacity: 0; }` with `will-change: transform, opacity;` so elements are invisible until GSAP runs. Once animated, GSAP sets `opacity: 1`.

### Loading → ready pattern for JS layout blocks
```css
.nextora-image-gallery-slide--loading { opacity: 0; }
.nextora-image-gallery-slide--ready { opacity: 1; }
```

Reserve space with `aspect-ratio` or `min-height` before JS init to prevent layout shift.

### Cleanup in view.ts
Always guard with init flags (`data-nextora-{slug}-scroll-init="1"`) to avoid double-init. Kill ScrollTriggers on elements being removed:

```javascript
ScrollTrigger.getById("my-id")?.kill();
```

## Best practices

- Animate **transform** and **opacity**; use **will-change** in CSS only on animating elements.
- Use **stagger** instead of many separate tweens.
- Use `--loading` / `--ready` CSS states to prevent FOUC in JS-dependent blocks.
- Always guard with init data attributes to prevent double-init.
- Honor `prefers-reduced-motion: reduce` — skip or minimize animations entirely.
