---
name: gsap-core
description: Official GSAP skill for core API — gsap.to(), from(), fromTo(), easing, duration, stagger, defaults, gsap.matchMedia() (responsive, prefers-reduced-motion). Use when animating DOM/SVG with GSAP tweens, easing, stagger, or responsive animations in Nextora theme blocks and front-end TS.
license: MIT
compatibility: opencode
metadata:
  audience: all
  workflow: gsap-animation
---

# GSAP Core

## When to Use This Skill

Apply when writing or reviewing GSAP animations in Nextora theme blocks (`view.ts`) or front-end TypeScript (`resources/ts/lib/scroll-animations/`). Use for single tweens, eases, staggers, or gsap.matchMedia() patterns.

**Related skills:** For sequencing multiple steps use **gsap-timeline**; for scroll-linked animation use **gsap-scrolltrigger**; for React use **gsap-react**; for performance use **gsap-performance**.

**Nextora context:** This theme uses GSAP v3.15+ with ScrollTrigger. All theme blocks that animate on scroll use `data-nextora-scroll-reveal="1"` with GSAP ScrollTrigger. See `resources/ts/lib/scroll-animations/` for the shared animation library and `resources/ts/header-nav.ts` for GSAP mobile drawer animations.

## Core Tween Methods

- **gsap.to(targets, vars)** — animate from current state to `vars`. Most common.
- **gsap.from(targets, vars)** — animate from `vars` to current state (good for entrances).
- **gsap.fromTo(targets, fromVars, toVars)** — explicit start and end; no reading of current values.
- **gsap.set(targets, vars)** — apply immediately (duration 0).

Always use **property names in camelCase** in the vars object.

## Common vars

- **duration** — seconds (default 0.5).
- **delay** — seconds before start.
- **ease** — string. Prefer built-in: `"power1.out"` (default), `"power3.inOut"`, `"back.out(1.7)"`, `"none"`.
- **stagger** — number (seconds between) like `0.1` or object: `{ amount: 0.3, from: "center" }`.
- **repeat** — number or `-1` for infinite.
- **yoyo** — boolean; with repeat, alternates direction.
- **onComplete**, **onStart** — callbacks.

## Transforms and CSS properties

Prefer GSAP transform aliases over raw `transform` string:

| GSAP property | Equivalent CSS |
|---------------|----------------|
| `x`, `y`, `z` | translateX/Y/Z (px) |
| `xPercent`, `yPercent` | translateX/Y in % |
| `scale`, `scaleX`, `scaleY` | scale |
| `rotation` | rotate (deg) |
| `rotationX`, `rotationY` | 3D rotate |
| `autoAlpha` | opacity + visibility — prefer over `opacity` for fade in/out |

Relative values: `x: "+=20"`, `rotation: "-=30"`.

## Accessibility and responsive (gsap.matchMedia())

**gsap.matchMedia()** (GSAP 3.11+) runs setup code only when a media query matches; when it stops matching, all animations and ScrollTriggers are **reverted automatically**. Use for **prefers-reduced-motion** in Nextora theme blocks.

```javascript
let mm = gsap.matchMedia();
mm.add(
  {
    isDesktop: "(min-width: 800px)",
    reduceMotion: "(prefers-reduced-motion: reduce)"
  },
  (context) => {
    const { isDesktop, reduceMotion } = context.conditions;
    gsap.to(".box", {
      rotation: isDesktop ? 360 : 180,
      duration: reduceMotion ? 0 : 2
    });
    return () => { /* optional cleanup */ };
  }
);
```

## Nextora-specific patterns

### Scroll reveal (theme blocks)
```javascript
// In blocks/<name>/view.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const root = document.querySelector("[data-nextora-scroll-reveal=\"1\"]");
if (root && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.from(root, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: root,
      start: "top 85%",
      once: true
    }
  });
}
```

Best practices:
- Use **property names in camelCase** in vars.
- Prefer **transform aliases** (`x`, `y`, `scale`, `rotation`) over animating raw `transform`.
- Use **autoAlpha** instead of `opacity` for fade in/out.
- Store tween returns when controlling playback.
- Honor `prefers-reduced-motion: reduce` — skip animation entirely or set `duration: 0`.
