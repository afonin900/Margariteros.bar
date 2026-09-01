export const EVENTS_PAGE_SIZE = 4;

export interface EventWindow {
  start: number;
  end: number;
  hasMore: boolean;
}

/**
 * Return the next contiguous slice of an already-rendered event list.
 * Keeping this calculation separate makes the client-side reveal predictable
 * for empty, short, and unusually large event collections.
 */
export function nextEventWindow(total: number, visible: number, pageSize = EVENTS_PAGE_SIZE): EventWindow {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safeVisible = Number.isFinite(visible) ? Math.min(safeTotal, Math.max(0, Math.floor(visible))) : 0;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : EVENTS_PAGE_SIZE;
  const end = Math.min(safeVisible + safePageSize, safeTotal);

  return { start: safeVisible, end, hasMore: end < safeTotal };
}
