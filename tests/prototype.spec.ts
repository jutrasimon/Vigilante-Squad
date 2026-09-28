import {test,expect} from '@playwright/test';

for(const mobile of [false,true])test.describe(mobile?'Touch mobile':'Mouse desktop',()=>{
 test.use({viewport:{width:mobile?390:1365,height:900},hasTouch:mobile,isMobile:mobile});
 test('Buttons survive live ticks and a complete intervention responds',async({page})=>{
  test.setTimeout(60000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('#start').click();
  await expect(page.locator('#map svg')).toBeVisible();
  const nora=page.locator('#agent-nora');
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
  await expect(page.locator('#toast')).toContainText('Ordre reçu');
  await expect(page.locator('#selection-label')).toHaveText('0 sélectionné');
  await page.locator('#speed').click();await page.locator('#speed').click();
  await page.waitForTimeout(700);
  expect(await page.evaluate(()=>(window as any).__heldAgent===document.querySelector('#agent-nora'))).toBe(true);
  await expect(page.locator('[data-choice="talk"]')).toBeVisible({timeout:12000});
  await page.locator('[data-choice="talk"]').click({delay:650});
  await expect(page.locator('.working')).toBeVisible();
  await expect(page.locator('.outcome')).toBeVisible({timeout:12000});
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
