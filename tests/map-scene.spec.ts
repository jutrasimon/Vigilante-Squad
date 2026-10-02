import {test,expect,type Page} from '@playwright/test';
test.use({launchOptions:{executablePath:process.env.CHROMIUM_PATH,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}});
const saved=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('vigilante-map-gym-v1')!));
async function input(page:Page,selector:string,value:string){await page.locator(selector).evaluate((node,v)=>{(node as HTMLInputElement).value=v;node.dispatchEvent(new Event('input',{bubbles:true}));},value);}
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{if(window!==top||localStorage.getItem('vigilante-map-gym-v1'))return;localStorage.setItem('vigilante-map-gym-v1',JSON.stringify({version:1,theme:{pitch:53,bearing:-94,threeD:true},points:[],overrides:{},camera:{center:[-73.579,45.519],zoom:15,pitch:53,bearing:-94,locked:true}}));});
 await page.route('https://tiles.openfreemap.org/styles/liberty',r=>r.fulfill({json:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#17252d'}}]}}));
});
for(const width of [390,1280])test(`Map tokens, floating Hero Gym and pencil JSON roundtrip at ${width}px`,async({page})=>{
 test.setTimeout(60_000);
 await page.setViewportSize({width,height:900});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');if(width<760)await page.locator('#atelier').click();
 await page.locator('#map-hero').selectOption('nyx');await page.locator('#add-agent').click();await expect(page.locator('.agent-token')).toHaveCount(1);
 if(width<760)await page.locator('#close').click();await expect(page.locator('#hero-window')).toBeVisible();
 const sheet=page.frameLocator('#hero-frame');await expect(sheet.locator('.identity h1')).toHaveText('NYX');await expect(sheet.locator('.tools')).toBeHidden();
 const before=(await page.locator('#hero-window').boundingBox())!;await page.locator('#hero-window-smaller').click();const small=(await page.locator('#hero-window').boundingBox())!;expect(small.width).toBeLessThan(before.width);expect(small.width/small.height).toBeCloseTo(before.width/before.height,2);
 const drag=(await page.locator('#hero-window-drag').boundingBox())!;await page.mouse.move(drag.x+35,drag.y+12);await page.mouse.down();await page.mouse.move(drag.x+55,drag.y+35,{steps:8});await page.mouse.up();const after=(await page.locator('#hero-window').boundingBox())!;expect(after.x).toBeGreaterThan(before.x);
 await page.locator('#hero-window-close').click();await expect(page.locator('#hero-window')).toBeHidden();
 if(width<760)await page.locator('#atelier').click();await page.locator('#add-vehicle').click();await expect(page.locator('.vehicle-token')).toHaveCount(1);await input(page,'#vehicle-heading','85');expect((await saved(page)).scene.vehicles[0].heading).toBe(85);
 await page.getByText('Direction artistique',{exact:true}).click();for(const [key,value] of Object.entries({light:'0.7',azimuth:'125',contrast:'1.25',saturation:'0.65',glow:'0.8',zoneOpacity:'0.23',lightColor:'#ffccaa'}))await input(page,`[data-effect=${key}]`,value);await page.locator('[data-effect=pulse]').check();await page.locator('[data-effect=shadows]').uncheck();await input(page,'[data-agent-color]','#ee77aa');await input(page,'#zone-color','#55dd88');
 await page.locator('#zone-name').fill('Gare Est');await page.locator('#draw-zone').click();if(width<760)await page.locator('#close').click();
 const viewport=(await page.locator('.viewport').boundingBox())!,cx=viewport.x+viewport.width*.5,cy=viewport.y+viewport.height*.55,rx=Math.min(120,viewport.width*.3),ry=85;
 await page.mouse.move(cx+rx,cy);await page.mouse.down();for(let i=1;i<=32;i++){const a=i/32*Math.PI*2;await page.mouse.move(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry);}await page.mouse.up();
 await expect(page.locator('.zone-label')).toHaveText('Gare Est');
 const agent=(await saved(page)).scene.agents[0];await page.locator('#zone-agent').selectOption(agent.id);let state=await saved(page);expect(state.scene.agents[0].zone).toBe(state.scene.zones[0].id);expect(state.scene.agents[0].order).toBe('watch');expect(state.scene.zones[0].ring[0]).toEqual(state.scene.zones[0].ring.at(-1));
 if(width<760)await page.locator('#atelier').click();await page.getByText('Lieu & caméra',{exact:true}).click();await page.locator('[data-pan-bound=left]').click();expect((await saved(page)).camera.movement.pan.left).toBe(0);
 await page.getByText('Sauvegarde & export',{exact:true}).click();const pending=page.waitForEvent('download');await page.locator('#export').click();const download=await pending,stream=await download.createReadStream(),chunks:Buffer[]=[];for await(const c of stream!)chunks.push(c);const exported=JSON.parse(Buffer.concat(chunks).toString());expect(exported.scene).toEqual((await saved(page)).scene);
 await page.locator('#import').setInputFiles({name:'scene.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await expect(page.locator('#status')).toHaveText('Atelier importé.');expect((await saved(page)).scene).toEqual(exported.scene);expect((await saved(page)).camera.movement).toEqual(exported.camera.movement);
 const malformed=structuredClone(exported);malformed.scene.zones[0].ring[0][0]='bad';await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(malformed))});await expect(page.locator('#status')).toContainText('Import refusé');expect((await saved(page)).scene).toEqual(exported.scene);
 await page.reload();await expect(page.locator('#add-agent')).toBeEnabled();await expect(page.locator('.agent-token')).toHaveCount(1);await expect(page.locator('.vehicle-token')).toHaveCount(1);await expect(page.locator('.zone-label')).toHaveText('Gare Est');
 await page.locator('.agent-token').click();await expect(page.locator('#hero-window')).toBeVisible();await expect(sheet.locator('.identity h1')).toHaveText('NYX');await expect(sheet.locator('.hero-state strong')).toHaveText('Surveillance');
 if(width<760)await page.locator('#atelier').click();await page.locator('#zone-list [data-zone]').click();if(width<760)await page.locator('#close').click();await expect(sheet.locator('.hero-state strong')).toHaveText('Surveillance');
 await page.locator('#remove-zone').click();expect((await saved(page)).scene.agents[0].order).toBe('ready');expect((await saved(page)).scene.zones).toHaveLength(0);
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`test-results/map-scene-${width}.png`});
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

