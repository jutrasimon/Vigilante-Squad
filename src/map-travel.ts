import type {Map as MapLibreMap,GeoJSONSource} from 'maplibre-gl';
import {createRoadRouter,roadDistance,type RoadCoord} from './map-roads';
export type Journey={path:RoadCoord[];next:number;destination:string};
export type Traveller={id:string;position:RoadCoord;journey?:Journey;color?:string;speed?:number;kind?:string};
export function createTravel(map:MapLibreMap,actors:()=>Traveller[],speed:()=>number,changed:()=>void,arrived:(id:string)=>void,status:(text:string)=>void,positioned:(id:string,position:RoadCoord)=>void){
 const roads=createRoadRouter(map);let last=0,saved=0,rendered=0;
 map.addSource('scene-routes',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 map.addLayer({id:'scene-route-shadow',type:'line',source:'scene-routes',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#09121b','line-width':7,'line-opacity':.65}});
 map.addLayer({id:'scene-route-line',type:'line',source:'scene-routes',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','color'],'line-width':3,'line-dasharray':[2,1.3]}});
 function draw(){(map.getSource('scene-routes') as GeoJSONSource)?.setData({type:'FeatureCollection',features:actors().filter(a=>a.journey).map(a=>({type:'Feature',properties:{id:a.id,color:a.color||'#78dcde'},geometry:{type:'LineString',coordinates:[a.position,...a.journey!.path.slice(a.journey!.next)]}}))});}
 function stop(id:string){const a=actors().find(a=>a.id===id);if(a)delete a.journey;draw();}
 function send(id:string,target:RoadCoord,label='Destination',ring?:RoadCoord[]){const a=actors().find(a=>a.id===id);if(!a)return false;const path=roads.get().route(a.position,target,!!a.kind,ring);if(path.length<2){stop(id);status('Aucun trajet routier accessible dans les rues chargées. Dézoome pour charger le secteur ou choisis une destination plus proche.');changed();return false;}a.position=[...path[0]];a.journey={path,next:1,destination:label};positioned(id,a.position);draw();changed();status(`Trajet vers ${label} · suit les rues.`);return true;}
 function tick(now:number){const dt=Math.min(.1,(now-(last||now))/1000);last=now;let moving=false;const done:string[]=[];for(const a of actors()){const j=a.journey;if(!j)continue;moving=true;let distance=(a.speed??(a.kind?30:18))/3.6*speed()*dt;while(distance>0&&j.next<j.path.length){const to=j.path[j.next],length=roadDistance(a.position,to);if(length<=distance+.001){a.position=[...to];distance-=length;j.next++;}else{const t=distance/length;a.position=[a.position[0]+(to[0]-a.position[0])*t,a.position[1]+(to[1]-a.position[1])*t];distance=0;}}positioned(a.id,a.position);if(j.next>=j.path.length){delete a.journey;done.push(a.id);}}
  if(moving&&now-rendered>80){draw();rendered=now;}if(moving&&now-saved>500){changed();saved=now;}for(const id of done){draw();changed();arrived(id);}requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);draw();return {send,stop,draw,network:()=>roads.get()};
}
