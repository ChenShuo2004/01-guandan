import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "public", "assets", "poker-cards");
const frontsDir = path.join(outputRoot, "fronts");

const suits = [
  { id: "spade", symbol: "♠", color: "#151922", accent: "#d6a83c" },
  { id: "heart", symbol: "♥", color: "#d94141", accent: "#f05252" },
  { id: "club", symbol: "♣", color: "#151922", accent: "#d6a83c" },
  { id: "diamond", symbol: "♦", color: "#d94141", accent: "#f05252" }
];

const ranks = [
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "J" },
  { value: 12, label: "Q" },
  { value: 13, label: "K" },
  { value: 14, label: "A" },
  { value: 15, label: "2" }
];

fs.mkdirSync(frontsDir, { recursive: true });

const manifest = [];

for (const suit of suits) {
  for (const rank of ranks) {
    const id = `${suit.id}-${rank.label.toLowerCase()}`;
    const fileName = `${id}.svg`;
    fs.writeFileSync(path.join(frontsDir, fileName), createCardSvg(rank.label, suit), "utf8");
    manifest.push({
      id,
      rank: rank.value,
      label: rank.label,
      suit: suit.id,
      path: `/assets/poker-cards/fronts/${fileName}`
    });
  }
}

for (const joker of [
  { id: "joker-small", label: "SJ", color: "#1d4ed8", accent: "#4bb8ff", title: "SMALL JOKER" },
  { id: "joker-big", label: "BJ", color: "#b91c1c", accent: "#ffd84d", title: "BIG JOKER" }
]) {
  const fileName = `${joker.id}.svg`;
  fs.writeFileSync(path.join(frontsDir, fileName), createJokerSvg(joker), "utf8");
  manifest.push({
    id: joker.id,
    rank: joker.id === "joker-small" ? 16 : 17,
    label: joker.label,
    suit: "joker",
    path: `/assets/poker-cards/fronts/${fileName}`
  });
}

fs.writeFileSync(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), cards: manifest }, null, 2)}\n`,
  "utf8"
);

console.log(`Generated ${manifest.length} poker card assets in ${frontsDir}`);

function createCardSvg(label, suit) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="252" viewBox="0 0 180 252" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="170" height="242" rx="18" fill="url(#paper)" stroke="#f7f2e6" stroke-width="10"/>
  <rect x="10" y="10" width="160" height="232" rx="14" stroke="${suit.accent}" stroke-opacity="0.18" stroke-width="2"/>
  <path d="M24 132C44 94 70 78 90 42C110 78 136 94 156 132C166 152 155 177 130 177C115 177 101 168 96 155V197H84V155C79 168 65 177 50 177C25 177 14 152 24 132Z" fill="${suit.color}" fill-opacity="0.96"/>
  <path d="M90 66C103 89 126 105 142 132C150 146 143 162 127 162C111 162 98 150 96 134C92 156 75 169 56 165C42 162 36 147 43 133C58 105 78 89 90 66Z" fill="${suit.accent}" fill-opacity="0.24"/>
  <text x="21" y="42" fill="${suit.color}" font-family="Georgia, serif" font-size="32" font-weight="800">${label}</text>
  <text x="23" y="68" fill="${suit.color}" font-family="Georgia, serif" font-size="28" font-weight="800">${suit.symbol}</text>
  <text x="159" y="210" fill="${suit.color}" font-family="Georgia, serif" font-size="32" font-weight="800" text-anchor="middle" transform="rotate(180 159 210)">${label}</text>
  <text x="157" y="184" fill="${suit.color}" font-family="Georgia, serif" font-size="28" font-weight="800" text-anchor="middle" transform="rotate(180 157 184)">${suit.symbol}</text>
  <defs>
    <linearGradient id="paper" x1="22" y1="14" x2="158" y2="238" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fffdfa"/>
      <stop offset="0.52" stop-color="#f5f1ea"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
</svg>
`;
}

function createJokerSvg(joker) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="252" viewBox="0 0 180 252" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="170" height="242" rx="18" fill="url(#paper)" stroke="#f7f2e6" stroke-width="10"/>
  <rect x="10" y="10" width="160" height="232" rx="14" stroke="${joker.accent}" stroke-opacity="0.34" stroke-width="2"/>
  <path d="M90 48L108 87L151 92L120 122L128 166L90 144L52 166L60 122L29 92L72 87L90 48Z" fill="${joker.color}" fill-opacity="0.95"/>
  <circle cx="90" cy="123" r="38" fill="${joker.accent}" fill-opacity="0.16"/>
  <text x="20" y="42" fill="${joker.color}" font-family="Inter, Arial, sans-serif" font-size="27" font-weight="900">${joker.label}</text>
  <text x="90" y="206" fill="${joker.color}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="2">${joker.title}</text>
  <text x="160" y="210" fill="${joker.color}" font-family="Inter, Arial, sans-serif" font-size="27" font-weight="900" text-anchor="middle" transform="rotate(180 160 210)">${joker.label}</text>
  <defs>
    <linearGradient id="paper" x1="22" y1="14" x2="158" y2="238" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fffdfa"/>
      <stop offset="0.52" stop-color="#f4f0e8"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
</svg>
`;
}
