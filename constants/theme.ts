/**
 * Therapeutic App Design System
 * "Therapeutic Playful Professional" - Duolingo meets medical app
 */

// Color Palette - Calming yet energetic
export const Colors = {
  // Primary - Calming yet energetic
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand blue
    600: '#1976D2',
    700: '#1565C0',
    800: '#0D47A1',
    900: '#0A2472',
  },

  // Secondary - Warm encouragement
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Achievement orange
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Success - Growth green
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Error - Alert red
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Warning - Caution yellow
  warning: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B',
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17',
  },

  // Gamification
  star: '#FFD700',
  badge: '#9C27B0',
  avatar: '#00BCD4',
  streak: '#FF5722',

  // Functional
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Text
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Risk levels (M-CHAT-R)
  risk: {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
  },

  // Light/Dark mode compatibility
  light: {
    text: '#1A1A1A',
    background: '#F8F9FA',
    tint: '#2196F3',
    icon: '#666666',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#2196F3',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#64B5F6',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#64B5F6',
  },
};

// Typography - Friendly but readable
export const Typography = {
  fontFamily: {
    primary: 'Poppins_400Regular', // Friendly, rounded - like Duolingo
    primaryBold: 'Poppins_700Bold',
    secondary: 'Inter_400Regular', // Clean for data/forms
    secondaryBold: 'Inter_700Bold',
  },

  // Sizes with Duolingo's playful scale
  fontSize: {
    hero: 32,
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
    hero: 40,
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
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing system (8px base)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Component Style
export const ComponentStyle = {
  // Duolingo-style rounded corners
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Soft shadows for depth
  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  // Button heights
  buttonHeight: {
    small: 36,
    medium: 48,
    large: 56,
  },

  // Input heights
  inputHeight: {
    small: 40,
    medium: 48,
    large: 56,
  },
};

// Animation configurations for Reanimated
export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  spring: {
    bounce: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    smooth: {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    },
    snappy: {
      damping: 15,
      stiffness: 400,
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
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  xxl: 128,
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
