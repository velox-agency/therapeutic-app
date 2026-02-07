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

  // Accent colors
  accentPeach: string;
  accentLavender: string;
  accentMint: string;
  accentSky: string;
}

const lightTheme: ThemeColors = {
  // Backgrounds - Soft, airy
  background: "#FAFBFC",
  surface: "#FFFFFF",
  surfaceVariant: "#F8F9FC",
  surfaceElevated: "#FFFFFF",

  // Primary - Soft Purple
  primary: Colors.primary[500],
  primaryLight: Colors.primary[50],
  primaryDark: Colors.primary[700],
  onPrimary: "#FFFFFF",

  // Secondary - Teal
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

  // Text - Dark neutrals (not pure black)
  text: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textDisabled: "#D1D5DB",
  textInverse: "#FFFFFF",

  // Borders - Soft
  border: "#E5E7EB",
  divider: "#F3F4F6",

  // Special
  star: Colors.star,
  badge: Colors.primary[400],
  streak: Colors.streak,
  avatar: Colors.secondary[400],

  // Risk
  riskLow: Colors.success[500],
  riskMedium: Colors.warning[500],
  riskHigh: Colors.error[500],

  // Tab bar
  tabIconDefault: "#9CA3AF",
  tabIconSelected: Colors.primary[500],

  // Accent colors
  accentPeach: "#FECACA",
  accentLavender: "#DDD6FE",
  accentMint: "#A7F3D0",
  accentSky: "#BAE6FD",
};

const darkTheme: ThemeColors = {
  // Backgrounds - Deep, rich
  background: "#0F172A",
  surface: "#1E293B",
  surfaceVariant: "#334155",
  surfaceElevated: "#1E293B",

  // Primary - Soft Purple (lighter for dark mode)
  primary: Colors.primary[400],
  primaryLight: "#2E1065",
  primaryDark: Colors.primary[300],
  onPrimary: "#FFFFFF",

  // Secondary - Teal
  secondary: Colors.secondary[400],
  secondaryLight: "#134E4A",
  onSecondary: "#FFFFFF",

  // Success/Error/Warning
  success: Colors.success[400],
  successLight: "#14532D",
  error: Colors.error[400],
  errorLight: "#881337",
  warning: Colors.warning[400],
  warningLight: "#78350F",

  // Text - Light
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textTertiary: "#9CA3AF",
  textDisabled: "#6B7280",
  textInverse: "#1F2937",

  // Borders
  border: "#475569",
  divider: "#334155",

  // Special
  star: Colors.star,
  badge: Colors.primary[300],
  streak: Colors.streak,
  avatar: Colors.secondary[300],

  // Risk
  riskLow: Colors.success[400],
  riskMedium: Colors.warning[400],
  riskHigh: Colors.error[400],

  // Tab bar
  tabIconDefault: "#6B7280",
  tabIconSelected: Colors.primary[400],

  // Accent colors
  accentPeach: "#7F1D1D",
  accentLavender: "#4C1D95",
  accentMint: "#14532D",
  accentSky: "#0C4A6E",
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
