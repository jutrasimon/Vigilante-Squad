import {icon} from './icons';
import type {Map as MapLibreMap} from 'maplibre-gl';
/** Anchor beside the geographic target; prefer free space outside the hero card. */
export function placeMapPopover(map:MapLibreMap,panel:HTMLElement,position:[number,number],outline?:[number,number][]){
 if(panel.hidden)return;equipWindow(panel);if(panel.dataset.windowMoved){clampWindow(panel);return;}const viewport=panel.parentElement!,v=viewport.getBoundingClientRect(),p=map.project(position),hero=viewport.querySelector<HTMLElement>('#hero-window:not([hidden])'),r=hero?.getBoundingClientRect();
 const obstacle=r?{x:r.left-v.left,y:r.top-v.top,w:r.width,h:r.height}:undefined;
 const usableHeight=v.height-(viewport.querySelector('#hero-dock:not([hidden])')?207:0);
 const w=Math.min(Number(panel.dataset.windowWidth)||320,v.width-16);panel.style.width=`${w}px`;panel.style.maxHeight=`${Math.max(140,usableHeight-20)}px`;const h=Math.min(panel.scrollHeight,usableHeight-20);
 const projected=outline?.map(c=>map.project(c)),bounds=projected?.length?{left:Math.min(...projected.map(c=>c.x)),right:Math.max(...projected.map(c=>c.x)),top:Math.min(...projected.map(c=>c.y)),bottom:Math.max(...projected.map(c=>c.y))}:{left:p.x-40,right:p.x+40,top:p.y-80,bottom:p.y+35};
 const candidates=bounds?[{x:bounds.right+18,y:p.y-h/2},{x:bounds.left-w-18,y:p.y-h/2},{x:p.x-w/2,y:bounds.bottom+18},{x:p.x-w/2,y:bounds.top-h-18},{x:8,y:8},{x:v.width-w-8,y:8},{x:8,y:usableHeight-h-8},{x:v.width-w-8,y:usableHeight-h-8}]:[{x:p.x+34,y:p.y-h/2},{x:p.x-w-34,y:p.y-h/2},{x:p.x-w/2,y:p.y+42},{x:p.x-w/2,y:p.y-h-42}];
 if(obstacle)candidates.push({x:obstacle.x+obstacle.w+12,y:p.y-h/2},{x:obstacle.x-w-12,y:p.y-h/2},{x:p.x-w/2,y:obstacle.y+obstacle.h+12});
 const overlap=(a:{x:number;y:number})=>!obstacle?0:Math.max(0,Math.min(a.x+w,obstacle.x+obstacle.w)-Math.max(a.x,obstacle.x))*Math.max(0,Math.min(a.y+h,obstacle.y+obstacle.h)-Math.max(a.y,obstacle.y));
 const sectorOverlap=(a:{x:number;y:number})=>!bounds?0:Math.max(0,Math.min(a.x+w,bounds.right+12)-Math.max(a.x,bounds.left-12))*Math.max(0,Math.min(a.y+h,bounds.bottom+12)-Math.max(a.y,bounds.top-12));
 const best=candidates.map(c=>({x:Math.max(8,Math.min(v.width-w-8,c.x)),y:Math.max(8,Math.min(usableHeight-h-8,c.y))})).sort((a,b)=>(overlap(a)+sectorOverlap(a))-(overlap(b)+sectorOverlap(b))||(Math.hypot(a.x+w/2-p.x,a.y+h/2-p.y)-Math.hypot(b.x+w/2-p.x,b.y+h/2-p.y)))[0];
 panel.style.left=`${best.x}px`;panel.style.top=`${best.y}px`;panel.style.right='auto';panel.style.bottom='auto';
}

