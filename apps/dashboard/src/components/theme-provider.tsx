"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes/dist/types";

/**
 * Numora Theme Provider
 * Enhanced theme provider with Numora design system defaults
 * Defaults to dark theme as per Numora specification
 */
export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Theme utility functions for Numora design system
 */
export const numoraTheme = {
  colors: {
    background: "hsl(var(--numora-background))",
    surface: "hsl(var(--numora-surface))",
    surfaceHover: "hsl(var(--numora-surface-hover))",
    accent: "hsl(var(--numora-accent))",
    accentMuted: "hsl(var(--numora-accent-muted))",
    textPrimary: "hsl(var(--numora-text-primary))",
    textSecondary: "hsl(var(--numora-text-secondary))",
    textMuted: "hsl(var(--numora-text-muted))",
    border: "hsl(var(--numora-border))",
    borderHover: "hsl(var(--numora-border-hover))",
    success: "hsl(var(--numora-success))",
    warning: "hsl(var(--numora-warning))",
    error: "hsl(var(--numora-error))",
  },
  typography: {
    fontFamily: {
      mono: "var(--font-ibm-plex-mono)",
    },
  },
} as const;

/**
 * Get themed color value
 */
export function getNumoraColor(colorKey: keyof typeof numoraTheme.colors): string {
  return numoraTheme.colors[colorKey];
}

/**
 * Hook to access theme state and controls
 */
export { useTheme } from "next-themes";
