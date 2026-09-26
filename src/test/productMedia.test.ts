import { describe, expect, it } from "vitest";
import { coverCandidates, heroCandidates, validEnrollment, videoEmbed, videoThumbnail, safeHttps, ratioClass } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

const product = {
  cover_16_9_url: "wide", cover_4_3_url: "compact", cover_1_1_url: "square",
  cover_3_4_url: "portrait", cover_9_16_url: "tall", cover_url: "legacy",
  hero_16_9_url: "heroWide", hero_4_3_url: "heroCompact", banner_url: "legacyBanner",
} as Tables<"courses">;

describe("product media", () => {
  it("prioritizes the requested ratio before fallback", () => {
    expect(coverCandidates(product, "16:9")[0]).toBe("wide");
    expect(coverCandidates(product, "4:3")[0]).toBe("compact");
    expect(coverCandidates(product, "1:1")[0]).toBe("square");
    expect(coverCandidates(product, "3:4")[0]).toBe("portrait");
    expect(coverCandidates(product, "9:16")[0]).toBe("tall");
    expect(Object.keys(ratioClass)).toHaveLength(5);
  });
  it("falls back to nearby and legacy images without duplicate urls", () => {
    expect(coverCandidates({ ...product, cover_1_1_url: null }, "1:1")[0]).toBe("compact");
    expect(coverCandidates({ ...product, cover_1_1_url: null, cover_4_3_url: null, cover_3_4_url: null, cover_9_16_url: null }, "1:1")).toEqual(["wide", "legacy"]);
    expect(coverCandidates({ ...product, cover_16_9_url: null, cover_url: null }, "16:9")[0]).toBe("compact");
  });
  it("chooses desktop and compact banners, including legacy fallbacks", () => {
    expect(heroCandidates(product)[0]).toBe("heroWide");
    expect(heroCandidates(product, true)[0]).toBe("heroCompact");
    expect(heroCandidates({ ...product, hero_16_9_url: null })[0]).toBe("heroCompact");
    expect(heroCandidates({ ...product, hero_16_9_url: null, hero_4_3_url: null })[0]).toBe("legacyBanner");
  });
});

describe("access and external media", () => {
  it("rejects expired, blocked or invalid enrollments", () => {
    const at = Date.parse("2026-09-26T17:00:00Z");
    expect(validEnrollment({ status: "active", expires_at: null }, at)).toBe(true);
    expect(validEnrollment({ status: "active", expires_at: "2026-09-27T00:00:00Z" }, at)).toBe(true);
    expect(validEnrollment({ status: "active", expires_at: "2026-09-25T00:00:00Z" }, at)).toBe(false);
    expect(validEnrollment({ status: "canceled", expires_at: null }, at)).toBe(false);
    expect(validEnrollment({ status: "blocked", expires_at: null }, at)).toBe(false);
  });
  it("only accepts secure urls and trusted video providers", () => {
    expect(safeHttps("http://example.com")).toBeNull();
    expect(videoEmbed("https://youtube.com/watch?v=abcdefghijk")).toBe("https://www.youtube-nocookie.com/embed/abcdefghijk");
    expect(videoEmbed("https://vimeo.com/12345")).toBe("https://player.vimeo.com/video/12345");
    expect(videoEmbed("https://evil.example/watch?v=abcdefghijk")).toBeNull();
    expect(videoThumbnail("https://youtu.be/abcdefghijk")).toEqual({ image: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg" });
    expect(videoThumbnail("https://evil.example/watch?v=abcdefghijk")).toBeNull();
  });
});
