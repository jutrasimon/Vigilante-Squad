import {test,expect} from '@playwright/test';
for(const width of [320,390,1365])test(`roll gym ${width}`,async({page})=>{
 await page.setViewportSize({width,height:850});
 await page.goto('/roll-gym.html');
 await page.selectOption('#duration','1200');
 for(let variant=0;variant<4;variant++){
  await page.locator(`[data-variant="${variant}"]`).click();
  await page.selectOption('#scenario',variant%2?'84':'64');
  await page.locator('#roll').click();
  await expect(page.locator('#roll')).toBeDisabled();
  await expect(page.locator('.verdict')).toContainText(variant%2?'RÉSULTAT PARTIEL':'RÉUSSITE');
  await expect(page.locator('.hero-results .meter')).toHaveCount(4);
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
