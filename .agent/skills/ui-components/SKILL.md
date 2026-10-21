---
name: ui-components
description: Guides the design, layout, and implementation of shadcn/ui components tailored to the Blades in the Dark gothic steampunk aesthetic and linear progress clocks.
---

# UI Components & Blades Theming Skill

## Purpose
Directs the implementation of responsive, accessible UI components using Tailwind CSS and shadcn/ui, styled with an immersive dark Victorian/industrial atmosphere fitting the haunted city of Doskvol.

## Theme & Palette Guidelines
* **Backgrounds**: Deep charcoal and void zinc (`zinc-950`, `zinc-900`, `slate-950`).
* **Borders**: Subtly weathered iron borders (`zinc-800`, `zinc-700`).
* **Accents & Highlights**:
  - **Electroplasm / Arcane**: Cyan and spectral emerald (`emerald-400`, `cyan-400`).
  - **Danger / Harm / Heat**: Blood crimson (`red-500`, `rose-600`).
  - **Coin & Prestige**: Aged brass / gold (`amber-400`, `yellow-500`).
* **Typography**: Clean monospace or vintage serif headers (`font-serif` / `Cinzel` or `Playfair`) paired with crisp sans-serif body fonts (`Inter` / `Geist`).

## Key Component Specifications

### 1. Linear Progress Clock (`<LinearClock />`)
* **Requirements**: Must render as a segmented linear bar rather than a circular chart.
* **Segments**: Supports 4, 6, 8, or 12 discrete segment blocks.
* **Interaction**: Clicking segment `k` sets the clock to `k` segments filled. Includes quick "+1", "-1", and "Clear" GM controls.
* **Visual States**:
  - Danger clock: `bg-rose-500/80` with dark divider slots.
  - Obstacle/Progress clock: `bg-emerald-500/80` or `bg-cyan-500/80`.
  - Badge indicator: Displays `[ X / Total ]` and GM-only lock icon when restricted.

### 2. Action Rating & Dot Trackers (`<DotRating />`)
* Renders 0 to 4 dots for an action (e.g. Skirmish, Prowl, Attune).
* Interactive dots fill up to the clicked index on click.
* Includes attribute grouping headers (Insight, Prowess, Resolve) with their respective 6-box XP tracks.

### 3. Stress & Trauma Bar (`<StressBar />`)
* 9 discrete stress check-boxes.
* Visual warning as stress reaches 7, 8, and 9.
* Upon reaching 10, triggers the interactive Trauma condition selection modal.

### 4. Harm Matrix (`<HarmMatrix />`)
* Level 3 (Severe - 1 slot): Prominent warning banner and disabled actions indicator unless pushed.
* Level 2 (Moderate - 2 slots): Shows `-1d to all actions` badge.
* Level 1 (Lesser - 2 slots): Shows `-1d when penalty applies`.
* Quick "Use Armor" button to downgrade active harm.

### 5. Multi-Campaign Switcher (`<CampaignSwitcher />`)
* Top navigation dropdown to switch between campaigns.
* Clearly displays the active user's campaign role (`[GM]` or `[Player]`) next to the campaign title.
