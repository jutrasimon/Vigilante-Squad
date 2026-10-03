import type {Map as MapLibreMap} from 'maplibre-gl';
import type {Polygon,MultiPolygon} from 'geojson';
import {defaultExplosion,type JuiceConfig} from './map-juice-state';
import {footprintSamples} from './map-rubble';
/** Bounded particles anchored across the footprint, reprojected on every frame. */
export function destructionVfx(map:MapLibreMap,viewport:HTMLElement,position:()=>[number,number],c:JuiceConfig,geometry?:Polygon|MultiPolygon){
 const canvas=document.createElement('canvas');canvas.className='juice-canvas destruction-vfx';canvas.setAttribute('aria-hidden','true');viewport.append(canvas);const ctx=canvas.getContext('2d')!,dpr=Math.min(devicePixelRatio||1,2),style={...defaultExplosion(),...c.explosion},reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const origins=geometry?footprintSamples(geometry,reduced?20:72):[position()],particles=origins.map((p,i)=>({p,angle:i*2.39996,seed:(i*37%101)/101})),smoke=c.effects.includes('smoke'),debris=c.effects.includes('debris'),burst=c.effects.includes('burst'),duration=c.duration*(smoke||debris?8:1),start=performance.now();let raf=0,stopped=false;
 const stop=()=>{stopped=true;cancelAnimationFrame(raf);canvas.remove();};
 function tick(now:number){if(stopped)return;const t=(now-start)/duration,boom=Math.min(1,(now-start)/c.duration);if(t>=1){stop();return;}
 const w=viewport.clientWidth,h=viewport.clientHeight;if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}ctx.clearRect(0,0,w,h);
 const center=map.project(position()),pixelsPerMeter=2**map.getZoom()/(156543.03*Math.cos(position()[1]*Math.PI/180)),radius=Math.max(2,Math.min(160,pixelsPerMeter*9))*style.scale*c.intensity;
 for(const q of particles){const p=map.project(q.p),x=center.x+(p.x-center.x)*style.scale,y=center.y+(p.y-center.y)*style.scale;
 if(burst&&boom<1){ctx.globalAlpha=(1-boom)*.85;const r=radius*(.4+boom),g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff7cc');g.addColorStop(.3,c.color);g.addColorStop(1,`${c.color}00`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 if(smoke&&style.smoke>0){const phase=Math.min(1,t*1.2),r=radius*(.5+phase*1.8),sy=y-phase*radius*5*style.rise;ctx.globalAlpha=style.smoke*Math.min(1,t*18)*(1-t)*.6;const g=ctx.createRadialGradient(x,sy,0,x,sy,r);g.addColorStop(0,q.seed>.5?'#262a2d':'#5b5752');g.addColorStop(.65,'#393a39');g.addColorStop(1,'#393a3900');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,sy,r,0,Math.PI*2);ctx.fill();}
 if(debris&&style.debris>0&&boom<1){const travel=reduced?0:boom,dist=radius*(1+q.seed)*style.debris,dx=Math.cos(q.angle)*dist*travel,dy=Math.sin(q.angle)*dist*travel*.5-radius*Math.sin(travel*Math.PI);ctx.globalAlpha=(1-boom)*.95;ctx.fillStyle=boom<.2?c.color:'#75675a';const size=Math.max(2,radius*.12);ctx.fillRect(x+dx,y+dy,size,size*.7);}}
 ctx.globalAlpha=1;raf=requestAnimationFrame(tick);
 }raf=requestAnimationFrame(tick);return {cancel:stop};
}
