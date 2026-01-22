import { calculateSM2 } from '@/services/spaced-repetition';

describe('SM-2 Algorithm', () => {
  describe('calculateSM2', () => {
    describe('first correct answer', () => {
      it('sets interval to 1 day and repetition to 1', () => {
        const result = calculateSM2(
          0,    // interval
          0,    // repetition
          2.5,  // efactor
          true, // isCorrect
          false // isTricky
        );

        expect(result.interval).toBe(1);
        expect(result.repetition).toBe(1);
        expect(result.efactor).toBeCloseTo(2.5, 2);
        expect(result.nextReviewDate).toBeTruthy();

        // Verify date is 1 day in the future
        const reviewDate = new Date(result.nextReviewDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(reviewDate.getDate()).toBe(tomorrow.getDate());
      });
    });

    describe('second correct answer', () => {
      it('sets interval to 6 days and repetition to 2', () => {
        const result = calculateSM2(
          1,    // interval (after first correct)
          1,    // repetition (after first correct)
          2.5,  // efactor
          true, // isCorrect
          false // isTricky
        );

        expect(result.interval).toBe(6);
        expect(result.repetition).toBe(2);
        expect(result.efactor).toBeCloseTo(2.5, 2);

        // Verify date is 6 days in the future
        const reviewDate = new Date(result.nextReviewDate);
        const sixDaysLater = new Date();
        sixDaysLater.setDate(sixDaysLater.getDate() + 6);
        expect(reviewDate.getDate()).toBe(sixDaysLater.getDate());
      });
    });

    describe('third correct answer with EF multiplication', () => {
      it('multiplies interval by EF but caps at 14 days', () => {
        const result = calculateSM2(
          6,    // interval (after second correct)
          2,    // repetition (after second correct)
          2.5,  // efactor
          true, // isCorrect
          false // isTricky
        );

        // Expected: 6 * 2.5 = 15, but capped to 14
        expect(result.interval).toBe(14);
        expect(result.repetition).toBe(3);
        expect(result.efactor).toBeCloseTo(2.5, 2);
      });

      it('uses EF multiplication without cap for smaller intervals', () => {
        const result = calculateSM2(
          3,    // interval
          2,    // repetition
          2.0,  // efactor
          true, // isCorrect
          false // isTricky
        );

        // Expected: 3 * 2.0 = 6
        expect(result.interval).toBe(6);
        expect(result.repetition).toBe(3);
      });
    });

    describe('incorrect answer resets', () => {
      it('resets interval to 1 and repetition to 0 from any state', () => {
        const result = calculateSM2(
          14,   // interval (was at max)
          5,    // repetition (multiple correct)
          2.3,  // efactor
          false, // isCorrect
          false  // isTricky
        );

        expect(result.interval).toBe(1);
        expect(result.repetition).toBe(0);
        // EF should decrease for quality=1
        expect(result.efactor).toBeLessThan(2.3);
      });

      it('resets even from first review', () => {
        const result = calculateSM2(
          1,    // interval
          1,    // repetition
          2.5,  // efactor
          false, // isCorrect
          false  // isTricky
        );

        expect(result.interval).toBe(1);
        expect(result.repetition).toBe(0);
      });
    });

    describe('14-day interval cap (SR-05)', () => {
      it('caps interval at 14 days even with high EF', () => {
        const result = calculateSM2(
          10,   // interval
          3,    // repetition
          3.0,  // efactor (high)
          true, // isCorrect
          false // isTricky
        );

        // Expected: 10 * 3.0 = 30, but capped to 14
        expect(result.interval).toBe(14);
      });

      it('allows intervals up to 14 days', () => {
        const result = calculateSM2(
          7,    // interval
          3,    // repetition
          2.0,  // efactor
          true, // isCorrect
          false // isTricky
        );

        // Expected: 7 * 2.0 = 14 (exactly at cap)
        expect(result.interval).toBe(14);
      });
    });

    describe('tricky multiplier (SR-06)', () => {
      it('applies 0.5x multiplier to intervals > 1', () => {
        const result = calculateSM2(
          1,    // interval (after first correct)
          1,    // repetition
          2.5,  // efactor
          true, // isCorrect
          true  // isTricky
        );

        // Expected: 6 * 0.5 = 3
        expect(result.interval).toBe(3);
        expect(result.repetition).toBe(2);
      });

      it('keeps interval at 1 for first review even if tricky', () => {
        const result = calculateSM2(
          0,    // interval
          0,    // repetition
          2.5,  // efactor
          true, // isCorrect
          true  // isTricky
        );

        // First review always gets interval=1, multiplier not applied
        expect(result.interval).toBe(1);
        expect(result.repetition).toBe(1);
      });

      it('applies multiplier and then caps at 14 days', () => {
        const result = calculateSM2(
          14,   // interval
          4,    // repetition
          2.5,  // efactor
          true, // isCorrect
          true  // isTricky
        );

        // Expected: 14 * 2.5 = 35, capped to 14, then * 0.5 = 7
        expect(result.interval).toBe(7);
      });

      it('does not apply multiplier to incorrect answers', () => {
        const result = calculateSM2(
          6,    // interval
          2,    // repetition
          2.5,  // efactor
          false, // isCorrect
          true   // isTricky
        );

        // Incorrect resets to interval=1, no multiplier needed
        expect(result.interval).toBe(1);
        expect(result.repetition).toBe(0);
      });
    });

    describe('ease factor (EF) adjustment', () => {
      it('keeps EF stable for correct answers (quality=4)', () => {
        const result = calculateSM2(
          6,    // interval
          2,    // repetition
          2.5,  // efactor
          true, // isCorrect (quality=4)
          false // isTricky
        );

        // Quality=4: EF' = EF + (0.1 - (5-4) * (0.08 + (5-4) * 0.02))
        // EF' = 2.5 + (0.1 - 1 * 0.1) = 2.5 + 0 = 2.5
        expect(result.efactor).toBeCloseTo(2.5, 2);
      });

      it('decreases EF for incorrect answers (quality=1)', () => {
        const result = calculateSM2(
          6,    // interval
          2,    // repetition
          2.5,  // efactor
          false, // isCorrect (quality=1)
          false  // isTricky
        );

        // Quality=1: EF' = EF + (0.1 - (5-1) * (0.08 + (5-1) * 0.02))
        // EF' = 2.5 + (0.1 - 4 * 0.16) = 2.5 - 0.54 = 1.96
        expect(result.efactor).toBeCloseTo(1.96, 2);
      });

      it('never goes below minimum EF of 1.3', () => {
        let efactor = 1.4;

        // Multiple incorrect answers should drive EF down but clamp at 1.3
        for (let i = 0; i < 5; i++) {
          const result = calculateSM2(
            1,      // interval
            0,      // repetition
            efactor, // current efactor
            false,  // isCorrect
            false   // isTricky
          );
          efactor = result.efactor;
        }

        expect(efactor).toBe(1.3);
      });

      it('clamps to 1.3 when calculation goes below', () => {
        const result = calculateSM2(
          1,    // interval
          0,    // repetition
          1.3,  // efactor (already at minimum)
          false, // isCorrect
          false  // isTricky
        );

        // Even with decrease, should stay at 1.3
        expect(result.efactor).toBe(1.3);
      });
    });

    describe('nextReviewDate generation', () => {
      it('generates valid ISO date string', () => {
        const result = calculateSM2(0, 0, 2.5, true, false);

        expect(result.nextReviewDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(() => new Date(result.nextReviewDate)).not.toThrow();
      });

      it('sets date in the future based on interval', () => {
        const result = calculateSM2(
          1,    // interval
          1,    // repetition
          2.5,  // efactor
          true, // isCorrect
          false // isTricky
        );

        // Should be 6 days in future
        const reviewDate = new Date(result.nextReviewDate);
        const now = new Date();
        const daysDiff = Math.round((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        expect(daysDiff).toBe(6);
      });
    });
  });
});
