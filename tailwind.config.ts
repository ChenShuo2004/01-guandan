import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        guandan: {
          background: "#0B1020",
          arena: "#101827",
          card: "#151D2E",
          elevated: "#1B2538",
          muted: "#202B40",
          gold: "#F6C65B",
          goldDeep: "#C9972E",
          blue: "#4DA3FF",
          cyan: "#54D7FF",
          pokerRed: "#F05252",
          success: "#45D483",
          danger: "#FF6B6B",
          reward: "#FFD36A",
          text: "#F8FAFC",
          subtext: "#A8B3C7",
          mutedText: "#6F7B91",
          border: "#2A3448",
          activeBorder: "#F6C65B"
        }
      },
      boxShadow: {
        soft: "0 18px 48px rgba(0, 0, 0, 0.24)",
        panel: "0 18px 48px rgba(0, 0, 0, 0.22)",
        energy: "0 0 0 1px rgba(246, 198, 91, 0.34), 0 22px 60px rgba(246, 198, 91, 0.12)",
        tech: "0 0 0 1px rgba(77, 163, 255, 0.28), 0 18px 48px rgba(77, 163, 255, 0.08)"
      },
      borderRadius: {
        panel: "1.25rem",
        arena: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
