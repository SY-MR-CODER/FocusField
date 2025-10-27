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
        background: "#F4F7F6",
        foreground: "#1E2D2F",
        accent: "#5C946E",
        secondary: "#A5D6A7",
        'sage-green': "#5C946E",
        'mint-green': "#A5D6A7",
        'dark-charcoal': "#1E2D2F",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;