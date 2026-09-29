export type Stat = 'Corps' | 'Esprit' | 'Âme';
export type IdleTask = 'rest' | 'patrol';
export type Phase = 'signal' | 'decision' | 'working' | 'resolved' | 'missed';
export const NIGHT = 240;
export const xs=[90,235,380,525,710], ys=[90,225,360,495];
export const node=(x:number,y:number)=>y*5+x;
export const position=(n:number)=>({x:xs[n%5],y:ys[Math.floor(n/5)]});
// The river is between columns 3 and 4. Only two bridges.
export function neighbours(n:number):number[]{
 const x=n%5,y=Math.floor(n/5); const out:number[]=[];
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a<0||a>4||b<0||b>3)continue;if(((x===3&&a===4)||(x===4&&a===3))&&y!==1&&y!==3)continue;out.push(node(a,b));}return out;
}
export function route(from:number,to:number){const queue=[from],prev=new Map<number,number>();prev.set(from,-1);for(let i=0;i<queue.length;i++){const n=queue[i];if(n===to)break;for(const next of neighbours(n))if(!prev.has(next)){prev.set(next,n);queue.push(next);}}if(!prev.has(to))return [];const path=[to];while(path[0]!==from)path.unshift(prev.get(path[0])!);return path.slice(1);}
export interface Agent {id:string;name:string;role:string;stats:Record<Stat,number>;tags:string[];energy:number;hp:number;maxHp:number;sanity:number;maxSanity:number;injured:boolean;node:number;path:number[];move:number;task:'idle'|'travel'|'patrol'|'investigate'|'mission'|'return';target?:string;intent?:'observe'|'intervene';timer:number;idleTask:IdleTask;patrolStop:number;}
export interface Choice {id:string;label:string;stat:Stat;tag:string;duration:number;bonus:number;risk:boolean;}
export interface Incident {history:{time:number;text:string}[];report?:{names:string[];chance:number;roll:number;civils:number;trust:number;injured:string[]};requirements:Record<Stat,number>;id:string;title:string;place:string;node:number;at:number;deadline:number;brief:string;reveal:string;phase:Phase;known:boolean;agents:string[];decisionAt:number;finishAt:number;choice?:Choice;outcome?:string;success?:boolean;police:boolean;type:'conflict'|'rescue'|'tech'|'media';}
export const choices:Record<Incident['type'],Choice[]>={
 conflict:[{id:'talk',label:'Désamorcer la confrontation',stat:'Âme',tag:'Médiation',duration:15,bonus:0,risk:false},{id:'secure',label:'Protéger les civils',stat:'Corps',tag:'Protection',duration:10,bonus:-5,risk:true}],
 rescue:[{id:'evacuate',label:'Évacuer par les escaliers',stat:'Corps',tag:'Protection',duration:16,bonus:0,risk:true},{id:'guide',label:'Guider vers le toit',stat:'Esprit',tag:'Repérage',duration:22,bonus:5,risk:false}],
 tech:[{id:'repair',label:'Isoler le circuit défectueux',stat:'Esprit',tag:'Électronique',duration:18,bonus:0,risk:true},{id:'cordon',label:'Sécuriser le passage',stat:'Âme',tag:'Médiation',duration:12,bonus:10,risk:false}],
 media:[{id:'explain',label:'Expliquer notre intervention',stat:'Âme',tag:'Médiation',duration:14,bonus:5,risk:false},{id:'evidence',label:'Présenter les faits recueillis',stat:'Esprit',tag:'Repérage',duration:18,bonus:0,risk:false}]
};
export class Simulation {
 time=0;started=false;ended=false;seed:number;agents:Agent[];incidents:Incident[];logs:{time:number;text:string}[]=[];saved=0;trust=0;
 police={node:19,path:[] as number[],move:0,target:'' ,arrivedAt:0};
 constructor(seed=42){this.seed=seed;this.agents=[
 {id:'nora',name:'Nora',role:'Repérage / technique',stats:{Corps:4,Esprit:8,'Âme':5},tags:['Repérage','Électronique','Nerveuse']},
 {id:'malik',name:'Malik',role:'Médiation / protection',stats:{Corps:6,Esprit:4,'Âme':8},tags:['Médiation','Protection','Impulsif']},
 {id:'silas',name:'Silas',role:'Protection / technique',stats:{Corps:8,Esprit:6,'Âme':3},tags:['Protection','Électronique','Genou fragile']}
 ].map((a,k)=>({...a,hp:[6,8,10][k],maxHp:[6,8,10][k],sanity:[8,10,6][k],maxSanity:[8,10,6][k],energy:100,injured:false,node:5,path:[],move:0,task:'idle',timer:0,idleTask:'rest',patrolStop:0}) as Agent);
 this.incidents=[
 {id:'gare',title:'Altercation à la gare',place:'Gare Est',node:8,at:0,deadline:95,brief:'Des cris sur le parvis. Le nombre de personnes impliquées est inconnu.',reveal:'Deux civils sont coincés. Un agresseur semble armé; un second bloque la sortie.',type:'conflict'},
 {id:'quai',title:'Montée des eaux',place:'Quai Nord',node:4,at:35,deadline:155,brief:'Un appel coupé signale de l’eau dans un immeuble.',reveal:'Deux résidents sont bloqués à l’étage. L’escalier est encore accessible.',type:'rescue'},
 {id:'transfo',title:'Panne au marché',place:'Marché des Halles',node:16,at:80,deadline:205,brief:'Des étincelles près d’une installation électrique. Des passants s’approchent.',reveal:'Un coffret endommagé alimente encore une zone inondée. Il faut isoler le danger.',type:'tech'},
 {id:'presse',title:'Une vidéo circule',place:'Place Centrale',node:12,at:130,deadline:230,brief:'Une journaliste cherche à comprendre ce qui se passe dans le quartier.',reveal:'Elle a une vidéo partielle de la nuit. Votre version peut changer le récit public.',type:'media'}
  ].map(i=>({...i,requirements:({conflict:{Corps:8,Esprit:6,'Âme':10},rescue:{Corps:12,Esprit:10,'Âme':6},tech:{Corps:6,Esprit:12,'Âme':6},media:{Corps:4,Esprit:8,'Âme':12}} as Record<string,Record<Stat,number>>)[i.type],history:[],phase:'signal',known:false,agents:[],decisionAt:0,finishAt:0,police:false}) as Incident);
 }
 random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 log(text:string){this.logs.unshift({time:this.time,text});}
 start(){if(this.started)return;this.started=true;this.log('Prise de service. Une alerte vous attend à la gare.');}
 visible(){return this.incidents.filter(i=>i.at<=this.time);}
 available(a:Agent){return ['idle','patrol','investigate','return'].includes(a.task)&&a.energy>=15;}
 dispatch(id:string,ids:string[],intent:'observe'|'intervene'){
 const i=this.incidents.find(i=>i.id===id);if(!this.started||this.ended||!i||i.at>this.time||['resolved','missed','working'].includes(i.phase))return false;
 const team=this.agents.filter(a=>ids.includes(a.id)&&this.available(a));if(!team.length)return false;
 for(const a of team){a.path=route(a.node,i.node);a.move=0;a.task='travel';a.target=id;a.intent=intent;}i.history.push({time:this.time,text:`Départ de ${team.map(a=>a.name).join(', ')} vers ${i.place}${intent==='observe'?' pour enquêter':''}.`});this.log(`${team.map(a=>a.name).join(', ')} → ${i.place}${intent==='observe'?' (enquête)':''}.`);return true;
 }
 assign(id:string,task:'patrol'|'investigate'|'return'){
 const a=this.agents.find(a=>a.id===id);if(!this.started||this.ended||!a||!['idle','patrol','investigate','return'].includes(a.task)||(task!=='return'&&a.energy<15))return false;
 a.target=undefined;a.intent=undefined;a.task=task;a.timer=0;a.move=0;a.path=task==='return'?route(a.node,5):route(a.node,task==='patrol'?10:6);return true;
 }
 setIdleTask(id:string,task:IdleTask){
 const a=this.agents.find(a=>a.id===id);if(!a||!this.started||this.ended||!['rest','patrol'].includes(task))return false;
 a.idleTask=task;if(!['travel','mission'].includes(a.task))this.resumeIdle(a);
 this.log(`${a.name} : tâche par défaut — ${task==='rest'?'repos au QG':'patrouille'}.`);return true;
 }
 resumeIdle(a:Agent){
 a.target=undefined;a.intent=undefined;a.timer=0;
 // Complete the current street segment when reassigning a moving hero.
 const next=a.path.length&&a.move>0?a.path[0]:a.node;
 const prefix=next!==a.node?[next]:[];if(!prefix.length)a.move=0;
 if(a.idleTask==='rest'||a.energy<15){a.task=next===5&&!prefix.length?'idle':'return';a.path=[...prefix,...route(next,5)];}
 else{a.task='patrol';a.path=prefix;if(!prefix.length)this.patrolRoute(a);}
 }
 patrolRoute(a:Agent){
 // Sweep the whole map; routes still obey bridges and streets.
 const stops=[0,1,2,3,8,9,4,9,14,19,18,17,16,15,10,11,12,13,8,7,6,5];
 let destination=stops[a.patrolStop%stops.length];a.patrolStop++;
 if(destination===a.node){destination=stops[a.patrolStop%stops.length];a.patrolStop++;}
 a.path=route(a.node,destination);
 }
 encounter(a:Agent){
 if(a.energy<15||a.task==='mission')return false;
 const i=this.visible().find(i=>i.node===a.node&&i.deadline>this.time&&['signal','decision','working'].includes(i.phase)&&!(a.task==='travel'&&a.target===i.id));
 if(!i)return false;
 a.path=[];a.move=0;a.target=i.id;a.intent='intervene';this.engage(a,i);
 this.log(`${a.name} croise une alerte à ${i.place} et s’engage.`);return true;
 }
 engage(a:Agent,i:Incident){
 i.history.push({time:this.time,text:`${a.name} arrive sur place.`});a.task='mission';if(!i.agents.includes(a.id))i.agents.push(a.id);a.energy=Math.max(0,a.energy-5);
 if(i.phase==='signal'){i.phase='decision';i.decisionAt=this.time;this.log(`${a.name} sur place à ${i.place}. ${i.reveal}`);}
 }
 progress(i:Incident){return i.phase==='resolved'?100:i.phase==='working'&&i.choice?Math.max(0,Math.min(100,100*(1-(i.finishAt-this.time)/i.choice.duration))):0;}
 team(i:Incident){return this.agents.filter(a=>i.agents.includes(a.id)&&a.task==='mission'&&a.target===i.id);}
 chance(i:Incident,c:Choice,team:Agent[]=this.team(i)){
 if(!team.length)return 0;
 const total=team.reduce((n,a)=>n+a.stats[c.stat],0);
 const specialist=team.some(a=>a.tags.includes(c.tag))?15:0;
 const penalty=team.reduce((n,a)=>n+(a.injured?15:0)+(a.energy<35?10:0)+(i.type==='conflict'&&a.tags.includes('Nerveuse')?10:0),0);
 return Math.max(15,Math.min(95,50+(total-i.requirements[c.stat])*5+specialist-penalty+(i.known?10:0)+c.bonus));
 }
 choose(id:string,choice:string,automatic=false){const i=this.incidents.find(i=>i.id===id);if(!i||i.phase!=='decision'||!this.started||this.ended)return false;const c=choices[i.type].find(c=>c.id===choice);if(!c)return false;i.choice=c;i.phase='working';i.finishAt=this.time+c.duration;i.history.push({time:this.time,text:`${automatic?'Choix automatique':'Approche choisie'} : ${c.label} (${c.duration} s).`});this.log(`${automatic?'Décision autonome : ':''}${i.place} — ${c.label}.`);return true;}
 release(i:Incident){for(const a of this.agents.filter(a=>a.target===i.id)){this.resumeIdle(a);}i.agents=[];}
 resolve(i:Incident){const c=i.choice!;const chance=this.chance(i,c);const roll=Math.floor(this.random()*100)+1;const success=roll<=chance;const team=this.team(i);i.success=success;i.phase='resolved';i.outcome=`${success?'Réussite':'Résultat partiel'} · jet ${roll} / ${chance}%.`;
 for(const a of team){a.energy=Math.max(0,a.energy-18);a.sanity=Math.max(0,a.sanity-(success?1:2));if(!success&&c.risk){a.hp=Math.max(0,a.hp-2);a.injured=true;a.energy=Math.max(0,a.energy-12);}}
 if(i.type==='media'){this.trust+=success?2:-1;i.outcome+=success?' Votre version est diffusée.':' Le reportage reste défavorable.';}else{this.saved+=success?2:1;this.trust+=success?1:0;i.outcome+=success?' Deux civils mis en sécurité.':' Un civil aidé; la situation reste dégradée.';}
 if(!success&&c.risk)i.outcome+=' Blessure légère dans l’équipe.';
 i.report={names:team.map(a=>a.name),chance,roll,civils:i.type==='media'?0:success?2:1,trust:i.type==='media'?(success?2:-1):(success?1:0),injured:!success&&c.risk?team.map(a=>a.name):[]};i.history.push({time:this.time,text:success?'Action terminée : réussite.':'Action terminée : résultat partiel.'});this.log(`${i.place} — ${i.outcome}`);this.release(i);
 }
 advanceAgent(a:Agent,dt:number){
 if(a.task==='patrol'){a.energy=Math.max(0,a.energy-dt*.15);if(a.energy<15)this.resumeIdle(a);}
 if(a.path.length){a.move+=dt*(a.tags.includes('Genou fragile')?0.85:1)/5;if(a.move>=1){a.node=a.path.shift()!;a.move=0;if(this.encounter(a))return;}return;}
 if(this.encounter(a))return;
 if(a.task==='return'){a.task='idle';this.log(`${a.name} est de retour au QG.`);}
 if(a.task==='travel'){
 const i=this.incidents.find(i=>i.id===a.target)!;
 if(['resolved','missed'].includes(i.phase)){this.resumeIdle(a);return;}
 if(a.intent==='observe'){i.history.push({time:this.time,text:`${a.name} termine son enquête : renseignements obtenus.`});i.known=true;a.energy=Math.max(0,a.energy-5);this.log(`${a.name}, enquête à ${i.place} : ${i.reveal}`);this.resumeIdle(a);return;}
 this.engage(a,i);
 }
 if(a.task==='patrol')this.patrolRoute(a);
 if(a.task==='investigate'){a.timer+=dt;if(a.timer>=20){a.timer=0;const unknown=this.visible().find(i=>!i.known&&i.phase==='signal');if(unknown){unknown.known=true;this.log(`${a.name} : renseignements obtenus à ${unknown.place}.`);}a.energy=Math.max(0,a.energy-3);if(a.energy<15)this.resumeIdle(a);}}
 if(a.task==='idle'&&a.node===5){a.hp=Math.min(a.maxHp,a.hp+dt*.08);a.sanity=Math.min(a.maxSanity,a.sanity+dt*.12);if(a.hp===a.maxHp)a.injured=false;a.energy=Math.min(100,a.energy+dt*.7);if(a.idleTask==='patrol'&&a.energy>=100)this.resumeIdle(a);}
 }
 tick(dt:number){if(!this.started||this.ended)return; // fixed substeps preserve timing at x4
 let left=dt;while(left>0&&!this.ended){const step=Math.min(left,0.25);left-=step;this.step(step);}}
 step(dt:number){const old=this.time;this.time=Math.min(NIGHT,this.time+dt);
 for(const i of this.incidents)if(i.at>old&&i.at<=this.time)this.log(`Nouvelle alerte : ${i.title}.`);
 for(const a of this.agents)this.advanceAgent(a,dt);
 for(const i of this.visible()){
 if(i.phase==='signal'&&this.time>=i.deadline){i.phase='missed';i.outcome='Aucune intervention à temps.';this.trust--;this.log(`${i.place} — alerte perdue.`);this.release(i);}
 if(i.phase==='decision'&&this.time-i.decisionAt>=30){const best=[...choices[i.type]].sort((a,b)=>this.chance(i,b)-this.chance(i,a))[0];this.choose(i.id,best.id,true);}
 if(i.phase==='working'&&this.time>=i.finishAt)this.resolve(i);
 }
 if(this.time>=55&&!this.police.target){const i=this.visible().find(i=>i.phase==='signal');if(i){this.police.target=i.id;this.police.path=route(this.police.node,i.node);this.log(`La police se dirige vers ${i.place}.`);}}
 const p=this.police;if(p.target){if(p.path.length){p.move+=dt/6;if(p.move>=1){p.node=p.path.shift()!;p.move=0;}}else{if(!p.arrivedAt)p.arrivedAt=this.time;const i=this.incidents.find(i=>i.id===p.target)!;if(this.time-p.arrivedAt>16&&i.phase==='signal'){i.phase='resolved';i.police=true;i.outcome='Prise en charge par la police.';this.log(`${i.place} — la police prend le relais.`);this.release(i);}}}
 if(this.time>=NIGHT)this.finish();
 }
 finish(){if(this.ended)return;this.ended=true;for(const i of this.visible())if(!['resolved','missed'].includes(i.phase)){i.phase='missed';i.outcome='Intervention non terminée à la relève.';this.release(i);}this.log('Fin de la nuit. La relève arrive.');}
}
