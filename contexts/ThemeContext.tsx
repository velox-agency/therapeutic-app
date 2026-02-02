import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;

  // Primary palette
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;

  // Secondary palette
  secondary: string;
  secondaryLight: string;
  onSecondary: string;

  // Success/Error/Warning
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;

  // Borders & Dividers
  border: string;
  divider: string;

  // Special
  star: string;
  badge: string;
  streak: string;
  avatar: string;

  // Risk levels
  riskLow: string;
  riskMedium: string;
  riskHigh: string;

  // Tab bar
  tabIconDefault: string;
  tabIconSelected: string;
}

const lightTheme: ThemeColors = {
  // Backgrounds
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F5F5",
  surfaceElevated: "#FFFFFF",

  // Primary
  primary: Colors.primary[500],
  primaryLight: Colors.primary[50],
  primaryDark: Colors.primary[700],
  onPrimary: "#FFFFFF",

  // Secondary
  secondary: Colors.secondary[500],
  secondaryLight: Colors.secondary[50],
  onSecondary: "#FFFFFF",

  // Success/Error/Warning
  success: Colors.success[500],
  successLight: Colors.success[50],
  error: Colors.error[500],
  errorLight: Colors.error[50],
  warning: Colors.warning[500],
  warningLight: Colors.warning[100],

  // Text
  text: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textDisabled: "#9E9E9E",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E0E0E0",
  divider: "#EEEEEE",

  // Special
  star: Colors.star,
  badge: Colors.badge,
  streak: Colors.streak,
  avatar: Colors.avatar,

  // Risk
  riskLow: Colors.success[500],
  riskMedium: Colors.secondary[500],
  riskHigh: Colors.error[500],

  // Tab bar
  tabIconDefault: "#9E9E9E",
  tabIconSelected: Colors.primary[500],
};

const darkTheme: ThemeColors = {
  // Backgrounds
  background: "#121212",
  surface: "#1E1E1E",
  surfaceVariant: "#2A2A2A",
  surfaceElevated: "#2D2D2D",

  // Primary
  primary: Colors.primary[400],
  primaryLight: "#1E3A5F",
  primaryDark: Colors.primary[300],
  onPrimary: "#000000",

  // Secondary
  secondary: Colors.secondary[400],
  secondaryLight: "#3D2A00",
  onSecondary: "#000000",

  // Success/Error/Warning
  success: Colors.success[400],
  successLight: "#1B3D1B",
  error: Colors.error[400],
  errorLight: "#3D1B1B",
  warning: Colors.warning[400],
  warningLight: "#3D3500",

  // Text
  text: "#ECEDEE",
  textSecondary: "#B3B3B3",
  textTertiary: "#808080",
  textDisabled: "#666666",
  textInverse: "#1A1A1A",

  // Borders
  border: "#3D3D3D",
  divider: "#2A2A2A",

  // Special
  star: Colors.star,
  badge: "#BA68C8",
  streak: Colors.streak,
  avatar: Colors.avatar,

  // Risk
  riskLow: Colors.success[400],
  riskMedium: Colors.secondary[400],
  riskHigh: Colors.error[400],

  // Tab bar
  tabIconDefault: "#808080",
  tabIconSelected: Colors.primary[400],
};

interface ThemeContextType {
  mode: ThemeMode;
  theme: ResolvedTheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "@therapeutic_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme mode:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadThemeMode();
  }, []);

  // Resolve actual theme
  const resolvedTheme: ResolvedTheme =
    mode === "system" ? (systemColorScheme ?? "light") : mode;

  const colors = resolvedTheme === "dark" ? darkTheme : lightTheme;
  const isDark = resolvedTheme === "dark";

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode =
      mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(nextMode);
  }, [mode, setMode]);

  if (!isLoaded) {
    return null; // Or a loading component
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: resolvedTheme,
        colors,
        setMode,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Convenient hook for just colors
export function useColors() {
  const { colors } = useTheme();
  return colors;
}
