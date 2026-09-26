import type { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;
export type MediaRatio = "16:9" | "4:3" | "1:1" | "3:4" | "9:16";

export const ratioClass: Record<MediaRatio, string> = {
  "16:9": "aspect-video", "4:3": "aspect-[4/3]", "1:1": "aspect-square",
  "3:4": "aspect-[3/4]", "9:16": "aspect-[9/16]",
};

const coverFields: Record<MediaRatio, keyof Course> = {
  "16:9": "cover_16_9_url", "4:3": "cover_4_3_url", "1:1": "cover_1_1_url",
  "3:4": "cover_3_4_url", "9:16": "cover_9_16_url",
};
const shape: Record<MediaRatio, number> = {
  "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "3:4": 3 / 4, "9:16": 9 / 16,
};
const clean = (value: unknown): string | null => typeof value === "string" && value.trim() ? value.trim() : null;
const unique = (values: (string | null)[]) => [...new Set(values.filter((value): value is string => Boolean(value)))];

export function coverCandidates(course: Course, ratio: MediaRatio): string[] {
  const nearest = (Object.keys(coverFields) as MediaRatio[])
    .filter((other) => other !== ratio && other !== "16:9")
    .sort((a, b) => Math.abs(Math.log(shape[a] / shape[ratio])) - Math.abs(Math.log(shape[b] / shape[ratio])));
  return unique([clean(course[coverFields[ratio]]), ...nearest.map((key) => clean(course[coverFields[key]])),
    clean(course.cover_16_9_url), clean(course.cover_url)]);
}

export function heroCandidates(course: Course, compact = false): string[] {
  const ratio: MediaRatio = compact ? "4:3" : "16:9";
  return unique([clean(course[compact ? "hero_4_3_url" : "hero_16_9_url"]),
    clean(course[compact ? "hero_16_9_url" : "hero_4_3_url"]), clean(course.banner_url),
    clean(course[coverFields[ratio]]), clean(course.cover_16_9_url), clean(course.cover_url)]);
}

export function safeHttps(url: string | null | undefined): string | null {
  try {
    const parsed = new URL(url || "");
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch { return null; }
}

export function validEnrollment(enrollment: { status: string; expires_at: string | null }, at = Date.now()): boolean {
  return enrollment.status === "active" && (!enrollment.expires_at || new Date(enrollment.expires_at).getTime() > at);
}

export function videoEmbed(url: string): string | null {
  try {
    const value = new URL(url);
    if (value.protocol !== "https:") return null;
    if (value.hostname === "youtu.be") {
      const id = value.pathname.slice(1);
      return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(value.hostname)) {
      const id = value.pathname === "/watch" ? value.searchParams.get("v") : value.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})$/)?.[1];
      return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(value.hostname)) {
      const id = value.pathname.match(/^\/(?:video\/)?(\d+)$/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch { return null; }
}
