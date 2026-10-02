import {LngLat, MercatorCoordinate, type Map} from 'maplibre-gl';

export type XY=[number,number];
export type FarFrame={center:XY;zoom:number;pitch:number;bearing:number;footprint:XY[]};
export type PanBounds={origin:XY;bearing:number;left?:number;right?:number;top?:number;bottom?:number};
export type MovementLimits={frame?:FarFrame;pan?:PanBounds};
export const plane=(p:XY):XY=>{const m=MercatorCoordinate.fromLngLat(p);return [m.x,m.y];};
const location=(p:XY)=>new MercatorCoordinate(...p).toLngLat();
export function rotated(p:XY,bearing:number):XY {const a=bearing*Math.PI/180;return [p[0]*Math.cos(a)+p[1]*Math.sin(a),-p[0]*Math.sin(a)+p[1]*Math.cos(a)];}
export function captureFrame(map:Map):FarFrame {
 const c=map.getCenter(),center:XY=[c.lng,c.lat],origin=plane(center),el=map.getContainer();
 return {center,zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),footprint:([[0,0],[el.clientWidth,0],[el.clientWidth,el.clientHeight],[0,el.clientHeight]] as XY[]).map(p=>{const ll=map.unproject(p),m=plane([ll.lng,ll.lat]);return [m[0]-origin[0],m[1]-origin[1]];})};
}
function clampPolygon(p:XY,polygon:XY[]):XY {
 let inside=true,best:XY=p,distance=Infinity;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dy=b[1]-a[1];
  if(dx*(p[1]-a[1])-dy*(p[0]-a[0])<-1e-16)inside=false;
  const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
  const q:XY=[a[0]+t*dx,a[1]+t*dy],d=(q[0]-p[0])**2+(q[1]-p[1])**2;
  if(d<distance){distance=d;best=q;}
 }
 return inside?p:best;
}
function clip(polygon:XY[],value:(p:XY)=>number):XY[]{
 const result:XY[]=[];
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],va=value(a),vb=value(b);
  if(va>=0)result.push(a);
  if((va>=0)!==(vb>=0)){const t=va/(va-vb);result.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
 }
 return result;
}
export function constrainCenter(center:LngLat,zoom:number,limits:MovementLimits):LngLat {
 const original=plane([center.lng,center.lat]);let p:XY=[...original];
 const pan=limits.pan;
 if(pan){
  const o=plane(pan.origin),v=rotated([p[0]-o[0],p[1]-o[1]],pan.bearing);
  v[0]=Math.max(pan.left??-Infinity,Math.min(pan.right??Infinity,v[0]));
  v[1]=Math.max(pan.top??-Infinity,Math.min(pan.bottom??Infinity,v[1]));
  const d=rotated(v,-pan.bearing);p=[o[0]+d[0],o[1]+d[1]];
 }
 const frame=limits.frame;
 if(frame){
  const o=plane(frame.center),factor=Math.max(0,1-2**(frame.zoom-zoom));
  if(factor<1e-8)return new LngLat(...frame.center);
  else {
   let polygon=frame.footprint.map(v=>[o[0]+v[0]*factor,o[1]+v[1]*factor] as XY);
   if(pan){const origin=plane(pan.origin);for(const side of ['left','right','top','bottom'] as const){const limit=pan[side];if(limit===undefined)continue;polygon=clip(polygon,p=>{const v=rotated([p[0]-origin[0],p[1]-origin[1]],pan.bearing),n=v[side==='left'||side==='right'?0:1];return side==='left'||side==='top'?n-limit:limit-n;});}}
   p=polygon.length?clampPolygon(p,polygon):o;
  }
 }
 if(Math.abs(p[0]-original[0])<1e-16&&Math.abs(p[1]-original[1])<1e-16)return center;
 return location(p);
}
export function readMovement(value:unknown):MovementLimits {
 if(value===undefined)return {};
 if(!value||typeof value!=='object')throw Error('Limites de déplacement invalides');
 const s=value as MovementLimits;
 const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
 const pair=(v:unknown):v is XY=>Array.isArray(v)&&v.length===2&&v.every(finite);
 const coord=(v:unknown):v is XY=>pair(v)&&Math.abs(v[0])<=180&&Math.abs(v[1])<=85;
 if(s.frame&&(!coord(s.frame.center)||!finite(s.frame.zoom)||s.frame.zoom<0||s.frame.zoom>22||!finite(s.frame.pitch)||s.frame.pitch<0||s.frame.pitch>60||!finite(s.frame.bearing)||!Array.isArray(s.frame.footprint)||s.frame.footprint.length!==4||!s.frame.footprint.every(pair)))throw Error('Cadrage invalide');
 if(s.pan&&(!coord(s.pan.origin)||!finite(s.pan.bearing)||(['left','right','top','bottom'] as const).some(k=>s.pan![k]!==undefined&&!finite(s.pan![k]))||(s.pan.left??-Infinity)>(s.pan.right??Infinity)||(s.pan.top??-Infinity)>(s.pan.bottom??Infinity)))throw Error('Bornes invalides');
 return structuredClone(s);
}
