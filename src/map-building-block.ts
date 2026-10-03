import {polygonContains} from './map-building-state';
import type {Polygon} from 'geojson';
export type BuildingPart={geometry:Polygon;height:number};
/** Connected footprints only: a 1.5 m seam is allowed, never a whole tile group. */
export function connectedBuildingBlock(seed:BuildingPart,pool:BuildingPart[],seam=1.5){
 const origin=seed.geometry.coordinates[0][0],sx=111320*Math.cos(origin[1]*Math.PI/180),sy=111320;
 const point=(p:number[])=>[(p[0]-origin[0])*sx,(p[1]-origin[1])*sy];
 const unique=new Map<string,BuildingPart>();for(const p of [seed,...pool]){const first=p.geometry.coordinates[0][0];if(p!==seed&&(Math.abs(first[0]-origin[0])*sx>350||Math.abs(first[1]-origin[1])*sy>350))continue;unique.set(JSON.stringify(p.geometry.coordinates),p);}
 let items=[...unique.values()].map(part=>{const ring=part.geometry.coordinates[0].map(point);return {part,ring,box:{l:Math.min(...ring.map(p=>p[0])),r:Math.max(...ring.map(p=>p[0])),t:Math.min(...ring.map(p=>p[1])),b:Math.max(...ring.map(p=>p[1]))}};}).filter(p=>p.box.l<250&&p.box.r>-250&&p.box.t<250&&p.box.b>-250).slice(0,1200);
 const distance=(p:number[],a:number[],b:number[])=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 const within=(a:typeof items[number],b:typeof items[number])=>a.box.l>=b.box.l-.15&&a.box.r<=b.box.r+.15&&a.box.t>=b.box.t-.15&&a.box.b<=b.box.b+.15&&a.ring.every(p=>polygonContains(p as [number,number],[b.ring])||b.ring.some((q,i)=>i>0&&distance(p,b.ring[i-1],q)<.15));
 const area=(a:typeof items[number])=>Math.abs(a.ring.reduce((v,p,i)=>i?v+a.ring[i-1][0]*p[1]-p[0]*a.ring[i-1][1]:v,0));
 const first=items[0];items=items.filter((a,i)=>!items.some((b,j)=>j!==i&&a.part.height===b.part.height&&area(b)>area(a)+.01&&within(a,b)));
 const start=Math.max(0,items.findIndex(a=>a.part.height===seed.height&&within(first,a)));
 const near=(a:typeof items[number],b:typeof items[number])=>{if(a.box.r+seam<b.box.l||b.box.r+seam<a.box.l||a.box.b+seam<b.box.t||b.box.b+seam<a.box.t)return false;return a.ring.some(p=>b.ring.some((q,i)=>i>0&&distance(p,b.ring[i-1],q)<=seam))||b.ring.some(p=>a.ring.some((q,i)=>i>0&&distance(p,a.ring[i-1],q)<=seam));};
 if(!items.length)return [seed];const found=new Set([start]),queue=[start];for(let n=0;n<queue.length&&found.size<300;n++){for(let i=0;i<items.length;i++)if(!found.has(i)&&near(items[queue[n]],items[i])){found.add(i);queue.push(i);}}
 return [...found].map(i=>items[i].part);
}
