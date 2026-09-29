import {test,expect,type Page} from '@playwright/test';

async function testTool(page:Page,id:string){
 await page.locator('#help').click();
 if(!(await page.locator('.test-settings').getAttribute('open'))&&!(await page.locator('#'+id).isVisible()))await page.locator('.test-settings summary').click();
 await page.locator('#'+id).click();
 if(await page.locator('#intro').isVisible())await page.locator('#start').click();
}

for(const mobile of [false,true])test.describe(mobile?'Touch mobile':'Mouse desktop',()=>{
 test.use({viewport:{width:mobile?390:1365,height:900},hasTouch:mobile,isMobile:mobile});
 test('Buttons survive live ticks and a complete intervention responds',async({page})=>{
  test.setTimeout(60000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('#start').click();
  await expect(page.locator('#map svg')).toBeVisible();
  await expect(page.locator('.objective-line')).toContainText('Mettre les civils');
  await page.screenshot({path:`test-results/event-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  const nora=page.locator('#agent-nora');
  await expect(nora.locator('.hero-status')).toHaveText('Repos au QG');
  expect(await page.locator('#agents .portrait').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect();return Math.abs(r.width-r.height)<1;}))).toBe(true);
  await expect(page.locator('#agents [role="meter"]')).toHaveCount(6);
  expect(await page.locator('#agents .segments').evaluateAll(ns=>Math.max(...ns.map(n=>n.getBoundingClientRect().width))-Math.min(...ns.map(n=>n.getBoundingClientRect().width))<1)).toBe(true);
  expect((await page.locator('.squad').boundingBox())!.height).toBeLessThan(mobile?230:170);
  await expect(page.locator('footer')).toHaveCount(0);
  const inScreen=async(selector:string)=>expect(await page.locator(selector).evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}))).toBe(true);
  await inScreen('.hero-status');await inScreen('#agents [data-idle]');
  expect(await page.locator('.agent').evaluateAll(cards=>cards.every(card=>Array.from(card.querySelectorAll('.stats b')).every(n=>n.getBoundingClientRect().bottom<=card.getBoundingClientRect().bottom)))).toBe(true);
  await inScreen('#map');
  if(mobile)await page.locator('#view-intervention').tap();
  await inScreen('#send-intervene');
  await page.locator('#profiles').click();await expect(page.locator('#profiles-dialog')).toBeVisible();
  await page.locator('[data-close="profiles-dialog"]').click();
  await testTool(page,'radio');await expect(page.locator('#radio-dialog')).toBeVisible();
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
  await expect(page.locator('#dispatch-panel .comparison-chart')).toHaveAttribute('role','img');
  await expect(page.locator('#dispatch-panel .bullet-fill')).toHaveCount(3);
  await expect(page.locator('#dispatch-panel .difficulty-marker')).toHaveCount(2);
  await expect(page.locator('#dispatch-panel .dial')).toHaveCount(2);
  await expect(page.locator('#pick-nora svg.icon-tabler')).not.toHaveCount(0);
  await page.locator('#dispatch-comparison').scrollIntoViewIfNeeded();
  await page.screenshot({path:`test-results/dispatch-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await page.evaluate(()=>{(window as any).__heldButton=document.querySelector('#confirm-dispatch');(window as any).__heldAgent=document.querySelector('#agent-nora');});
  await page.waitForTimeout(750);
  expect(await page.evaluate(()=>(window as any).__heldButton===document.querySelector('#confirm-dispatch'))).toBe(true);
  await page.locator('#confirm-dispatch').click({delay:650});
  await expect(page.locator('#dispatch-panel')).not.toBeVisible();
  await expect(page.locator('.arrival')).toContainText('en route');
  await expect(nora.locator('.hero-status')).toHaveText('Occupé · trajet');
  await expect(nora.locator('.hero-activity')).toContainText('→ Gare Est');await expect(nora.locator('.hero-activity')).toContainText('Altercation à la gare');
  await page.locator('#idle-nora-patrol').click();
  await expect(page.locator('#idle-nora-patrol')).toHaveAttribute('aria-pressed','true');
  await testTool(page,'speed');await testTool(page,'speed');
  await page.waitForTimeout(700);
  expect(await page.evaluate(()=>(window as any).__heldAgent===document.querySelector('#agent-nora'))).toBe(true);
  await expect(page.locator('[data-choice="talk"]')).toBeVisible({timeout:12000});
  await expect(nora.locator('.hero-status')).toHaveText('À décider');
  await inScreen('.hero-status');await page.locator('[data-choice="talk"]').scrollIntoViewIfNeeded();
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
  await expect(page.locator('#idle-nora-patrol')).toHaveAttribute('aria-pressed','true');
  if(mobile)await page.locator('#view-map').tap();
  await expect(page.locator('[data-map-incident="quai"]')).toBeVisible({timeout:6000});
  await testTool(page,'pause');
  await expect(page.locator('#pause')).toHaveText('Reprendre');
  if(mobile)await page.locator('[data-map-incident="quai"] .map-hit').tap();
  else await page.locator('[data-map-incident="quai"] .map-hit').click();
  await expect(page.locator('#incident h2')).toHaveText('Montée des eaux');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/web-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await testTool(page,'finish');await expect(page.locator('#summary')).toBeVisible();
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
 await page.goto('/');await page.locator('#start').click();await testTool(page,'pause');
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
 await testTool(page,'pause');const paused=await amount();await page.waitForTimeout(500);expect(await amount()).toBe(paused);
});

for(const viewport of [{width:360,height:640},{width:390,height:700},{width:320,height:568}])test.describe(`Short phone ${viewport.width}`,()=>{
 test.use({viewport,hasTouch:true,isMobile:true});
 test('Map and intervention controls remain usable above browser chrome',async({page})=>{
  await page.goto('/');await page.locator('#start').tap();await testTool(page,'pause');
  const usable=async(selector:string)=>{
   await expect(page.locator(selector)).toBeVisible();
   expect(await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&!!hit&&el.contains(hit);})).toBe(true);
  };
  expect((await page.locator('#map').boundingBox())!.height).toBeGreaterThan(170);
  expect((await page.locator('[data-map-incident="gare"] .map-hit').boundingBox())!.width).toBeGreaterThan(35);
  await page.screenshot({path:`test-results/short-${viewport.width}-map.png`});
  await page.locator('#alert-gare').tap();await usable('#send-intervene');
  await page.screenshot({path:`test-results/short-${viewport.width}-event.png`});
  await page.locator('#send-intervene').tap();await page.locator('#pick-malik').tap();await usable('#confirm-dispatch');
  await page.locator('#dispatch-comparison').scrollIntoViewIfNeeded();
  await page.screenshot({path:`test-results/short-${viewport.width}-prepare.png`});
  await page.setViewportSize({width:viewport.width,height:viewport.height-40});await usable('#confirm-dispatch');
  await page.locator('#confirm-dispatch').tap();await expect(page.locator('.arrival')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight)).toBe(true);
 });
});


test.describe('Actual multi-touch map gestures',()=>{
 test.use({viewport:{width:390,height:700},hasTouch:true,isMobile:true});
 test('Pinch, continue dragging, reset and tap without accidental selection',async({page,context})=>{
  await page.goto('/');await page.locator('#start').tap();await testTool(page,'pause');
  const client=await context.newCDPSession(page),svg=page.locator('#map svg');
  const view=()=>svg.evaluate(n=>{const v=(n as SVGSVGElement).viewBox.baseVal;return {x:v.x,y:v.y,width:v.width};});
  const b=(await svg.boundingBox())!,x=b.x+b.width/2,y=b.y+b.height/2;
  const touch=async(type:string,points:{x:number;y:number;id:number}[])=>client.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  await touch('touchStart',[{x:x-30,y,id:1},{x:x+30,y,id:2}]);
  for(let d=35;d<=80;d+=5)await touch('touchMove',[{x:x-d,y,id:1},{x:x+d,y,id:2}]);
  expect((await view()).width).toBeLessThan(450);
  await touch('touchEnd',[{x:x+80,y,id:2}]);const before=await view();
  await touch('touchMove',[{x:x+100,y:y+20,id:2}]);await touch('touchEnd',[]);
  expect((await view()).x).toBeLessThan(before.x);await expect(page.locator('#view-map')).toHaveAttribute('aria-pressed','true');
  await page.locator('#map-reset').tap();expect((await view()).width).toBe(800);
  const hit=page.locator('[data-map-incident="gare"] .map-hit'),r=(await hit.boundingBox())!,px=r.x+r.width/2,py=r.y+r.height/2;
  await touch('touchStart',[{x:px,y:py,id:3}]);await touch('touchMove',[{x:px-35,y:py+20,id:3}]);await touch('touchEnd',[]);
  await expect(page.locator('#view-map')).toHaveAttribute('aria-pressed','true');
  await page.locator('#map-reset').tap();await hit.tap();await expect(page.locator('#view-intervention')).toHaveAttribute('aria-pressed','true');
 });
});
