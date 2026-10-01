import {test,expect} from '@playwright/test';
for(const width of [320,390,1280])test(`hero gym ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/hero-gym.html');
 for(const theme of ['dossier','bulletin']){
 await page.locator(`[data-theme="${theme}"]`).first().click();
 await expect(page.locator('#sheet')).toHaveAttribute('data-theme',theme);
 const portrait=await page.locator('.portrait').boundingBox();expect(Math.abs(portrait!.width-portrait!.height)).toBeLessThan(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await expect(page.locator('.hp .filled')).toHaveCount(6);await expect(page.locator('.mental .filled')).toHaveCount(8);
 await page.getByText('Couleurs et matière',{exact:true}).click();await page.locator('[data-color="accent"]').fill('#33aacc');await expect(page.locator('#sheet')).toHaveCSS('--accent','#33aacc');
 await page.locator('[data-tab="Journal"]').click();await expect(page.locator('.journal-timeline')).toContainText('Gare Est · Civils protégés');await page.locator('[data-tab="Fiche"]').click();
 await page.locator('[data-idle="patrol"]').click();await expect(page.locator('[data-idle="patrol"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#reset-colors').click();await page.getByText('Couleurs et matière',{exact:true}).click();
 await page.screenshot({path:`test-results/hero-${theme}-${width}.png`,fullPage:true});
 }
 await page.getByText('Attributs et TAGs',{exact:true}).click();
 await page.locator('[data-stat="0"]').fill('12');await page.locator('[data-stat="0"]').press('Tab');await expect(page.locator('.attributes')).toContainText('12');
 await page.locator('#tag-name').fill('Sang-froid');await page.locator('#tag-description').fill('Reste calme sous pression.');await page.getByRole('button',{name:'+ Ajouter le TAG',exact:true}).click();
 await page.getByText('Attributs et TAGs',{exact:true}).click();
 const tag=page.locator('.tag').filter({hasText:'Sang-froid'});await tag.click();await expect(page.getByRole('tooltip')).toContainText('Reste calme sous pression.');await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
 const ring=await page.locator('.countdown').boundingBox(),value=await page.locator('.countdown-value').boundingBox();expect(Math.abs((ring!.x+ring!.width/2)-(value!.x+value!.width/2))).toBeLessThan(2);
 await page.locator('summary').filter({hasText:'Tester la fiche'}).click();const before=await page.locator('.attributes').boundingBox();await page.locator('#bark').click();await expect(page.locator('#speech')).toBeVisible();expect((await page.locator('.attributes').boundingBox())!.y).toBe(before!.y);
 await page.locator('[data-max="hp"]').fill('4');await page.locator('[data-max="hp"]').press('Tab');await expect(page.locator('.hp .track')).toHaveAttribute('aria-valuemax','4');await expect(page.locator('.hp .filled')).toHaveCount(4);
 await page.locator('[data-max="mental"]').fill('14');await page.locator('[data-max="mental"]').press('Tab');await expect(page.locator('.mental .track i')).toHaveCount(14);
 await page.locator('#cancel-mission').click();await expect(page.getByRole('dialog')).toBeVisible();await page.locator('#keep-mission').click();await expect(page.locator('.mission')).toBeVisible();
 await page.locator('#cancel-mission').click();await page.locator('#confirm-cancel').click();await expect(page.locator('.mission')).toHaveCount(0);await expect(page.locator('.hero-state')).toContainText('Patrouille');
 await page.locator('#state').selectOption('travel');await expect(page.locator('.mini-mission')).toBeVisible();
 await page.locator('#view-mission').click();await expect(page).toHaveURL(/incident=gare/);await expect(page.locator('#intro')).not.toBeVisible();
});

for(const width of [320,390,1280])test(`single object workshop ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/hero-gym.html');
 await page.getByText('Tester la fiche',{exact:true}).click();
 for(const theme of ['dossier','bulletin']){
  await page.locator(`[data-theme="${theme}"]`).first().click();
  await page.locator('.tabs [data-tab="Objet"]').click();
  await expect(page.locator('.tabs [data-tab="Véhicule"]')).toHaveCount(0);
  await expect(page.locator('.object-card')).toHaveCount(4);
  await page.locator('#state').selectOption('rest');
  await page.locator('[data-object="bike"]').click();
  await expect(page.locator('.speed-strip')).toContainText('18');
  await expect(page.locator('.object-card:disabled')).toHaveCount(0);
  await page.locator('.object-workshop').screenshot({path:`test-results/objects-${theme}-hq-${width}.png`});
  await page.locator('[data-object="vest"]').click();
  await expect(page.locator('.speed-strip')).toContainText('5');
  await expect(page.locator('.object-card[aria-pressed="true"]')).toHaveCount(1);
  await page.locator('[data-object="medkit"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('[data-object="medkit"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.speed-strip')).toContainText('6');
  await page.locator('[data-object="bike"]').click();
  for(const state of ['patrol','travel','working']){
   await page.locator('#state').selectOption(state);
   await expect(page.locator('.object-card:disabled')).toHaveCount(3);
   await page.locator('[data-object="vest"]').evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
   await expect(page.locator('[data-object="bike"]')).toHaveAttribute('aria-pressed','true');
  }
  await page.locator('.object-workshop').screenshot({path:`test-results/objects-${theme}-away-${width}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.getByText('Couleurs et matière',{exact:true}).click();
  await page.locator('[data-color="accent"]').fill('#cc44aa');await expect(page.locator('.object-card.equipped')).toHaveCSS('border-top-color','rgb(204, 68, 170)');
  await page.locator('[data-color="speed"]').fill('#55bbdd');await expect(page.locator('.object-speed')).toHaveCSS('color','rgb(85, 187, 221)');
  await page.locator('#state').selectOption('rest');await page.locator('[data-color="negative"]').fill('#ee3366');await expect(page.locator('.object-penalty')).toHaveCSS('color','rgb(238, 51, 102)');
  await page.locator('[data-color="positive"]').fill('#66dd99');await expect(page.locator('.object-tag').first()).toHaveCSS('--positive','#66dd99');
  await page.locator('#reset-colors').click();await page.getByText('Couleurs et matière',{exact:true}).click();
  await page.locator('.tabs [data-tab="Journal"]').click();await expect(page.locator('.journal-timeline')).toContainText('Objet équipé');
 }
});

for(const width of [320,390,1280])test(`comic barks alignment ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/hero-gym.html');await page.getByText('Tester la fiche',{exact:true}).click();
 for(const theme of ['dossier','bulletin']){
 await page.locator(`[data-theme="${theme}"]`).first().click();
 for(let i=0;i<4;i++){
 await page.locator('#bark').click();await page.locator('.identity').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
 const bubble=page.locator('#speech');await expect(bubble).toBeVisible();await expect(bubble).not.toContainText('MALIK');
 const b=await bubble.boundingBox(),header=await page.locator('.identity').boundingBox(),name=await page.locator('.identity h1').boundingBox();
 expect(b!.x).toBeGreaterThanOrEqual(header!.x);expect(b!.x+b!.width).toBeLessThanOrEqual(header!.x+header!.width+1);
   expect(b!.x).toBeGreaterThan(header!.x+header!.width*.25);
   expect(b!.y).toBeLessThan(name!.y+name!.height);
   expect(b!.y+b!.height).toBeGreaterThan(name!.y);
 await page.locator('.identity').screenshot({path:`test-results/dialogue-${theme}-${width}-${i}.png`});
 }
 }
});
