/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-quicksand)", "system-ui", "sans-serif"],
        heading: ["var(--font-quicksand)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          purple: "#7C4DFF",
          blue: "#2563EB",
          green: "#15B77A",
          orange: "#F59E0B",
          pink: "#E94B8A",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}
