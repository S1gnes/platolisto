import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Abort every request that leaves the machine and remember it. */
async function blockNetwork(page: Page): Promise<string[]> {
  const external: string[] = [];
  await page.route('**/*', (route) => {
    const url = route.request().url();
    const host = new URL(url).hostname;
    if (LOCAL_HOSTS.has(host)) return route.continue();
    // Dish photos are optional: offline they fail and the drawn plate shows instead.
    if (host !== 'img.spoonacular.com') external.push(url);
    return route.abort('internetdisconnected');
  });
  return external;
}

async function finishOnboarding(page: Page) {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Your food preferences' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'What can you cook today?' })).toBeVisible();
}

test('the example fridge flow works end to end with the network blocked', async ({ page }) => {
  const external = await blockNetwork(page);
  await finishOnboarding(page);

  await page.getByRole('link', { name: /Photograph your fridge/ }).click();
  await expect(page.getByRole('heading', { name: '8 items found' })).toBeVisible();
  const findDishes = page.getByRole('button', { name: 'Find dishes' });
  await expect(findDishes).toBeEnabled();
  await findDishes.click();

  await expect(page.getByRole('heading', { name: /dishes with your ingredients/ })).toBeVisible();
  await page.getByRole('link', { name: /Lemon chicken rice/ }).click();
  await expect(page.getByRole('heading', { name: 'Lemon chicken rice' })).toBeVisible();
  await expect(page.getByText('€4.69')).toBeVisible();
  await expect(page.getByText('You save €1.60')).toBeVisible();
  await page.getByRole('button', { name: 'Add 2 to list' }).click();
  await page.getByRole('link', { name: 'Open list' }).click();

  await expect(page.getByRole('heading', { name: 'Shopping list' })).toBeVisible();
  await expect(page.getByText('2 items for 1 dish')).toBeVisible();
  await expect(page.getByText('€4.69')).toBeVisible();

  // Your own item joins the list with this week's deal for it.
  await page.getByLabel('Add an item yourself').fill('bread');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByText('Rustic baguette 250 g')).toBeVisible();
  await expect(page.getByText('€5.34')).toBeVisible();

  await page.getByRole('link', { name: 'Deals' }).click();
  await expect(page.getByText(/^(Prices read|Example prices)/)).toBeVisible();
  await page.getByRole('link', { name: /See dishes from these deals/ }).click();
  await expect(page.getByRole('heading', { name: /dishes from this week's deals/ })).toBeVisible();

  // Back on the home screen, the saved fridge is one tap from its dishes.
  await page.goto('./#/');
  await expect(page.getByText('8 items from an example fridge')).toBeVisible();
  await page.getByRole('link', { name: 'See dishes' }).click();
  await expect(page.getByRole('heading', { name: /dishes with your ingredients/ })).toBeVisible();

  await page.goto('./#/profile');
  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
  await page.goto('./#/');
  await expect(page.getByRole('heading', { name: '¿Qué puedes cocinar hoy?' })).toBeVisible();

  expect(external).toEqual([]);
});

test('a deal opens the dishes that use it, and the recipe keeps that deal', async ({ page }) => {
  await blockNetwork(page);
  await finishOnboarding(page);

  await page.goto('./#/deals');
  // An example deal from the brief, so the test does not depend on this week's real prices.
  await page.getByRole('link', { name: /Chickpeas 570 g/ }).first().click();
  await expect(page.getByRole('heading', { name: /dishes with chickpeas/ })).toBeVisible();
  await expect(page.getByText(/On offer at Mercadona: Chickpeas 570 g/)).toBeVisible();

  await page.getByRole('link', { name: /Chickpeas with spinach/ }).click();
  await expect(page.getByRole('heading', { name: 'Chickpeas with spinach' })).toBeVisible();
  await expect(page.getByText('Chickpeas 570 g')).toBeVisible();
});

test('typing a list by hand leads to dishes', async ({ page }) => {
  await blockNetwork(page);
  await finishOnboarding(page);

  await page.getByRole('link', { name: /Type what you have/ }).click();
  await expect(page.getByRole('heading', { name: 'No ingredients yet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Find dishes' })).toBeDisabled();

  await page.getByRole('button', { name: 'Eggs', exact: true }).click();
  await page.getByRole('button', { name: 'Onion', exact: true }).click();
  await page.getByLabel('Add an ingredient').fill('pota');
  await page.getByRole('button', { name: 'Potatoes', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: '3 items' })).toBeVisible();

  await page.getByRole('button', { name: 'Find dishes' }).click();
  const tortilla = page.getByRole('link', { name: /Spanish tortilla/ });
  await expect(tortilla).toContainText('Nothing to buy');
});

const SCREENS = [
  '#/',
  '#/scan',
  '#/scan?mode=type',
  '#/dishes',
  '#/dishes?from=deals',
  '#/recipe/lemon-chicken-rice',
  '#/deals',
  '#/list',
  '#/profile',
  '#/plus',
];
const PLUS_SCREENS = ['#/plan', '#/bartender'];

test('every screen passes axe and has touch targets of at least 44 px', async ({ page }) => {
  await blockNetwork(page);
  await finishOnboarding(page);
  // Put something in the list so the list screen is not empty.
  await page.goto('./#/scan');
  await expect(page.getByRole('button', { name: 'Find dishes' })).toBeEnabled();
  await page.goto('./#/recipe/spanish-tortilla');
  await page.getByRole('button', { name: /Add 1 to list/ }).click();

  const problems: string[] = [];
  for (const screen of [...SCREENS, ...PLUS_SCREENS]) {
    if (screen === PLUS_SCREENS[0]) {
      await page.goto('./#/plus');
      await page.getByRole('button', { name: 'Unlock Plus (demo)' }).click();
      await page.goto('./#/bartender');
      await page.getByRole('button', { name: "Yes, I'm 18 or older" }).click();
      await page.getByRole('button', { name: 'Use an example bar' }).click();
      await expect(page.getByRole('heading', { name: /You can mix \d+ drinks/ })).toBeVisible();
    }
    await page.goto(`./${screen}`);
    await expect(page.locator('main')).toBeVisible();
    await page.waitForTimeout(1300); // let the scan animation settle

    // axe's own 24 px target rule is off: it misfires on a control that happens to sit half under the
    // sticky tab bar, and the 44 px check below is stricter anyway.
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .disableRules(['target-size'])
      .analyze();
    for (const violation of axe.violations) {
      if (violation.impact !== 'serious' && violation.impact !== 'critical') continue;
      problems.push(`${screen} axe ${violation.id}: ${violation.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    }

    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea')]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height || el.classList.contains('visually-hidden')) return false;
          // A checkbox inside a big label row is fine: the whole row is the target.
          if (el instanceof HTMLInputElement && el.type === 'checkbox' && el.closest('label')) return false;
          return rect.width < 44 || rect.height < 44;
        })
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40);
          return `${el.tagName.toLowerCase()} "${name}" ${Math.round(rect.width)}×${Math.round(rect.height)}`;
        }),
    );
    for (const target of small) problems.push(`${screen} small target: ${target}`);
  }
  expect(problems).toEqual([]);
});
