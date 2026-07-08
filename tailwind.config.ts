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
          background: "#10131A",
          card: "#181C25",
          muted: "#202634",
          gold: "#F6C65B",
          success: "#55D68A",
          danger: "#FF6B6B",
          text: "#F8FAFC",
          subtext: "#A7B0C0",
          border: "#2A3140"
        }
      },
      boxShadow: {
        soft: "0 18px 48px rgba(0, 0, 0, 0.24)"
      }
    }
  },
  plugins: []
};

export default config;
