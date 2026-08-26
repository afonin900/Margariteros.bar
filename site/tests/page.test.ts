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
});
