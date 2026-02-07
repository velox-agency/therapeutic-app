/**
 * Therapeutic App Design System
 * Modern Health-Tech UI - Calm, Friendly, and Professional
 * Primary Brand: Purple (from logo)
 */

// Color Palette - Soft, calming, health-tech inspired
export const Colors = {
  // Primary - Soft Purple (Brand Color)
  primary: {
    50: "#F5F0FF",
    100: "#EDE5FF",
    200: "#DBC9FF",
    300: "#C4A7FF",
    400: "#A78BFA",
    500: "#8B5CF6", // Main brand purple
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
  },

  // Secondary - Teal/Mint accent
  secondary: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6", // Teal accent
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },

  // Success - Soft green
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },

  // Error - Soft coral red
  error: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    200: "#FECDD3",
    300: "#FDA4AF",
    400: "#FB7185",
    500: "#F43F5E",
    600: "#E11D48",
    700: "#BE123C",
    800: "#9F1239",
    900: "#881337",
  },

  // Warning - Soft amber
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Accent colors for variety
  accent: {
    peach: "#FECACA",
    lavender: "#DDD6FE",
    mint: "#A7F3D0",
    sky: "#BAE6FD",
    rose: "#FBCFE8",
    amber: "#FDE68A",
  },

  // Gamification - Vibrant but friendly
  star: "#FBBF24",
  badge: "#A78BFA",
  avatar: "#2DD4BF",
  streak: "#FB923C",

  // Functional - Off-white and soft grays
  background: "#FAFBFC",
  surface: "#FFFFFF",
  surfaceVariant: "#F8F9FC",
  surfaceElevated: "#FFFFFF",
  border: "#E5E7EB",
  divider: "#F3F4F6",

  // Text - Dark neutrals (not pure black)
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    disabled: "#D1D5DB",
    inverse: "#FFFFFF",
  },

  // Risk levels (M-CHAT-R)
  risk: {
    low: "#22C55E",
    medium: "#F59E0B",
    high: "#F43F5E",
  },

  // Light/Dark mode compatibility
  light: {
    text: "#1F2937",
    background: "#FAFBFC",
    tint: "#8B5CF6",
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#8B5CF6",
  },
  dark: {
    text: "#F9FAFB",
    background: "#111827",
    tint: "#A78BFA",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#A78BFA",
  },
};

// Typography - Clean, modern sans-serif
export const Typography = {
  fontFamily: {
    primary: "Poppins_400Regular", // Friendly, rounded
    primaryBold: "Poppins_700Bold",
    secondary: "Inter_400Regular", // Clean for data/forms
    secondaryBold: "Inter_700Bold",
  },

  // Modern, well-balanced type scale
  fontSize: {
    hero: 34,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    small: 14,
    tiny: 12,
    micro: 10,
  },

  lineHeight: {
    hero: 42,
    h1: 36,
    h2: 32,
    h3: 28,
    h4: 26,
    body: 24,
    small: 20,
    tiny: 18,
    micro: 14,
  },

  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  // Letter spacing for better readability
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Spacing system (8px base) - Generous for airy feel
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  /** Bottom padding to clear the floating tab bar */
  tabBarClearance: 100,
};

// Component Style - Rounded, soft, modern
export const ComponentStyle = {
  // Rounded corners - more generous for modern feel
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  // Soft, diffuse shadows for depth
  shadow: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: "#6B7280",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    medium: {
      shadowColor: "#6B7280",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    large: {
      shadowColor: "#6B7280",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
    xl: {
      shadowColor: "#6B7280",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 28,
      elevation: 12,
    },
  },

  // Button heights - comfortable touch targets
  buttonHeight: {
    small: 40,
    medium: 52,
    large: 60,
  },

  // Input heights
  inputHeight: {
    small: 44,
    medium: 52,
    large: 60,
  },
};

// Animation configurations for Reanimated
export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  spring: {
    bounce: {
      damping: 12,
      stiffness: 120,
      mass: 0.8,
    },
    smooth: {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    },
    snappy: {
      damping: 18,
      stiffness: 350,
      mass: 0.3,
    },
  },
};

// Icon sizes
export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

// Avatar sizes
export const AvatarSize = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 88,
  xxl: 120,
};

// Default theme export for convenience
export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  components: ComponentStyle,
  animation: Animation,
  iconSize: IconSize,
  avatarSize: AvatarSize,
};
