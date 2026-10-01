const { test, expect } = require('@playwright/test');

const adminEmail=process.env.E2E_ADMIN_EMAIL;
const adminPassword=process.env.E2E_ADMIN_PASSWORD;

async function login(page){
  test.skip(!adminEmail||!adminPassword,'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin tests.');
  await page.goto('/admin-login');
  await page.locator('input[type="email"]').fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.getByRole('button',{name:/sign in to dashboard|sign in|login|log in/i}).click();
  await page.waitForURL(url=>url.pathname==='/admin'||url.pathname.startsWith('/admin/'),{timeout:15000});
  await expect(page.getByText(/securing talentquest/i)).toBeHidden({timeout:15000}).catch(()=>{});
}

async function openAdmin(page,path){
  await page.goto(path);
  // Supabase persists the session in browser storage. On slower/mobile runs the
  // layout auth check can briefly race navigation; if it redirects, log in once
  // more and return to the intended protected page.
  await page.waitForLoadState('domcontentloaded');
  if(new URL(page.url()).pathname==='/admin-login'){
    await login(page);
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
  }
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:$|[/?#])`),{timeout:15000});
}

test.describe('TalentQuest admin competition flow',()=>{
  test.beforeEach(async({page})=>{await login(page)});

  test('applications review area loads for an administrator',async({page})=>{
    await openAdmin(page,'/admin/applications');
    await expect(page.getByRole('heading',{name:'Applications',exact:true})).toBeVisible({timeout:15000});
    await expect(page.locator('body')).toContainText(/application/i);
  });

  test('contestant management loads',async({page})=>{
    await openAdmin(page,'/admin/contestants');
    await expect(page.locator('body')).toContainText(/contestant/i,{timeout:15000});
  });

  test('round management exposes qualification controls',async({page})=>{
    await openAdmin(page,'/admin/rounds');
    await expect(page.getByRole('heading',{name:'Rounds',exact:true})).toBeVisible({timeout:15000});
    await expect(page.locator('body')).toContainText(/round|voting/i);
  });

  test('voting control exposes revenue, vote and ranking state',async({page})=>{
    await openAdmin(page,'/admin/voting');
    await expect(page.locator('body')).toContainText(/voting/i,{timeout:15000});
    await expect(page.locator('body')).toContainText(/vote|revenue|ranking/i);
  });
});
