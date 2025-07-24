import baseConfig from "@iq24/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    container: {
      center: true,
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      perspective: {
        '1000': '1000px',
      },
      rotate: {
        'x-1': 'rotateX(1deg)',
        'x-2': 'rotateX(2deg)',
      },
    },
  },
} satisfies Config;
