import {test,expect} from '@playwright/test';
test.use({launchOptions:{args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}});
for(const width of [320,390,1280])test(`Map workshop and points at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://tiles.openfreemap.org/styles/liberty',route=>route.fulfill({json:{version:8,sources:{terrain:{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[-73.582,45.517],[-73.576,45.517],[-73.576,45.521],[-73.582,45.521],[-73.582,45.517]]]}}]}}},layers:[{id:'background',type:'background',paint:{'background-color':'#ffffff'}},{id:'land',type:'fill',source:'terrain',paint:{'fill-color':'#ffffff'}}]}}));
 await page.goto('/map-gym.html');
 await expect(page.locator('#status')).toContainText('Carte prête');
 await page.locator('#center').click();
 await expect(page.locator('.poi')).toHaveCount(1);
 await page.locator('#edit-name').fill('QG de test');await page.locator('#edit-name').blur();
 await expect(page.locator('.poi-name')).toHaveText('QG de test');
 if(width<760)await page.locator('#atelier').click();
 await page.getByText('Direction artistique',{exact:true}).click();
 await page.locator('[data-preset=bulletin]').click();
 await expect(page.locator('[data-theme=land]')).toHaveValue('#c9c1ac');
 await expect(page.locator('.category-row')).toHaveCount(2);
 await expect(page.locator('#advanced-layers')).not.toHaveAttribute('open');
 await page.locator('#advanced-layers summary').click();
 await expect(page.locator('#layer-list .layer-row')).toHaveCount(2);
 await expect(page.locator('#layer')).toHaveCount(0);
 const land=page.locator('[data-layer="land"]'),background=page.locator('[data-layer="background"]');
 await expect(land.locator('[data-layer-key=color]')).toHaveValue('#c9c1ac');
 await background.locator('[data-layer-key=visible]').uncheck();
 await expect(background).toHaveClass(/is-hidden/);
 await land.locator('[data-layer-key=opacity]').focus();await page.keyboard.press('Home');
 await page.keyboard.press('ArrowRight');
 await expect(land.locator('output')).toHaveText('1 %');
 await page.locator('#layer-search').fill('BATIMENTS');await expect(page.locator('#layer-empty')).toBeVisible();
 await page.locator('#layer-search').fill('terrain');await expect(land).toBeVisible();await expect(background).toBeHidden();
 await page.locator('#layer-search').fill('');
 await background.locator('[data-layer-reset]').click();await expect(background.locator('[data-layer-key=visible]')).toBeChecked();
 await page.locator('#point-type').selectOption('clue');
 if(width<760)await page.locator('#close').click();
 await page.locator('#center').click();await expect(page.locator('.poi')).toHaveCount(2);
 await page.locator('#edit-type').selectOption('police');
 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');await expect(page.locator('.poi')).toHaveCount(2);
 await page.locator('.poi').last().click();await page.locator('#delete-point').click();await expect(page.locator('.poi')).toHaveCount(1);
 if(width<760)await page.locator('#atelier').click();
 await expect(page.locator('[data-layer=land] [data-layer-key=opacity]')).toHaveValue('0.01');
 await page.getByText('Direction artistique',{exact:true}).click();
 await page.locator('[data-preset=dossier]').click();
 await expect(page.locator('[data-layer=land] [data-layer-key=opacity]')).toHaveValue('1');
 await expect(page.locator('[data-layer=land] [data-layer-key=color]')).toHaveValue('#17252d');
 await page.getByText('Sauvegarde & export',{exact:true}).click();
 const download=page.waitForEvent('download');await page.locator('#export').click();expect((await download).suggestedFilename()).toBe('vigilante-map-atelier.json');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
});
test('Live OpenFreeMap style and geographic tiles',async({page})=>{
 await page.setViewportSize({width:1280,height:844});
 await page.goto('/map-gym.html');
 await expect(page.locator('#status')).toContainText('Carte prête',{timeout:30000});
 await expect(page.locator('.maplibregl-canvas')).toBeVisible();
 await page.locator('#center').click();await expect(page.locator('.poi')).toHaveCount(1);
 await page.getByText('Sauvegarde & export',{exact:true}).click();
 const styleDownload=page.waitForEvent('download');await page.locator('#style-export').click();const downloaded=await styleDownload;const stream=await downloaded.createReadStream();const parts:Buffer[]=[];for await(const part of stream!)parts.push(part);const style=JSON.parse(Buffer.concat(parts).toString());
 const supplierPlaces=style.layers.filter((l:any)=>l['source-layer']==='poi');expect(supplierPlaces.length).toBeGreaterThan(0);for(const l of supplierPlaces)expect(l.layout.visibility).toBe('none');
 const shields=style.layers.filter((l:any)=>/road.*shield/.test(l.id));expect(shields.length).toBeGreaterThan(0);for(const l of shields)expect(l.layout.visibility).toBe('none');
 for(const l of style.layers.filter((l:any)=>l.type==='line'&&l['source-layer']==='transportation'&&!/rail/.test(l.id)))expect(l.paint['line-dasharray']).toBeFalsy();
 const volumes=style.layers.filter((l:any)=>l.type==='fill-extrusion'&&/building/.test(l.id));expect(volumes.length).toBeGreaterThan(0);for(const l of volumes)expect(l.paint['fill-extrusion-color']).toBe('#34434b');
 await page.screenshot({path:'test-results/map-real-dossier.png'});
 await page.getByText('Direction artistique',{exact:true}).click();
 await page.locator('[data-preset=bulletin]').click();
 await page.waitForTimeout(800);
 await page.screenshot({path:'test-results/map-real-bulletin.png'});
});

for(const width of [390,1280])test(`Map categories hide commerces independently at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 await page.route('https://tiles.openfreemap.org/styles/liberty',r=>r.fulfill({json:{version:8,sources:{terrain:{type:'geojson',data:{type:'FeatureCollection',features:[]}}},layers:[
 {id:'background',type:'background'},
 {id:'land',type:'fill',source:'terrain'},
 {id:'place-city',type:'symbol',source:'terrain'},
 {id:'road-label',type:'symbol',source:'terrain'},
 {id:'poi-shop',type:'symbol',source:'terrain'},
 {id:'poi-cafe',type:'symbol',source:'terrain'}
 ]}}));
 await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');
 await page.locator('#center').click();
 if(width<760)await page.locator('#atelier').click();
 await expect(page.locator('.category-row')).toHaveCount(4);
 await expect(page.locator('#advanced-layers')).not.toHaveAttribute('open');
 const places=page.locator('[data-category=places] [data-category-key=visible]');
 await expect(places).not.toBeChecked();
 await page.getByText('Sauvegarde & export',{exact:true}).click();
 async function exportedStyle(){
 const pending=page.waitForEvent('download');await page.locator('#style-export').click();const stream=await(await pending).createReadStream();const parts:Buffer[]=[];for await(const part of stream!)parts.push(part);return JSON.parse(Buffer.concat(parts).toString());
 }
 let style=await exportedStyle();
 for(const l of style.layers)expect(l.layout.visibility).toBe(l.id.startsWith('poi-')?'none':'visible');
 await places.check();
 await page.locator('#advanced-layers summary').click();
 // An advanced exception must not prevent the next bulk hide action.
 await page.locator('[data-layer=poi-shop] [data-layer-key=visible]').uncheck();
 await places.check();await places.uncheck();
 style=await exportedStyle();for(const l of style.layers.filter((l:any)=>l.id.startsWith('poi-')))expect(l.layout.visibility).toBe('none');
 await expect(page.locator('.poi')).toHaveCount(1);
 await places.check();await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');
 if(width<760)await page.locator('#atelier').click();await expect(places).toBeChecked();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

for(const width of [390,1280])test(`Map road cleanup at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://tiles.openfreemap.org/styles/liberty',r=>r.fulfill({json:{version:8,sources:{terrain:{type:'geojson',data:{type:'FeatureCollection',features:[]}}},layers:[
 {id:'background',type:'background'},
 {id:'road_path_pedestrian',type:'line',source:'terrain',paint:{'line-dasharray':[1,1.5]}},
 {id:'rail',type:'line',source:'terrain',paint:{'line-dasharray':[2,2]}},
 {id:'road_label',type:'symbol',source:'terrain'},
 {id:'road_shield',type:'symbol',source:'terrain'},
 {id:'road_shield_us',type:'symbol',source:'terrain'}
 ]}}));
 await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');
 if(width<760)await page.locator('#atelier').click();
 await expect(page.locator('[data-theme=solidRoads]')).toBeChecked();await expect(page.locator('[data-theme=roadNumbers]')).not.toBeChecked();
 await expect(page.locator('[data-category=labels] [data-category-key=visible]')).toBeChecked();
 await page.getByText('Sauvegarde & export',{exact:true}).click();
 async function exportedStyle(){const p=page.waitForEvent('download');await page.locator('#style-export').click();const stream=await(await p).createReadStream();const parts:Buffer[]=[];for await(const part of stream!)parts.push(part);return JSON.parse(Buffer.concat(parts).toString());}
 let style=await exportedStyle();
 expect(style.layers.find((l:any)=>l.id==='road_path_pedestrian').paint['line-dasharray']).toBeFalsy();
 expect(style.layers.find((l:any)=>l.id==='rail').paint['line-dasharray']).toEqual([2,2]);
 for(const l of style.layers.filter((l:any)=>/shield/.test(l.id)))expect(l.layout.visibility).toBe('none');
 expect(style.layers.find((l:any)=>l.id==='road_label').layout.visibility).toBe('visible');
 await page.locator('[data-theme=solidRoads]').uncheck();await page.locator('[data-theme=roadNumbers]').check();
 style=await exportedStyle();expect(style.layers.find((l:any)=>l.id==='road_path_pedestrian').paint['line-dasharray']).toEqual([1,1.5]);
 for(const l of style.layers.filter((l:any)=>/shield/.test(l.id)))expect(l.layout.visibility).toBe('visible');
 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');
 if(width<760)await page.locator('#atelier').click();await expect(page.locator('[data-theme=solidRoads]')).not.toBeChecked();await expect(page.locator('[data-theme=roadNumbers]')).toBeChecked();
 // Older atelier exports without these new controls still load with clean defaults.
 await page.getByText('Sauvegarde & export',{exact:true}).click();const pending=page.waitForEvent('download');await page.locator('#export').click();const stream=await(await pending).createReadStream();const parts:Buffer[]=[];for await(const part of stream!)parts.push(part);const old=JSON.parse(Buffer.concat(parts).toString());delete old.theme.solidRoads;delete old.theme.roadNumbers;
 await page.locator('#import').setInputFiles({name:'old-atelier.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});await expect(page.locator('#status')).toHaveText('Atelier importé.');
 await expect(page.locator('[data-theme=solidRoads]')).toBeChecked();await expect(page.locator('[data-theme=roadNumbers]')).not.toBeChecked();expect(errors).toEqual([]);
});

for(const width of [390,1280])test(`Game camera pans only at ${width}px`,async({page,context})=>{
 await page.setViewportSize({width,height:844});
 await page.route('https://tiles.openfreemap.org/styles/liberty',r=>r.fulfill({json:{version:8,sources:{},layers:[{id:'background',type:'background'}]}}));
 await page.goto('/map-gym.html');await expect(page.locator('#status')).toContainText('Carte prête');
 await page.locator('#camera-game').click();await expect(page.locator('#map')).toHaveAttribute('data-camera-mode','game');
 if(width<760)await page.locator('#atelier').click();await page.getByText('Sauvegarde & export',{exact:true}).click();
 async function camera(){const p=page.waitForEvent('download');await page.locator('#export').click();const stream=await(await p).createReadStream();const chunks:Buffer[]=[];for await(const c of stream!)chunks.push(c);return JSON.parse(Buffer.concat(chunks).toString()).camera;}
 const initial=await camera();expect(initial.mode).toBe('game');expect(initial.pitch).toBe(45);expect(initial.bearing).toBe(45);
 if(width<760)await page.locator('#close').click();
 const canvas=page.locator('.maplibregl-canvas'),box=(await canvas.boundingBox())!;
 const x=box.x+box.width*.5,y=box.y+box.height*.55;
 await page.mouse.move(x,y);await page.mouse.wheel(0,-800);await page.mouse.dblclick(x,y);
 await page.mouse.move(x,y);await page.mouse.down({button:'right'});await page.mouse.move(x+50,y+30,{steps:8});await page.mouse.up({button:'right'});
 await canvas.focus();await page.keyboard.press('Shift+ArrowLeft');await page.keyboard.press('+');await page.waitForTimeout(250);
 if(width<760)await page.locator('#atelier').click();let pose=await camera();expect(pose.pitch).toBe(45);expect(pose.bearing).toBe(45);expect(pose.zoom).toBe(initial.zoom);expect(pose.center).not.toEqual(initial.center);
 if(width<760)await page.locator('#close').click();
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+80,y+40,{steps:8});await page.mouse.up();await page.waitForTimeout(500);
 if(width<760)await page.locator('#atelier').click();const panned=await camera();expect(panned.center).not.toEqual(pose.center);expect(panned.zoom).toBe(initial.zoom);expect(panned.bearing).toBe(45);
 if(width<760)await page.locator('#close').click();
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*6,y:y+i*3,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);
 if(width<760)await page.locator('#atelier').click();const fingerPan=await camera();expect(fingerPan.center).not.toEqual(panned.center);expect(fingerPan.pitch).toBe(45);expect(fingerPan.zoom).toBe(initial.zoom);if(width<760)await page.locator('#close').click();
 const points=(spread:number,dy=0)=>[{x:x-spread,y:y+dy,id:1},{x:x+spread,y:y+dy,id:2}];
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(20)});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(20+i*5,i*3)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);
 if(width<760)await page.locator('#atelier').click();pose=await camera();expect(pose.zoom).toBe(initial.zoom);expect(pose.pitch).toBe(45);expect(pose.bearing).toBe(45);
 await page.reload();await expect(page.locator('#status')).toContainText('Carte prête');await expect(page.locator('#camera-game')).toHaveAttribute('aria-pressed','true');
 if(width<760)await page.locator('#atelier').click();await page.getByText('Lieu & caméra',{exact:true}).click();await expect(page.locator('[data-theme=pitch]')).toBeDisabled();
 if(width<760)await page.locator('#close').click();await page.locator('#camera-workshop').click();if(width<760)await page.locator('#atelier').click();await expect(page.locator('[data-theme=pitch]')).toBeEnabled();
});
