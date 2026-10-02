import {constrainCenter} from './map-limits';
import {screenDefaults,readScreenTheme,paintScreenTheme,createBoundaryFeedback} from './map-screen-effects';
import {placeMapPopover} from './map-popover';
import * as maplibregl from 'maplibre-gl';
import {type StyleSpecification, type LayerSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);
import './map-gym.css';
import referenceJSON from '../public/config/map-reference.json?raw';
const reference=JSON.parse(referenceJSON);
import {createCameraPolicy,type CameraPose,type ZoomBounds} from './map-camera';
import {icon, type IconName} from './icons';
import {captureFrame,plane,rotated,readMovement,type MovementLimits,type PanBounds} from './map-limits';
import {createScene,emptyScene,readScene,type Scene} from './map-scene';
const STYLE='https://tiles.openfreemap.org/styles/liberty';
const KEY='vigilante-map-gym-v1';
const types:Record<string,{label:string;icon:IconName;color:string}>={hq:{label:'QG',icon:'home',color:'#edc25d'},alert:{label:'Alerte',icon:'alert-triangle',color:'#ed7968'},police:{label:'Police',icon:'shield',color:'#77bcec'},clue:{label:'Indice',icon:'search',color:'#bca0ef'},civil:{label:'Civils',icon:'users',color:'#8ad6b1'},hospital:{label:'Secours',icon:'first-aid-kit',color:'#ed9dba'},watch:{label:'Surveillance',icon:'eye',color:'#6fd9dc'}};
const defaults={...screenDefaults,background:'#101a22',land:'#17252d',water:'#102e40',park:'#263d35',building:'#34434b',buildingEdge:'#59636a',road:'#55636d',major:'#a38b59',rail:'#9c7270',label:'#c9d6da',halo:'#142129',accent:'#edc25d',roadWidth:1.1,buildingOpacity:.85,labelSize:1,labels:true,solidRoads:true,roadNumbers:false,buildings:true,parks:true,threeD:false,height:1,grain:.06,vignette:.3,poiSize:44,poiLabels:true,pitch:0,bearing:0};
type Theme=typeof defaults;
type Point={id:string;type:string;name:string;lng:number;lat:number;color:string};
type Override={visible?:boolean;color?:string;opacity?:number};
let theme:Theme={...defaults}, points:Point[]=[], overrides:Record<string,Override>={};
let savedCamera:({center:[number,number];locked?:boolean;mode?:string;zoomBounds?:ZoomBounds}&Partial<CameraPose>)|undefined;
let cameraLocked=false,zoomBounds:ZoomBounds={};
function readBounds(value?:ZoomBounds):ZoomBounds{
 const next:ZoomBounds={};
 for(const key of ['min','max'] as const){const v=value?.[key];if(v!==undefined){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>22)throw Error('Limite de zoom invalide');next[key]=v;}}
 if((next.min??0)>(next.max??22))throw Error('Limites de zoom inversées');return next;
}
function readPose(camera?:Partial<CameraPose>):CameraPose{
 const number=(v:unknown,fallback:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
 return {pitch:number(camera?.pitch,theme.pitch,0,60),bearing:number(camera?.bearing,theme.bearing,-180,180),zoom:number(camera?.zoom,15,0,22)};
}
let boundaryFeedback:ReturnType<typeof createBoundaryFeedback>|undefined;
let cameraPolicy:ReturnType<typeof createCameraPolicy>|undefined;
let place:{city:string;country:string}|undefined;
function inferPlace(c:number[]){return Math.abs(c[0]+73.58)<.7&&Math.abs(c[1]-45.52)<.5?{city:'Montréal',country:'Canada'}:Math.abs(c[0]+71.22)<.7&&Math.abs(c[1]-46.81)<.5?{city:'Québec',country:'Canada'}:Math.abs(c[0]-2.35)<.7&&Math.abs(c[1]-48.86)<.5?{city:'Paris',country:'France'}:{city:'Ville',country:'Pays'};}
function readPlace(v:unknown,c:number[]){const p=v as {city:string;country:string}|undefined;if(p===undefined)return inferPlace(c);if(!p||typeof p.city!=='string'||typeof p.country!=='string'||p.city.length>80||p.country.length>80)throw Error('Lieu invalide');return {...p};}
let movement:MovementLimits={},sceneState:Scene=emptyScene(),sceneTools:ReturnType<typeof createScene>|undefined;
try{const s=JSON.parse(localStorage.getItem(KEY)||'null')??structuredClone(reference);if(s){theme={...defaults,...s.theme,...readScreenTheme(s.theme)};points=Array.isArray(s.points)?s.points:[];overrides=s.overrides||{};savedCamera=s.camera;cameraLocked=savedCamera?.locked??savedCamera?.mode==='game';zoomBounds=readBounds(savedCamera?.zoomBounds);movement=readMovement(s.camera?.movement);sceneState=readScene(s.scene);place=readPlace(s.place,s.camera?.center||[-73.579,45.519]);}}catch{}
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const button=(id:string,label:string,i:IconName)=>`<button id="${id}" title="${label}" aria-label="${label}">${icon(i)}<span>${label}</span></button>`;
$('app').innerHTML=`<header><a href="./gyms.html">${icon('arrow-left')} Gyms</a><b>VIGILANTE <em>SQUAD</em><small>CARTE RÉELLE / ATELIER</small></b>${button('atelier','Atelier','tools')}</header><main><section class="viewport"><div id="map"></div><div class="grain"></div><div class="vignette"></div><div class="map-top"><span class="live" id="map-place">Montréal · Canada</span><span id="coords"></span></div><div class="map-actions">${button('center','Placer au centre','target')}${button('mode','Placer un point','map-pin')}</div><div id="status" role="status" class="sr-only">Chargement de la carte…</div><div id="selection" hidden></div><details class="map-credit"><summary aria-label="Crédits de la carte">ⓘ</summary><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap · OpenFreeMap</a></details><output id="map-fps" aria-label="Images par seconde">— FPS</output></section><aside id="workshop"><div class="aside-title"><h1>Composer le quartier</h1>${button('close','Fermer','x')}</div><p class="hint">Réglages en direct · sauvegarde sur cet appareil.</p><details open id="layers-panel"><summary>Affichage de la carte</summary><div class="fields"><div id="road-controls" class="road-options"></div><div id="category-list"><p class="hint">Chargement de la carte…</p></div><details id="advanced-layers"><summary>Avancé · couches techniques <span id="layer-count"></span></summary><label class="layer-search">Rechercher une couche<input id="layer-search" type="search" placeholder="Rues, eau, bâtiments…"></label><div id="layer-list"></div></details></div></details><details><summary>Lieu & caméra</summary><div class="fields"><label>Ville<select id="city"><option value="montreal">Montréal · Plateau</option><option value="quebec">Québec · Saint-Roch</option><option value="paris">Paris · Les Halles</option><option value="custom">Coordonnées libres</option></select></label><div class="pair"><label>Latitude<input id="lat" type="number" step=".0001" min="-85" max="85"></label><label>Longitude<input id="lng" type="number" step=".0001" min="-180" max="180"></label></div>${button('go','Aller aux coordonnées','route')}<div class="pair"><label>Ville affichée<input id="place-city" maxlength="80"></label><label>Pays<input id="place-country" maxlength="80"></label></div><div id="camera-controls"></div></div></details><details><summary>Direction artistique</summary><div class="fields"><div class="presets"><button data-preset="dossier">Dossier</button><button data-preset="bulletin">Bulletin</button><button data-preset="neon">Nuit électrique</button></div><div id="colors" class="colors"></div><div id="visual-controls"></div></div></details><details open><summary>Points d’intérêt <span id="count">0</span></summary><div class="fields"><label>Type<select id="point-type">${Object.entries(types).map(([k,t])=>`<option value="${k}">${t.label}</option>`).join('')}</select></label><label>Nom<input id="point-name" maxlength="80" placeholder="Nom du point"></label><label class="color-row">Couleur<input id="point-color" type="color" value="${types.hq.color}"></label><p class="hint">Active « Placer un point », puis touche la carte. Glisse un point pour le déplacer. Ou utilise « Placer au centre ».</p><div id="point-list"></div></div></details><details><summary>Sauvegarde & export</summary><div class="fields">${button('reference','Restaurer la référence','lock')}${button('export','Exporter l’atelier complet (JSON)','flag')}${button('style-export','Exporter le style seul (MapLibre)','tools')}<label class="file">Importer un atelier<input id="import" type="file" accept="application/json,.json"></label>${button('reset','Réinitialiser l’atelier','x')}<p class="hint">Atelier complet : caméra, limites, couleurs, effets, points, héros, véhicules, secteurs et fiche. Le style seul contient uniquement le fond de carte.</p></div></details></aside></main>`;
let map:maplibregl.Map;
let base:StyleSpecification|undefined, placing=false, selected:string|undefined, markers:maplibregl.Marker[]=[];
const colors:Record<string,string>={background:'Fond',land:'Sol',water:'Eau',park:'Parcs',building:'Bâtiments',buildingEdge:'Contours bâtiments',road:'Rues',major:'Axes principaux',rail:'Voies ferrées',label:'Libellés',halo:'Halo du texte',accent:'Accent interface'};
function range(key:keyof Theme,label:string,min:number,max:number,step:number){return `<label class="range">${label}<output id="out-${key}">${theme[key]}</output><input data-theme="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${theme[key]}"></label>`;}
function check(key:keyof Theme,label:string){return `<label class="check"><input data-theme="${key}" type="checkbox" ${theme[key]?'checked':''}>${label}</label>`;}
function controls(){
 $('road-controls').innerHTML=check('solidRoads','Routes pleines')+check('roadNumbers','Numéros de routes')+check('threeD','Bâtiments en volume');
 $('colors').innerHTML=Object.entries(colors).map(([k,label])=>`<label class="color-row">${label}<input data-theme="${k}" type="color" value="${theme[k as keyof Theme]}"></label>`).join('');
 $('camera-controls').innerHTML=range('pitch','Inclinaison',0,60,1)+range('bearing','Rotation',-180,180,1)+`<label class="range">Zoom<output id="out-camera-zoom"></output><input id="camera-zoom" type="range" min="0" max="22" step=".1"></label><label class="check camera-lock"><input id="camera-lock" type="checkbox">Verrouiller la caméra</label><p class="hint">Garde cet angle et cette rotation. Déplacement et zoom suivent leurs propres limites.</p><div class="zoom-bounds">${(['min','max'] as const).map(key=>`<div class="zoom-bound"><span>${key==='min'?'Loin · zoom minimum':'Près · zoom maximum'}</span><output id="out-zoom-${key}">Libre</output><button id="zoom-lock-${key}" data-zoom-bound="${key}" type="button" aria-pressed="false"></button></div>`).join('')}</div><p class="hint">Loin mémorise aussi ce cadrage. Au zoom minimum, le déplacement est bloqué; en zoomant, tu explores ce secteur.</p><div id="pan-controls" class="pan-bounds"></div>`;cameraUI();panUI();
 $('visual-controls').innerHTML=range('roadWidth','Largeur des rues',.3,3,.1)+range('buildingOpacity','Opacité bâtiments',0,1,.05)+range('labelSize','Taille des libellés',.5,1.8,.1)+range('height','Hauteur 3D',.3,3,.1)+range('grain','Grain',0,.25,.01)+range('poiSize','Taille des points',32,72,2)+check('labels','Libellés de la ville')+check('buildings','Bâtiments')+check('parks','Parcs')+check('poiLabels','Noms des points')+`<h2>Vignette</h2><label class="color-row">Couleur<input type="color" data-theme="vignetteColor" value="${theme.vignetteColor}"></label>`+range('vignette','Intensité',0,1,.05)+range('vignetteSize','Ouverture centrale',0,85,1)+range('vignetteSoftness','Douceur',5,100,1)+range('vignetteRoundness','Rondeur',0,1,.05)+range('vignetteX','Centre horizontal',0,100,1)+range('vignetteY','Centre vertical',0,100,1)+`<h2>Signal des limites</h2>`+check('edgeFeedback','Brume lumineuse aux limites')+`<label class="color-row">Couleur<input type="color" data-theme="edgeColor" value="${theme.edgeColor}"></label>`+range('edgeStrength','Intensité du signal',0,1,.02)+range('edgeWidth','Largeur du halo (%)',3,35,1)+range('edgeDuration','Durée (ms)',200,2000,50)+range('edgeFade','Fondu · douceur et disparition',5,95,1)+`<button id="preview-boundary">Tester le signal des limites</button>`;
}
function cameraUI(){
 $<HTMLInputElement>('camera-lock').checked=cameraLocked;
 const zoom=$<HTMLInputElement>('camera-zoom');zoom.min=String(zoomBounds.min??0);zoom.max=String(zoomBounds.max??22);
 const pose=map?{pitch:map.getPitch(),bearing:map.getBearing(),zoom:map.getZoom()}:readPose(savedCamera);
 for(const input of $('camera-controls').querySelectorAll<HTMLInputElement>('input[type=range]')){
  const key=input.id==='camera-zoom'?'zoom':input.dataset.theme as 'pitch'|'bearing';
  const value=pose[key];input.disabled=key!=='zoom'&&cameraLocked;input.value=String(value);
  $('out-'+(key==='zoom'?'camera-zoom':key)).textContent=key==='zoom'?value.toFixed(1):`${Math.round(value)}°`;
 }
 for(const key of ['min','max'] as const){
  const value=zoomBounds[key],locked=value!==undefined;
  $('out-zoom-'+key).textContent=locked?value.toFixed(1):'Libre';
  const button=$<HTMLButtonElement>('zoom-lock-'+key),label=key==='min'?'limite loin':'limite près';
  button.innerHTML=icon(locked?'lock':'lock-open');button.setAttribute('aria-pressed',String(locked));
  button.title=locked?`Libérer la ${label}`:`Fixer la ${label} au zoom actuel`;button.setAttribute('aria-label',button.title);
 }
}
function applyCamera(pose?:CameraPose){cameraPolicy?.apply(cameraLocked,zoomBounds,pose);cameraUI();}
function panUI(){
 const el=document.getElementById('pan-controls');if(!el)return;
 el.innerHTML=`<h2>Limites de déplacement</h2>${(['left','right','top','bottom'] as const).map(key=>{const label={left:'Gauche',right:'Droite',top:'Haut',bottom:'Bas'}[key],locked=movement.pan?.[key]!==undefined;return `<div class="pan-row"><span>${label}<small>${locked?'Position fixée':'Libre'}</small></span><button data-pan-bound="${key}" aria-label="${locked?'Libérer':'Fixer'} la limite ${label.toLowerCase()}" aria-pressed="${locked}">${icon(locked?'lock':'lock-open')}</button></div>`;}).join('')}<button id="pan-frame">${icon('target')}Limiter aux quatre coins de cette vue</button>${movement.frame?'<button id="pan-clear-frame">Libérer le cadrage</button>':''}<p class="hint">Pour chaque côté : place le centre à sa limite, puis ferme le cadenas. Les directions suivent l’angle enregistré au premier verrou.</p>`;
}
function setMovement(){cameraPolicy?.movement(movement);panUI();}
function setFrame(){if(!map)return;movement.frame=captureFrame(map);zoomBounds.min=map.getZoom();setMovement();applyCamera();}
$('camera-controls').addEventListener('click',e=>{
 const button=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||!map)return;
 const key=button.dataset.panBound as 'left'|'right'|'top'|'bottom'|undefined;
 if(key){
  const c=map.getCenter(),pan=movement.pan??{origin:[c.lng,c.lat],bearing:map.getBearing()} as PanBounds;
  if(pan[key]!==undefined)delete pan[key];else {
   const o=plane(pan.origin),p=plane([c.lng,c.lat]),v=rotated([p[0]-o[0],p[1]-o[1]],pan.bearing),value=v[key==='left'||key==='right'?0:1];
   if(key==='left'&&value>(pan.right??Infinity)||key==='right'&&value<(pan.left??-Infinity)||key==='top'&&value>(pan.bottom??Infinity)||key==='bottom'&&value<(pan.top??-Infinity)){status('Cette limite croise celle du côté opposé. Libère l’autre côté pour la déplacer.');return;}
   pan[key]=value;
  }
  movement.pan=pan;setMovement();save();
 }else if(button.id==='pan-frame'){setFrame();save();status('Cadrage et zoom minimum fixés aux quatre coins de cette vue.');}
 else if(button.id==='pan-clear-frame'){delete movement.frame;delete zoomBounds.min;setMovement();applyCamera();save();}
});
$('camera-controls').addEventListener('click',e=>{
 const button=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-zoom-bound]');if(!button||!map)return;
 const key=button.dataset.zoomBound as 'min'|'max';
 if(zoomBounds[key]!==undefined){delete zoomBounds[key];if(key==='min')delete movement.frame;}else {zoomBounds[key]=map.getZoom();if(key==='min')movement.frame=captureFrame(map);}
 applyCamera();setMovement();save();
});
$('camera-controls').addEventListener('change',e=>{
 const input=e.target as HTMLInputElement;if(input.id!=='camera-lock')return;
 cameraLocked=input.checked;applyCamera();save();
 status(cameraLocked?'Angle verrouillé · déplacement et zoom dans leurs limites.':'Caméra déverrouillée · ajuste ta vue.');
});
$('camera-controls').addEventListener('input',e=>{
 const input=e.target as HTMLInputElement;if(input.id!=='camera-zoom')return;
 applyCamera({pitch:map.getPitch(),bearing:map.getBearing(),zoom:Number(input.value)});save();
});
function save(){try{localStorage.setItem(KEY,JSON.stringify(snapshot()));}catch{status('Sauvegarde locale indisponible; utilise l’export JSON.');}}
function snapshot(){const c=map?.getCenter();return {version:1,place,theme,points,overrides,camera:{center:c?[c.lng,c.lat]:[-73.579,45.519],zoom:map?.getZoom()??15,pitch:map?.getPitch()??theme.pitch,bearing:map?.getBearing()??theme.bearing,locked:cameraLocked,zoomBounds:{...zoomBounds},movement:structuredClone(movement)},scene:sceneTools?.snapshot()??structuredClone(sceneState)};}
function status(s:string){$('status').textContent=s;}
function placeUI(){place??=inferPlace(savedCamera?.center||[-73.579,45.519]);$('map-place').textContent=`${place.city} · ${place.country}`;$<HTMLInputElement>('place-city').value=place.city;$<HTMLInputElement>('place-country').value=place.country;}
for(const key of ['city','country'] as const)$(`place-${key}`).onchange=()=>{place??=inferPlace([-73.579,45.519]);place[key]=$<HTMLInputElement>(`place-${key}`).value.trim().slice(0,80);placeUI();save();};placeUI();
function group(l:LayerSpecification){const id=l.id.toLowerCase(),src='source-layer'in l?String(l['source-layer']):'';
 if(l.type==='background')return 'background';if(/water/.test(src+id))return 'water';if(/building/.test(src+id))return 'building';if(/park|landcover|landuse/.test(src+id))return 'park';if(/rail/.test(id))return 'rail';if(/transportation/.test(src)||/road|bridge|tunnel/.test(id))return 'road';return 'land';}