test('Shared surveillance activity, independent card height, movement and ground anchor survive zoom',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');
 await page.locator('#add-agent').click();const frame=page.frameLocator('#hero-frame');await expect(frame.locator('[data-idle=rest]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.token-order .icon-tabler-home')).toHaveCount(1);
 const initial=(await page.locator('#hero-window').boundingBox())!,handle=(await page.locator('#hero-window-resize').boundingBox())!;
 await page.mouse.move(handle.x+15,handle.y+15);await page.mouse.down();await page.mouse.move(handle.x+15,handle.y-155,{steps:8});await page.mouse.up();const resized=(await page.locator('#hero-window').boundingBox())!;expect(resized.width).toBeCloseTo(initial.width,0);expect(resized.height).toBeLessThan(initial.height-100);
 await frame.locator('[data-idle=watch]').click();await expect(frame.locator('.hero-state strong')).toHaveText('Surveillance');await expect.poll(async()=>(await saved(page)).scene.agents[0].order).toBe('watch');await expect(page.locator('.token-order .icon-tabler-eye')).toHaveCount(1);
 await page.locator('#hero-window-close').click();await page.locator('#center').click();await page.locator('#unselect').click();await page.getByText('Lieu & caméra',{exact:true}).click();
 for(const zoom of ['15','17','14']){await input(page,'#camera-zoom',zoom);const pin=(await page.locator('.poi-symbol').boundingBox())!,base=(await page.locator('.token-ground').boundingBox())!;expect(Math.abs(base.x+base.width/2-pin.x-pin.width/2)).toBeLessThan(2);expect(Math.abs(base.y+base.height/2-pin.y-pin.height/2)).toBeLessThan(2);}
 await page.locator('[data-agent]').click();await page.locator('#hero-center').click();await expect(page.locator('#hero-window')).toBeVisible();
 await frame.locator('#hero-move').click();const before=(await saved(page)).scene.agents[0].position;const box=(await page.locator('.viewport').boundingBox())!;await page.mouse.click(box.x+box.width*.85,box.y+box.height*.85);await expect(page.locator('#status')).toContainText('Aucun trajet routier');expect((await saved(page)).scene.agents[0].position).toEqual(before);

 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');await page.locator('[data-agent]').click();expect((await saved(page)).scene.window.height).toBeCloseTo(resized.height,0);
});

 test('Hero halo stays independent of activity and selection is restored by full JSON',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');await page.locator('#add-agent').click();const token=page.locator('.agent-token'),sheet=page.frameLocator('#hero-frame');
 await expect(token).toHaveClass(/is-selected/);await expect(token).toHaveCSS('--point','#78dcde');await expect(token.locator('.token-portrait')).toHaveCSS('border-top-width','3px');
 await sheet.locator('[data-idle=watch]').click();await expect.poll(async()=>(await saved(page)).scene.agents[0].order).toBe('watch');await expect(token).toHaveCSS('--point','#78dcde');
 await input(page,'[data-agent-color]','#ff77bb');await expect(token).toHaveCSS('--point','#ff77bb');await page.locator('#hero-window-close').click();await expect(token).not.toHaveClass(/is-selected/);await expect(token.locator('.token-portrait')).toHaveCSS('border-top-width','2px');await token.click();
 await page.getByText('Sauvegarde & export',{exact:true}).click();const pending=page.waitForEvent('download');await page.locator('#export').click();const dl=await pending,stream=await dl.createReadStream(),chunks:Buffer[]=[];for await(const c of stream!)chunks.push(c);const exported=JSON.parse(Buffer.concat(chunks).toString());expect(exported.scene.agents[0].color).toBe('#ff77bb');expect(exported.scene.window.open).toBe(true);
 await input(page,'[data-agent-color]','#111111');await page.locator('#import').setInputFiles({name:'complete.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await expect(page.locator('#status')).toHaveText('Atelier importé.');await expect(token).toHaveCSS('--point','#ff77bb');await expect(token).toHaveClass(/is-selected/);expect((await saved(page)).scene).toEqual(exported.scene);
 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');await expect(token).toHaveCSS('--point','#ff77bb');await expect(token).toHaveClass(/is-selected/);
 // Old exports have no individual halo colour and must still restore the original blue.
 delete exported.scene.agents[0].color;await page.getByText('Sauvegarde & export',{exact:true}).click();await page.locator('#import').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await expect(page.locator('#status')).toHaveText('Atelier importé.');await expect(token).toHaveCSS('--point','#78dcde');
 });
