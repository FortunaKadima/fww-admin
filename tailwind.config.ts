import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Official FWW brand colors — sourced from exported-styles.json (Drive)
        fww: {
          "green-950": "#001805",
          "green-900": "#002409",
          "green-800": "#003e16",
          "green-700": "#015d25",
          "green-600": "#007c33", // hero green — primary CTA
          "green-500": "#008236",
          "green-400": "#00b64f",
          "green-300": "#00d25c",
          "green-200": "#02eb68",
          "green-100": "#7fff9e",
          "green-50":  "#d0ffd9", // light tint
          // Neutrals — from Figma design system
          "sage-50":  "#f4f6f0",
          "sage-100": "#e6eadc",
          "sage-200": "#d4dcc4",
          "sage-400": "#9aa489",
          "sage-600": "#636858",
          "sage-800": "#4a5041",
          "cream":    "#fbf9f6",
        },
      },
      fontFamily: {
        // ✅ Official FWW typeface — Albert Sans (confirmed from App Doc Assets + Drive Typefaces folder)
        sans: ["Albert Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
