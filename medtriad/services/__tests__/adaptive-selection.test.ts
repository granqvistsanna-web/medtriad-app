import {
  classifyDifficulty,
  calculateTriadWeight,
  weightedRandomSelect,
} from '../adaptive-selection';
import type { TriadPerformance } from '@/types/triad-performance';
import type { Triad, TriadCategory } from '@/types/triad';

describe('classifyDifficulty', () => {
  describe('returns "new" for insufficient data', () => {
    it('returns "new" when performance is null', () => {
      expect(classifyDifficulty(null)).toBe('new');
    });

    it('returns "new" when correctCount + incorrectCount < 3 (2 attempts)', () => {
      const performance: TriadPerformance = {
        correctCount: 1,
        incorrectCount: 1,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1000,
        responseCount: 2,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('new');
    });

    it('returns "new" when exactly 2 attempts', () => {
      const performance: TriadPerformance = {
        correctCount: 2,
        incorrectCount: 0,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 800,
        responseCount: 2,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('new');
    });

    it('returns "new" when 0 attempts (edge case)', () => {
      const performance: TriadPerformance = {
        correctCount: 0,
        incorrectCount: 0,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 0,
        responseCount: 0,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('new');
    });
  });

  describe('returns "easy" for high accuracy (>= 85%)', () => {
    it('returns "easy" when accuracy is 90% (9/10)', () => {
      const performance: TriadPerformance = {
        correctCount: 9,
        incorrectCount: 1,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1200,
        responseCount: 10,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('easy');
    });

    it('returns "easy" when accuracy is exactly 85%', () => {
      // 85% of 20 = 17 correct
      const performance: TriadPerformance = {
        correctCount: 17,
        incorrectCount: 3,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1100,
        responseCount: 20,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('easy');
    });

    it('returns "easy" when accuracy is 100% (perfect)', () => {
      const performance: TriadPerformance = {
        correctCount: 5,
        incorrectCount: 0,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 900,
        responseCount: 5,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('easy');
    });
  });

  describe('returns "medium" for moderate accuracy (51-84%)', () => {
    it('returns "medium" when accuracy is 60% (6/10)', () => {
      const performance: TriadPerformance = {
        correctCount: 6,
        incorrectCount: 4,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1500,
        responseCount: 10,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('medium');
    });

    it('returns "medium" when accuracy is exactly 51%', () => {
      // Need whole numbers: 51/100 = 51 correct, 49 incorrect
      // Smaller scale: approximately 51% with integers
      const performance: TriadPerformance = {
        correctCount: 51,
        incorrectCount: 49,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1400,
        responseCount: 100,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('medium');
    });

    it('returns "medium" when accuracy is 84% (just below easy)', () => {
      // 84/100 = 84 correct, 16 incorrect
      const performance: TriadPerformance = {
        correctCount: 84,
        incorrectCount: 16,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1100,
        responseCount: 100,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('medium');
    });
  });

  describe('returns "hard" for low accuracy (<= 50%)', () => {
    it('returns "hard" when accuracy is 40% (4/10)', () => {
      const performance: TriadPerformance = {
        correctCount: 4,
        incorrectCount: 6,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 2000,
        responseCount: 10,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('hard');
    });

    it('returns "hard" when accuracy is exactly 50%', () => {
      const performance: TriadPerformance = {
        correctCount: 5,
        incorrectCount: 5,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 1800,
        responseCount: 10,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('hard');
    });

    it('returns "hard" when accuracy is 0% (all wrong)', () => {
      const performance: TriadPerformance = {
        correctCount: 0,
        incorrectCount: 5,
        lastSeenAt: '2026-01-21T00:00:00Z',
        avgResponseTimeMs: 2500,
        responseCount: 5,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewDate: null,
      };
      expect(classifyDifficulty(performance)).toBe('hard');
    });
  });
});

describe('calculateTriadWeight', () => {
  const createTriad = (id: string, category: TriadCategory): Triad => ({
    id,
    condition: 'Test Condition',
    findings: ['Finding 1', 'Finding 2', 'Finding 3'],
    category,
  });

  const createPerformance = (correct: number, incorrect: number): TriadPerformance => ({
    correctCount: correct,
    incorrectCount: incorrect,
    lastSeenAt: '2026-01-21T00:00:00Z',
    avgResponseTimeMs: 1000,
    responseCount: correct + incorrect,
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    nextReviewDate: null,
  });

  describe('base weight', () => {
    it('returns 1.0 with no factors applied', () => {
      const triad = createTriad('test-1', 'cardiology');
      const weight = calculateTriadWeight({
        triad,
        performance: null,
        trickyIds: new Set(),
        weakCategories: new Set(),
        userTier: 1,
      });
      expect(weight).toBe(1.0);
    });
  });

  describe('weak category multiplier', () => {
    it('multiplies by 2.0 when category is weak', () => {
      const triad = createTriad('test-1', 'cardiology');
      const weight = calculateTriadWeight({
        triad,
        performance: null,
        trickyIds: new Set(),
        weakCategories: new Set(['cardiology'] as TriadCategory[]),
        userTier: 1,
      });
      expect(weight).toBe(2.0);
    });
  });

  describe('tricky multiplier', () => {
    it('multiplies by 3.0 when triad is marked tricky', () => {
      const triad = createTriad('test-1', 'cardiology');
      const weight = calculateTriadWeight({
        triad,
        performance: null,
        trickyIds: new Set(['test-1']),
        weakCategories: new Set(),
        userTier: 1,
      });
      expect(weight).toBe(3.0);
    });
  });

  describe('tier-based difficulty adjustment', () => {
    it('tier 5+ hard triad multiplies by 1.5', () => {
      const triad = createTriad('test-1', 'cardiology');
      // Hard = 50% accuracy (5 correct, 5 incorrect)
      const performance = createPerformance(5, 5);
      const weight = calculateTriadWeight({
        triad,
        performance,
        trickyIds: new Set(),
        weakCategories: new Set(),
        userTier: 5,
      });
      expect(weight).toBe(1.5);
    });

    it('tier 5+ medium triad multiplies by 1.2', () => {
      const triad = createTriad('test-1', 'cardiology');
      // Medium = 60% accuracy (6 correct, 4 incorrect)
      const performance = createPerformance(6, 4);
      const weight = calculateTriadWeight({
        triad,
        performance,
        trickyIds: new Set(),
        weakCategories: new Set(),
        userTier: 5,
      });
      expect(weight).toBe(1.2);
    });

    it('tier 3-4 hard triad multiplies by 1.3', () => {
      const triad = createTriad('test-1', 'cardiology');
      // Hard = 40% accuracy (4 correct, 6 incorrect)
      const performance = createPerformance(4, 6);
      const weight = calculateTriadWeight({
        triad,
        performance,
        trickyIds: new Set(),
        weakCategories: new Set(),
        userTier: 3,
      });
      expect(weight).toBe(1.3);
    });

    it('tiers 1-2 get no difficulty adjustment', () => {
      const triad = createTriad('test-1', 'cardiology');
      // Hard = 40% accuracy
      const performance = createPerformance(4, 6);
      const weight = calculateTriadWeight({
        triad,
        performance,
        trickyIds: new Set(),
        weakCategories: new Set(),
        userTier: 2,
      });
      expect(weight).toBe(1.0);
    });

    it('tier 1 also gets no difficulty adjustment', () => {
      const triad = createTriad('test-1', 'cardiology');
      // Hard = 40% accuracy
      const performance = createPerformance(4, 6);
      const weight = calculateTriadWeight({
        triad,
        performance,
        trickyIds: new Set(),
        weakCategories: new Set(),
        userTier: 1,
      });
      expect(weight).toBe(1.0);
    });
  });

  describe('stacking multipliers', () => {
    it('weak + tricky stacks multiplicatively (2.0 * 3.0 = 6.0)', () => {
      const triad = createTriad('test-1', 'cardiology');
      const weight = calculateTriadWeight({
        triad,
        performance: null,
        trickyIds: new Set(['test-1']),
        weakCategories: new Set(['cardiology'] as TriadCategory[]),
        userTier: 1,
      });
      expect(weight).toBe(6.0);
    });

    it('weak + tricky + tier 5 hard stacks (2.0 * 3.0 * 1.5 = 9.0)', () => {
      const triad = createTriad('test-1', 'cardiology');
      // Hard = 40% accuracy
      const performance = createPerformance(4, 6);
      const weight = calculateTriadWeight({
        triad,
        performance,
        trickyIds: new Set(['test-1']),
        weakCategories: new Set(['cardiology'] as TriadCategory[]),
        userTier: 5,
      });
      expect(weight).toBe(9.0);
    });
  });
});

describe('weightedRandomSelect', () => {
  it('returns correct count when count < items.length', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const weights = [1, 1, 1, 1, 1];
    const selected = weightedRandomSelect(items, weights, 3);
    expect(selected.length).toBe(3);
    // All selected items should be unique
    expect(new Set(selected).size).toBe(3);
    // All selected items should be from original array
    selected.forEach(item => {
      expect(items).toContain(item);
    });
  });

  it('returns all items when count > items.length', () => {
    const items = ['a', 'b', 'c'];
    const weights = [1, 1, 1];
    const selected = weightedRandomSelect(items, weights, 10);
    expect(selected.length).toBe(3);
    expect(new Set(selected).size).toBe(3);
  });

  it('returns all items when count === items.length', () => {
    const items = ['a', 'b', 'c'];
    const weights = [1, 1, 1];
    const selected = weightedRandomSelect(items, weights, 3);
    expect(selected.length).toBe(3);
    expect(new Set(selected).size).toBe(3);
  });

  it('selects unique items without replacement', () => {
    const items = ['a', 'b', 'c', 'd'];
    const weights = [1, 1, 1, 1];
    // Run multiple times to verify uniqueness
    for (let i = 0; i < 10; i++) {
      const selected = weightedRandomSelect(items, weights, 3);
      expect(new Set(selected).size).toBe(selected.length);
    }
  });

  it('respects weights - higher weight items selected more often', () => {
    const items = ['high', 'low'];
    const weights = [100, 1]; // 'high' has 100x the weight of 'low'

    let highCount = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const selected = weightedRandomSelect(items, weights, 1);
      if (selected[0] === 'high') {
        highCount++;
      }
    }

    // 'high' should be selected most of the time (expect > 90%)
    expect(highCount).toBeGreaterThan(80);
  });
});
