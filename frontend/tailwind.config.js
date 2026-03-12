/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
        bg: "#0f172a",
        surface: "#1e293b",
        border: "#334155",
        text: "#e2e8f0",
        muted: "#64748b",
      },
    },
  },
  plugins: [],
};
