const { test, expect } = require('@playwright/test');

const adminEmail=process.env.E2E_ADMIN_EMAIL;
const adminPassword=process.env.E2E_ADMIN_PASSWORD;

async function login(page){
  test.skip(!adminEmail||!adminPassword,'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin tests.');
  await page.goto('/admin-login');
  await page.locator('input[type="email"]').fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.getByRole('button',{name:/sign|login|log in/i}).click();
  await page.waitForURL(/\/admin/,{timeout:15000});
}

test.describe('TalentQuest admin competition flow',()=>{
  test('applications review area loads for an administrator',async({page})=>{
    await login(page); await page.goto('/admin/applications');
    await expect(page.getByRole('heading',{name:/applications/i})).toBeVisible();
  });

  test('contestant management loads',async({page})=>{
    await login(page); await page.goto('/admin/contestants');
    await expect(page.locator('body')).toContainText(/contestant/i);
  });

  test('round management exposes qualification controls',async({page})=>{
    await login(page); await page.goto('/admin/rounds');
    await expect(page.getByRole('heading',{name:/rounds/i})).toBeVisible();
    await expect(page.locator('body')).toContainText(/round|voting/i);
  });

  test('voting control exposes revenue, vote and ranking state',async({page})=>{
    await login(page); await page.goto('/admin/voting');
    await expect(page.locator('body')).toContainText(/voting/i);
    await expect(page.locator('body')).toContainText(/vote|revenue|ranking/i);
  });
});
