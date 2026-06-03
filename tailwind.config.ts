import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        panel: "#ffffff",
        mist: "#f6f8fb",
        line: "#d9e2ec",
        teal: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e"
        },
        amber: "#f59e0b",
        danger: "#dc2626"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
