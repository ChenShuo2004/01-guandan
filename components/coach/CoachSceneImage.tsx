import Image from "next/image";
import { getImageAsset } from "@/lib/assets/image-assets";
import { cn } from "@/lib/utils";

interface CoachSceneImageProps {
  assetId?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export function CoachSceneImage({
  assetId,
  className,
  imageClassName,
  priority = false,
  sizes = "96px"
}: CoachSceneImageProps) {
  const asset = getImageAsset(assetId);

  if (!asset?.src) {
    return (
      <div
        aria-label="AI 教练"
        className={cn(
          "flex h-full w-full items-center justify-center rounded-2xl bg-guandan-muted text-sm font-black text-guandan-gold",
          className
        )}
      >
        AI
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        alt={asset.alt}
        className={cn("object-cover", imageClassName)}
        fill
        priority={priority}
        sizes={sizes}
        src={asset.src}
      />
    </div>
  );
}
