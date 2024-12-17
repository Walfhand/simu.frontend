import { test, expect } from "@playwright/test";

test.describe("Loan Simulation Interface", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the initial state correctly", async ({ page }) => {
    // Verify form elements are present
    await expect(page.locator('label[for="capital"]')).toBeVisible();
    await expect(page.locator('label[for="duration"]')).toBeVisible();
    await expect(page.locator('label[for="income"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Lancer la simulation" })
    ).toBeVisible();

    // Verify form inputs
    await expect(page.locator("input#capital")).toBeVisible();
    await expect(page.locator("input#duration")).toBeVisible();
    await expect(page.locator("input#income")).toBeVisible();

    // Verify initial result values
    const rateText = page.locator(".text-muted-foreground", {
      hasText: "Taux annuel fixe :",
    });
    const monthlyText = page.locator(".text-muted-foreground", {
      hasText: "Mensualité :",
    });
    await expect(rateText).toBeVisible();
    await expect(monthlyText).toBeVisible();

    // Verify table headers
    const headers = [
      "Mois",
      "Mensualité",
      "Part d'intérêts",
      "Part de capital",
      "Solde restant dû",
    ];
    for (const header of headers) {
      await expect(page.locator("th", { hasText: header })).toBeVisible();
    }

    // Verify empty state message
    await expect(page.getByText("Aucune donnée disponible")).toBeVisible();
  });

  test("should handle form input correctly", async ({ page }) => {
    // Fill in the form
    await page.locator("input#capital").fill("100000");
    await page.locator("input#duration").fill("12");
    await page.locator("input#income").fill("50000");

    // Verify the values are correctly set
    await expect(page.locator("input#capital")).toHaveValue("100000");
    await expect(page.locator("input#duration")).toHaveValue("12");
    await expect(page.locator("input#income")).toHaveValue("50000");
  });

  test("should display simulation results after form submission", async ({
    page,
  }) => {
    // Mock the API response
    await page.route("**/api/simulations**", async (route) => {
      const postData = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          fixedAnnualRate: 3.5,
          monthlyAmount: 1250.75,
          depreciationTableLines: [
            {
              month: "Janvier 2021",
              monthlyAmount: 1250.75,
              interestShare: 291.67,
              capitalShare: 959.08,
              remainingBalance: 99040.92,
            },
            {
              month: "Février 2021",
              monthlyAmount: 1250.75,
              interestShare: 288.87,
              capitalShare: 961.88,
              remainingBalance: 98079.04,
            },
          ],
        }),
      });
    });

    // Fill in the form
    await page.locator("input#capital").fill("100000");
    await page.locator("input#duration").fill("12");
    await page.locator("input#income").fill("50000");

    // Submit the form
    await page.getByRole("button", { name: "Lancer la simulation" }).click();

    // Wait for the API call to complete
    await page.waitForResponse("**/api/simulations**");

    // Wait for and verify results
    const rateValue = page.locator("div", { hasText: /3\.5%/ }).first();
    await expect(rateValue).toBeVisible();

    // Verify table content
    await expect(page.locator("td", { hasText: "Janvier 2021" })).toBeVisible();
    await expect(
      page.locator("td", { hasText: "1 250,75 €" }).first()
    ).toBeVisible();

    // Verify table is scrollable
    const tableContainer = page.locator(".max-h-\\[500px\\]");
    await expect(tableContainer).toBeVisible();
  });

  test("should handle empty form submission", async ({ page }) => {
    // Click submit without filling the form
    await page.getByRole("button", { name: "Lancer la simulation" }).click();

    // Verify empty state remains
    await expect(page.getByText("Aucune donnée disponible")).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API to return an error
    await page.route("**/api/simulations**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Fill in the form
    await page.locator("input#capital").fill("100000");
    await page.locator("input#duration").fill("12");
    await page.locator("input#income").fill("50000");

    // Submit the form
    await page.getByRole("button", { name: "Lancer la simulation" }).click();

    // Wait for the API call to complete
    await page.waitForResponse("**/api/simulations**");

    // Verify error state
    await expect(page.getByText("Aucune donnée disponible")).toBeVisible();
  });
});
