import Image from "next/image";
import { getImageAsset } from "@/lib/assets/image-assets";
import { cn } from "@/lib/utils";

interface AssetImageProps {
  assetId?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export function AssetImage({
  assetId,
  className,
  imageClassName,
  priority = false,
  sizes = "100vw"
}: AssetImageProps) {
  const asset = getImageAsset(assetId);

  if (!asset?.src) {
    return (
      <div
        className={cn(
          "flex h-full min-h-40 w-full items-center justify-center rounded-2xl border border-dashed border-guandan-border bg-guandan-muted text-center text-sm font-bold text-guandan-subtext",
          className
        )}
      >
        素材待补充
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-guandan-muted", className)}>
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
