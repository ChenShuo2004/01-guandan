"use client";

import { motion } from "framer-motion";

export function AIThinking() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((item) => (
        <motion.span
          animate={{ opacity: [0.35, 1, 0.75], y: [0, -3, 0] }}
          className="h-1.5 w-1.5 rounded-full bg-[#4bb8ff]"
          key={item}
          transition={{ duration: 0.75, delay: item * 0.15 }}
        />
      ))}
    </div>
  );
}
