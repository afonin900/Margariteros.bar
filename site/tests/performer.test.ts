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

  it("renders a name-only card and silently omits unsafe optional fields", () => {
    expect(normalizePerformer({ name: "DJ Kike" })).toEqual({ name: "DJ Kike" });
    expect(normalizePerformer({ name: "Unsafe photo", main_photo: { src: "javascript:alert(1)" } })).toEqual({ name: "Unsafe photo" });
    expect(normalizePerformer({ name: "DJ Kike", main_photo: { src: "/_emdash/api/media/file/dj-kike.webp" } })).toEqual({
      name: "DJ Kike",
      photo: { src: "/_emdash/api/media/file/dj-kike.webp" },
    });
    expect(normalizePerformer({ name: "DJ Kike", main_photo: { src: "/_emdash/api/media/file/dj-kike.webp" }, instagram: "https://example.com/profile", website: "javascript:alert(1)" })).toEqual({
      name: "DJ Kike",
      photo: { src: "/_emdash/api/media/file/dj-kike.webp" },
    });
    expect(normalizePerformer({ main_photo: { src: "/_emdash/api/media/file/dj-kike.webp" } })).toBeNull();
  });
});
