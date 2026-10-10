import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        studio: {
          cyan: "#0284c7", // vibrant sky
          blue: "#2563eb", // vibrant royal
          violet: "#7c3aed", // modern violet
          purple: "#9333ea",
          dark: "#f8fafc", // ultra light surface
          darker: "#ffffff", // pure white surface
          card: "rgba(255, 255, 255, 0.92)",
          cardBorder: "rgba(226, 232, 240, 0.85)",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanline 2.5s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        scanline: {
          "0%, 100%": { transform: "translateY(0%)", opacity: "0.2" },
          "50%": { transform: "translateY(95%)", opacity: "0.9" },
        },
        glow: {
          "0%": { filter: "drop-shadow(0 0 5px rgba(14,165,233,0.3))" },
          "100%": { filter: "drop-shadow(0 0 15px rgba(124,58,237,0.4))" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      boxShadow: {
        "neon-cyan": "0 8px 24px -4px rgba(2, 132, 199, 0.25)",
        "neon-violet": "0 8px 24px -4px rgba(124, 58, 237, 0.25)",
        "glass": "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
