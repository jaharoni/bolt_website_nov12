import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/ui/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1D4E89",
          secondary: "#F97316",
          accent: "#2F855A",
          muted: "#F3F4F6",
          ink: "#0F172A",
        },
      },
      fontSize: {
        base: "18px",
        lg: "20px",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      boxShadow: {
        card: "0 10px 25px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
