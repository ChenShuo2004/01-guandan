"use client";

import { motion } from "framer-motion";

export function ScorePanel() {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="rounded-[28px] border border-white/65 bg-white/45 p-4 shadow-[0_18px_45px_rgba(38,126,190,0.18)] backdrop-blur-xl"
      initial={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.45, delay: 0.25 }}
    >
      <p className="mb-3 text-sm font-black text-[#12395a]">本局战绩</p>
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-[#47799b]">
        <span>玩家</span>
        <span>得分</span>
        <span>总计</span>
      </div>
      <div className="mt-3 space-y-2 text-sm font-black text-[#17496d]">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/55 px-2 py-2 text-center">
          <span>我方</span>
          <span>--</span>
          <span>2000</span>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/35 px-2 py-2 text-center">
          <span>对方</span>
          <span>--</span>
          <span>2150</span>
        </div>
      </div>
    </motion.div>
  );
}
