const { test, expect } = require('@playwright/test');

test.describe('TalentQuest public flows',()=>{
  test('application page exposes protected application workflow',async({page})=>{
    await page.goto('/apply');
    await expect(page.getByText('Contestant application')).toBeVisible();
    await expect(page.getByText('Public profile photo')).toBeVisible();
    await expect(page.getByText('Audition performance')).toBeVisible();
    await expect(page.getByText('Security check')).toBeVisible();
    await expect(page.getByRole('button',{name:/submit application/i})).toBeVisible();
  });

  test('contestants and leaderboard pages render',async({page})=>{
    await page.goto('/contestants');
    await expect(page.locator('body')).toContainText(/contestant|talent/i);
    await page.goto('/leaderboard');
    await expect(page.locator('body')).toContainText(/leaderboard|ranking/i);
  });

  test('vote directory renders current voting state',async({page})=>{
    await page.goto('/vote');
    await expect(page.locator('body')).toContainText(/vote|voting/i);
  });

  test('portal remains usable on mobile viewport',async({page})=>{
    await page.setViewportSize({width:375,height:667});
    await page.goto('/portal');
    await expect(page.locator('body')).toContainText(/portal|sign|welcome/i);
  });
});
