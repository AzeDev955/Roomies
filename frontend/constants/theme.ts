export const Theme = {
  colors: {
    // Primarios
    primary:          '#FF6B6B',  // Coral cálido vibrante (Airbnb-inspired)
    primaryLight:     '#FFF0F0',  // Tint suave para focus states y fondos activos
    primaryDisabled:  '#FFBCBC',
    // Semánticos
    success:          '#06D6A0',  // Teal-verde vibrante
    successLight:     '#E8FBF5',
    successDisabled:  '#A3E8DA',
    info:             '#4F8CFF',
    infoLight:        '#EDF4FF',
    danger:           '#FF4757',
    dangerLight:      '#FFF0F2',
    warning:          '#FFA726',
    // Fondos
    background:       '#F8F7F4',  // Off-white cálido (no frío puro)
    surface:          '#FFFFFF',
    surface2:         '#F2F0EB',  // Warm light grey para chips y secundarios
    // Texto
    text:             '#1A1A2E',  // Deep navy — más rico que negro puro
    textSecondary:    '#6B6B80',
    textTertiary:     '#9E9EAF',
    textMuted:        '#C4C4D0',
    textMedium:       '#3D3D56',
    // UI
    border:           '#E8E6E0',  // Borde cálido
    shadow:           '#000000',
  },
  spacing: {
    xs:   4,
    sm:   8,
    md:   12,
    base: 16,
    lg:   24,
    xl:   32,
    xxl:  48,
  },
  radius: {
    sm:   8,
    md:   16,   // Inputs, chips
    lg:   24,   // Cards, botones, modales
    xl:   32,   // Bottom sheets, hero cards
    full: 100,  // Pills, avatares
  },
  typography: {
    caption:  12,
    label:    14,
    body:     15,
    input:    16,
    subtitle: 18,
    title:    20,
    heading:  24,
    hero:     32,
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
} as const;

// Expo template compatibility — used by unused boilerplate components
export const Colors = {
  light: { icon: Theme.colors.textSecondary, text: Theme.colors.text,    background: Theme.colors.background },
  dark:  { icon: Theme.colors.textTertiary,  text: Theme.colors.surface, background: '#151718' },
} as const;
