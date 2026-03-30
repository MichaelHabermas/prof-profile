# prof-profile — feature log

Short notes on what we add and why, so the portfolio stays intentional as it grows.

---

## Scroll-linked iridescent tide

### Added

- **`--iris-tide`** on **`:root`** — unitless **0–1** progress along the page (`scrollY / maxScroll`), updated from **`js/iris-tide.js`**.
- **Scroll + resize** listeners ( **`requestAnimationFrame`** throttling ) that recompute **`--iris-tide`**; **no** continuous animation loop when idle.
- **`prefers-reduced-motion: reduce`** — **`--iris-tide`** stays **0** (no hue / orb parallax); **`--scroll-progress`** still updates for the top bar.
- **`.hero-shimmer`** — **`filter: hue-rotate(calc(var(--iris-tide) * 20deg))`** so hero ambient blobs **shift hue** as you move through the page.
- **`.shimmer-orb`** — **`float-orb`** keyframes **compose** scroll parallax with the existing float: **`translate(var(--iris-dx), var(--iris-dy))`** then the original **`translate(40px, -30px)`** motion; **`nth-child(1–3)`** set different **`--iris-dx` / `--iris-dy`** multipliers for **per-orb** drift.

### Why

Makes iridescence feel like **one atmosphere** tied to reading depth, not only hover micro-interactions; reinforces the **optical / lens** mood of the hero art without new UI chrome.

### Implementation

- Script: [`js/iris-tide.js`](js/iris-tide.js) — **`initIrisTide()`**; wired from [`js/main.js`](js/main.js).
- Styles: [`css/main.css`](css/main.css) — **`:root`**, **`.hero-shimmer`**, **`.shimmer-orb`** + **nth-child** offsets, **`@keyframes float-orb`** ( **`html::before`** is documented under *Iris scroll progress* below ).
- Markup: hero orbs unchanged in [`index.html`](index.html) (three **`.shimmer-orb`** children under **`.hero-shimmer`**).

---

## Iris scroll progress (top sliver)

### Added

- **`--scroll-progress`** on **`:root`** — **0–1** from the same **`scrollY / maxScroll`** math as tide; **always** updated on scroll/resize ( **`requestAnimationFrame`** throttled ), including when **`prefers-reduced-motion: reduce`**.
- **`html::before`** — **fixed** **2px**-tall strip along the **top edge of the viewport** (**`z-index: 51`**), **iridescent** **`linear-gradient`**, **`transform: scaleX(var(--scroll-progress))`**, **`transform-origin: left`**.

### Why

Gives a **single glance** of position in the page; matches **pearl** / **iris** language without competing with the nav.

### Implementation

- [`js/iris-tide.js`](js/iris-tide.js) sets **`--scroll-progress`** and **`--iris-tide`**; [`css/main.css`](css/main.css) **`html::before`**.

---

## Section-synced nav (scroll spy)

### Added

- **`js/nav-section-sync.js`** — **`initNavSectionSync()`** maps **`nav .nav-link[href^="#"]`** to **`#hero`**, **`#skills`**, **`#projects`**, **`#experience`**.
- **Active section** is the **last** in document order whose **`getBoundingClientRect().top`** is at or above a fixed **reading line** (**112px** from the top of the viewport, below the fixed nav). Updated on **scroll** / **resize** via **`requestAnimationFrame`** throttling.
- **Active link** gets class **`nav-link-active`** and **`aria-current="location"`**; inactive links lose both.
- **`html { scroll-padding-top: 96px; }`** so in-page anchors (**`#skills`**, etc.) land **below** the fixed nav.

### Why

The header shows **which section you’re in**, aligned with scroll-linked tide and long-page wayfinding—without a separate table of contents.

### Implementation

- [`js/nav-section-sync.js`](js/nav-section-sync.js), [`js/main.js`](js/main.js), [`css/main.css`](css/main.css) ( **`.nav-link-active`** + pearl underline **`::after`** ).

---

## Plausible next (not shipped): cursor-linked specular on hero frames

### Idea

Drive **`--focus-x` / `--focus-y`** from pointer position over **`.hero-gallery`** so a **soft radial specular** or **focus-ring-style** highlight follows the cursor (machine-vision metaphor); degrade on **touch** / **coarse pointer** and respect **`prefers-reduced-motion`**.

### Why (if we build it)

Turns the hero mosaic from **hover-only** shine into a **responsive “lens”** without changing assets.

---
