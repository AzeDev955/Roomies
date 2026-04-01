export const Theme = {
  colors: {
    // Primarios
    primary:         '#007AFF',
    primaryDisabled: '#b0c8f0',
    // Semánticos
    success:         '#34C759',
    successDisabled: '#a8ddb5',
    danger:          '#FF3B30',
    warning:         '#FF9500',
    // Fondos
    background:      '#f5f5f5',
    surface:         '#ffffff',
    surface2:        '#e9ecef',
    // Texto
    text:            '#212529',
    textSecondary:   '#6c757d',
    textTertiary:    '#9e9e9e',
    textMuted:       '#c7c7cc',
    textMedium:      '#495057',
    // UI
    border:          '#dee2e6',
    shadow:          '#000000',
  },
  spacing: {
    xs:   4,
    sm:   8,
    md:   12,
    base: 16,
    lg:   24,
    xl:   32,
  },
  radius: {
    sm:   8,
    md:   12,
    lg:   20,
    full: 28,
  },
  typography: {
    caption: 12,
    label:   13,
    body:    15,
    input:   16,
    title:   20,
    heading: 24,
    hero:    32,
  },
} as const;

// Expo template compatibility — used by unused boilerplate components
export const Colors = {
  light: { icon: Theme.colors.textSecondary, text: Theme.colors.text,     background: Theme.colors.background },
  dark:  { icon: Theme.colors.textTertiary,  text: Theme.colors.surface,  background: '#151718' },
} as const;
