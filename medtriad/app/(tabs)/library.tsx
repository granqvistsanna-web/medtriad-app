import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';
import { getTriadsByCategory } from '@/services/triads';
import { TriadCategory } from '@/types';
import { CategorySection } from '@/components/library/CategorySection';

// All 10 medical categories in display order
const CATEGORIES: TriadCategory[] = [
  'cardiology',
  'neurology',
  'endocrine',
  'pulmonary',
  'gastroenterology',
  'infectious',
  'hematology',
  'rheumatology',
  'renal',
  'obstetrics',
];

export default function LibraryScreen() {
  const colors = Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        {CATEGORIES.map((category, index) => (
          <CategorySection
            key={category}
            category={category}
            triads={getTriadsByCategory(category)}
            delay={index * Durations.stagger}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.title,
  },
});
