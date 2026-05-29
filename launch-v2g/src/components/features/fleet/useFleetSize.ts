"use client";

import { useSyncExternalStore } from "react";

export const MIN_FLEET_SIZE = 250;
export const MAX_FLEET_SIZE = 25000;
export const DEFAULT_FLEET_SIZE = 250;

const STORAGE_KEY = "v2g.fleetSize";

function clamp(value: number) {
  return Math.min(MAX_FLEET_SIZE, Math.max(MIN_FLEET_SIZE, Math.round(value)));
}

// Module-scope store: survives client-side navigation between /fleet and the
// dashboard, and is shared by every component without a provider in the tree.
const listeners = new Set<() => void>();
let cached: number | null = null;

function read(): number {
  if (cached !== null) return cached;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = stored !== null ? Number(stored) : NaN;
  cached = Number.isFinite(parsed) ? clamp(parsed) : DEFAULT_FLEET_SIZE;
  return cached;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return read();
}

// SSR and the first hydration render fall back to the default, so server and
// client markup agree; useSyncExternalStore reconciles to the stored value.
function getServerSnapshot() {
  return DEFAULT_FLEET_SIZE;
}

export function setFleetSize(value: number) {
  cached = clamp(value);
  window.localStorage.setItem(STORAGE_KEY, String(cached));
  for (const listener of listeners) listener();
}

export function useFleetSize() {
  const fleetSize = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { fleetSize, setFleetSize };
}
