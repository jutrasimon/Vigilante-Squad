import type {Map as MapLibreMap} from 'maplibre-gl';
/** Anchor beside the geographic target; prefer free space outside the hero card. */
export function placeMapPopover(map:MapLibreMap,panel:HTMLElement,position:[number,number],outline?:[number,number][]){
 if(panel.hidden)return;const viewport=panel.parentElement!,v=viewport.getBoundingClientRect(),p=map.project(position),hero=viewport.querySelector<HTMLElement>('#hero-window:not([hidden])'),r=hero?.getBoundingClientRect();
 const obstacle=r?{x:r.left-v.left,y:r.top-v.top,w:r.width,h:r.height}:undefined;
 const usableHeight=v.height-(viewport.querySelector('#hero-dock:not([hidden])')?180:0);
 const w=Math.min(270,v.width-16);panel.style.width=`${w}px`;panel.style.maxHeight=`${Math.max(140,usableHeight-20)}px`;const h=Math.min(panel.scrollHeight,usableHeight-20);
 const projected=outline?.map(c=>map.project(c)),bounds=projected?.length?{left:Math.min(...projected.map(c=>c.x)),right:Math.max(...projected.map(c=>c.x)),top:Math.min(...projected.map(c=>c.y)),bottom:Math.max(...projected.map(c=>c.y))}:undefined;
 const candidates=bounds?[{x:bounds.right+18,y:p.y-h/2},{x:bounds.left-w-18,y:p.y-h/2},{x:p.x-w/2,y:bounds.bottom+18},{x:p.x-w/2,y:bounds.top-h-18},{x:8,y:8},{x:v.width-w-8,y:8},{x:8,y:usableHeight-h-8},{x:v.width-w-8,y:usableHeight-h-8}]:[{x:p.x+34,y:p.y-h/2},{x:p.x-w-34,y:p.y-h/2},{x:p.x-w/2,y:p.y+42},{x:p.x-w/2,y:p.y-h-42}];
 if(obstacle)candidates.push({x:obstacle.x+obstacle.w+12,y:p.y-h/2},{x:obstacle.x-w-12,y:p.y-h/2},{x:p.x-w/2,y:obstacle.y+obstacle.h+12});
 const overlap=(a:{x:number;y:number})=>!obstacle?0:Math.max(0,Math.min(a.x+w,obstacle.x+obstacle.w)-Math.max(a.x,obstacle.x))*Math.max(0,Math.min(a.y+h,obstacle.y+obstacle.h)-Math.max(a.y,obstacle.y));
 const sectorOverlap=(a:{x:number;y:number})=>!bounds?0:Math.max(0,Math.min(a.x+w,bounds.right+12)-Math.max(a.x,bounds.left-12))*Math.max(0,Math.min(a.y+h,bounds.bottom+12)-Math.max(a.y,bounds.top-12));
 const best=candidates.map(c=>({x:Math.max(8,Math.min(v.width-w-8,c.x)),y:Math.max(8,Math.min(usableHeight-h-8,c.y))})).sort((a,b)=>(overlap(a)+sectorOverlap(a))-(overlap(b)+sectorOverlap(b))||(Math.hypot(a.x+w/2-p.x,a.y+h/2-p.y)-Math.hypot(b.x+w/2-p.x,b.y+h/2-p.y)))[0];
 panel.style.left=`${best.x}px`;panel.style.top=`${best.y}px`;panel.style.right='auto';panel.style.bottom='auto';
}
