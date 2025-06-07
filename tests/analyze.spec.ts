import test, { expect } from './fixtures';

test('analyze: we have data', async ({ page }) => {
  await page.goto('/analyze');
  
  // Wait for server-filter to be visible (it might be collapsed initially)
  await page.getByTestId('server-filter').waitFor({ timeout: 10000 });
  await expect(page.getByTestId('server-filter')).toBeVisible();
  
  await expect(page.getByTestId('server-pricechart')).toBeVisible();
  await page.getByTestId('server-card').first().waitFor({ timeout: 10000});
  await expect(await page.getByTestId('server-card').count()).toBeGreaterThan(0);
  await expect(page.getByTestId('filter-clear')).not.toBeVisible();
  await page.getByTestId('filter-save').click();
  await expect(page.getByTestId('filter-clear')).toBeVisible();
  await page.getByTestId('filter-clear').click();
  await expect(page.getByTestId('filter-clear')).not.toBeVisible();
  await expect(page.getByTestId('total-configurations')).toBeVisible();
});

test('analyze: filter functionality works', async ({ page }) => {
  await page.goto('/analyze');

  // Wait for initial data load to complete
  await page.getByTestId('server-card').first().waitFor({ timeout: 10000 });

  // Get initial count of servers from the QuickStat component
  const initialResultsText = await page.getByTestId('total-configurations').textContent();
  const initialCount = parseInt(initialResultsText?.match(/(\d+)/)?.[1] || '0');

  // Test location filter - click on the Germany toggle label instead of the hidden input
  const germanyLabel = page.locator('label:has-text("Germany")');
  await expect(germanyLabel).toBeVisible();
  
  // Get the current state by checking the input
  const germanyInput = page.locator('label:has-text("Germany") input[type="checkbox"]');
  const isGermanyChecked = await germanyInput.isChecked();
  
  // Click the label to toggle Germany filter
  await germanyLabel.click();
  
  // Wait for filtering to take effect
  await page.waitForTimeout(1000);

  // Verify filtered results changed
  const filteredResultsText = await page.getByTestId('total-configurations').textContent();
  const filteredCount = parseInt(filteredResultsText?.match(/(\d+)/)?.[1] || '0');

  // The count should have changed (either increased or decreased)
  expect(filteredCount).not.toEqual(initialCount);

  // Toggle Germany filter back to original state
  await germanyLabel.click();
  
  // Wait for filtering to take effect
  await page.waitForTimeout(1000);

  // Count should return to initial (or close to it)
  const finalResultsText = await page.getByTestId('total-configurations').textContent();
  const finalCount = parseInt(finalResultsText?.match(/(\d+)/)?.[1] || '0');
  expect(finalCount).toEqual(initialCount);
});
