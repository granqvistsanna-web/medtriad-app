import { test, expect } from '@playwright/test';

test.describe('Results Page Screenshots', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set localStorage to bypass onboarding
    await context.addInitScript(() => {
      localStorage.setItem('@medtriad_stats', JSON.stringify({
        hasCompletedOnboarding: true,
        totalScore: 1000,
        totalCorrect: 50,
        totalIncorrect: 10,
        highScore: 500,
        currentStreak: 3,
        longestStreak: 5,
        categoryMastery: {}
      }));
    });
  });

  test('Desktop - Good Score', async ({ page }) => {
    await page.goto('http://localhost:8081/quiz/results?score=850&correctCount=8&bestStreak=5&isNewHighScore=true&isPerfect=false&tierUp=false');

    // Wait for animations to complete
    await page.waitForTimeout(3500);

    await page.screenshot({
      path: '../../screenshot-results-desktop.png',
      fullPage: true
    });
  });

  test('Desktop - Perfect Score', async ({ page }) => {
    await page.goto('http://localhost:8081/quiz/results?score=1000&correctCount=10&bestStreak=10&isNewHighScore=true&isPerfect=true&tierUp=false');

    await page.waitForTimeout(3500);

    await page.screenshot({
      path: '../../screenshot-results-perfect.png',
      fullPage: true
    });
  });

  test('Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8081/quiz/results?score=850&correctCount=8&bestStreak=5&isNewHighScore=true&isPerfect=false&tierUp=false');

    await page.waitForTimeout(3500);

    await page.screenshot({
      path: '../../screenshot-results-tablet.png',
      fullPage: true
    });
  });

  test('Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8081/quiz/results?score=850&correctCount=8&bestStreak=5&isNewHighScore=true&isPerfect=false&tierUp=false');

    await page.waitForTimeout(3500);

    await page.screenshot({
      path: '../../screenshot-results-mobile.png',
      fullPage: true
    });
  });

  test('Low Score', async ({ page }) => {
    await page.goto('http://localhost:8081/quiz/results?score=400&correctCount=4&bestStreak=2&isNewHighScore=false&isPerfect=false&tierUp=false');

    await page.waitForTimeout(3500);

    await page.screenshot({
      path: '../../screenshot-results-low.png',
      fullPage: true
    });
  });
});
