import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TriadCategory } from '@/types';

const STORAGE_KEY = 'study_category_preferences';

// All available categories
const ALL_CATEGORIES: TriadCategory[] = [
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

interface UseStudyCategoryPreferencesReturn {
  selectedCategories: Set<TriadCategory>;
  isLoading: boolean;
  toggleCategory: (category: TriadCategory) => void;
  selectAll: () => void;
  deselectAll: () => void;
  getSelectedArray: () => TriadCategory[];
}

/**
 * Hook to manage study mode category preferences with persistence
 * Stores the selected categories in AsyncStorage for cross-session persistence
 */
export function useStudyCategoryPreferences(): UseStudyCategoryPreferencesReturn {
  const [selectedCategories, setSelectedCategories] = useState<Set<TriadCategory>>(
    new Set(ALL_CATEGORIES)
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as TriadCategory[];
          // Validate that all saved categories are valid
          const validCategories = parsed.filter(c =>
            ALL_CATEGORIES.includes(c)
          );
          // If nothing is valid, default to all
          if (validCategories.length > 0) {
            setSelectedCategories(new Set(validCategories));
          }
        }
      } catch (error) {
        console.error('Failed to load study category preferences:', error);
        // Keep default (all categories)
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, []);

  // Save preferences whenever they change
  const savePreferences = useCallback(async (categories: Set<TriadCategory>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...categories]));
    } catch (error) {
      console.error('Failed to save study category preferences:', error);
    }
  }, []);

  const toggleCategory = useCallback((category: TriadCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      savePreferences(next);
      return next;
    });
  }, [savePreferences]);

  const selectAll = useCallback(() => {
    const allSet = new Set(ALL_CATEGORIES);
    setSelectedCategories(allSet);
    savePreferences(allSet);
  }, [savePreferences]);

  const deselectAll = useCallback(() => {
    const emptySet = new Set<TriadCategory>();
    setSelectedCategories(emptySet);
    savePreferences(emptySet);
  }, [savePreferences]);

  const getSelectedArray = useCallback(() => {
    return [...selectedCategories];
  }, [selectedCategories]);

  return {
    selectedCategories,
    isLoading,
    toggleCategory,
    selectAll,
    deselectAll,
    getSelectedArray,
  };
}
