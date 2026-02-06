import type { Config } from "tailwindcss";

export default{
  darkMode: "class", // Enables dark mode via a class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)", 
        primary: "var(--primary)", 
        secondary: "var(--secondary)", 
        accent: "var(--accent)",
        border: "var(--border)", 
        card: "var(--card)", 
        "muted-foreground": "var(--muted-foreground)",
        island_background: "var(--island-background)",
        island_border: "var(--island-border)",         
      },
      borderRadius: {
        'theme': 'var(--rounded)',
      },
    },
  },
  plugins: [],
} satisfies Config;
