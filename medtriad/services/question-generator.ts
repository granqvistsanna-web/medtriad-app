import { Triad, QuizOption, QuizQuestion, TriadCategory } from '@/types';
import { getAllTriads } from '@/services/triads';
import { shuffle } from '@/utils/shuffle';

/**
 * Format findings array into display string
 */
function formatFindings(findings: [string, string, string]): string {
  return findings.join(' + ');
}

/**
 * Select distractor triads for a question
 * Prefers same-category distractors for educational value
 * Falls back to other categories if needed
 */
function selectDistractors(correctTriad: Triad, count: number): Triad[] {
  const allTriads = getAllTriads();

  // Partition triads into same-category and other-category
  const sameCategory: Triad[] = [];
  const otherCategory: Triad[] = [];

  for (const triad of allTriads) {
    if (triad.id === correctTriad.id) {
      continue; // Skip the correct answer
    }
    if (triad.category === correctTriad.category) {
      sameCategory.push(triad);
    } else {
      otherCategory.push(triad);
    }
  }

  // Track used IDs to prevent duplicates
  const usedIds = new Set<string>([correctTriad.id]);
  const distractors: Triad[] = [];

  // First: add from same category (preferred for educational value)
  const shuffledSameCategory = shuffle(sameCategory);
  for (const triad of shuffledSameCategory) {
    if (distractors.length >= count) break;
    if (!usedIds.has(triad.id)) {
      distractors.push(triad);
      usedIds.add(triad.id);
    }
  }

  // Then: fill remaining from other categories
  const shuffledOtherCategory = shuffle(otherCategory);
  for (const triad of shuffledOtherCategory) {
    if (distractors.length >= count) break;
    if (!usedIds.has(triad.id)) {
      distractors.push(triad);
      usedIds.add(triad.id);
    }
  }

  return distractors;
}

/**
 * Generate a quiz question for a given triad
 * Returns a QuizQuestion with 4 shuffled options (1 correct, 3 distractors)
 */
export function generateQuestion(correctTriad: Triad): QuizQuestion {
  const distractors = selectDistractors(correctTriad, 3);

  // Create options array
  const correctOption: QuizOption = {
    id: correctTriad.id,
    condition: correctTriad.condition,
    isCorrect: true,
  };

  const distractorOptions: QuizOption[] = distractors.map(triad => ({
    id: triad.id,
    condition: triad.condition,
    isCorrect: false,
  }));

  // Combine and shuffle options so correct answer isn't always first
  const options = shuffle([correctOption, ...distractorOptions]);

  return {
    id: `q-${correctTriad.id}-${Date.now()}`,
    triad: correctTriad,
    displayFindings: formatFindings(correctTriad.findings),
    options,
  };
}

/**
 * Generate a set of quiz questions
 * Ensures no duplicate triads in a single quiz round
 */
export function generateQuestionSet(count: number): QuizQuestion[] {
  const allTriads = getAllTriads();
  const shuffledTriads = shuffle([...allTriads]);
  const selectedTriads = shuffledTriads.slice(0, Math.min(count, allTriads.length));

  return selectedTriads.map(triad => generateQuestion(triad));
}

/**
 * Generate a set of quiz questions filtered by categories
 * @param count Number of questions to generate
 * @param categories Array of categories to include (if empty, includes all)
 */
export function generateQuestionSetByCategories(
  count: number,
  categories: TriadCategory[]
): QuizQuestion[] {
  const allTriads = getAllTriads();

  // Filter triads by selected categories (if any selected)
  const filteredTriads =
    categories.length === 0
      ? allTriads
      : allTriads.filter(triad => categories.includes(triad.category));

  const shuffledTriads = shuffle([...filteredTriads]);
  const selectedTriads = shuffledTriads.slice(
    0,
    Math.min(count, filteredTriads.length)
  );

  return selectedTriads.map(triad => generateQuestion(triad));
}
