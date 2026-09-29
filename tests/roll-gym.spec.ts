import {test,expect} from '@playwright/test';
for(const width of [320,390,1365])test(`roll gym ${width}`,async({page})=>{
 await page.setViewportSize({width,height:850});
 await page.goto('/roll-gym.html');
 await expect(page.locator('.prep-ledger .equation')).toContainText('14');
 await page.screenshot({path:`test-results/gym-prep-${width}.png`,fullPage:true});
 await page.selectOption('#duration','1200');
 for(let variant=0;variant<4;variant++){
  await page.locator(`[data-variant="${variant}"]`).click();
  await page.selectOption('#scenario',variant%2?'84':'64');
  await page.locator('#roll').click();
  await expect(page.locator('#roll')).toBeDisabled();
  await expect(page.locator('.verdict')).toContainText(variant%2?'RÉSULTAT PARTIEL':'RÉUSSITE');
  await expect(page.locator('.hero-results .meter')).toHaveCount(4);
  await expect(page.locator('#stage')).toBeHidden();
  await expect(page.locator('#stage')).toHaveAttribute('data-value',variant%2?'84':'64');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  if(variant===0)await page.screenshot({path:`test-results/gym-${width}.png`,fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-variant="1"]').click();
 await page.selectOption('#scenario','random');
 await page.locator('#roll').click();
 await expect(page.locator('.verdict')).toBeVisible();
 const result=Number(await page.locator('.verdict b').textContent());
 expect(result).toBeGreaterThanOrEqual(1);expect(result).toBeLessThanOrEqual(100);
});

test('critical values and gym navigation',async({page})=>{
 await page.goto('/gyms.html');await page.getByRole('link',{name:/Tirages et conséquences/}).click();
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const v of [0,1,2,3])for(const result of ['1','100']){
  await page.locator(`[data-variant="${v}"]`).click();await page.selectOption('#scenario',result);await page.locator('#roll').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-value',result);
  await expect(page.locator('.verdict')).toContainText(result==='1'?'CRITIQUE POSITIF':'CRITIQUE NÉGATIF');
  if(v===1){await expect(page.locator('.grid .win')).toHaveCount(70);await expect(page.locator('.grid .lose')).toHaveCount(30);}
  if(v===2){await expect(page.locator('.counter span')).toHaveCount(2);await expect(page.locator('.counter')).toHaveText(result==='1'?'01':'00');}
 }
 await page.getByRole('link',{name:'Gyms',exact:true}).click();await page.getByRole('link',{name:/Quartier/}).click();await expect(page.locator('#intro .gym-link')).toBeVisible();
});
