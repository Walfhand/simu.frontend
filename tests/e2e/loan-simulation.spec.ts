import { test, expect } from '@playwright/test';

test.describe('Loan Simulation Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the initial state correctly', async ({ page }) => {
    // Verify form elements are present
    await expect(page.getByText('Capital souhaité')).toBeVisible();
    await expect(page.getByText('Durée souhaitée')).toBeVisible();
    await expect(page.getByText('Vos revenus (RIG)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lancer la simulation' })).toBeVisible();

    // Verify form placeholders
    await expect(page.getByPlaceholder('Entrez le montant')).toBeVisible();
    await expect(page.getByPlaceholder('Entrez la durée')).toBeVisible();
    await expect(page.getByPlaceholder('Entrez vos revenus')).toBeVisible();

    // Verify initial result values are empty
    await expect(page.getByText('Taux annuel fixe :')).toBeVisible();
    await expect(page.getByText('Mensualité :')).toBeVisible();
    await expect(page.getByText('--', { exact: true })).toHaveCount(2);

    // Verify table headers
    const headers = ['Mois', 'Mensualité', "Part d'intérêts", 'Part de capital', 'Solde restant dû'];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }

    // Verify empty state message
    await expect(page.getByText('Aucune donnée disponible')).toBeVisible();
  });

  test('should handle form input correctly', async ({ page }) => {
    // Fill in the form
    await page.locator('#capital').fill('100000');
    await page.locator('#duration').fill('12');
    await page.locator('#income').fill('50000');

    // Verify the values are correctly set
    await expect(page.locator('#capital')).toHaveValue('100000');
    await expect(page.locator('#duration')).toHaveValue('12');
    await expect(page.locator('#income')).toHaveValue('50000');
  });

  test('should display simulation results after form submission', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/simulations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fixedAnnualRate: 3.5,
          monthlyAmount: 1250.75,
          depreciationTableLines: [
            {
              month: "Janvier 2021",
              monthlyAmount: 1250.75,
              interestShare: 291.67,
              capitalShare: 959.08,
              remainingBalance: 99040.92
            },
            {
              month: "Février 2021",
              monthlyAmount: 1250.75,
              interestShare: 288.87,
              capitalShare: 961.88,
              remainingBalance: 98079.04
            }
          ]
        })
      });
    });

    // Fill in the form
    await page.locator('#capital').fill('100000');
    await page.locator('#duration').fill('12');
    await page.locator('#income').fill('50000');

    // Submit the form
    await page.getByRole('button', { name: 'Lancer la simulation' }).click();

    // Wait for results to appear and verify them
    await expect(page.getByText('3.5%')).toBeVisible();
    await expect(page.getByText('1 250,75 €')).toBeVisible();

    // Verify first row of the table is visible
    await expect(page.getByRole('cell', { name: 'Janvier 2021' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '1 250,75 €' }).first()).toBeVisible();

    // Verify table is scrollable
    const tableContainer = page.locator('.overflow-auto');
    await expect(tableContainer).toBeVisible();
  });

  test('should handle empty form submission', async ({ page }) => {
    // Click submit without filling the form
    await page.getByRole('button', { name: 'Lancer la simulation' }).click();

    // Verify no results are displayed
    await expect(page.getByText('Aucune donnée disponible')).toBeVisible();
    await expect(page.getByText('--', { exact: true })).toHaveCount(2);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return an error
    await page.route('**/api/simulations', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    // Fill in the form
    await page.locator('#capital').fill('100000');
    await page.locator('#duration').fill('12');
    await page.locator('#income').fill('50000');

    // Submit the form
    await page.getByRole('button', { name: 'Lancer la simulation' }).click();

    // Verify error state
    await expect(page.getByText('Aucune donnée disponible')).toBeVisible();
    await expect(page.getByText('--', { exact: true })).toHaveCount(2);
  });
});
