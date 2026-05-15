import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { legalDocuments } from '@/constants/legal';
import { useAppTheme } from '@/contexts/ThemeContext';
import { createStyles } from './LegalNotice.styles';

type LegalNoticeProps = {
  title?: string;
  body: string;
  accepted?: boolean;
  onToggleAccepted?: () => void;
  acceptanceLabel?: string;
  variant?: 'card' | 'inline';
};

function LegalLinks() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const version = legalDocuments.terminos.version;
  const effectiveDate = legalDocuments.terminos.effectiveDate;
  const terminosRoute = '/legal/terminos' as Href;
  const privacidadRoute = '/legal/privacidad' as Href;

  return (
    <>
      <View style={styles.rowWrap}>
        <Text style={styles.body}>Consulta </Text>
        <Pressable
          onPress={() => router.push(terminosRoute)}
          accessibilityRole="link"
          accessibilityLabel="Abrir terminos de uso"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Terminos de uso</Text>
        </Pressable>
        <Text style={styles.body}> y </Text>
        <Pressable
          onPress={() => router.push(privacidadRoute)}
          accessibilityRole="link"
          accessibilityLabel="Abrir politica de privacidad"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Politica de privacidad</Text>
        </Pressable>
        <Text style={styles.body}>.</Text>
      </View>
      <Text style={styles.meta}>Version {version} · vigente desde {effectiveDate}</Text>
    </>
  );
}

export function LegalNotice({
  title,
  body,
  accepted,
  onToggleAccepted,
  acceptanceLabel,
  variant = 'card',
}: LegalNoticeProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const containerStyle = variant === 'inline' ? styles.inline : styles.card;

  return (
    <View style={containerStyle}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.body}>{body}</Text>
      <LegalLinks />
      {typeof accepted === 'boolean' && onToggleAccepted && acceptanceLabel ? (
        <Pressable
          onPress={onToggleAccepted}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          accessibilityLabel={acceptanceLabel}
          style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted ? <Ionicons name="checkmark" size={16} color={theme.colors.surface} /> : null}
          </View>
          <Text style={styles.checkboxCopy}>{acceptanceLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
