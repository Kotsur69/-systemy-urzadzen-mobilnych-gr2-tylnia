import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@theme:mode";

export const LIGHT = {
  bg: "#f8fafc",
  surface: "#ffffff",
  primary: "#3b82f6",
  text: "#0f172a",
  textSub: "#64748b",
  border: "#e2e8f0",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  inputBg: "#f1f5f9",
  badge: "#e2e8f0",
  badgeText: "#475569",
  icon: "#444",
};

export const DARK = {
  bg: "#0f172a",
  surface: "#1e293b",
  primary: "#60a5fa",
  text: "#f1f5f9",
  textSub: "#94a3b8",
  border: "#334155",
  danger: "#f87171",
  success: "#34d399",
  warning: "#fbbf24",
  inputBg: "#1e293b",
  badge: "#334155",
  badgeText: "#94a3b8",
  icon: "#94a3b8",
};

type Colors = typeof LIGHT;

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
  C: Colors;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  toggle: () => {},
  C: LIGHT,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "dark") setIsDark(true);
    });
  }, []);

  const toggle = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, C: isDark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
