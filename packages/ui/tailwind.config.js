"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx}"],
    safelist: ["dark", "light"],
    theme: {
        extend: {
            fontFamily: {
                sans: "var(--font-geist-sans)",
                mono: ["var(--font-ibm-plex-mono)", "var(--font-geist-mono)", "monospace"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Numora Design System Colors
                numora: {
                    background: "hsl(var(--numora-background))",
                    surface: "hsl(var(--numora-surface))",
                    "surface-hover": "hsl(var(--numora-surface-hover))",
                    accent: "hsl(var(--numora-accent))",
                    "accent-muted": "hsl(var(--numora-accent-muted))",
                    "text-primary": "hsl(var(--numora-text-primary))",
                    "text-secondary": "hsl(var(--numora-text-secondary))",
                    "text-muted": "hsl(var(--numora-text-muted))",
                    border: "hsl(var(--numora-border))",
                    "border-hover": "hsl(var(--numora-border-hover))",
                    success: "hsl(var(--numora-success))",
                    warning: "hsl(var(--numora-warning))",
                    error: "hsl(var(--numora-error))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                jiggle: {
                    "0%": {
                        transform: "rotate(-4deg)",
                    },
                    "50%": {
                        transform: "rotate(4deg)",
                    },
                },
                "caret-blink": {
                    "0%,70%,100%": { opacity: "1" },
                    "20%,50%": { opacity: "0" },
                },
                scroll: {
                    to: {
                        transform: "translate(calc(-50% - 0.5rem))",
                    },
                },
                moveHorizontal: {
                    "0%": {
                        transform: "translateX(-50%) translateY(-10%)",
                    },
                    "50%": {
                        transform: "translateX(50%) translateY(10%)",
                    },
                    "100%": {
                        transform: "translateX(-50%) translateY(-10%)",
                    },
                },
                moveInCircle: {
                    "0%": {
                        transform: "rotate(0deg)",
                    },
                    "50%": {
                        transform: "rotate(180deg)",
                    },
                    "100%": {
                        transform: "rotate(360deg)",
                    },
                },
                moveVertical: {
                    "0%": {
                        transform: "translateY(-50%)",
                    },
                    "50%": {
                        transform: "translateY(50%)",
                    },
                    "100%": {
                        transform: "translateY(-50%)",
                    },
                },
                "webgl-scale-in-fade": {
                    "0%": {
                        opacity: "0",
                        transform: "scale(.7)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "scale(1)",
                    },
                },
                "open-scale-up-fade": {
                    "0%": {
                        opacity: "0",
                        transform: "scale(.98) translateY(5px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "scale(1) translateY(0)",
                    },
                },
            },
            animation: {
                "animate-webgl-scale-in-fade": "webgl-scale-in-fade 1s ease-in-out",
                "open-scale-up-fade": "open-scale-up-fade",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "caret-blink": "caret-blink 1.25s ease-out infinite",
                first: "moveVertical 30s ease infinite",
                second: "moveInCircle 20s reverse infinite",
                third: "moveInCircle 40s linear infinite",
                fourth: "moveHorizontal 40s ease infinite",
                fifth: "moveInCircle 20s ease infinite",
                scroll: "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
            },
            screens: {
                "3xl": "1800px",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
