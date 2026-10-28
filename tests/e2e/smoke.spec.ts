import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Abort every request that leaves the machine and remember it. */
async function blockNetwork(page: Page): Promise<string[]> {
  const external: string[] = [];
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (LOCAL_HOSTS.has(new URL(url).hostname)) return route.continue();
    external.push(url);
    return route.abort('internetdisconnected');
  });
  return external;
}

async function finishOnboarding(page: Page) {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Make it yours' })).toBeVisible();
  await page.getByRole('button', { name: 'Start cooking' }).click();
  await expect(page.getByRole('heading', { name: 'What are we cooking tonight?' })).toBeVisible();
}

test('the preset flow works end to end with the network blocked', async ({ page }) => {
  const external = await blockNetwork(page);
  await finishOnboarding(page);

  await page.getByRole('link', { name: /Scan your fridge/ }).click();
  await expect(page.getByRole('heading', { name: 'We found 8 items' })).toBeVisible();
  const findDishes = page.getByRole('button', { name: 'Find dishes' });
  await expect(findDishes).toBeEnabled();
  await findDishes.click();

  await expect(page.getByRole('heading', { name: /dishes for tonight/ })).toBeVisible();
  await page.getByRole('link', { name: /Lemon chicken rice/ }).click();
  await expect(page.getByRole('heading', { name: 'Lemon chicken rice' })).toBeVisible();
  await expect(page.getByText('You save €1.60')).toBeVisible();
  await page.getByRole('button', { name: 'Add 2 to list · €4.69' }).click();
  await page.getByRole('link', { name: 'View list' }).click();

  await expect(page.getByRole('heading', { name: 'Shopping list' })).toBeVisible();
  await expect(page.getByText('For 1 dish · 2 items · 2 stores')).toBeVisible();
  await expect(page.getByText('€4.69')).toBeVisible();

  await page.getByRole('link', { name: 'Deals' }).click();
  await expect(page.getByText('Demo prices')).toBeVisible();
  await page.getByRole('link', { name: /Cook something from these deals/ }).click();
  await expect(page.getByRole('heading', { name: /dishes from this week's deals/ })).toBeVisible();

  await page.goto('./#/profile');
  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
  await page.goto('./#/');
  await expect(page.getByRole('heading', { name: '¿Qué cocinamos esta noche?' })).toBeVisible();

  expect(external).toEqual([]);
});

const SCREENS = ['#/', '#/scan', '#/dishes', '#/recipe/lemon-chicken-rice', '#/deals', '#/list', '#/profile', '#/plus'];
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
      await page.getByRole('button', { name: "Yes, I'm 18+" }).click();
      await page.getByRole('button', { name: 'Try a sample bar' }).click();
      await expect(page.getByRole('heading', { name: /You can mix \d+ drinks/ })).toBeVisible();
    }
    await page.goto(`./${screen}`);
    await expect(page.locator('main')).toBeVisible();
    await page.waitForTimeout(1300); // let the scan animation and toasts settle

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
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
