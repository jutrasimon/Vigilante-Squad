import type {Feature,Polygon,MultiPolygon} from 'geojson';
import {buildingParts,polygonContains,type BuildingEdit} from './map-building-state';
/** Deterministic footprint samples, bounded independently of the number of tile vertices. */
export function footprintSamples(geometry:Polygon|MultiPolygon,count=64):[number,number][]{
 const polygons=buildingParts(geometry),weighted=polygons.map(r=>{const ring=r[0];const area=Math.abs(ring.reduce((v,p,i)=>i?v+ring[i-1][0]*p[1]-p[0]*ring[i-1][1]:v,0));return {r,area};}),total=weighted.reduce((v,p)=>v+p.area,0)||1,points:[number,number][]=[];
 let seed=173;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const {r,area} of weighted){const xs=r[0].map(p=>p[0]),ys=r[0].map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y,n=Math.max(1,Math.round(count*area/total));for(let tries=0,got=0;tries<n*30&&got<n&&points.length<count;tries++){const p:[number,number]=[x+random()*w,y+random()*h];if(polygonContains(p,r)){points.push(p);got++;}}}return points;
}
export function rubbleFeatures(b:BuildingEdit):Feature<Polygon>[] {
 const parts=buildingParts(b.geometry),points=footprintSamples(b.geometry,80),sx=111320*Math.cos(points[0]?.[1]*Math.PI/180||0),base=b.destroyedColor||'#34302d';
 return points.flatMap((p,i)=>{const rings=parts.find(r=>polygonContains(p,r))!,size=1.5+(i%7)*.45,dx=size/sx,dy=size/111320,ring=[[p[0]-dx,p[1]-dy],[p[0]+dx*.7,p[1]-dy],[p[0]+dx,p[1]+dy*.55],[p[0]-dx*.6,p[1]+dy],[p[0]-dx,p[1]-dy]];
 if(!ring.every(q=>polygonContains(q as [number,number],rings)))return [];
 const color='#'+[1,3,5].map(k=>Math.min(255,parseInt(base.slice(k,k+2),16)+12+(i%4)*9).toString(16).padStart(2,'0')).join('');return [{type:'Feature' as const,properties:{color,height:1.6+(i%9)*.35},geometry:{type:'Polygon' as const,coordinates:[ring]}}];});
}
