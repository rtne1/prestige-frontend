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
        obsidian: "#050505",
        carbon: "#121212",
        tungsten: "#1A1A1A",
        crimson: {
          DEFAULT: "#CC0000",
          hover: "#FF1A1A",
        },
        ash: "#888888",
        glass: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        janna: ["'Bahij Janna'", "sans-serif"],
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;