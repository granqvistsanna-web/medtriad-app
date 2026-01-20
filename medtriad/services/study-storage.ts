import AsyncStorage from '@react-native-async-storage/async-storage';
import { TriadCategory } from '@/types/triad';

const TRICKY_KEY = '@medtriad_tricky_questions';
const STUDY_HISTORY_KEY = '@medtriad_study_history';
const MAX_STUDY_HISTORY = 20;

/**
 * A question marked as tricky for later review
 */
export interface TrickyQuestion {
  /** Triad ID of the marked question */
  triadId: string;

  /** When the question was marked as tricky */
  markedAt: string;

  /** Category for filtering/grouping */
  category: TriadCategory;
}

/**
 * A completed study session history entry
 */
export interface StudyHistoryEntry {
  /** When the session was completed */
  completedAt: string;

  /** Number of questions answered correctly */
  correctCount: number;

  /** Total number of questions in the session */
  totalQuestions: number;

  /** How many questions were marked as tricky */
  trickyCount: number;
}

/**
 * Load all tricky questions from AsyncStorage
 */
export async function loadTrickyQuestions(): Promise<TrickyQuestion[]> {
  try {
    const json = await AsyncStorage.getItem(TRICKY_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (error) {
    console.error('Failed to load tricky questions:', error);
    return [];
  }
}

/**
 * Save a tricky question (idempotent - skips if already exists)
 */
export async function saveTrickyQuestion(
  triadId: string,
  category: TriadCategory
): Promise<void> {
  try {
    const current = await loadTrickyQuestions();
    const exists = current.some((q) => q.triadId === triadId);

    if (exists) return;

    const newEntry: TrickyQuestion = {
      triadId,
      markedAt: new Date().toISOString(),
      category,
    };

    const updated = [...current, newEntry];
    await AsyncStorage.setItem(TRICKY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save tricky question:', error);
  }
}

/**
 * Remove a tricky question by triad ID
 */
export async function removeTrickyQuestion(triadId: string): Promise<void> {
  try {
    const current = await loadTrickyQuestions();
    const filtered = current.filter((q) => q.triadId !== triadId);
    await AsyncStorage.setItem(TRICKY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove tricky question:', error);
  }
}

/**
 * Toggle a question's tricky status
 * @returns true if question was added, false if removed
 */
export async function toggleTrickyQuestion(
  triadId: string,
  category: TriadCategory
): Promise<boolean> {
  try {
    const current = await loadTrickyQuestions();
    const exists = current.some((q) => q.triadId === triadId);

    if (exists) {
      // Remove it
      const filtered = current.filter((q) => q.triadId !== triadId);
      await AsyncStorage.setItem(TRICKY_KEY, JSON.stringify(filtered));
      return false;
    } else {
      // Add it
      const newEntry: TrickyQuestion = {
        triadId,
        markedAt: new Date().toISOString(),
        category,
      };
      const updated = [...current, newEntry];
      await AsyncStorage.setItem(TRICKY_KEY, JSON.stringify(updated));
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle tricky question:', error);
    return false;
  }
}

/**
 * Load study session history from AsyncStorage
 */
export async function loadStudyHistory(): Promise<StudyHistoryEntry[]> {
  try {
    const json = await AsyncStorage.getItem(STUDY_HISTORY_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return [];
  } catch (error) {
    console.error('Failed to load study history:', error);
    return [];
  }
}

/**
 * Save a completed study session to history
 * Prepends new entry (most recent first) and limits to MAX_STUDY_HISTORY
 */
export async function saveStudySession(entry: StudyHistoryEntry): Promise<void> {
  try {
    const history = await loadStudyHistory();
    const updated = [entry, ...history].slice(0, MAX_STUDY_HISTORY);
    await AsyncStorage.setItem(STUDY_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save study session:', error);
  }
}
