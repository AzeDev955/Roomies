import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

type AccordionSectionProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AccordionSection({
  title,
  subtitle,
  meta,
  expanded,
  onToggle,
  children,
  style,
}: AccordionSectionProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${expanded ? 'Plegar' : 'Desplegar'} ${title}`}
      >
        <View style={styles.iconBox}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </Pressable>

      {expanded ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.2 : 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    minHeight: 72,
    padding: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.base,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.body,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  meta: {
    fontSize: theme.typography.caption,
    fontWeight: '800',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    overflow: 'hidden',
    flexShrink: 0,
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.base,
    gap: theme.spacing.base,
  },
});
