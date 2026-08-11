/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14213A",
          soft: "#2A3A56",
          faint: "#5B6B78",
        },
        canvas: "#F5F7F6",
        surface: "#FFFFFF",
        accent: {
          DEFAULT: "#1F6F78",
          soft: "#E4EEEE",
          dark: "#154F56",
        },
        line: "#DEE3E1",
        success: { DEFAULT: "#1E8E5A", soft: "#E4F4EC" },
        warning: { DEFAULT: "#B9770E", soft: "#FBF0DD" },
        danger: { DEFAULT: "#C33C3C", soft: "#FBEAEA" },
        pending: { DEFAULT: "#8A93A6", soft: "#EEF0F3" },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,58,0.06), 0 1px 8px rgba(20,33,58,0.04)",
        popover: "0 8px 30px rgba(20,33,58,0.14)",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(31,111,120,0.35)" },
          "100%": { boxShadow: "0 0 0 8px rgba(31,111,120,0)" },
        },
        dash: {
          to: { strokeDashoffset: "0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.1s ease-out infinite",
        fadeUp: "fadeUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
