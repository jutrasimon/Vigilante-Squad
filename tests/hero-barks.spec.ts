import {test,expect} from '@playwright/test';
for(const width of [320,390,1280])test(`biseau resizing and palette ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/hero-gym.html');
 await page.getByText('Tester la fiche',{exact:true}).click();await page.locator('#bark-pin').check();
 await page.locator('#bark-copy').fill('On y va.');await page.locator('#bark').click();
 const bubble=page.locator('#speech');await expect(bubble).toBeVisible();
 for(const theme of ['dossier','bulletin']){
  await page.locator(`button[data-theme="${theme}"]`).click();
  for(const text of ['On y va.','Dis-moi qu’on a un plan. Un vrai, cette fois.','Wir warten auf die anderen. Diesmal gehen wir gemeinsam hinein.','みんなを待とう。今度は一緒に行こう。']){
   await page.locator('#bark-copy').fill(text);await expect(bubble).toHaveText(text);await page.waitForTimeout(250);
   const bounds=await bubble.evaluate(el=>{const b=el.getBoundingClientRect(),t=el.querySelector('strong')!,r=t.getBoundingClientRect(),m=document.querySelector('.hero-state')!.getBoundingClientRect();return {overflow:t.scrollWidth>t.clientWidth+1,inside:r.top>=b.top&&r.bottom<=b.bottom,clear:b.bottom<=m.top,viewport:document.documentElement.scrollWidth<=innerWidth,path:el.querySelector('.bark-body')!.getAttribute('d')};});
   expect(bounds).toMatchObject({overflow:false,inside:true,clear:true,viewport:true});expect(bounds.path).toBeTruthy();
  }
 }
 await page.getByText('Couleurs et matière',{exact:true}).click();
 for(const [key,color] of [['bark-fill','#223344'],['bark-text','#ffeecc'],['bark-border','#44aa88'],['bark-shadow','#aa3344']]){
  await page.locator(`[data-color="${key}"]`).fill(color);await expect(page.locator('#sheet')).toHaveCSS(`--${key}`,color);
 }
 await expect(page.locator('.bark-body')).toHaveCSS('fill','rgb(34, 51, 68)');await expect(bubble).toHaveCSS('color','rgb(255, 238, 204)');
 await page.locator('#reset-colors').click();await expect(page.locator('.bark-body')).toHaveCSS('fill','rgb(255, 242, 214)');
 await page.locator('#bark-copy').fill('Dis-moi qu’on a un plan. Un vrai, cette fois.');
 await page.locator('#hero-select').selectOption('nyx');await page.locator('#bark').click();await page.waitForTimeout(250);
 await page.locator('.identity').screenshot({path:`test-results/biseau-${width}.png`});
 await page.locator('#bark-pin').uncheck();await expect(bubble).toBeHidden({timeout:10000});await expect(page.locator('.identity h1')).toBeVisible();
});
