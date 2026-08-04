/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111111",
        surface: "#1A1A1A",
        gold: {
          DEFAULT: "#C9A227",
          hover: "#E5B82B",
          light: "#F3D675",
        },
        primaryText: "#F8F6F2",
        secondaryText: "#A5A5A5",
        customBorder: "#2E2E2E",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["Manrope", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(201, 162, 39, 0.2)",
        "gold-glow-lg": "0 0 35px rgba(201, 162, 39, 0.45)",
        "premium": "0 20px 40px rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "radial-gold-glow": "radial-gradient(circle at center, rgba(201, 162, 39, 0.15) 0%, transparent 70%)",
        "shelf-wood": "linear-gradient(to bottom, #2c1e13 0%, #1a110a 100%)",
        "shelf-top": "linear-gradient(to right, #1f140c 0%, #3d2a1c 50%, #1f140c 100%)",
      }
    },
  },
  plugins: [],
}