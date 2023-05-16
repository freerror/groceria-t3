import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        super: "url(/img/super.jpg)",
      },
    },
  },
  plugins: [require("daisyui")],
} satisfies Config;
