import imageManifest from "@/assets/manifests/image-manifest.json";
import type { GeneratedImageAsset } from "@/types/asset";

export const imageAssets = imageManifest as Record<string, GeneratedImageAsset>;

export function getImageAsset(assetId?: string) {
  if (!assetId) {
    return undefined;
  }

  return imageAssets[assetId];
}
