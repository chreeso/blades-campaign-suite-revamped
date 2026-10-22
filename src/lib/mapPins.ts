import { useSyncExternalStore } from 'react';
import { MapPin, MapPinCategory } from '@/types/blades';

/** Fields a user supplies when creating a pin; the rest are stamped by the campaign owner. */
export type MapPinDraft = Omit<MapPin, 'id' | 'campaign_id' | 'created_by' | 'created_at' | 'updated_at'>;

export const MAP_PIN_CATEGORIES: { id: MapPinCategory; label: string; color: string; textClass: string }[] = [
  { id: 'landmark', label: 'Landmark', color: '#f59e0b', textClass: 'text-amber-400' },
  { id: 'hideout', label: 'Hideout', color: '#10b981', textClass: 'text-emerald-400' },
  { id: 'hazard', label: 'Hazard', color: '#ef4444', textClass: 'text-red-400' },
  { id: 'shop', label: 'Shop / Fence', color: '#06b6d4', textClass: 'text-cyan-400' },
  { id: 'rumor', label: 'Rumor', color: '#a855f7', textClass: 'text-purple-400' }
];

export function getPinCategory(id: MapPinCategory) {
  return MAP_PIN_CATEGORIES.find((c) => c.id === id) ?? MAP_PIN_CATEGORIES[0];
}

const storageKey = (campaignId: string) => `blades:map_pins:${campaignId}`;

/** Loads persisted pins for a campaign from localStorage (client-only fallback until Supabase sync). */
export function loadMapPins(campaignId: string): MapPin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(campaignId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Enforce campaign isolation even for local data.
    return (parsed as MapPin[]).filter((p) => p && p.campaign_id === campaignId);
  } catch {
    return [];
  }
}

export function saveMapPins(campaignId: string, pins: MapPin[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      storageKey(campaignId),
      JSON.stringify(pins.filter((p) => p.campaign_id === campaignId))
    );
  } catch {
    // Storage full or unavailable — pins remain in memory for this session.
  }
  window.dispatchEvent(new Event(PINS_CHANGED_EVENT));
}

// ---------------------------------------------------------------------------
// External-store hook (SSR-safe, syncs across tabs via the `storage` event)
// ---------------------------------------------------------------------------

const PINS_CHANGED_EVENT = 'blades:map_pins_changed';
const EMPTY_PINS: MapPin[] = [];
const snapshotCache = new Map<string, { raw: string | null; pins: MapPin[] }>();

function subscribe(listener: () => void): () => void {
  window.addEventListener('storage', listener);
  window.addEventListener(PINS_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(PINS_CHANGED_EVENT, listener);
  };
}

/** Returns a referentially stable snapshot for the campaign (re-parsed only when storage changes). */
function getSnapshot(campaignId: string): MapPin[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey(campaignId));
  } catch {
    return EMPTY_PINS;
  }
  const cached = snapshotCache.get(campaignId);
  if (cached && cached.raw === raw) return cached.pins;
  const pins = raw ? loadMapPins(campaignId) : EMPTY_PINS;
  snapshotCache.set(campaignId, { raw, pins });
  return pins;
}

/** Live, campaign-scoped map pins backed by localStorage. */
export function useMapPins(campaignId: string): MapPin[] {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(campaignId),
    () => EMPTY_PINS
  );
}

/** Players never see GM-only pins. */
export function visiblePinsFor(pins: MapPin[], isGm: boolean): MapPin[] {
  return isGm ? pins : pins.filter((p) => p.visibility !== 'gm_only');
}
