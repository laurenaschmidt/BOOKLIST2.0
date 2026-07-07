"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Avatar from "@radix-ui/react-avatar";
import { Camera, Loader2 } from "lucide-react";

export function AvatarUploader({
  name,
  image,
}: {
  name: string;
  image: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(image);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPreview(data.url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(image);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-border ring-offset-2 ring-offset-canvas transition"
      >
        <Avatar.Root className="flex h-full w-full items-center justify-center bg-sage text-sage-foreground">
          <Avatar.Image src={preview ?? undefined} alt={name} className="h-full w-full object-cover" />
          <Avatar.Fallback className="text-3xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </button>
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
