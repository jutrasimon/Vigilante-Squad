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
 await page.locator('[data-tab="Journal"]').click();await expect(page.locator('.future')).toContainText('contenu à définir');await page.locator('[data-tab="Fiche"]').click();
 await page.locator('[data-idle="patrol"]').click();await expect(page.locator('[data-idle="patrol"]')).toHaveAttribute('aria-pressed','true');
 await page.getByText('Couleurs et matière',{exact:true}).click();
 await page.screenshot({path:`test-results/hero-${theme}-${width}.png`,fullPage:true});
 }
 await page.getByText('Attributs et TAGs',{exact:true}).click();
 await page.locator('[data-stat="0"]').fill('12');await page.locator('[data-stat="0"]').press('Tab');await expect(page.locator('.attributes')).toContainText('12');
 await page.locator('#tag-name').fill('Sang-froid');await page.locator('#tag-description').fill('Reste calme sous pression.');await page.getByRole('button',{name:'+ Ajouter le TAG',exact:true}).click();
 await page.getByText('Attributs et TAGs',{exact:true}).click();
 const tag=page.locator('.tag').filter({hasText:'Sang-froid'});await tag.click();await expect(page.getByRole('tooltip')).toContainText('Reste calme sous pression.');await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
 const ring=await page.locator('.countdown').boundingBox(),value=await page.locator('.countdown-value').boundingBox();expect(Math.abs((ring!.x+ring!.width/2)-(value!.x+value!.width/2))).toBeLessThan(2);
 await page.locator('summary').filter({hasText:'Tester la fiche'}).click();const before=await page.locator('.attributes').boundingBox();await page.locator('#bark').click();await expect(page.locator('#speech')).toBeVisible();expect((await page.locator('.attributes').boundingBox())!.y).toBe(before!.y);
 await page.locator('#view-mission').click();await expect(page).toHaveURL(/incident=gare/);await expect(page.locator('#intro')).not.toBeVisible();
});
