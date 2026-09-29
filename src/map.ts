import {Simulation,position,neighbours,xs,ys} from './simulation';

/** Persistent SVG nodes. Only attributes change while agents move. */
export function createMap(parent:string,getSim:()=>Simulation,onSelect:(id:string)=>void,getSelected:()=>string){
 const host=document.getElementById(parent)!;
 const rect=(x:number,y:number,w:number,h:number,fill:string)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
 let blocks='',roads='';
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const x=xs[col]+24,y=ys[row]+23,w=xs[col+1]-x-24,h=ys[row+1]-y-23;
  blocks+=rect(x+5,y+6,w,h,'#10171b')+rect(x,y,w,h,(row+col)%2?'#30373c':'#343b41')+`<rect x="${x+3}" y="${y+3}" width="${w-6}" height="${h-6}" fill="none" stroke="#42474b" stroke-width="2"/>`+rect(x+20,y+20,w-40,h-40,'#1d262a');
  for(let bx=x+8;bx<x+w-8;bx+=17)blocks+=rect(bx,y+6,5,3,'#8a784e');
 }
 for(let n=0;n<20;n++)for(const next of neighbours(n))if(next>n){const p=position(n),q=position(next);roads+=`<path d="M${p.x} ${p.y}L${q.x} ${q.y}"/>`;}
 for(let r=0;r<3;r++)blocks+=rect(736,ys[r]+30,48,65,'#343c42')+rect(18,ys[r]+30,46,70,'#343c42');
 const label=(x:number,y:number,t:string,size=13)=>`<text x="${x}" y="${y}" font-size="${size}" class="district">${t}</text>`;
 const units=[...getSim().agents.map((a,k)=>({id:a.id,label:a.name,color:['#e6b94d','#83c3b0','#c7a5cf'][k]})),{id:'police',label:'Police',color:'#77b6ea'}];
 host.innerHTML=`<svg viewBox="0 0 800 580" aria-label="Carte interactive du quartier" role="group" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="water" width="40" height="24" patternUnits="userSpaceOnUse"><path d="M3 10h15M25 19h8" stroke="#285060" opacity=".45"/></pattern></defs><rect width="800" height="580" fill="#161d23"/><rect x="584" width="83" height="580" fill="#0c2936"/><rect x="584" width="83" height="580" fill="url(#water)"/>${blocks}<g fill="none" stroke="#454a4e" stroke-width="20">${roads}</g><g fill="none" stroke="#272e34" stroke-width="14">${roads}</g><g fill="none" stroke="#687075" stroke-width="1" opacity=".5">${roads}</g>${label(294,35,'LES HALLES',19)}${label(294,551,'SAINT-ROCH',19)}${label(742,48,'QUAI NORD')}${label(525,196,'GARE EST')}${label(90,193,'QG')}
 <g class="routes" fill="none">${units.map(u=>`<path id="route-${u.id}" stroke="${u.color}" stroke-width="3" stroke-dasharray="7 6" opacity=".75"/>`).join('')}</g>
 <g class="map-incidents">${getSim().incidents.map(i=>{const p=position(i.node);return `<g class="map-incident" data-map-incident="${i.id}" transform="translate(${p.x} ${p.y})" role="button" tabindex="0" aria-label="${i.title}, ${i.place}"><circle class="map-hit" r="44" fill="transparent"/><circle class="incident-halo" r="29"/><circle class="incident-ring" r="21"/><circle class="incident-timer" r="25" pathLength="100" transform="rotate(-90)" fill="none" stroke-dasharray="100 100"/><text class="incident-symbol" y="7">!</text><text class="incident-label" y="48">${i.place}</text></g>`;}).join('')}</g>
 <g class="units">${units.map(u=>`<g id="unit-${u.id}" style="--unit:${u.color}"><circle r="10"/><text y="-20">${u.label}</text></g>`).join('')}</g></svg>`;
 const svg=host.querySelector('svg')!;
 const incidentNodes=new Map([...host.querySelectorAll<SVGGElement>('[data-map-incident]')].map(n=>[n.dataset.mapIncident!,n]));
 const unitNodes=new Map(units.map(u=>[u.id,{marker:host.querySelector<SVGGElement>(`#unit-${u.id}`)!,path:host.querySelector<SVGPathElement>(`#route-${u.id}`)!}]));
 let level=1,viewX=0,viewY=0,suppressClick=false;
 let drag:{id:number;x:number;y:number;viewX:number;viewY:number;scale:number;moved:boolean}|undefined;
 function paintCamera(){
  const w=800/level,h=580/level;
  // Leave a little room around the city, but never lose the map entirely.
  viewX=Math.max(-w*.35,Math.min(800-w*.65,viewX));viewY=Math.max(-h*.35,Math.min(580-h*.65,viewY));
  svg.setAttribute('viewBox',`${viewX} ${viewY} ${w} ${h}`);
 }
 function camera(){const i=getSim().incidents.find(i=>i.id===getSelected());const p=i?position(i.node):{x:400,y:290};viewX=p.x-400/level;viewY=p.y-290/level;paintCamera();}
 function zoom(next:number,clientX?:number,clientY?:number){
  const matrix=svg.getScreenCTM();if(!matrix)return;
  const anchor=clientX===undefined?new DOMPoint(viewX+400/level,viewY+290/level):new DOMPoint(clientX,clientY!).matrixTransform(matrix.inverse());
  const old=level;level=Math.max(1,Math.min(4,next));
  viewX=anchor.x-(anchor.x-viewX)*old/level;viewY=anchor.y-(anchor.y-viewY)*old/level;paintCamera();
 }
 function activate(target:EventTarget|null){const n=(target as Element)?.closest<SVGGElement>('[data-map-incident]');if(n){onSelect(n.dataset.mapIncident!);}}
 host.addEventListener('click',e=>{if((suppressClick||performance.now()-lastTouch<500)&&e.detail!==0){e.preventDefault();e.stopPropagation();suppressClick=false;return;}activate(e.target);});
 host.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&(e.target as Element).closest('[data-map-incident]')){e.preventDefault();activate(e.target);}});
 host.addEventListener('wheel',e=>{e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?host.clientHeight:1);zoom(level*Math.exp(-Math.max(-500,Math.min(500,delta))*.002),e.clientX,e.clientY);},{passive:false});
 const touches=new Map<number,{x:number;y:number;target:EventTarget|null}>();
 let pinch:{distance:number;level:number;anchor:DOMPoint}|undefined,lastTouch=0;
 function beginPinch(){const [a,b]=[...touches.values()],m=svg.getScreenCTM();if(!a||!b||!m)return;pinch={distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),level,anchor:new DOMPoint((a.x+b.x)/2,(a.y+b.y)/2).matrixTransform(m.inverse())};drag=undefined;suppressClick=true;}
 host.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){
   e.preventDefault();touches.set(e.pointerId,{x:e.clientX,y:e.clientY,target:e.target});host.setPointerCapture(e.pointerId);
   if(touches.size>=2){beginPinch();return;}
  }else if(drag||![0,1].includes(e.button))return;
  if(e.button===1)e.preventDefault();suppressClick=false;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,viewX,viewY,scale:svg.getScreenCTM()?.a||1,moved:false};
 });
 host.addEventListener('pointermove',e=>{
  if(touches.has(e.pointerId)){
   const t=touches.get(e.pointerId)!;t.x=e.clientX;t.y=e.clientY;
   if(pinch&&touches.size>=2){
    e.preventDefault();const [a,b]=[...touches.values()];level=Math.max(1,Math.min(4,pinch.level*Math.hypot(b.x-a.x,b.y-a.y)/pinch.distance));paintCamera();
    const m=svg.getScreenCTM();if(m){const p=new DOMPoint((a.x+b.x)/2,(a.y+b.y)/2).matrixTransform(m.inverse());viewX+=pinch.anchor.x-p.x;viewY+=pinch.anchor.y-p.y;paintCamera();}return;
   }
  }
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<6)return;
  drag.moved=true;suppressClick=true;host.setPointerCapture(e.pointerId);host.classList.add('panning');
  viewX=drag.viewX-dx/drag.scale;viewY=drag.viewY-dy/drag.scale;paintCamera();
 });
 function endDrag(e:PointerEvent){
  const touch=touches.get(e.pointerId);
  if(touch){
   const tap=e.type==='pointerup'&&!pinch&&drag?.id===e.pointerId&&!drag.moved;
   touches.delete(e.pointerId);lastTouch=performance.now();suppressClick=true;
   if(tap)activate(touch.target);
   pinch=undefined;drag=undefined;
   const rest=[...touches.entries()][0];if(rest)drag={id:rest[0],x:rest[1].x,y:rest[1].y,viewX,viewY,scale:svg.getScreenCTM()?.a||1,moved:true};
  }else{if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;drag=undefined;}
  host.classList.remove('panning');if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);
 }
 window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
 host.addEventListener('lostpointercapture',e=>{if(touches.has(e.pointerId)||drag?.id===e.pointerId)endDrag(e);});
 host.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
 function update(){const s=getSim();const symbolScale=matchMedia('(max-width:760px)').matches?Math.max(1,Math.min(3,.85/(svg.getScreenCTM()?.a||1))):1;
  for(const i of s.incidents){const n=incidentNodes.get(i.id)!;const visible=i.at<=s.time&&!['resolved','missed'].includes(i.phase);n.style.display=visible?'':'none';if(!visible)continue;const anchor=position(i.node);n.setAttribute('transform',`translate(${anchor.x} ${anchor.y}) scale(${symbolScale})`);const chosen=i.id===getSelected();n.classList.toggle('selected',chosen);n.classList.toggle('in-progress',i.phase==='working');n.classList.toggle('needs-choice',i.phase==='decision');n.setAttribute('aria-pressed',String(chosen));const duration=i.phase==='signal'?i.deadline-i.at:i.phase==='decision'?30:i.choice?.duration??1;
   const remaining=Math.max(0,(i.phase==='signal'?i.deadline:i.phase==='decision'?i.decisionAt+30:i.finishAt)-s.time);
   const fraction=Math.max(0,Math.min(1,remaining/duration));
   n.querySelector('.incident-timer')!.setAttribute('stroke-dasharray',`${fraction*100} 100`);
   n.classList.toggle('urgent',fraction<.25);n.querySelector('.incident-symbol')!.textContent=String(Math.ceil(remaining));
   n.setAttribute('aria-label',`${i.title}, ${Math.ceil(remaining)} secondes restantes${i.phase==='working'?', résolution en cours':i.phase==='decision'?', décision attendue':''}`);}
  const updateUnit=(id:string,n:number,path:number[],move:number,offset:number)=>{const p=position(n),q=path.length?position(path[0]):p;const x=p.x+(q.x-p.x)*move,y=p.y+(q.y-p.y)*move;const nodes=unitNodes.get(id)!;nodes.marker.setAttribute('transform',`translate(${x+offset*symbolScale} ${y-10*symbolScale}) scale(${symbolScale})`);nodes.path.setAttribute('d',path.length?`M${x} ${y} `+path.map(n=>{const p=position(n);return `L${p.x} ${p.y}`;}).join(' '):'');};
  s.agents.forEach((a,k)=>updateUnit(a.id,a.node,a.path,a.move,k*17-17));updateUnit('police',s.police.node,s.police.path,s.police.move,0);
 }
 update();return{update,focus:camera,reset:()=>{level=1;viewX=0;viewY=0;paintCamera();},zoom:(delta:number)=>zoom(level+delta)};
}
