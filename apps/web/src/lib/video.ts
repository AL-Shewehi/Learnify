export function getEmbedInfo(
  url?: string,
): { kind: "iframe" | "file"; src: string } | null {
  if (!url) return null;

  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v
        ? { kind: "iframe", src: `https://www.youtube.com/embed/${v}` }
        : null;
    }
    if (u.hostname === "youtu.be") {
      return {
        kind: "iframe",
        src: `https://www.youtube.com/embed${u.pathname}`,
      };
    }
    if (u.hostname.includes("vimeo.com")) {
      return {
        kind: "iframe",
        src: `https://player.vimeo.com/video${u.pathname}`,
      };
    }
    if (/\.(mp4|webm)$/.test(u.pathname)) {
      return { kind: "file", src: url };
    }
    return { kind: "iframe", src: url };
  } catch {
    return null;
  }
}
