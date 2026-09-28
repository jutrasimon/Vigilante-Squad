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
  // Both entry paths use the same screen; entering through a hero preselects them.
  if(mobile)await nora.tap();else await nora.click();
  await expect(page.locator('aside #dispatch-panel')).toBeVisible();await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.locator('#pick-nora')).toHaveAttribute('aria-pressed','true');
  await page.locator('#dispatch-back').click();
  await page.locator('#send-intervene').click({delay:650});
  await expect(page.locator('#confirm-dispatch')).toBeDisabled();
  const pickNora=page.locator('#pick-nora');
  for(let k=0;k<7;k++){
   if(mobile)await pickNora.tap();else await pickNora.click();
   await expect(pickNora).toHaveAttribute('aria-pressed',k%2?'false':'true');
  }
  await page.locator('#pick-malik').click();
  await expect(page.locator('[data-total="Corps"]')).toHaveText('10');
  await expect(page.locator('[data-total="Esprit"]')).toHaveText('12');
  await expect(page.locator('[data-total="Âme"]')).toHaveText('13');
  await page.screenshot({path:`test-results/dispatch-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await page.evaluate(()=>{(window as any).__heldButton=document.querySelector('#confirm-dispatch');(window as any).__heldAgent=document.querySelector('#agent-nora');});
  await page.waitForTimeout(750);
  expect(await page.evaluate(()=>(window as any).__heldButton===document.querySelector('#confirm-dispatch'))).toBe(true);
  await page.locator('#confirm-dispatch').click({delay:650});
  await expect(page.locator('#dispatch-panel')).not.toBeVisible();
  await expect(page.locator('.arrival')).toContainText('en route');
  await expect(nora.locator('.hero-status')).toHaveText('Occupé · trajet');
  await expect(nora.locator('.hero-activity')).toContainText('→ Gare Est');await expect(nora.locator('.hero-activity')).toContainText('Altercation à la gare');
  await page.locator('[data-idle="nora"]').selectOption('patrol');
  await expect(page.locator('#toast')).toContainText('Ordre reçu');
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
  await expect(page.locator('.outcome')).toContainText('Nora + Malik');
  await expect(page.locator('.event-history')).toContainText('Approche choisie');
  await page.screenshot({path:`test-results/report-${mobile?'mobile':'desktop'}.png`,fullPage:true});
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
 await page.keyboard.press('Enter');await expect(page.locator('#dispatch-panel')).toBeVisible();
 await page.locator('#pick-malik').focus();await page.keyboard.press('Enter');
 await page.locator('#confirm-dispatch').focus();await page.waitForTimeout(750);await expect(page.locator('#confirm-dispatch')).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('.arrival')).toBeVisible();
});


test('Map wheel zoom anchors the cursor and left/middle drag preserve selection',async({page})=>{
 await page.goto('/');await page.locator('#start').click();await page.locator('#pause').click();
 const svg=page.locator('#map svg');
 const view=()=>svg.evaluate(n=>{const r=(n as SVGSVGElement).viewBox.baseVal;return {x:r.x,y:r.y,width:r.width,height:r.height};});
 const box=(await svg.boundingBox())!;const x=Math.round(box.x+box.width*.45),y=Math.round(box.y+box.height*.45);
 const world=()=>svg.evaluate((n,p)=>new DOMPoint(p.x,p.y).matrixTransform((n as SVGSVGElement).getScreenCTM()!.inverse()).toJSON(),{x,y});
 await page.mouse.move(x,y);const anchor=await world();await page.mouse.wheel(0,-350);
 await expect.poll(async()=>(await view()).width).toBeLessThan(800);
 const after=await world();expect(after.x).toBeCloseTo(anchor.x,1);expect(after.y).toBeCloseTo(anchor.y,1);
 for(const button of ['left','middle'] as const){
  const before=await view();await page.mouse.move(x,y);await page.mouse.down({button});await page.mouse.move(x+60,y+35,{steps:8});await page.mouse.up({button});
  const next=await view();expect(next.x).toBeLessThan(before.x);expect(next.y).toBeLessThan(before.y);
  await expect(page.locator('#map')).not.toHaveClass(/panning/);
 }
 // Dragging from an actual alert must not trigger its click/recentering callback.
 await page.locator('#alert-gare').click();
 const hit=page.locator('[data-map-incident="gare"] .map-hit');const b=(await hit.boundingBox())!;
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2-30,b.y+b.height/2-20,{steps:5});
 const held=await view();await page.mouse.up();expect(await view()).toEqual(held);
 await page.locator('#zoomout').click();await page.locator('#zoomout').click();await hit.click();
 await expect(page.locator('#incident h2')).toHaveText('Altercation à la gare');
 await page.mouse.move(x,y);await page.mouse.wheel(0,3000);await expect.poll(async()=>(await view()).width).toBeGreaterThan(held.width);
});


test('Alert countdown ring drains with time and pauses with the simulation',async({page})=>{
 await page.goto('/');await page.locator('#start').click();
 const ring=page.locator('[data-map-incident="gare"] .incident-timer');
 const amount=async()=>parseFloat((await ring.getAttribute('stroke-dasharray'))!);
 const before=await amount();await expect.poll(amount).toBeLessThan(before);
 await page.locator('#pause').click();const paused=await amount();await page.waitForTimeout(500);expect(await amount()).toBe(paused);
});
