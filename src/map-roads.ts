import type {Map as MapLibreMap} from 'maplibre-gl';
import type {Feature,Geometry} from 'geojson';
import {shortestPath} from './pathfinding';
export type RoadCoord=[number,number];
type Segment={a:RoadCoord;b:RoadCoord;level:string;car:boolean;cuts:number[]};
const xy=(p:RoadCoord):RoadCoord=>[p[0]*111320,Math.log(Math.tan(Math.PI/4+p[1]*Math.PI/360))*6378137];
const ll=(p:RoadCoord):RoadCoord=>[p[0]/111320,(2*Math.atan(Math.exp(p[1]/6378137))-Math.PI/2)*180/Math.PI];
const dist=(a:RoadCoord,b:RoadCoord)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const lerp=(a:RoadCoord,b:RoadCoord,t:number):RoadCoord=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
export const roadDistance=(a:RoadCoord,b:RoadCoord)=>dist(xy(a),xy(b))*Math.cos(a[1]*Math.PI/180);
export function insideZone(p:RoadCoord,ring:RoadCoord[]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function project(p:RoadCoord,a:RoadCoord,b:RoadCoord){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return {point:lerp(a,b,t),t};}
// A one-metre calculation contour avoids repeatedly inspecting every smoothed pencil vertex.
function calculationContour(ring:RoadCoord[],tolerance:number){if(!tolerance||ring.length<40)return ring;const points=ring.map(xy),keep=new Set([0,ring.length-1]),stack=[[0,ring.length-1]],limit=tolerance/Math.cos(ring[0][1]*Math.PI/180);while(stack.length){const [a,b]=stack.pop()!;let far=-1,best=limit;for(let i=a+1;i<b;i++){const distance=dist(points[i],project(points[i],points[a],points[b]).point);if(distance>best){best=distance;far=i;}}if(far!==-1){keep.add(far);stack.push([a,far],[far,b]);}}return [...keep].sort((a,b)=>a-b).map(i=>ring[i]);}
function zoneCuts(a:RoadCoord,b:RoadCoord,ring:RoadCoord[]){const cuts=[0,1],rx=b[0]-a[0],ry=b[1]-a[1];for(let i=1;i<ring.length;i++){const c=ring[i-1],d=ring[i],sx=d[0]-c[0],sy=d[1]-c[1],den=rx*sy-ry*sx;if(Math.abs(den)<1e-18)continue;const dx=c[0]-a[0],dy=c[1]-a[1],t=(dx*sy-dy*sx)/den,u=(dx*ry-dy*rx)/den;if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);}return cuts.sort((x,y)=>x-y);}
export class RoadNetwork{
 private sectorCache=new WeakMap<RoadCoord[],Map<number,RoadNetwork>>();
 private candidateCache?:RoadCoord[];
 nodes:RoadCoord[]=[];edges=new Map<number,Map<number,{cost:number;car:boolean}>>();segments:{a:number;b:number;car:boolean}[]=[];
 constructor(features:Feature<Geometry>[]){
  const raw:Segment[]=[],seen=new Set<string>(),portals=new Map<string,Set<string>>();
  const coordKey=(p:RoadCoord)=>p.map(n=>Math.round(n*5)).join(',');
  for(const f of features){const p=f.properties||{},kind=String(p.class||p.highway||'street');if(/rail|ferry|aerial|motorway|construction/.test(kind))continue;if(p.access==='no'||p.access==='private')continue;
   const lines=f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.type==='MultiLineString'?f.geometry.coordinates:[];
   const level=String(p.layer??(p.brunnel==='bridge'?1:p.brunnel==='tunnel'?-1:0)),car=!/path|footway|pedestrian|steps|cycleway/.test(kind);
   for(const line of lines){for(const p of [line[0],line.at(-1)])if(p){const k=coordKey(xy(p as RoadCoord)),levels=portals.get(k)||new Set<string>();levels.add(level);portals.set(k,levels);} }
   for(const line of lines)for(let i=1;i<line.length;i++){const a=xy(line[i-1] as RoadCoord),b=xy(line[i] as RoadCoord);if(dist(a,b)<.05)continue;const key=[a,b].map(v=>v.map(n=>Math.round(n*10)).join(',')).sort().join(':')+':'+level;if(seen.has(key))continue;seen.add(key);raw.push({a,b,level,car,cuts:[0,1]});}
  }
  // Spatial buckets keep intersection splitting local. Bridge/tunnel levels never connect at crossings.
  const buckets=new Map<string,number[]>();raw.forEach((s,i)=>{const minX=Math.floor(Math.min(s.a[0],s.b[0])/120),maxX=Math.floor(Math.max(s.a[0],s.b[0])/120),minY=Math.floor(Math.min(s.a[1],s.b[1])/120),maxY=Math.floor(Math.max(s.a[1],s.b[1])/120);for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){const k=`${s.level}:${x}:${y}`;const b=buckets.get(k)||[];b.push(i);buckets.set(k,b);}});
  const pairs=new Set<string>();for(const ids of buckets.values())for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++){const i=ids[a],j=ids[b],key=`${i}:${j}`;if(pairs.has(key))continue;pairs.add(key);const s=raw[i],t=raw[j],rx=s.b[0]-s.a[0],ry=s.b[1]-s.a[1],sx=t.b[0]-t.a[0],sy=t.b[1]-t.a[1],dx=t.a[0]-s.a[0],dy=t.a[1]-s.a[1],den=rx*sy-ry*sx;
   if(Math.abs(den)>.000001){const u=(dx*sy-dy*sx)/den,v=(dx*ry-dy*rx)/den;if(u>=-1e-7&&u<=1+1e-7&&v>=-1e-7&&v<=1+1e-7){s.cuts.push(Math.max(0,Math.min(1,u)));t.cuts.push(Math.max(0,Math.min(1,v)));}}
   else for(const [p,line] of [[s.a,t],[s.b,t],[t.a,s],[t.b,s]] as [RoadCoord,Segment][]){const q=project(p,line.a,line.b);if(dist(p,q.point)<.15)line.cuts.push(q.t);}
  }
  const nodes=new Map<string,number>();const node=(p:RoadCoord,level:string)=>{const key=coordKey(p),k=key+':'+((portals.get(key)?.size??0)>1?'junction':level);let id=nodes.get(k);if(id===undefined){id=this.nodes.length;nodes.set(k,id);this.nodes.push(ll(p));this.edges.set(id,new Map());}return id;};
  for(const s of raw){const cuts=[...new Set(s.cuts)].sort((a,b)=>a-b);for(let i=1;i<cuts.length;i++){const a=node(lerp(s.a,s.b,cuts[i-1]),s.level),b=node(lerp(s.a,s.b,cuts[i]),s.level);if(a===b)continue;const cost=roadDistance(this.nodes[a],this.nodes[b]),old=this.edges.get(a)!.get(b);this.edges.get(a)!.set(b,{cost,car:s.car||!!old?.car});this.edges.get(b)!.set(a,{cost,car:s.car||!!old?.car});}}
  for(const [a,edges] of this.edges)for(const [b,e] of edges)if(a<b)this.segments.push({a,b,car:e.car});
 }
 route(from:RoadCoord,to:RoadCoord,vehicle=false,ring?:RoadCoord[]):RoadCoord[]{
  const allowed=(a:RoadCoord,b:RoadCoord)=>{if(!ring)return true;if(!insideZone(a,ring)||!insideZone(b,ring))return false;const cuts=zoneCuts(a,b,ring);return cuts.slice(1).every((t,i)=>insideZone(lerp(a,b,(t+cuts[i])/2),ring));};
  const nearest=(p:RoadCoord)=>{const pos=xy(p);let best:{point:RoadCoord;t:number;edge:{a:number;b:number;car:boolean};distance:number}|undefined;for(const edge of this.segments){if(vehicle&&!edge.car)continue;const a=this.nodes[edge.a],b=this.nodes[edge.b];const q=project(pos,xy(a),xy(b)),distance=dist(pos,q.point);if(ring&&!insideZone(ll(q.point),ring))continue;if(!best||distance<best.distance)best={point:ll(q.point),t:q.t,edge,distance};}return best;};
  const a=nearest(from),b=nearest(to);if(!a||!b||a.distance>500||b.distance>500)return [];
  if(a.edge===b.edge&&allowed(a.point,b.point))return [a.point,b.point];
  const start=this.nodes.length,end=start+1,points=[...this.nodes,a.point,b.point];
  const extra=new Map<number,[number,number][]>();const connect=(x:number,y:number)=>{if(!allowed(points[x],points[y]))return;const w=roadDistance(points[x],points[y]);extra.set(x,[...(extra.get(x)||[]),[y,w]]);extra.set(y,[...(extra.get(y)||[]),[x,w]]);};connect(start,a.edge.a);connect(start,a.edge.b);connect(end,b.edge.a);connect(end,b.edge.b);
  return shortestPath(start,end,n=>[...[...(this.edges.get(n)||[])].filter(([k,e])=>(!vehicle||e.car)&&allowed(points[n],points[k])).map(([k,e])=>[k,e.cost] as [number,number]),...(extra.get(n)||[])]).map(n=>points[n]);
 }
 /** A drawn sector selects nearby street sections, completing short ends to junctions. */
 sector(ring:RoadCoord[],margin=35):RoadNetwork{
  const cached=this.sectorCache.get(ring)?.get(margin);if(cached)return cached;
  const remember=(net:RoadNetwork)=>{let entries=this.sectorCache.get(ring);if(!entries){entries=new Map();this.sectorCache.set(ring,entries);}entries.set(margin,net);return net;};
  if(this.segments.some(e=>roadDistance(this.nodes[e.a],this.nodes[e.b])>200)){const fine=new RoadNetwork([]);fine.nodes=[...this.nodes];for(const e of this.segments){const a=this.nodes[e.a],b=this.nodes[e.b],n=Math.max(1,Math.ceil(roadDistance(a,b)/150));let previous=e.a;for(let k=1;k<=n;k++){const next=k===n?e.b:fine.nodes.push(lerp(a,b,k/n))-1;const edge={cost:roadDistance(fine.nodes[previous],fine.nodes[next]),car:e.car};for(const [x,y] of [[previous,next],[next,previous]]){if(!fine.edges.has(x))fine.edges.set(x,new Map());fine.edges.get(x)!.set(y,edge);}fine.segments.push({a:previous,b:next,car:e.car});previous=next;}}return remember(fine.sector(ring,margin));}

  const contour=calculationContour(ring,Math.min(1,margin/4)),projected=contour.map(xy),cos=Math.cos(ring[0][1]*Math.PI/180),padding=(margin+65)/cos;
  const xs=projected.map(p=>p[0]),ys=projected.map(p=>p[1]),bounds=[Math.min(...xs)-padding,Math.min(...ys)-padding,Math.max(...xs)+padding,Math.max(...ys)+padding];
  const near=(p:RoadCoord,extra=0)=>{const q=xy(p);if(q[0]<bounds[0]||q[0]>bounds[2]||q[1]<bounds[1]||q[1]>bounds[3])return false;if(insideZone(p,contour))return true;for(let i=1;i<projected.length;i++)if(dist(q,project(q,projected[i-1],projected[i]).point)*cos<=margin+extra)return true;return false;};
  const chosen=new Set<number>();
  this.segments.forEach((e,i)=>{const a=this.nodes[e.a],b=this.nodes[e.b],length=roadDistance(a,b),n=Math.max(2,Math.ceil(length/12));let touches=false,bounded=true;for(let k=0;k<=n;k++){const p=lerp(a,b,k/n);touches ||= near(p);bounded &&= near(p,65);}if(touches&&bounded)chosen.add(i);});
  const links=new Map<number,number[]>();this.segments.forEach((e,i)=>{for(const n of [e.a,e.b])links.set(n,[...(links.get(n)||[]),i]);});
  for(const i of [...chosen]){const e=this.segments[i];for(const end of [e.a,e.b]){let n=end,previous=i,distance=0;const visited=new Set<number>();while((links.get(n)?.length??0)===2){const next=links.get(n)!.find(k=>k!==previous)!;if(visited.has(next)||chosen.has(next))break;visited.add(next);const edge=this.segments[next],other=edge.a===n?edge.b:edge.a;distance+=roadDistance(this.nodes[n],this.nodes[other]);if(distance>65||!near(this.nodes[other],65))break;chosen.add(next);previous=next;n=other;}}}
  const net=new RoadNetwork([]),ids=new Map<number,number>();const local=(id:number)=>{if(!ids.has(id)){ids.set(id,net.nodes.length);net.nodes.push(this.nodes[id]);}return ids.get(id)!;};for(const i of chosen){const e=this.segments[i],a=local(e.a),b=local(e.b);net.segments.push({a,b,car:e.car});for(const [x,y] of [[a,b],[b,a]]){if(!net.edges.has(x))net.edges.set(x,new Map());net.edges.get(x)!.set(y,this.edges.get(e.a)!.get(e.b)!);}}return remember(net);
 }
 /** One fixed road traversal, returned along the same streets when no circuit exists. */
 patrolPath(from:RoadCoord):RoadCoord[]{
  if(!this.segments.length)return [];let start=this.segments[0].a;
  for(const id of this.edges.keys())if(roadDistance(from,this.nodes[id])<roadDistance(from,this.nodes[start]))start=id;
  const seen=new Set([start]),queue=[start];for(let i=0;i<queue.length;i++)for(const id of this.edges.get(queue[i])!.keys())if(!seen.has(id)){seen.add(id);queue.push(id);}
  const farthest=(origin:number)=>queue.reduce((best,id)=>roadDistance(this.nodes[origin],this.nodes[id])>roadDistance(this.nodes[origin],this.nodes[best])?id:best,origin);
  const a=farthest(start),b=farthest(a),path=shortestPath(a,b,id=>[...(this.edges.get(id)||[])].map(([next,e])=>[next,e.cost] as [number,number])).map(id=>this.nodes[id]);
  if(path.length<2||path.length>10000)return [];if(roadDistance(from,path.at(-1)!)<roadDistance(from,path[0]))path.reverse();return [...path,...path.slice(0,-1).reverse()];
 }
 streetCandidates(){return this.candidateCache??=this.segments.flatMap(e=>[.15,.5,.85].map(t=>lerp(this.nodes[e.a],this.nodes[e.b],t)));}
 containsPosition(p:RoadCoord){return this.segments.some(e=>roadDistance(p,ll(project(xy(p),xy(this.nodes[e.a]),xy(this.nodes[e.b])).point))<5);}
 candidates(ring:RoadCoord[]){const points=this.nodes.filter(p=>insideZone(p,ring));for(const e of this.segments){const a=this.nodes[e.a],b=this.nodes[e.b],cuts=zoneCuts(a,b,ring);for(let i=1;i<cuts.length;i++){for(const t of [.15,.5,.85]){const p=lerp(a,b,cuts[i-1]+(cuts[i]-cuts[i-1])*t);if(insideZone(p,ring))points.push(p);}}}return points;}
}
export function createRoadRouter(map:MapLibreMap){
 let dirty=true,zoom=-1,network:RoadNetwork|undefined;const roadSources=new Set<string>();const cache=new Map<string,Feature<Geometry>>();
 map.on('sourcedata',e=>{if(e.sourceId&&roadSources.has(e.sourceId)&&e.sourceDataType==='content')dirty=true;});
 return {get(){const nextZoom=Math.floor(map.getZoom());if(nextZoom!==zoom){zoom=nextZoom;cache.clear();network=undefined;dirty=true;}if(!dirty&&network)return network;dirty=false;const sources=new Map<string,Set<string|undefined>>();for(const l of map.getStyle().layers){if(l.type!=='line'||!('source'in l))continue;const layer='source-layer'in l?l['source-layer']:undefined;if(layer?!/transportation/.test(layer):!/road|street/.test(l.id))continue;roadSources.add(l.source);const set=sources.get(l.source)||new Set();set.add(layer);sources.set(l.source,set);}let added=false;for(const [source,layers] of sources)for(const sourceLayer of layers){let fs:Feature<Geometry>[]=[];try{fs=map.querySourceFeatures(source,sourceLayer?{sourceLayer}:{});}catch{}for(const f of fs){if(!['LineString','MultiLineString'].includes(f.geometry.type))continue;const key=JSON.stringify([f.geometry,f.properties?.class,f.properties?.layer,f.properties?.brunnel]);if(!cache.has(key)&&cache.size<10000){cache.set(key,f);added=true;}}}if(added||!network)network=new RoadNetwork([...cache.values()]);return network;}};
}
