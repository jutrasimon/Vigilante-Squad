import type {Feature,Polygon,MultiPolygon} from 'geojson';
import {buildingParts} from './map-building-state';
/** Narrow extruded ribbons trace roof edges and corner pillars in map space. */
export function buildingOutline(geometry:Polygon|MultiPolygon,height:number,color:string,id:string):Feature<Polygon>[] {
 const features:Feature<Polygon>[]=[],width=.3;
 for(const rings of buildingParts(geometry))for(const ring of rings){const sx=111320*Math.cos(ring[0][1]*Math.PI/180),sy=111320;
 const add=(points:number[][],base:number,top:number)=>features.push({type:'Feature',id,properties:{color,base,height:top},geometry:{type:'Polygon',coordinates:[[...points,points[0]]]}});
 for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],dx=(b[0]-a[0])*sx,dy=(b[1]-a[1])*sy,len=Math.hypot(dx,dy);if(len<.05)continue;const nx=-dy/len*width/sx,ny=dx/len*width/sy;
 add([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]],height+.08,height+.24);
 const wx=width/sx,wy=width/sy;add([[a[0]-wx,a[1]-wy],[a[0]+wx,a[1]-wy],[a[0]+wx,a[1]+wy],[a[0]-wx,a[1]+wy]],0,height+.24);
 }}return features;
}
