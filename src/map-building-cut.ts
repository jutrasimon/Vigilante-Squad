import polygonClipping from 'polygon-clipping';
import type {MultiPolygon as ClipMultiPolygon} from 'polygon-clipping';
import type {Polygon,MultiPolygon} from 'geojson';
import {buildingParts} from './map-building-state';
/** Subtract the whole destroyed footprint, including partial overlaps and holes. */
export function cutBuildings(geometry:Polygon|MultiPolygon,cuts:(Polygon|MultiPolygon)[]):MultiPolygon{
 const parts=buildingParts(geometry) as ClipMultiPolygon;
 const box=(rings:number[][][])=>{let x=Infinity,y=Infinity,r=-Infinity,b=-Infinity;for(const p of rings[0]){x=Math.min(x,p[0]);y=Math.min(y,p[1]);r=Math.max(r,p[0]);b=Math.max(b,p[1]);}return [x,y,r,b];};
 const clips=cuts.flatMap(g=>buildingParts(g)).map(p=>({p,box:box(p)}));
 return {type:'MultiPolygon',coordinates:parts.flatMap(part=>{const a=box(part),near=clips.filter(({box:b})=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]);return near.length?polygonClipping.difference([part],...near.map(c=>[c.p] as ClipMultiPolygon)):[part];})};
}
