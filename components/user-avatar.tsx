import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-28 w-28 text-3xl",
};

export function UserAvatar({
  name,
  image,
  size = "sm",
  className,
}: {
  name: string;
  image: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Avatar.Root
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage text-sage-foreground",
        SIZES[size],
        className
      )}
    >
      <Avatar.Image src={image ?? undefined} alt={name} className="h-full w-full object-cover" />
      <Avatar.Fallback className="font-semibold">{name.charAt(0).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
  );
}
