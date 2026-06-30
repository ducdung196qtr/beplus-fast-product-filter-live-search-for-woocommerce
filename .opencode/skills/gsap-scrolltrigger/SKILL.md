---
name: gsap-scrolltrigger
description: Official GSAP skill for ScrollTrigger — scroll-linked animations, pinning, scrub, triggers, refresh and cleanup. Use when building scroll-based animation in Nextora theme blocks (view.ts), scroll-animations library, or when the user asks about ScrollTrigger, scroll animations, or pinning.
license: MIT
compatibility: opencode
metadata:
  audience: all
  workflow: gsap-scroll
---

# GSAP ScrollTrigger

## When to Use This Skill

Apply when implementing scroll-driven animations in Nextora theme blocks (`blocks/*/view.ts`) or the shared scroll-animations library (`resources/ts/lib/scroll-animations/`). Use for triggering tweens/timelines on scroll, pinning elements, scrubbing animation to scroll position.

**Related skills:** For tweens and timelines use **gsap-core**; for performance use **gsap-performance**.

**Nextora context:** All theme blocks animate on scroll via `data-nextora-scroll-reveal="1"` + GSAP ScrollTrigger with `once: true`. The shared `resources/ts/lib/scroll-animations/` provides class-driven reveals (`animation-fade-in-up`). See `blocks/image-gallery-grid/view.ts` for the canonical pattern.

## Registering

```javascript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

## Basic Trigger

```javascript
gsap.to(".box", {
  x: 500,
  scrollTrigger: {
    trigger: ".box",
    start: "top center",
    end: "bottom center",
    toggleActions: "play reverse play reverse"
  }
});
```

**start** / **end** format: `"triggerPosition viewportPosition"` (e.g. `"top 85%"`, `"center center"`). Relative values: `"+=300"` (300px past start).

## Key config options

| Property | Description |
|----------|-------------|
| **trigger** | Element defining ScrollTrigger start |
| **start** | When trigger becomes active. Default `"top bottom"` |
| **end** | When trigger ends. Default `"bottom top"` |
| **scrub** | Link animation progress to scroll. `true` = direct; number = smooth delay |
| **toggleActions** | Four actions: onEnter onLeave onEnterBack onLeaveBack |
| **pin** | Pin element while active. Don't animate the pinned element; animate children |
| **once** | If true, kills ScrollTrigger after reaching end once. **Used in all Nextora scroll reveals** |
| **markers** | `true` for dev markers. Remove in production |

## Nextora scroll reveal pattern

```javascript
// Canonical pattern in blocks/image-gallery-grid/view.ts
const root = document.querySelector("[data-nextora-scroll-reveal=\"1\"]");
if (!root) return;
if (root.dataset.nextoraImageGalleryGridScrollInit === "1") return;

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  root.style.opacity = "1";
  root.dataset.nextoraImageGalleryGridScrollInit = "1";
  return;
}

gsap.from(root, {
  y: 60,
  opacity: 0,
  duration: 0.9,
  ease: "power3.out",
  scrollTrigger: {
    trigger: root,
    start: "top 80%",
    once: true
  }
});
root.dataset.nextoraImageGalleryGridScrollInit = "1";
```

## Refresh and Cleanup

- **ScrollTrigger.refresh()** — recalculate positions after DOM/layout changes.
- Kill stale instances: `ScrollTrigger.getAll().forEach(t => t.kill())`.

## Do Not

- Put ScrollTrigger on a child tween when part of a timeline; put it on the timeline only.
- Forget `ScrollTrigger.refresh()` after DOM changes.
- Use both `scrub` and `toggleActions` together.
- Leave `markers: true` in production.
- Forget `once: true` and `prefers-reduced-motion` guard in Nextora theme blocks.
