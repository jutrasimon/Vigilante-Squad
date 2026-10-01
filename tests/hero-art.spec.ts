import {test,expect} from '@playwright/test';
import {heroRoster} from '../src/hero-roster';

test('twenty transparent heroes work in both art directions',async({page})=>{
 test.setTimeout(90_000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:390,height:900});await page.goto('/hero-gym.html');
 await expect(page.locator('#hero-select option')).toHaveCount(21);
 for(const hero of heroRoster.filter(h=>h.collection!=='reference')){
  await page.locator('#hero-select').selectOption(hero.id);
  await expect(page.locator('.identity h1')).toHaveText(hero.name.toLocaleUpperCase('fr-CA'));
  for(const theme of ['dossier','bulletin']){
   await page.locator(`button[data-theme="${theme}"]`).click();
   await expect(page.locator('#sheet')).toHaveAttribute('data-hero',hero.id);
   for(const view of ['portrait','silhouette']){
    await page.locator(`[data-art-view="${view}"]`).click();
    const image=page.locator('.portrait');
    await expect(image).toHaveAttribute('src',`./assets/heroes/brute-angulaire/${view==='portrait'?'portraits/':''}${hero.id}.png`);
    await image.evaluate(async el=>{await (el as HTMLImageElement).decode();});
    const alpha=await image.evaluate(el=>{
     const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
     const ctx=canvas.getContext('2d')!;ctx.drawImage(el as HTMLImageElement,0,0,32,32);
     const data=ctx.getImageData(0,0,32,32).data;let transparent=0,visible=0;
     for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;if(data[i]>128)visible++;}
     return {transparent,visible};
    });
    expect(alpha.transparent).toBeGreaterThan(15);expect(alpha.visible).toBeGreaterThan(40);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   }
  }
  await expect(page.locator('.hp .filled')).toHaveCount(6);
  await expect(page.locator('.tags .tag')).toHaveCount(3);
 }
 expect(errors).toEqual([]);
});

for(const width of [320,390,1280])test(`separate backgrounds and downloadable art ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/hero-gym.html');
 await page.locator('#hero-select').selectOption('nyx');
 const source=await page.locator('.portrait').getAttribute('src');
 let dossierBackground='';
 for(const theme of ['dossier','bulletin']){
  await page.locator(`button[data-theme="${theme}"]`).click();
  await page.locator('#hero-background').selectOption('theme');
  const background=await page.locator('.portrait-backdrop').evaluate(el=>getComputedStyle(el).backgroundImage);
  if(theme==='dossier')dossierBackground=background;else expect(background).not.toBe(dossierBackground);
  await expect(page.locator('.portrait')).toHaveAttribute('src',source!);
  await page.locator('.portrait').evaluate(async el=>{await (el as HTMLImageElement).decode();});
  await page.locator('#sheet').screenshot({path:`test-results/roster-${theme}-${width}.png`});
  await page.locator('#hero-background').selectOption('transparent');
  await expect(page.locator('.portrait-backdrop')).toHaveCSS('background-image',/repeating-conic-gradient/);
  await expect(page.locator('.portrait')).toHaveAttribute('src',source!);
  await page.locator('#hero-background').selectOption('plain');
  await expect(page.locator('.portrait-backdrop')).toHaveCSS('background-image','none');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
 await expect(page.getByRole('link',{name:'Portrait PNG',exact:true})).toHaveAttribute('download','nyx-portrait.png');
 await expect(page.getByRole('link',{name:'Silhouette PNG',exact:true})).toHaveAttribute('download','nyx.png');
 await page.locator('#hero-select').selectOption('malik');
 await expect(page.locator('[data-art-view="silhouette"]')).toBeDisabled();
 await expect(page.locator('.portrait')).toHaveAttribute('src','./assets/heroes/portrait-bulletin.webp');
});
