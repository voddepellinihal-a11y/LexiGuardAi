/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C8A6E8",
          hover: "#D8BDF0",
          foreground: "#0B0F14",
        },
        accent: {
          DEFAULT: "#D6B878",
          foreground: "#0B0F14",
        },
        secondary: {
          DEFAULT: "#8B96A5",
          foreground: "#F4F1F7",
        },
        background: "#0B0F14",
        surface: "#151D29",
        "surface-hover": "#1B2635",
        "surface-muted": "#101722",
        border: "#263241",
        "text-primary": "#F4F1F7",
        "text-secondary": "#A8B1BD",
        "text-muted": "#8B96A5",
        risk: {
          critical: "#F04438",
          high: "#F79009",
          medium: "#F5C451",
          low: "#32D583",
          info: "#53B1FD",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
      },
      fontSize: {
        "page-title": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "section-title": ["24px", { lineHeight: "32px", fontWeight: "650" }],
        "card-title": ["18px", { lineHeight: "28px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "24px", fontWeight: "400" }],
        secondary: ["13px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
