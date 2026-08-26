import { describe, expect, it } from "vitest";
import { getPage, locales } from "../src/content/page";

describe("getPage", () => {
  it("returns full localized page content for every supported route", () => {
    for (const locale of locales) {
      const page = getPage(locale);

      expect(page.locale).toBe(locale);
      expect(page.title).not.toHaveLength(0);
      expect(page.description).not.toHaveLength(0);
    }
  });

  it("exposes the complete guest interface in every locale", () => {
    for (const locale of locales) {
      const page = getPage(locale);

      expect(page.galleryHeading).not.toHaveLength(0);
      expect(page.contactHeading).not.toHaveLength(0);
      expect(page.hoursHeading).not.toHaveLength(0);
      expect(page.socialsHeading).not.toHaveLength(0);
      expect(page.mapHeading).not.toHaveLength(0);
      expect(page.hours).toHaveLength(7);
    }
  });

  it("uses a local, square twenty-image gallery in every locale", () => {
    for (const locale of locales) {
      const page = getPage(locale);

      expect(page.galleryItems).toHaveLength(20);
      for (const item of page.galleryItems) {
        expect(item.src).toMatch(/^\/media\/gallery\//);
        expect(item.width).toBe(item.height);
        expect(item.alt).not.toHaveLength(0);
      }
    }
  });

  it("does not expose the rejected tray photo through the public gallery seam", () => {
    for (const locale of locales) {
      expect(getPage(locale).galleryItems.map((item) => item.src)).not.toContain(
        "/media/gallery/food-tacos-tray-400.webp",
      );
    }
  });

  it("keeps prohibited positioning out of localized content", () => {
    for (const locale of locales) {
      expect(JSON.stringify(getPage(locale))).not.toMatch(/cocktail|margarita|tequila|vodka|whisky|piwo|wino|alkohol|drink/i);
    }
  });
});
