"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookCover({
  src,
  title,
  className,
}: {
  src: string | null;
  title: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.045, rotate: -1.5 }}
      whileTap={{ scale: 0.97, rotate: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-hover shadow-sm",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink-muted">
          <BookOpen className="h-8 w-8" strokeWidth={1.5} />
        </div>
      )}
    </motion.div>
  );
}
