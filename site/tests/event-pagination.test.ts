import { describe, expect, it } from "vitest";
import { EVENTS_PAGE_SIZE, nextEventWindow } from "../src/lib/content/event-pagination";

describe("event load-more windows", () => {
  it("uses four events per reveal and stops at the end", () => {
    expect(EVENTS_PAGE_SIZE).toBe(4);
    expect(nextEventWindow(9, 4)).toEqual({ start: 4, end: 8, hasMore: true });
    expect(nextEventWindow(9, 8)).toEqual({ start: 8, end: 9, hasMore: false });
    expect(nextEventWindow(4, 4)).toEqual({ start: 4, end: 4, hasMore: false });
  });

  it("clamps empty, fractional, negative, and invalid inputs", () => {
    expect(nextEventWindow(0, 0)).toEqual({ start: 0, end: 0, hasMore: false });
    expect(nextEventWindow(2.9, -2)).toEqual({ start: 0, end: 2, hasMore: false });
    expect(nextEventWindow(Number.NaN, Number.POSITIVE_INFINITY)).toEqual({ start: 0, end: 0, hasMore: false });
    expect(nextEventWindow(10, 4, 0)).toEqual({ start: 4, end: 5, hasMore: true });
  });
});
