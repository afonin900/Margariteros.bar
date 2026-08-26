import { describe, expect, it } from "vitest";
import { verifyResponsiveUi } from "../scripts/verify-responsive-ui.mjs";

const widths = [320, 390, 597, 719, 720, 768, 1024, 1280] as const;
type Geometry = {
  viewport: { width: number; height: number };
  scrollWidth: number;
  headerOverlap: boolean;
  bookingOverlap: boolean;
  consentGalleryOverlap: boolean;
  consentFooterOverlap: boolean;
  footerAfterGallery: boolean;
  footerHeight: number;
  minimumTarget: number;
  footerActions: boolean[];
};

describe("responsive SSR geometry", () => {
  it("keeps the public guest surface usable at every supported width", async () => {
    const results = await verifyResponsiveUi() as Record<number, Geometry>;

    for (const width of widths) {
      const result = results[width];

      expect(result.viewport.width).toBe(width);
      expect(result.scrollWidth).toBe(width);
      expect(result.headerOverlap).toBe(false);
      expect(result.bookingOverlap).toBe(false);
      expect(result.consentGalleryOverlap).toBe(false);
      expect(result.consentFooterOverlap).toBe(false);
      expect(result.footerAfterGallery).toBe(true);
      expect(result.footerHeight).toBeGreaterThan(0);
      expect(result.minimumTarget).toBeGreaterThanOrEqual(44);
      expect(result.footerActions).toEqual([true, true, true, true, true, true]);
    }
  }, 30_000);
});
