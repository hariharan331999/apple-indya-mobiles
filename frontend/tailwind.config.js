/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'SF Pro Display'", "'Helvetica Neue'", "Arial", "sans-serif"],
        mono: ["'SF Mono'", "monospace"],
      },
      colors: {
        apple: {
          blue: "#0071e3",
          dark: "#1d1d1f",
          gray: "#86868b",
          light: "#f5f5f7",
          white: "#ffffff",
          red: "#ff3b30",
          green: "#30d158",
          orange: "#ff9f0a",
          purple: "#bf5af2",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
