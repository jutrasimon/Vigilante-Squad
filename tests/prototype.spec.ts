import {test,expect} from '@playwright/test';

for(const mobile of [false,true])test.describe(mobile?'Touch mobile':'Mouse desktop',()=>{
 test.use({viewport:{width:mobile?390:1365,height:900},hasTouch:mobile,isMobile:mobile});
 test('Buttons survive live ticks and a complete intervention responds',async({page})=>{
  test.setTimeout(60000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('#start').click();
  await expect(page.locator('#map svg')).toBeVisible();
  const nora=page.locator('#agent-nora');
  await expect(nora.locator('.hero-status')).toHaveText('Repos au QG');
  const inScreen=async(selector:string)=>expect(await page.locator(selector).evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}))).toBe(true);
  await inScreen('.hero-status');await inScreen('[data-idle]');
  expect(await page.locator('.agent').evaluateAll(cards=>cards.every(card=>Array.from(card.querySelectorAll('.stats b')).every(n=>n.getBoundingClientRect().bottom<=card.getBoundingClientRect().bottom)))).toBe(true);
  await inScreen('#send-intervene');await inScreen('#map');
  await page.locator('#profiles').click();await expect(page.locator('#profiles-dialog')).toBeVisible();
  await page.locator('[data-close="profiles-dialog"]').click();
  await page.locator('#radio').click();await expect(page.locator('#radio-dialog')).toBeVisible();
  await page.locator('[data-close="radio-dialog"]').click();
  // Real taps/clicks while the simulation is updating, not a paused UI.
  for(let k=0;k<8;k++){
   if(mobile)await nora.tap();else await nora.click();
   await expect(nora).toHaveAttribute('aria-pressed',k%2?'true':'false');
  }
  await page.evaluate(()=>{(window as any).__heldButton=document.querySelector('#send-intervene');(window as any).__heldAgent=document.querySelector('#agent-nora');});
  await page.waitForTimeout(750);
  expect(await page.evaluate(()=>(window as any).__heldButton===document.querySelector('#send-intervene'))).toBe(true);
  // Holding across several 200ms refreshes used to lose this click.
  await page.locator('#send-intervene').click({delay:650});
  await expect(page.locator('.arrival')).toContainText('en route');
  await expect(nora.locator('.hero-status')).toHaveText('Occupé · trajet');
  await page.locator('[data-idle="nora"]').selectOption('patrol');
  await expect(nora.locator('.hero-status')).toHaveText('Occupé · trajet');
  await expect(page.locator('#toast')).toContainText('Ordre reçu');
  await expect(page.locator('#selection-label')).toHaveText('0 sélectionné');
  await page.locator('#speed').click();await page.locator('#speed').click();
  await page.waitForTimeout(700);
  expect(await page.evaluate(()=>(window as any).__heldAgent===document.querySelector('#agent-nora'))).toBe(true);
  await expect(page.locator('[data-choice="talk"]')).toBeVisible({timeout:12000});
  await expect(nora.locator('.hero-status')).toHaveText('À décider');
  await inScreen('.hero-status');await inScreen('[data-choice]');
  await page.screenshot({path:`test-results/decision-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await page.locator('[data-choice="talk"]').click({delay:650});
  await expect(page.locator('.working')).toBeVisible();
  await expect(nora.locator('.hero-status')).toHaveText('Occupé · action');
  await expect(page.getByRole('progressbar')).toBeVisible();
  await expect.poll(async()=>Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  await page.screenshot({path:`test-results/progress-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await expect(page.locator('.outcome')).toBeVisible({timeout:12000});
  await expect(nora.locator('.hero-status')).toHaveText('Patrouille');
  await expect(page.locator('[data-idle="nora"]')).toHaveValue('patrol');
  await expect(page.locator('[data-map-incident="quai"]')).toBeVisible({timeout:6000});
  await page.locator('#pause').click();
  await expect(page.locator('#pause')).toHaveText('Reprendre');
  if(mobile)await page.locator('[data-map-incident="quai"] .map-hit').tap();
  else await page.locator('[data-map-incident="quai"] .map-hit').click();
  await expect(page.locator('#incident h2')).toHaveText('Montée des eaux');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/web-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await page.locator('#finish').click();await expect(page.locator('#summary')).toBeVisible();
  await page.locator('#same-night').click();await expect(page.locator('#summary')).not.toBeVisible();
  expect(errors).toEqual([]);
 });
});

test('Keyboard focus remains on a button while its countdown changes',async({page})=>{
 await page.goto('/');await page.locator('#start').click();await page.locator('#send-intervene').focus();
 await page.waitForTimeout(1100);await expect(page.locator('#send-intervene')).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('.arrival')).toBeVisible();
});