function scale(v:unknown,m:number):any{if(typeof v==='number')return v*m;if(!Array.isArray(v))return undefined;const a=structuredClone(v);if(a[0]==='interpolate'||a[0]==='interpolate-hcl'||a[0]==='interpolate-lab'){for(let i=4;i<a.length;i+=2)a[i]=scale(a[i],m)??a[i];return a;}if(a[0]==='step'){a[2]=scale(a[2],m)??a[2];for(let i=4;i<a.length;i+=2)a[i]=scale(a[i],m)??a[i];return a;}return ['*',a,m];}
function isRoadNumber(l:LayerSpecification){
 if(l.type!=='symbol')return false;
 // Liberty uses both road_shield* and highway-shield* names.
 if(/(?:road|highway).*(?:shield|ref)/i.test(l.id))return true;
 const readsRef=(value:unknown):boolean=>typeof value==='string'?value.includes('{ref}'):Array.isArray(value)&&((value[0]==='get'&&value[1]==='ref')||value.some(readsRef));
 const source='source-layer'in l?String(l['source-layer']):'';
 return source==='transportation_name'&&readsRef(l.layout?.['text-field']);
}
function layerState(l:LayerSpecification){
 const g=group(l),ov=overrides[l.id]||{},category=layerCategory(l),shared=overrides['@group:'+category]||{};
 let visible=l.type==='symbol'?theme.labels:true;
 if(g==='building')visible=theme.buildings;
 if(g==='park')visible=theme.parks;
 if(category==='places')visible=false;
 const major=/motorway|trunk|primary|secondary/.test(l.id),casing=/casing|outline/.test(l.id);
 const color=l.type==='symbol'?theme.label:g==='building'&&l.type==='line'?theme.buildingEdge:g==='road'?(casing?theme.background:major?theme.major:theme.road):theme[g as keyof Theme] as string;
 return {visible:(ov.visible??shared.visible??visible)&&(!isRoadNumber(l)||theme.roadNumbers),color:ov.color||shared.color||color,opacity:ov.opacity??shared.opacity??(g==='building'&&(l.type==='fill'||l.type==='fill-extrusion')?theme.buildingOpacity:1)};
}
function paint(){if(!base)return;
 const set=(id:string,key:string,v:unknown)=>{try{(map.setPaintProperty as (id:string,key:string,v:unknown)=>unknown)(id,key,v);}catch{}};
 for(const l of base.layers){const g=group(l),state=layerState(l);
 map.setLayoutProperty(l.id,'visibility',state.visible?'visible':'none');
 const color=state.color;
 if(l.type==='background'){set(l.id,'background-color',color);set(l.id,'background-opacity',state.opacity);}
 if(l.type==='fill-extrusion'){set(l.id,'fill-extrusion-color',color);set(l.id,'fill-extrusion-opacity',state.opacity);set(l.id,'fill-extrusion-height',theme.threeD?['*',['coalesce',['get','render_height'],['get','height'],8],theme.height]:0);set(l.id,'fill-extrusion-base',0);}
 if(l.type==='fill'){set(l.id,'fill-color',color);set(l.id,'fill-opacity',state.opacity);if(g==='building')set(l.id,'fill-outline-color',theme.buildingEdge);}
 if(l.type==='line'){
 if(g==='road'){set(l.id,'line-dasharray',theme.solidRoads?null:l.paint?.['line-dasharray']??null);set(l.id,'line-pattern',theme.solidRoads?null:l.paint?.['line-pattern']??null);}
 set(l.id,'line-color',color);set(l.id,'line-opacity',state.opacity);const orig=l.paint?.['line-width'];const w=scale(orig,theme.roadWidth);if(w!==undefined&&(g==='road'||g==='rail'))set(l.id,'line-width',w);}
 if(l.type==='raster')set(l.id,'raster-opacity',state.opacity);
 if(l.type==='circle'){set(l.id,'circle-color',color);set(l.id,'circle-opacity',state.opacity);}
 if(l.type==='symbol'){set(l.id,'text-color',color);set(l.id,'text-halo-color',theme.halo);set(l.id,'text-halo-width',1.5);set(l.id,'text-opacity',state.opacity);set(l.id,'icon-opacity',state.opacity);const size=scale(l.layout?.['text-size'],theme.labelSize);if(size!==undefined)map.setLayoutProperty(l.id,'text-size',size);}
 }
 if(map.getLayer('gym-buildings-3d')){const shared=overrides['@group:building']||{};map.setLayoutProperty('gym-buildings-3d','visibility',theme.threeD&&(shared.visible??theme.buildings)?'visible':'none');set('gym-buildings-3d','fill-extrusion-color',shared.color||theme.building);set('gym-buildings-3d','fill-extrusion-opacity',shared.opacity??theme.buildingOpacity);set('gym-buildings-3d','fill-extrusion-height',['*',['coalesce',['get','render_height'],['get','height'],8],theme.height]);}
 document.documentElement.style.setProperty('--accent',theme.accent);document.documentElement.style.setProperty('--grain',String(theme.grain));document.documentElement.style.setProperty('--shade',String(theme.vignette));paintScreenTheme(document.querySelector('.viewport')!,theme);if(!theme.edgeFeedback)boundaryFeedback?.clear();
 $('map').style.background=theme.background;
 sceneTools?.buildingPaint();const firstVolume=map.getStyle().layers.find(l=>l.type==='fill-extrusion');if(firstVolume)for(const l of base.layers.filter(l=>l.type==='symbol')){map.moveLayer(l.id,firstVolume.id);if(group(l)==='road'){map.setLayoutProperty(l.id,'text-pitch-alignment','map');map.setLayoutProperty(l.id,'text-rotation-alignment','map');}}for(const m of markers){m.getElement().style.setProperty('--point-size',`${theme.poiSize}px`);m.getElement().classList.toggle('no-label',!theme.poiLabels);}
}
function renderPoints(){markers.forEach(m=>m.remove());markers=[];
 for(const p of points){const el=document.createElement('button');el.type='button';el.className='poi';el.dataset.pointType=p.type;el.dataset.poi=p.id;el.style.setProperty('--point',p.color);el.style.setProperty('--point-size',`${theme.poiSize}px`);el.classList.toggle('no-label',!theme.poiLabels);el.setAttribute('aria-label',p.name);el.innerHTML=`<span class="poi-symbol">${icon(types[p.type].icon)}</span><span class="poi-name">${esc(p.name)}</span>`;el.addEventListener('click',e=>{e.stopPropagation();if(sceneTools?.pointClick(p.id))return;selected=p.id;editor();});const m=new maplibregl.Marker({element:el,draggable:true}).setLngLat([p.lng,p.lat]).addTo(map);m.on('dragend',()=>{const c=m.getLngLat();p.lng=c.lng;p.lat=c.lat;save();if(selected===p.id)editor();});markers.push(m);}
 sceneTools?.pointsChanged();$('count').textContent=String(points.length);
 $('point-list').innerHTML=points.map(p=>`<button data-select="${p.id}" class="point-row"><span style="color:${p.color}">${icon(types[p.type].icon)}</span><span>${esc(p.name)}<small>${types[p.type].label}</small></span></button>`).join('');
}
function editor(){const p=points.find(p=>p.id===selected);$('selection').hidden=!p;sceneTools?.pointSelected(p?.id);if(!p)return;
 $('selection').innerHTML=`<div class="selection-head"><b>${types[p.type].label}</b><button id="unselect" aria-label="Fermer">${icon('x')}</button></div><label>Nom<input id="edit-name" value="${esc(p.name)}" maxlength="80"></label><label>Type<select id="edit-type">${Object.entries(types).map(([k,t])=>`<option value="${k}" ${k===p.type?'selected':''}>${t.label}</option>`).join('')}</select></label><label class="color-row">Couleur<input id="edit-color" type="color" value="${p.color}"></label><small>${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</small>${sceneTools?.pointMoveLabel()?`<button id="move-to-point">${icon('route')}${esc(sceneTools.pointMoveLabel()!)}</button>`:''}<button id="center-point">${icon('target')}Placer au centre</button><button id="delete-point" class="danger">${icon('x')} Supprimer le point</button>`;
 placeMapPopover(map,$('selection'),[p.lng,p.lat]);$('center-point').onclick=()=>sceneTools?.centerPoint(p.id);
 const moveButton=document.getElementById('move-to-point');if(moveButton)moveButton.onclick=()=>{sceneTools?.moveToPoint(p.id);selected=undefined;editor();};
 $('unselect').onclick=()=>{selected=undefined;editor();};$('delete-point').onclick=()=>{points=points.filter(x=>x.id!==p.id);selected=undefined;renderPoints();editor();save();};
 $('edit-name').onchange=()=>{p.name=$<HTMLInputElement>('edit-name').value.trim()||types[p.type].label;renderPoints();save();};$('edit-type').onchange=()=>{p.type=$<HTMLSelectElement>('edit-type').value;p.color=types[p.type].color;renderPoints();editor();save();};$('edit-color').oninput=()=>{p.color=$<HTMLInputElement>('edit-color').value;renderPoints();save();};
}
function add(lng:number,lat:number){const type=$<HTMLSelectElement>('point-type').value;const p={id:crypto.randomUUID(),type,name:$<HTMLInputElement>('point-name').value.trim()||types[type].label,lng,lat,color:$<HTMLInputElement>('point-color').value};points.push(p);selected=p.id;placing=false;mode();renderPoints();editor();save();status(`${p.name} ajouté. Glisse le point pour le déplacer.`);}
function mode(){$('mode').setAttribute('aria-pressed',String(placing));$('mode').querySelector('span')!.textContent=placing?'Touche la carte…':'Placer un point';$('map').classList.toggle('placing',placing);}
const layerGroups:Record<string,string>={background:'Fond',land:'Terrain',park:'Parcs & espaces verts',water:'Eau',building:'Bâtiments',road:'Rues & routes',rail:'Voies ferrées',labels:'Noms des rues & quartiers',places:'Commerces & lieux'};
function layerCategory(l:LayerSpecification){
 if(l.type!=='symbol')return group(l);
 const source='source-layer'in l?String(l['source-layer']):'';
 return source==='poi'||/(^|[_-])(poi|poi-level|transit|aerodrome|airport)([_-]|$)/i.test(l.id)?'places':'labels';
}
function categoryList(){
 if(!base)return;
 $('category-list').innerHTML=Object.entries(layerGroups).map(([key,name])=>{
 const layers=base!.layers.filter(l=>layerCategory(l)===key);if(!layers.length)return '';
 const active=layers.filter(l=>theme.roadNumbers||!isRoadNumber(l));
 const states=(active.length?active:layers).map(layerState),shown=states.filter(s=>s.visible).length,state=states[0];
 const custom=!!overrides['@group:'+key]||layers.some(l=>!!overrides[l.id]);
 const color=overrides['@group:'+key]?.color||(key==='places'||key==='labels'?theme.label:theme[key as keyof Theme]);
 return `<div class="layer-row category-row ${shown?'':'is-hidden'}" data-category="${key}">
 <label class="layer-toggle"><input type="checkbox" data-category-key="visible" ${shown===states.length?'checked':''} data-mixed="${shown>0&&shown<states.length}" aria-label="Afficher ${name}"><span>${name}${key==='places'?'<small>Enseignes, restaurants, services…</small>':''}</span></label>
 <input type="color" data-category-key="color" value="${color}" aria-label="Couleur ${name}">
 <label class="layer-opacity"><input type="range" data-category-key="opacity" min="0" max="1" step=".01" value="${state.opacity}" aria-label="Opacité ${name}"><output>${Math.round(state.opacity*100)} %</output></label>
 <button class="layer-reset" data-category-reset title="Suivre la palette" aria-label="Suivre la palette : ${name}" ${custom?'':'disabled'}>${icon('arrow-left')}</button></div>`;
 }).join('');
 for(const input of $('category-list').querySelectorAll<HTMLInputElement>('[data-mixed=true]'))input.indeterminate=true;
}
$('category-list').addEventListener('input',e=>{
 const input=e.target as HTMLInputElement,key=input.dataset.categoryKey as keyof Override;
 const row=input.closest<HTMLElement>('[data-category]'),category=row?.dataset.category;
 if(!key||!row||!category||!base)return;
 // A category action applies to every child, including previously edited layers.
 for(const l of base.layers.filter(l=>layerCategory(l)===category)){
 const ov=overrides[l.id];if(!ov)continue;delete ov[key];if(!Object.keys(ov).length)delete overrides[l.id];
 }
 const id='@group:'+category;
 overrides[id]={...overrides[id],[key]:key==='visible'?input.checked:key==='opacity'?Number(input.value):input.value};
 if(key==='visible'){input.indeterminate=false;row.classList.toggle('is-hidden',!input.checked);}
 if(key==='opacity')row.querySelector('output')!.textContent=`${Math.round(Number(input.value)*100)} %`;
 row.querySelector<HTMLButtonElement>('[data-category-reset]')!.disabled=false;
 paint();layerList(false);save();
});
$('category-list').addEventListener('click',e=>{
 const category=(e.target as HTMLElement).closest('[data-category-reset]')?.closest<HTMLElement>('[data-category]')?.dataset.category;
 if(!category||!base)return;delete overrides['@group:'+category];
 for(const l of base.layers.filter(l=>layerCategory(l)===category))delete overrides[l.id];
 paint();layerList();save();
});
const layerWords:Record<string,string>={background:'Fond',natural:'Nature',earth:'Relief',park:'Parc',outline:'Contour',landuse:'Zone',landcover:'Sol',residential:'Résidentiel',wood:'Boisé',grass:'Herbe',ice:'Glace',wetland:'Milieu humide',pitch:'Terrain sportif',track:'Piste',cemetery:'Cimetière',hospital:'Hôpital',school:'École',waterway:'Cours d’eau',tunnel:'Tunnel',river:'Rivière',other:'Autres',water:'Eau',sand:'Sable',aeroway:'Aéroport',fill:'Surface',line:'Tracé',building:'Bâtiments',buildings:'Bâtiments',volume:'Volume',road:'Rue',roads:'Rues',bridge:'Pont',casing:'Bordure',motorway:'Autoroute',trunk:'Route principale',primary:'Axe principal',secondary:'Axe secondaire',tertiary:'Axe local',minor:'Rue locale',service:'Voie de service',path:'Sentier',pedestrian:'Piéton',railway:'Rail',rail:'Rail',transportation:'Transport',label:'Nom',place:'Lieu',city:'Ville',town:'Ville',village:'Village',country:'Pays',state:'Région',poi:'Lieu d’intérêt',transit:'Transport',symbol:'Icône',name:'Nom',boundary:'Limite',admin:'Administrative',capital:'Capitale',neighbourhood:'Quartier',suburb:'Quartier',aerodrome:'Aérodrome',ferry:'Traversier'};
function layerName(l:LayerSpecification){return l.id.split(/[_-]/).map(w=>layerWords[w]||w).join(' · ');}
function layerList(refreshCategories=true){
 if(!base)return;
 if(refreshCategories)categoryList();
 const list=$('layer-list');
 list.innerHTML=Object.entries(layerGroups).map(([g,label])=>{
 const layers=base!.layers.filter(l=>layerCategory(l)===g);
 if(!layers.length)return '';
 return `<section class="layer-group"><h2>${label}<span>${layers.length}</span></h2>${layers.map(l=>{
 const state=layerState(l),id=esc(l.id),name=esc(layerName(l)),custom=!!overrides[l.id];
 return `<div class="layer-row ${state.visible?'':'is-hidden'} ${custom?'is-custom':''}" data-layer="${id}" data-search="${esc((label+' '+layerName(l)+' '+l.id).toLocaleLowerCase('fr'))}">
 <label class="layer-toggle"><input type="checkbox" data-layer-key="visible" aria-label="Afficher ${name}" ${state.visible?'checked':''}><span>${name}<small>${id}</small></span></label>
 <input type="color" data-layer-key="color" value="${state.color}" aria-label="Couleur ${name}" ${l.type==='raster'?'disabled title="Cette couche contient une image non recolorable"':''}>
 <label class="layer-opacity"><input type="range" data-layer-key="opacity" min="0" max="1" step=".01" value="${state.opacity}" aria-label="Opacité ${name}"><output>${Math.round(state.opacity*100)} %</output></label>
 <button class="layer-reset" data-layer-reset title="Suivre la palette" aria-label="Suivre la palette : ${name}" ${custom?'':'disabled'}>${icon('arrow-left')}</button></div>`;
 }).join('')}</section>`;
 }).join('')+'<p id="layer-empty" class="hint" hidden>Aucune couche trouvée.</p>';
 filterLayers();
}
function filterLayers(){
 const query=$<HTMLInputElement>('layer-search').value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 let count=0;
 for(const row of $('layer-list').querySelectorAll<HTMLElement>('.layer-row')){
 row.hidden=!(row.dataset.search||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query);
 if(!row.hidden)count++;
 }
 for(const section of $('layer-list').querySelectorAll<HTMLElement>('.layer-group'))section.hidden=!section.querySelector('.layer-row:not([hidden])');
 $('layer-count').textContent=String(count);
 const empty=document.getElementById('layer-empty');if(empty)empty.hidden=count>0;
}
$('layer-search').oninput=filterLayers;
$('layer-list').addEventListener('input',e=>{
 const input=e.target as HTMLInputElement,key=input.dataset.layerKey as keyof Override;
 const row=input.closest<HTMLElement>('[data-layer]'),id=row?.dataset.layer;
 if(!key||!row||!id)return;
 overrides[id]={...overrides[id],[key]:key==='visible'?input.checked:key==='opacity'?Number(input.value):input.value};
 row.classList.add('is-custom');row.querySelector<HTMLButtonElement>('[data-layer-reset]')!.disabled=false;
 if(key==='visible')row.classList.toggle('is-hidden',!input.checked);
 if(key==='opacity')row.querySelector('output')!.textContent=`${Math.round(Number(input.value)*100)} %`;
 paint();categoryList();save();
});
$('layer-list').addEventListener('click',e=>{
 const button=(e.target as HTMLElement).closest('[data-layer-reset]');
 const id=button?.closest<HTMLElement>('[data-layer]')?.dataset.layer;
 if(!id)return;delete overrides[id];paint();layerList();save();
});
function download(name:string,data:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
controls();
try{map=new maplibregl.Map({container:'map',style:STYLE,center:savedCamera?.center||[-73.579,45.519],...readPose(savedCamera),attributionControl:false});
 boundaryFeedback=createBoundaryFeedback(map,document.querySelector('.viewport')!,()=>theme,(c,z)=>constrainCenter(c,z,movement));cameraPolicy=createCameraPolicy(map,boundaryFeedback.blocked);applyCamera();
 if(zoomBounds.min!==undefined&&!movement.frame){const current={center:map.getCenter(),zoom:map.getZoom()};map.jumpTo({zoom:zoomBounds.min});movement.frame=captureFrame(map);map.jumpTo(current);}
 setMovement();
 map.on('load',()=>{base=map.getStyle();const building=base.layers.find(l=>'source-layer'in l&&l['source-layer']==='building');if(building&&'source'in building&&!base.layers.some(l=>group(l)==='building'&&l.type==='fill-extrusion')){map.addLayer({id:'gym-buildings-3d',type:'fill-extrusion',source:building.source,'source-layer':'building',minzoom:13,paint:{'fill-extrusion-height':8,'fill-extrusion-base':0}},base.layers.find(l=>l.type==='symbol')?.id);}
 paint();renderPoints();layerList();sceneTools=createScene(map,sceneState,save,status,()=>points);status(cameraLocked?'Carte prête · angle verrouillé, zoom disponible.':'Carte prête · glisser pour déplacer, pincer pour zoomer.');});
 let lastError=0;map.on('error',()=>{if(Date.now()-lastError>5000){lastError=Date.now();status('Une ressource cartographique ne charge pas. Vérifie la connexion ou recharge la page.');}});
 map.on('move',()=>{const p=points.find(p=>p.id===selected);if(p)placeMapPopover(map,$('selection'),[p.lng,p.lat]);});
 map.on('click',e=>{if(placing&&!sceneTools?.active())add(e.lngLat.lng,e.lngLat.lat);});
 map.on('moveend',()=>{theme.pitch=map.getPitch();theme.bearing=map.getBearing();cameraUI();const c=map.getCenter();$<HTMLInputElement>('lat').value=c.lat.toFixed(5);$<HTMLInputElement>('lng').value=c.lng.toFixed(5);$('coords').textContent=`${c.lat.toFixed(3)} / ${c.lng.toFixed(3)} · Z${map.getZoom().toFixed(1)}`;save();});
 const c=map.getCenter();$<HTMLInputElement>('lat').value=String(c.lat);$<HTMLInputElement>('lng').value=String(c.lng);
}catch(error){console.error('Initialisation de la carte',error);status(error instanceof maplibregl.GPUInitializationError?'La carte requiert WebGL. Essaie un navigateur avec accélération graphique.':`Initialisation de la carte impossible : ${error instanceof Error?error.message:'erreur inconnue'}`);}
$('atelier').onclick=()=>{$('workshop').classList.toggle('open');setTimeout(()=>map?.resize(),220);};$('close').onclick=()=>{$('workshop').classList.remove('open');map?.resize();};
$('mode').onclick=()=>{sceneTools?.cancelPlacement();placing=!placing;mode();status(placing?'Touche un lieu pour ajouter ton point.':'Placement désactivé.');};$('center').onclick=()=>{if(map){const c=map.getCenter();add(c.lng,c.lat);}};
$('point-type').onchange=()=>{$<HTMLInputElement>('point-color').value=types[$<HTMLSelectElement>('point-type').value].color;};
$('city').onchange=()=>{const coords:Record<string,[number,number]>={montreal:[-73.579,45.519],quebec:[-71.222,46.815],paris:[2.347,48.862]};const c=coords[$<HTMLSelectElement>('city').value];if(c){place=inferPlace(c);placeUI();cameraPolicy?.go(c,15);}};
$('go').onclick=()=>{const lat=Number($<HTMLInputElement>('lat').value),lng=Number($<HTMLInputElement>('lng').value);if(Number.isFinite(lat)&&Math.abs(lat)<=85&&Number.isFinite(lng)&&Math.abs(lng)<=180)cameraPolicy?.go([lng,lat]);else status('Coordonnées invalides. Latitude −85 à 85, longitude −180 à 180.');};
$('workshop').addEventListener('input',e=>{const input=e.target as HTMLInputElement,key=input.dataset.theme as keyof Theme;if(!key)return;(theme as unknown as Record<string,unknown>)[key]=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;const out=document.getElementById(`out-${key}`);if(out)out.textContent=String(theme[key]);if(key==='pitch'||key==='bearing'){if(cameraLocked)return;applyCamera({pitch:theme.pitch,bearing:theme.bearing,zoom:map.getZoom()});}paint();sceneTools?.effects();layerList();save();});
$('workshop').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-preset],[data-select]');if(!b)return;if(b.dataset.select){selected=b.dataset.select;const p=points.find(p=>p.id===selected)!;map?.easeTo({center:[p.lng,p.lat]});editor();return;}const preset=b.dataset.preset;const v=preset==='bulletin'?{background:'#ded5bf',land:'#c9c1ac',water:'#476578',park:'#87997e',building:'#aea18b',buildingEdge:'#796c5c',road:'#eee6d4',major:'#9d6950',label:'#343638',halo:'#dcd2bc',accent:'#cc604e',grain:.12}:preset==='neon'?{water:'#082f45',park:'#172f35',building:'#26304c',buildingEdge:'#5a5384',road:'#395b6c',major:'#ad668f',label:'#a8cede',accent:'#78dcde',grain:.03}:{};theme={...theme,...defaults,...v,threeD:theme.threeD,height:theme.height,pitch:map.getPitch(),bearing:map.getBearing()};overrides={};controls();layerList();paint();sceneTools?.effects();save();});
$('export').onclick=()=>download('vigilante-map-atelier.json',snapshot());$('style-export').onclick=()=>{if(base)download('vigilante-map-style.json',map.getStyle());else status('Attends le chargement de la carte avant l’export.');};
$('reference').onclick=()=>{
 if(!confirm('Restaurer la carte de référence ? Les réglages et points actuels seront remplacés.'))return;
 const saved=structuredClone(reference);place=inferPlace(saved.camera.center);placeUI();
 boundaryFeedback?.clear();theme={...defaults,...saved.theme,...readScreenTheme(saved.theme)};points=saved.points;overrides=saved.overrides;selected=undefined;placing=false;
 cameraLocked=saved.camera.locked;zoomBounds=readBounds(saved.camera.zoomBounds);savedCamera=saved.camera;movement=readMovement((saved.camera as unknown as {movement?:MovementLimits}).movement);sceneState=emptyScene();sceneTools?.replace(sceneState);cameraPolicy?.movement({});
 controls();layerList();applyCamera(readPose(saved.camera));map?.jumpTo({center:saved.camera.center});if(zoomBounds.min!==undefined&&!movement.frame)movement.frame=captureFrame(map);setMovement();
 paint();renderPoints();editor();mode();save();status('Carte de référence restaurée.');
};
$('reset').onclick=()=>{if(!confirm('Réinitialiser la palette, la caméra et supprimer les points de cet atelier ?'))return;place=inferPlace([-73.579,45.519]);placeUI();cameraLocked=false;zoomBounds={};movement={};cameraPolicy?.movement({});sceneState=emptyScene();sceneTools?.replace(sceneState);theme={...defaults};points=[];overrides={};selected=undefined;controls();layerList();applyCamera({pitch:0,bearing:0,zoom:15});map?.jumpTo({center:[-73.579,45.519]});paint();sceneTools?.effects();renderPoints();editor();save();};
$('import').onchange=async()=>{try{const f=$<HTMLInputElement>('import').files?.[0];if(!f)return;if(f.size>16000000)throw Error();const s=JSON.parse(await f.text());if(s.version!==1||!Array.isArray(s.points)||s.points.length>500)throw Error();for(const p of s.points)if(!types[p.type]||typeof p.id!=='string'||typeof p.name!=='string'||p.name.length>80||!Number.isFinite(p.lng)||Math.abs(p.lng)>180||!Number.isFinite(p.lat)||Math.abs(p.lat)>85||!/^#[0-9a-f]{6}$/i.test(p.color))throw Error();const next={...defaults};for(const k of Object.keys(defaults) as (keyof Theme)[]){const v=s.theme?.[k];if(v===undefined&&(k==='solidRoads'||k==='roadNumbers'))continue;if(typeof v!==typeof defaults[k])throw Error();if(typeof v==='string'&&!/^#[0-9a-f]{6}$/i.test(v))throw Error();if(typeof v==='number'&&(!Number.isFinite(v)||v<0&&k!=='bearing'))throw Error();(next as unknown as Record<string,unknown>)[k]=v;}
 Object.assign(next,readScreenTheme(s.theme));boundaryFeedback?.clear();const nextPlace=readPlace(s.place,s.camera?.center||[-73.579,45.519]),nextBounds=readBounds(s.camera?.zoomBounds),nextMovement=readMovement(s.camera?.movement),nextScene=readScene(s.scene);place=nextPlace;placeUI();theme=next;points=s.points;overrides=s.overrides||{};selected=undefined;cameraLocked=s.camera?.locked??s.camera?.mode==='game';zoomBounds=nextBounds;movement=nextMovement;cameraPolicy?.movement({});sceneState=nextScene;controls();layerList();applyCamera(readPose(s.camera));if(s.camera&&Array.isArray(s.camera.center)&&s.camera.center.length===2&&s.camera.center.every(Number.isFinite))map.jumpTo({center:s.camera.center});if(zoomBounds.min!==undefined&&!movement.frame){const current={center:map.getCenter(),zoom:map.getZoom()};map.jumpTo({zoom:zoomBounds.min});movement.frame=captureFrame(map);map.jumpTo(current);}setMovement();sceneTools?.replace(nextScene);paint();renderPoints();editor();save();status('Atelier importé.');}catch{status('Import refusé : fichier atelier invalide.');}};

new ResizeObserver(()=>{const p=points.find(p=>p.id===selected);if(p)placeMapPopover(map,$('selection'),[p.lng,p.lat]);}).observe($('selection'));

document.querySelector('.viewport')!.addEventListener('map-layout',()=>{const p=points.find(p=>p.id===selected);if(p)placeMapPopover(map,$('selection'),[p.lng,p.lat]);});

$('visual-controls').addEventListener('click',e=>{if((e.target as HTMLElement).closest('#preview-boundary'))boundaryFeedback?.preview();});

let fpsFrames=0,fpsStart=performance.now();function measureFPS(now:number){if(document.hidden){fpsFrames=0;fpsStart=now;}else {fpsFrames++;if(now-fpsStart>=600){$('map-fps').textContent=`${Math.round(fpsFrames*1000/(now-fpsStart))} FPS`;fpsFrames=0;fpsStart=now;}}requestAnimationFrame(measureFPS);}requestAnimationFrame(measureFPS);
