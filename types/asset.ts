export interface AnimationAsset {
  id: string;
  type: "placeholder" | "framer" | "gsap" | "lottie" | "svg";
  src?: string;
  description: string;
}

export interface GeneratedImageAsset {
  id: string;
  type: "placeholder" | "webp" | "png" | "svg";
  src?: string;
  alt: string;
  aspectRatio: "1:1" | "3:4" | "4:5" | "3:1" | "16:5";
}
