import {test,expect} from '@playwright/test';
for(const theme of ['dossier','bulletin'])test(`current hero profile ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:900});await page.goto('/hero-gym.html');
 await page.locator(`button[data-theme="${theme}"]`).click();await page.getByText('Tester la fiche',{exact:true}).click();
 await page.locator('#test-hard').click();await page.locator('#test-mission').click();
 await expect(page.locator('.attributes b')).toHaveText(['4','2','6']);await expect(page.locator('.speed-strip')).toContainText('16');
 await page.locator('.tags .tag').filter({hasText:'Épuisé'}).click();await expect(page.getByRole('tooltip')).toContainText('récupération au QG');await page.keyboard.press('Escape');
 await page.locator('[data-base]').click();await expect(page.locator('.stat-breakdown').first()).toContainText('6 − 2 Épuisé');
 for(const [state,label] of [['scouting','Repérage'],['choice','À décider'],['working','En intervention'],['return','Retour au QG']]){
  await page.locator('#state').selectOption(state);await expect(page.locator('.hero-state')).toContainText(label);await expect(page.locator('.mission h2')).toHaveText(label);
 }
 await page.locator('#sheet').screenshot({path:`test-results/profile-current-${theme}.png`});
 await page.locator('#test-rest').click();await expect(page.locator('.attributes b')).toHaveText(['6','4','8']);await expect(page.locator('.tags')).not.toContainText('Épuisé');
 await page.locator('[data-tab="Objet"]').click();await page.locator('[data-object="medkit"]').click();await page.locator('[data-tab="Fiche"]').click();await expect(page.locator('.tags')).toContainText('Soins');
 await page.locator('[data-tab="Journal"]').click();await expect(page.locator('.journal-timeline')).toContainText('Épuisé');await expect(page.locator('.journal-timeline')).toContainText('Récupération au QG');await page.locator('#sheet').screenshot({path:`test-results/profile-journal-${theme}.png`});
 await page.locator('[data-tab="Identité"]').click();await page.locator('[data-story="story"]').fill('Histoire de test.');await page.reload();await page.locator('[data-tab="Identité"]').click();await expect(page.locator('[data-story="story"]')).toHaveValue('Histoire de test.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('temporary tags expire after the stated number of missions',async({page})=>{
 await page.goto('/hero-gym.html');await page.getByText('Attributs et TAGs',{exact:true}).click();await page.locator('#tag-name').fill('Encouragé');await page.locator('#tag-description').fill('Effet de démonstration');await page.locator('#tag-duration').fill('2');await page.getByRole('button',{name:'+ Ajouter le TAG',exact:true}).click();
 await page.getByText('Tester la fiche',{exact:true}).click();await page.locator('#test-mission').click();await expect(page.locator('.tags')).toContainText('1 mission');await page.locator('#test-mission').click();await expect(page.locator('.tags')).not.toContainText('Encouragé');
});
