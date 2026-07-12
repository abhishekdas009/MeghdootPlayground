import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0176D3",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#032D60",
          foreground: "#FFFFFF",
        },
        background: "#F3F6F9",
        card: "#FFFFFF",
        border: "#D8DDE6",
        hover: "#EEF4FF",
        success: "#2E844A",
        warning: "#FE9339",
        danger: "#EA001E",
        muted: {
          DEFAULT: "#F3F6F9",
          foreground: "#5C6670",
        },
        foreground: "#181818",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px 0 rgba(1,118,211,0.12), 0 2px 4px -1px rgba(0,0,0,0.06)",
        header: "0 1px 0 0 rgba(0,0,0,0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
