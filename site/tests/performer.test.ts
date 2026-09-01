import { describe, expect, it } from "vitest";
import { normalizePerformer } from "../src/lib/content/performer";

describe("performer public contract", () => {
  it("keeps the normalized DJ profile and optional verified social links", () => {
    expect(normalizePerformer({
      name: "DJ Kike",
      main_photo: { src: "/_emdash/api/media/file/dj-kike.webp", width: 600, height: 600 },
      bio: "Warsaw-based selector.",
      instagram_url: "https://www.instagram.com/djkike/",
      facebook_url: "https://www.facebook.com/djkike",
      tiktok_url: "https://www.tiktok.com/@djkike",
      youtube_url: "https://www.youtube.com/@djkike",
      soundcloud_url: "https://soundcloud.com/djkike",
      website_url: "https://djkike.example/",
    })).toEqual({
      name: "DJ Kike",
      photo: { src: "/_emdash/api/media/file/dj-kike.webp", width: 600, height: 600 },
      bio: "Warsaw-based selector.",
      instagram: "https://www.instagram.com/djkike/",
      facebook: "https://www.facebook.com/djkike",
      tiktok: "https://www.tiktok.com/@djkike",
      youtube: "https://www.youtube.com/@djkike",
      soundcloud: "https://soundcloud.com/djkike",
      website: "https://djkike.example/",
    });
  });

  it("does not render a partial or unsafe card", () => {
    expect(normalizePerformer({ name: "No contact" })).toBeNull();
    expect(normalizePerformer({ name: "Unsafe", instagram: "javascript:alert(1)" })).toBeNull();
    expect(normalizePerformer({ name: "Wrong host", instagram: "https://example.com/profile" })).toBeNull();
    expect(normalizePerformer({ name: "DJ Kike", instagram: "https://instagram.com/djkike", website: "javascript:alert(1)", photo: { src: "javascript:alert(1)" } })).toEqual({
      name: "DJ Kike",
      instagram: "https://instagram.com/djkike",
    });
  });
});
