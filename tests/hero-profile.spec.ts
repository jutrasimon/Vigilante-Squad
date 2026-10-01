import {test,expect} from '@playwright/test';
for(const theme of ['dossier','bulletin'])test(`current hero profile ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:900});await page.goto('/hero-gym.html');
 await page.locator(`button[data-theme="${theme}"]`).click();await page.getByText('Tester la fiche',{exact:true}).click();
 await page.locator('#test-hard').click();await page.locator('#test-mission').click();
 await expect(page.locator('.attributes b')).toHaveText(['4','2','6']);await expect(page.locator('.speed-strip')).toContainText('16');
 await page.locator('.tags .tag').filter({hasText:'Épuisé'}).click();await expect(page.getByRole('tooltip')).toContainText('récupération au QG');await page.keyboard.press('Escape');
 await page.locator('[data-base]').focus();await page.keyboard.down('Space');await expect(page.locator('#sheet')).toHaveClass(/view-base/);await expect(page.locator('.attributes .base-value')).toHaveText(['6','4','8']);await page.keyboard.up('Space');await expect(page.locator('#sheet')).not.toHaveClass(/view-base/);
 for(const [state,label] of [['scouting','Repérage'],['choice','À décider'],['working','En intervention'],['return','Retour au QG']]){
  await page.locator('#state').selectOption(state);await expect(page.locator('.hero-state')).toContainText(label);await expect(page.locator('.mission h2')).toHaveText(label);
 }
 await page.locator('#sheet').screenshot({path:`test-results/profile-current-${theme}.png`});
 await page.locator('#test-rest').click();await expect(page.locator('.attributes b')).toHaveText(['6','4','8']);await expect(page.locator('.tags')).not.toContainText('Épuisé');
 await page.locator('[data-tab="Objet"]').click();await page.locator('[data-object="medkit"]').click();await page.locator('[data-tab="Fiche"]').click();await expect(page.locator('.tags')).toContainText('Soins');
 await page.locator('[data-tab="Journal"]').click();await expect(page.locator('.journal-timeline')).toContainText('Épuisé');await expect(page.locator('.journal-timeline')).toContainText('Récupération au QG');await page.locator('#sheet').screenshot({path:`test-results/profile-journal-${theme}.png`});
 await page.locator('[data-tab="Identité"]').click();await expect(page.locator('.story textarea')).toHaveCount(0);await expect(page.locator('.story-scroll')).toContainText('Le squad');expect(await page.locator('.story-scroll').evaluate(el=>el.scrollHeight>el.clientHeight)).toBeTruthy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('temporary tags expire after the stated number of missions',async({page})=>{
 await page.goto('/hero-gym.html');await page.getByText('Attributs et TAGs',{exact:true}).click();await page.locator('#tag-name').fill('Encouragé');await page.locator('#tag-description').fill('Effet de démonstration');await page.locator('#tag-duration').fill('2');await page.getByRole('button',{name:'+ Ajouter le TAG',exact:true}).click();
 await page.getByText('Tester la fiche',{exact:true}).click();await page.locator('#test-mission').click();await expect(page.locator('.tags')).toContainText('1 mission');await page.locator('#test-mission').click();await expect(page.locator('.tags')).not.toContainText('Encouragé');
});

for(const width of [320,1280])test(`hold base values and internal story scrolling ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/hero-gym.html');
 await page.getByText('Tester la fiche',{exact:true}).click();await page.locator('#exhausted').check();
 const hold=page.locator('[data-base]');await hold.scrollIntoViewIfNeeded();const b=(await hold.boundingBox())!;
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await expect(page.locator('#sheet')).toHaveClass(/view-base/);await expect(page.locator('.speed-strip .base-value')).toHaveText('6');
 await page.locator('.attributes').screenshot({path:`test-results/base-hold-${width}.png`});
 await page.mouse.move(1,1);await page.mouse.up();await expect(page.locator('#sheet')).not.toHaveClass(/view-base/);await hold.click();await expect(page.locator('#sheet')).not.toHaveClass(/view-base/);
 await hold.focus();await page.keyboard.down('Enter');await expect(page.locator('#sheet')).toHaveClass(/view-base/);await page.keyboard.up('Enter');await expect(page.locator('#sheet')).not.toHaveClass(/view-base/);
 await hold.scrollIntoViewIfNeeded();const c=(await hold.boundingBox())!;await page.mouse.move(c.x+c.width/2,c.y+c.height/2);await page.mouse.down();await page.dispatchEvent('body','pointercancel');await expect(page.locator('#sheet')).not.toHaveClass(/view-base/);await page.mouse.up();
 await page.locator('[data-tab="Identité"]').click();const story=page.locator('.story-scroll');await story.scrollIntoViewIfNeeded();await story.hover();const y=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,450);await expect.poll(()=>story.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);expect(await page.evaluate(()=>scrollY)).toBe(y);
 await page.locator('#sheet').screenshot({path:`test-results/story-${width}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
for(const width of [320,390,1280])test(`base comparison has no layout shift ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/hero-gym.html');
 for(const theme of ['dossier','bulletin']){
 await page.locator(`button[data-theme="${theme}"]`).click();
 await page.evaluate(()=>document.fonts.ready);
 const geometry=()=>page.locator('.attributes,.speed-strip,.tabs,.tab-content').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {top:r.top+scrollY,height:r.height};}));
 const before=await geometry();await page.locator('[data-base]').evaluate(el=>el.style.display='none');expect(await geometry()).toEqual(before);await page.locator('[data-base]').evaluate(el=>el.style.removeProperty('display'));
 await page.locator('[data-base]').focus();await page.keyboard.down('Space');expect(await geometry()).toEqual(before);await page.locator('.attributes-wrap').screenshot({path:`test-results/stable-base-${theme}-${width}.png`});await page.keyboard.up('Space');expect(await geometry()).toEqual(before);
 }
});
