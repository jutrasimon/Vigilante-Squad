import {test,expect} from '@playwright/test';
for(const width of [320,390,1280])test(`hero gym ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/hero-gym.html');
 for(const theme of ['dossier','bulletin']){
 await page.locator(`[data-theme="${theme}"]`).first().click();
 await expect(page.locator('#sheet')).toHaveAttribute('data-theme',theme);
 const portrait=await page.locator('.portrait').boundingBox();expect(Math.abs(portrait!.width-portrait!.height)).toBeLessThan(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await expect(page.locator('.hp .filled')).toHaveCount(6);await expect(page.locator('.mental .filled')).toHaveCount(8);
 await page.locator('[data-color="accent"]').fill('#33aacc');await expect(page.locator('#sheet')).toHaveCSS('--accent','#33aacc');
 await page.locator('[data-tab="Journal"]').click();await expect(page.locator('.future')).toContainText('contenu à définir');await page.locator('[data-tab="Fiche"]').click();
 await page.locator('[data-idle="patrol"]').click();await expect(page.locator('[data-idle="patrol"]')).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:`test-results/hero-${theme}-${width}.png`,fullPage:true});
 }
 await page.locator('summary').filter({hasText:'Tester la fiche'}).click();const before=await page.locator('.attributes').boundingBox();await page.locator('#bark').click();await expect(page.locator('#speech')).toBeVisible();expect((await page.locator('.attributes').boundingBox())!.y).toBe(before!.y);
 await page.locator('#view-mission').click();await expect(page).toHaveURL(/incident=gare/);await expect(page.locator('#intro')).not.toBeVisible();
});
