import {test,expect,type Page} from '@playwright/test';
test.use({launchOptions:{args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}});
const saved=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('vigilante-map-gym-v1')!));
async function input(page:Page,selector:string,value:string){await page.locator(selector).evaluate((node,v)=>{(node as HTMLInputElement).value=v;node.dispatchEvent(new Event('input',{bubbles:true}));},value);}
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{if(window!==top||localStorage.getItem('vigilante-map-gym-v1'))return;localStorage.setItem('vigilante-map-gym-v1',JSON.stringify({version:1,theme:{pitch:53,bearing:-94,threeD:true},points:[],overrides:{},camera:{center:[-73.579,45.519],zoom:15,pitch:53,bearing:-94,locked:true}}));});
 await page.route('https://tiles.openfreemap.org/styles/liberty',r=>r.fulfill({json:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#17252d'}}]}}));
});
for(const width of [390,1280])test(`Map tokens, floating Hero Gym and pencil JSON roundtrip at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');if(width<760)await page.locator('#atelier').click();
 await page.locator('#map-hero').selectOption('nyx');await page.locator('#add-agent').click();await expect(page.locator('.agent-token')).toHaveCount(1);
 if(width<760)await page.locator('#close').click();await expect(page.locator('#hero-window')).toBeVisible();
 const sheet=page.frameLocator('#hero-frame');await expect(sheet.locator('.identity h1')).toHaveText('NYX');await expect(sheet.locator('.tools')).toBeHidden();
 const before=(await page.locator('#hero-window').boundingBox())!;await page.locator('#hero-window-smaller').click();const small=(await page.locator('#hero-window').boundingBox())!;expect(small.width).toBeLessThan(before.width);expect(small.width/small.height).toBeCloseTo(before.width/before.height,2);
 const drag=(await page.locator('#hero-window-drag').boundingBox())!;await page.mouse.move(drag.x+35,drag.y+12);await page.mouse.down();await page.mouse.move(drag.x+55,drag.y+35,{steps:8});await page.mouse.up();const after=(await page.locator('#hero-window').boundingBox())!;expect(after.x).toBeGreaterThan(before.x);
 await page.locator('#hero-window-close').click();await expect(page.locator('#hero-window')).toBeHidden();
 if(width<760)await page.locator('#atelier').click();await page.locator('#add-vehicle').click();await expect(page.locator('.vehicle-token')).toHaveCount(1);await input(page,'#vehicle-heading','85');expect((await saved(page)).scene.vehicles[0].heading).toBe(85);
 await page.getByText('Direction artistique',{exact:true}).click();await input(page,'[data-effect=glow]','0.8');await page.locator('[data-effect=pulse]').check();
 await page.locator('#zone-name').fill('Gare Est');await page.locator('#draw-zone').click();if(width<760)await page.locator('#close').click();
 const viewport=(await page.locator('.viewport').boundingBox())!,cx=viewport.x+viewport.width*.5,cy=viewport.y+viewport.height*.55,rx=Math.min(120,viewport.width*.3),ry=85;
 await page.mouse.move(cx+rx,cy);await page.mouse.down();for(let i=1;i<=32;i++){const a=i/32*Math.PI*2;await page.mouse.move(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry);}await page.mouse.up();
 await expect(page.locator('.zone-label')).toHaveText('Gare Est');if(width<760)await page.locator('#atelier').click();
 const agent=(await saved(page)).scene.agents[0];await page.locator('#zone-agent').selectOption(agent.id);await page.locator('#zone-order').selectOption('patrol');let state=await saved(page);expect(state.scene.agents[0].zone).toBe(state.scene.zones[0].id);expect(state.scene.agents[0].order).toBe('patrol');expect(state.scene.zones[0].ring[0]).toEqual(state.scene.zones[0].ring.at(-1));
 await page.getByText('Lieu & caméra',{exact:true}).click();await page.locator('[data-pan-bound=left]').click();expect((await saved(page)).camera.movement.pan.left).toBe(0);
 await page.getByText('Sauvegarde & export',{exact:true}).click();const pending=page.waitForEvent('download');await page.locator('#export').click();const download=await pending,stream=await download.createReadStream(),chunks:Buffer[]=[];for await(const c of stream!)chunks.push(c);const exported=JSON.parse(Buffer.concat(chunks).toString());expect(exported.scene).toEqual((await saved(page)).scene);
 await page.locator('#import').setInputFiles({name:'scene.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await expect(page.locator('#status')).toHaveText('Atelier importé.');expect((await saved(page)).scene).toEqual(exported.scene);expect((await saved(page)).camera.movement).toEqual(exported.camera.movement);
 const malformed=structuredClone(exported);malformed.scene.zones[0].ring[0][0]='bad';await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(malformed))});await expect(page.locator('#status')).toContainText('Import refusé');expect((await saved(page)).scene).toEqual(exported.scene);
 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');await expect(page.locator('.agent-token')).toHaveCount(1);await expect(page.locator('.vehicle-token')).toHaveCount(1);await expect(page.locator('.zone-label')).toHaveText('Gare Est');
 await page.locator('.agent-token').click();await expect(page.locator('#hero-window')).toBeVisible();await expect(sheet.locator('.identity h1')).toHaveText('NYX');await expect(sheet.locator('.hero-state strong')).toHaveText('Patrouille');
 if(width<760)await page.locator('#atelier').click();await page.locator('#zone-list [data-zone]').click();await page.locator('#zone-order').selectOption('watch');await expect(sheet.locator('.hero-state strong')).toHaveText('Surveillance');
 await page.locator('#remove-zone').click();expect((await saved(page)).scene.agents[0].order).toBe('ready');expect((await saved(page)).scene.zones).toHaveLength(0);
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();if(width<760)await page.locator('#close').click();await page.screenshot({path:`test-results/map-scene-${width}.png`});
});
test('Far zoom fixes camera position, near zoom explores the frame and side locks persist',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');await page.getByText('Lieu & caméra',{exact:true}).click();await page.locator('#zoom-lock-min').click();
 const original=(await saved(page)).camera,canvas=page.locator('.maplibregl-canvas');await canvas.focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(400);expect((await saved(page)).camera.center).toEqual(original.center);
 const box=(await canvas.boundingBox())!;await page.mouse.move(box.x+box.width*.55,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.6,{steps:8});await page.mouse.up();expect((await saved(page)).camera.center).toEqual(original.center);
 await input(page,'#camera-zoom','17');await canvas.focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(400);expect((await saved(page)).camera.center).not.toEqual(original.center);
 await input(page,'#camera-zoom','15');expect((await saved(page)).camera.center[0]).toBeCloseTo(original.center[0],10);expect((await saved(page)).camera.center[1]).toBeCloseTo(original.center[1],10);
 await page.locator('#zoom-lock-min').click();expect((await saved(page)).camera.movement.frame).toBeUndefined();
 await input(page,'#camera-zoom','16');await page.locator('#pan-frame').click();expect((await saved(page)).camera.zoomBounds.min).toBe(16);expect((await saved(page)).camera.movement.frame.zoom).toBe(16);await page.locator('#pan-clear-frame').click();expect((await saved(page)).camera.zoomBounds.min).toBeUndefined();
 await page.locator('[data-pan-bound=left]').click();await page.locator('[data-pan-bound=right]').click();await page.locator('[data-pan-bound=top]').click();await page.locator('[data-pan-bound=bottom]').click();const locked=(await saved(page)).camera;await canvas.focus();await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowRight');await page.waitForTimeout(400);for(let i=0;i<2;i++)expect((await saved(page)).camera.center[i]).toBeCloseTo(locked.center[i],10);
 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');await page.getByText('Lieu & caméra',{exact:true}).click();for(const key of ['left','right','top','bottom'])await expect(page.locator(`[data-pan-bound=${key}]`)).toHaveAttribute('aria-pressed','true');
});
