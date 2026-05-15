import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { getLegalDocument, LegalDocumentKey } from '@/constants/legal';
import { useAppTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/styles/legal/legal-document.styles';

type LegalDocumentScreenProps = {
  documentKey: LegalDocumentKey;
};

export function LegalDocumentScreen({ documentKey }: LegalDocumentScreenProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const document = getLegalDocument(documentKey);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: document.title,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Documentacion legal</Text>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.summary}>{document.summary}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Version {document.version}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Vigente desde {document.effectiveDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Importante</Text>
          <Text style={styles.noteText}>{document.reviewNote}</Text>
        </View>

        {document.sections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );
}
