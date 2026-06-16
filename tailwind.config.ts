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
        obsidian: "rgb(var(--color-obsidian, 5 5 5) / <alpha-value>)",
        carbon: "rgb(var(--color-carbon, 18 18 18) / <alpha-value>)",
        tungsten: "rgb(var(--color-tungsten, 26 26 26) / <alpha-value>)",
        crimson: {
          DEFAULT: "rgb(var(--color-crimson, 204 0 0) / <alpha-value>)",
          hover: "rgb(var(--color-crimson-hover, 255 26 26) / <alpha-value>)",
        },
        ash: "rgb(var(--color-ash, 136 136 136) / <alpha-value>)",
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
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;