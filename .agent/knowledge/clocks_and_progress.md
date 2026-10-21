# Blades in the Dark — Clocks & Linear Progress Mechanics

This document defines the schema, behavior, and UI rendering rules for the Progress Clock system.

---

## 1. Segment Counts & Types

Clocks track complex situations, obstacles, and countdowns. All clocks support standard segment sizes:
* **4-Segment**: Short obstacle, simple lock, immediate danger, quick skirmish.
* **6-Segment**: Standard obstacle, guard patrol, infiltration step, complex lock.
* **8-Segment**: Substantial barrier, high-security vault, faction alert level, major project.
* **12-Segment**: Massive long-term campaign project, city-wide faction war, master ritual.

### Clock Classifications
1. **Obstacle Clocks (Progress)**:
   - Driven by player action rolls (ticks equal to effect level: Limited = 1, Standard = 2, Great = 3).
   - Once all segments are filled, the obstacle is cleared or bypassed.
2. **Danger Clocks (Trouble / Alert)**:
   - Driven by GM consequences or failed rolls (e.g. "Guards on Alert", "Building Collapses", "Bluecoats Arrive").
   - Filled left-to-right. Once full, the disaster triggers immediately.
3. **Long-Term Project Clocks**:
   - Advanced during Downtime activities (Healing, Inventions, Research, Forgery).
   - Can be shared among crew members or tied to an individual character.
4. **Tug-of-War Clocks**:
   - Two opposing entities push the tracker back and forth.
   - Example: Red Sashes vs Lampblacks turf control. PC successes advance it right; rival successes push it left.

---

## 2. Linear Progress Bar UI Specification

Per suite design specifications, clocks are rendered as **segmented linear progress bars** (rather than circular pie charts):

### UI Anatomy
* **Container**: Clean, gothic/slate bordered box with header containing:
  - Clock Name (e.g., `Investigate Spirit Wardens Crypt`).
  - Total Segments indicator (e.g., `[ 3 / 6 ]`).
  - Visibility Badge (`GM Only` or `Public`).
* **Bar Component**:
  - Linear flex container divided into discrete segment blocks (e.g. 4, 6, 8, or 12 equal flex cells).
  - Filled segments: Solid accent highlight (e.g., emerald for player progress, crimson for danger/trouble, amber for alert).
  - Empty segments: Subtle dark background with muted border divider.
  - Interactive controls: Clickable segment targets allowing GM or authorized player to directly increment/decrement ticks.
  - Reset / Clear button for quick re-use.

---

## 3. Data Schema & Permissions

```typescript
export type ClockType = 'obstacle' | 'danger' | 'project' | 'tug_of_war';
export type ClockVisibility = 'gm_only' | 'campaign_public' | 'character_private';

export interface Clock {
  id: string;
  campaign_id: string;
  name: string;
  description?: string;
  clock_type: ClockType;
  max_segments: 4 | 6 | 8 | 12;
  current_segments: number; // 0 to max_segments
  visibility: ClockVisibility;
  created_by: string; // user_id
  linked_entity_type?: 'faction' | 'character' | 'score' | 'crew';
  linked_entity_id?: string;
  is_completed: boolean;
  color_theme?: 'red' | 'emerald' | 'amber' | 'violet' | 'slate';
  created_at: string;
  updated_at: string;
}
```

### Access Control & RLS Rules
* **GM Role**: Can view, create, edit, increment, decrement, and delete ALL clocks in the campaign (including `gm_only` clocks).
* **Player Role**:
  - Can view all `campaign_public` clocks.
  - Can view and modify their own `character_private` project clocks.
  - Cannot see or query `gm_only` clocks in Supabase (enforced at RLS database layer).
