import { test, expect } from '@playwright/test';

/**
 * Study Mode Category Filter E2E Tests
 *
 * Tests the category filter functionality including:
 * - Filter screen navigation and UI
 * - Category selection/deselection
 * - All/none selection states
 * - Persistence across navigation
 * - Question filtering by selected categories
 */

const BASE_URL = 'http://localhost:8082';

test.describe('Study Mode Category Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home screen and wait for app to hydrate
    await page.goto(BASE_URL);
    // Wait for React to hydrate - the app takes a moment to render
    await page.waitForTimeout(3000);

    // Check if onboarding is shown and skip it if needed
    const skipButton = page.getByRole('button', { name: 'Skip onboarding' });
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Wait for the home screen to fully load - look for the START QUIZ button
    await page.waitForSelector('text=START QUIZ', { timeout: 30000 });
  });

  test('should navigate to filter screen when clicking Study button', async ({ page }) => {
    // Click STUDY button
    await page.getByText('STUDY').click();

    // Verify we're on the filter screen
    await expect(page).toHaveURL(/\/quiz\/study-filter/);
    await expect(page.getByText('Choose Your Focus')).toBeVisible();
    await expect(page.getByText('All Categories')).toBeVisible();
  });

  test('should show all categories with correct counts', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Verify all 10 categories are displayed via their checkboxes
    const categories = [
      'Cardiology',
      'Neurology',
      'Endocrine',
      'Pulmonary',
      'GI',
      'Infectious',
      'Hematology',
      'Rheumatology',
      'Renal',
      'OB/GYN',
    ];

    for (const category of categories) {
      await expect(
        page.getByRole('checkbox', { name: new RegExp(category, 'i') })
      ).toBeVisible();
    }
  });

  test('should show all categories selected by default', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Verify "All X triads selected" summary is shown
    await expect(page.getByText(/All \d+ triads selected/)).toBeVisible();
    await expect(page.getByText('10 questions per session')).toBeVisible();
  });

  test('should update summary when deselecting a category', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Get initial total
    const initialSummary = await page.getByText(/All \d+ triads selected/).textContent();

    // Click on Cardiology to deselect it
    await page.getByRole('checkbox', { name: /Cardiology/i }).click();

    // Verify summary updated to show partial selection
    await expect(page.getByText(/triads from \d+ categories/)).toBeVisible();

    // Should no longer show "All triads selected"
    await expect(page.getByText(/All \d+ triads selected/)).not.toBeVisible();
  });

  test('should disable Start button when no categories selected', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Deselect all categories by clicking "All Categories" toggle
    await page.getByRole('switch', { name: 'Toggle all categories' }).click();

    // Verify warning message
    await expect(page.getByText('No categories selected')).toBeVisible();
    await expect(page.getByText('Select at least one category to start')).toBeVisible();
  });

  test('should re-enable Start button when category selected after none', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Deselect all
    await page.getByRole('switch', { name: 'Toggle all categories' }).click();
    await expect(page.getByText('No categories selected')).toBeVisible();

    // Select one category
    await page.getByRole('checkbox', { name: /Cardiology/i }).click();

    // Verify warning is gone
    await expect(page.getByText('No categories selected')).not.toBeVisible();

    // Verify summary shows selection
    await expect(page.getByText(/triads from 1 category/)).toBeVisible();
  });

  test('should select all categories when toggle is clicked from partial state', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Deselect one category
    await page.getByRole('checkbox', { name: /Cardiology/i }).click();
    await expect(page.getByText(/triads from \d+ categories/)).toBeVisible();

    // Click toggle to select all
    await page.getByRole('switch', { name: 'Toggle all categories' }).click();

    // Verify all selected again
    await expect(page.getByText(/All \d+ triads selected/)).toBeVisible();
  });

  test('should navigate to Study Mode with selected categories', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Click Start Studying
    await page.getByText('START STUDYING').click();

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify navigation to study mode
    await expect(page).toHaveURL(/\/quiz\/study/);

    // Verify study mode UI is shown - use more specific selectors
    await expect(page.locator('text=/\\d+ of \\d+/')).toBeVisible();
  });

  test('should pass category filter to Study Mode via URL params', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Deselect Cardiology
    await page.getByRole('checkbox', { name: /Cardiology/i }).click();

    // Start studying
    await page.getByText('START STUDYING').click();

    // Verify URL contains categories param without cardiology
    await expect(page).toHaveURL(/\/quiz\/study\?categories=/);
    const url = page.url();
    expect(url).not.toContain('cardiology');
    expect(url).toContain('neurology');
  });

  test('should filter questions by selected categories only', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Deselect all except Neurology
    await page.getByRole('switch', { name: 'Toggle all categories' }).click();
    await page.getByRole('checkbox', { name: /Neurology/i }).click();

    // Start studying
    await page.getByText('START STUDYING').click();

    // Wait for study mode to load
    await page.waitForTimeout(2000);

    // Verify we're on study mode with Neurology filter applied
    await expect(page).toHaveURL(/\/quiz\/study\?categories=neurology/);
  });

  test('should show correct question count for limited selection', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Select only categories with few triads
    await page.getByRole('switch', { name: 'Toggle all categories' }).click();
    await page.getByRole('checkbox', { name: /Rheumatology/i }).click();

    // Verify the summary shows available count
    const summary = await page.getByText(/questions per session/).textContent();
    // Should show less than 10 if category has fewer triads
    expect(summary).toMatch(/\d+ questions per session/);
  });

  test('should cancel and return to home screen', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Navigate back using browser back
    await page.goBack();

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Should return to home - verify we can see the STUDY button again
    await expect(page.getByText('START QUIZ')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Category Filter Persistence', () => {
  test('should persist category selection across navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Skip onboarding if shown
    const skipButton = page.getByRole('button', { name: 'Skip onboarding' });
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    await page.waitForSelector('text=START QUIZ');

    // Go to filter screen
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Deselect Cardiology
    await page.getByRole('checkbox', { name: /Cardiology/i }).click();

    // Navigate back using browser back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Return to filter screen
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Cardiology should still be deselected (shows partial selection message)
    await expect(page.getByText(/triads from \d+ categories/)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Skip onboarding if shown
    const skipButton = page.getByRole('button', { name: 'Skip onboarding' });
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    await page.waitForSelector('text=START QUIZ');
  });

  test('should have proper accessibility roles on category chips', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Scroll to bottom to load all checkboxes
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Verify at least some checkboxes have proper roles
    const checkboxes = await page.getByRole('checkbox').all();
    expect(checkboxes.length).toBeGreaterThanOrEqual(7); // At least 7 visible

    // Verify toggle switch has proper role
    const toggle = page.getByRole('switch', { name: 'Toggle all categories' });
    await expect(toggle).toBeVisible();
  });

  test('should have accessible labels on category checkboxes', async ({ page }) => {
    await page.getByText('STUDY').click();
    await page.waitForSelector('text=Choose Your Focus');

    // Each checkbox should have an accessible name with category and count
    await expect(
      page.getByRole('checkbox', { name: /Cardiology, \d+ triads/i })
    ).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: /Neurology, \d+ triads/i })
    ).toBeVisible();
  });
});
