import type { LyricsType } from "@/app/generated/prisma/enums";

const CONFIG: Record<LyricsType, { label: string; className: string }> = {
  INSTRUMENTAL: { label: "Instrumental", className: "bg-dusty/15 text-dusty" },
  LYRICAL: { label: "Has Lyrics", className: "bg-sage/15 text-sage" },
  MIXED: { label: "Mixed", className: "bg-accent/15 text-accent" },
};

export function LyricsTypeBadge({ lyricsType }: { lyricsType: LyricsType | null }) {
  if (!lyricsType) return null;
  const { label, className } = CONFIG[lyricsType];

  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
