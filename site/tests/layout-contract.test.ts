import { describe, expect, it } from "vitest";
import { verifyResponsiveUi } from "../scripts/verify-responsive-ui.mjs";

const widths = [320, 390, 597, 719, 720, 768, 1024, 1280] as const;
type Geometry = {
  viewport: { width: number; height: number };
  scrollWidth: number;
  scrollHeight: number;
  contentStage: { left: number; right: number; width: number };
  headerOverlap: boolean;
  bookingOverlap: boolean;
  consentGalleryOverlap: boolean;
  consentFooterOverlap: boolean;
  consentHidden: boolean;
  footerAfterGallery: boolean;
  footerHeight: number;
  minimumTarget: number;
  footerActions: boolean[];
  galleryColumns: number;
  mobileTemplate: boolean;
  interaction: { drawerOpen: boolean; drawerClosed: boolean; drawerEscaped: boolean; languageOpen: boolean; languageClosed: boolean };
  galleryGrid: { left: number; top: number; width: number };
};

describe("responsive SSR geometry", () => {
  it("keeps the public guest surface usable at every supported width", async () => {
    const previous = process.env.CHOICEQR_MIRROR_DISABLE;
    process.env.CHOICEQR_MIRROR_DISABLE = "1";
    const results = await verifyResponsiveUi() as Record<number, Geometry>;
    if (previous === undefined) delete process.env.CHOICEQR_MIRROR_DISABLE;
    else process.env.CHOICEQR_MIRROR_DISABLE = previous;

    for (const width of widths) {
      const result = results[width];

      expect(result.viewport.width).toBe(width);
      expect(result.scrollWidth).toBe(width);
      expect(result.galleryGrid.width).toBeGreaterThan(0);
      if (width <= 760) {
        expect(result.contentStage.left).toBe(0);
        expect(result.contentStage.right).toBe(width);
        expect(result.mobileTemplate).toBe(true);
        expect(result.galleryColumns).toBe(3);
      } else {
        expect(result.mobileTemplate).toBe(false);
        expect(result.galleryColumns).toBe(4);
      }
      expect(result.headerOverlap).toBe(false);
      expect(result.bookingOverlap).toBe(false);
      expect(result.consentGalleryOverlap).toBe(false);
      expect(result.consentFooterOverlap).toBe(false);
      expect(result.consentHidden).toBe(true);
      expect(result.footerAfterGallery).toBe(true);
      expect(result.footerHeight).toBeGreaterThan(0);
      expect(result.minimumTarget).toBeGreaterThanOrEqual(40);
      expect(result.footerActions).toEqual([true, true, true, true, true, true]);
      expect(result.interaction).toEqual({ drawerOpen: true, drawerClosed: true, drawerEscaped: true, languageOpen: true, languageClosed: true });
    }
  }, 30_000);
});
