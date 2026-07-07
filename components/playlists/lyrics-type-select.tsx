import type { LyricsType } from "@/app/generated/prisma/enums";

const OPTIONS: { value: LyricsType; label: string }[] = [
  { value: "INSTRUMENTAL", label: "Instrumental" },
  { value: "LYRICAL", label: "Has Lyrics" },
  { value: "MIXED", label: "Mixed" },
];

export function LyricsTypeSelect({ defaultValue }: { defaultValue?: LyricsType | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">Sound</span>
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer">
          <input type="radio" name="lyricsType" value="" defaultChecked={!defaultValue} className="peer sr-only" />
          <span className="inline-block rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground">
            Not set
          </span>
        </label>
        {OPTIONS.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name="lyricsType"
              value={option.value}
              defaultChecked={defaultValue === option.value}
              className="peer sr-only"
            />
            <span className="inline-block rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