const equipped=new WeakSet<HTMLElement>();
function clampWindow(panel:HTMLElement){const viewport=panel.parentElement!,w=Math.min(Number(panel.dataset.windowWidth)||panel.offsetWidth,viewport.clientWidth-16);panel.style.width=`${w}px`;panel.style.maxHeight=`${Math.max(120,viewport.clientHeight-16)}px`;panel.style.left=`${Math.max(8,Math.min(parseFloat(panel.style.left)||8,viewport.clientWidth-w-8))}px`;panel.style.top=`${Math.max(8,Math.min(parseFloat(panel.style.top)||8,viewport.clientHeight-panel.offsetHeight-8))}px`;panel.style.right='auto';panel.style.bottom='auto';}
function equipWindow(panel:HTMLElement){
 panel.classList.add('map-floating-window');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
 const head=panel.querySelector<HTMLElement>('.selection-head');if(head){
 const title=head.querySelector('b')!,close=head.querySelector('button')!,center=panel.querySelector<HTMLButtonElement>('#center-point,[data-center-zone],#building-center');
 const bar=document.createElement('div');bar.className='hero-window-bar map-window-bar';const drag=document.createElement('button');drag.dataset.windowAction='drag';drag.setAttribute('aria-label','Déplacer la fiche');drag.innerHTML=`<span>${title.innerHTML}</span>${icon('arrows-move')}`;bar.append(drag);
 for(const [action,label,text] of [['smaller','Rapetisser la fiche','−'],['larger','Agrandir la fiche','+']]){const b=document.createElement('button');b.dataset.windowAction=action;b.setAttribute('aria-label',label);b.textContent=text;bar.append(b);}
 if(center){center.innerHTML=icon('target');center.setAttribute('aria-label','Centrer sur la carte');bar.append(center);}bar.append(close);head.replaceWith(bar);
 const body=document.createElement('div');body.className='map-window-body';for(const child of [...panel.children])if(child!==bar)body.append(child);panel.append(body);
 const resize=document.createElement('button');resize.dataset.windowAction='resize';resize.className='map-window-resize';resize.setAttribute('aria-label','Redimensionner la fiche');resize.textContent='◢';panel.append(resize);
 }
 if(equipped.has(panel))return;equipped.add(panel);
 panel.addEventListener('click',e=>{const action=(e.target as HTMLElement).closest<HTMLElement>('[data-window-action]')?.dataset.windowAction;if(action!=='smaller'&&action!=='larger')return;panel.dataset.windowWidth=String(Math.max(260,Math.min(640,panel.offsetWidth+(action==='larger'?40:-40))));panel.dataset.windowMoved='true';clampWindow(panel);});
 panel.addEventListener('pointerdown',e=>{const action=(e.target as HTMLElement).closest<HTMLElement>('[data-window-action]')?.dataset.windowAction;if(e.button!==0||(action!=='drag'&&action!=='resize'))return;e.preventDefault();const start={x:e.clientX,y:e.clientY,left:panel.offsetLeft,top:panel.offsetTop,width:panel.offsetWidth,height:panel.offsetHeight};panel.dataset.windowMoved='true';panel.setPointerCapture(e.pointerId);
 const move=(ev:PointerEvent)=>{const dx=ev.clientX-start.x,dy=ev.clientY-start.y;if(action==='drag'){panel.style.left=`${start.left+dx}px`;panel.style.top=`${start.top+dy}px`;}else{panel.dataset.windowWidth=String(Math.max(260,Math.min(640,start.width+dx)));panel.style.height=`${Math.max(180,Math.min(panel.parentElement!.clientHeight-16,start.height+dy))}px`;}clampWindow(panel);};const end=()=>{panel.removeEventListener('pointermove',move);panel.removeEventListener('pointerup',end);panel.removeEventListener('pointercancel',end);};panel.addEventListener('pointermove',move);panel.addEventListener('pointerup',end);panel.addEventListener('pointercancel',end);
 });new ResizeObserver(()=>{if(!panel.hidden&&panel.dataset.windowMoved)clampWindow(panel);}).observe(panel.parentElement!);
}
