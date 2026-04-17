import type { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

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
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Theme.colors.primary} />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  header: {
    minHeight: 72,
    padding: Theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Theme.spacing.xs,
  },
  title: {
    fontSize: Theme.typography.body,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  meta: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    color: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    overflow: 'hidden',
    flexShrink: 0,
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
});
