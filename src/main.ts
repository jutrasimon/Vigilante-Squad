import morphdom from 'morphdom';
import './style.css';
import {Simulation,NIGHT,choices,route,type Agent} from './simulation';
import {createMap} from './map';
let sim=new Simulation(), selectedIncident='gare',selected=new Set(['nora','malik']),speed=1,paused=false,seed=42;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><div class="brand">VIGILANTE <b>SQUAD</b><small>PREMIÈRE NUIT · PROTO WEB 0.3</small></div><div class="clock"><strong id="clock">22:00</strong><span>LES HALLES</span></div><button id="help" class="quiet" aria-label="Comment jouer">?</button></header>
<main><section class="city"><div class="map-heading"><span>QUARTIER SOUS SURVEILLANCE</span><span class="live">● DIRECT</span></div><div id="map" aria-label="Carte du quartier, agents et interventions. Les alertes sont aussi accessibles dans la liste."></div><div class="map-tools"><span><i class="legend crew"></i> Équipe <i class="legend police"></i> Police <i class="legend alert"></i> Alerte</span><div><button id="zoomout" aria-label="Réduire la carte">−</button><button id="zoomin" aria-label="Agrandir la carte">+</button></div></div><div id="alerts" class="alert-list"></div></section>
<aside><div class="section-title">INTERVENTION <span id="count"></span></div><div id="incident"></div></aside>
<section class="squad"><div class="section-title">VOTRE ÉQUIPE <span id="selection-label">Toucher pour sélectionner</span><button id="profiles" class="text-button">Profils</button></div><div id="agents"></div><div class="assign"><button data-duty="patrol">Patrouiller</button><button data-duty="investigate">Enquêter</button><button data-duty="return">Retour au QG</button></div></section>
</main>
<footer><button id="radio">Radio <span id="radio-count">0</span></button><span class="lab-label">LABO <b id="remaining">4 min / nuit</b></span><div><button id="pause">Pause test</button><button id="speed">×1</button><button id="replay">Rejouer</button><button id="finish">Bilan</button></div></footer>
<dialog id="intro"><span class="eyebrow">TEST 01 / UNE NUIT AUX HALLES</span><h1>On prend<br>la relève.</h1><p>Trois personnes. Un quartier. Les alertes continuent pendant vos interventions.</p><ol><li>Sélectionne une alerte et tes agents.</li><li>Enquête pour mieux comprendre, ou envoie-les intervenir.</li><li>À leur arrivée, choisis une approche selon leur profil.</li></ol><p class="muted">Nuit de 4 minutes. Pause et accélération sont des outils de test. La police intervient aussi.</p><button id="start" class="primary">Commencer la nuit <span>→</span></button></dialog>
<dialog id="summary"></dialog><dialog id="radio-dialog"><div class="dialog-heading"><h2>Radio du quartier</h2><button data-close="radio-dialog" aria-label="Fermer la radio">×</button></div><p id="impact"></p><div id="logs" role="log" aria-live="off"></div></dialog><dialog id="profiles-dialog"><div class="dialog-heading"><h2>Profils de l’équipe</h2><button data-close="profiles-dialog" aria-label="Fermer les profils">×</button></div><div id="profile-content"></div></dialog><div id="toast" role="status"></div>`;
const el=(id:string)=>document.getElementById(id)!;
// Morph existing elements instead of destroying pressed/focused controls at each tick.
function html(id:string,content:string){const target=el(id);const next=document.createElement('div');next.innerHTML=content;morphdom(target,next,{childrenOnly:true,onBeforeElUpdated:(from,to)=>!from.isEqualNode(to)});}
let toastTimer=0;
function feedback(button:HTMLElement){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;button.animate([{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:180});}

const clock=()=>{const mins=(22*60+Math.floor(sim.time/NIGHT*480))%(24*60);return `${Math.floor(mins/60).toString().padStart(2,'0')}:${(mins%60).toString().padStart(2,'0')}`;};
function heroStatus(a:Agent){
 const mission=sim.incidents.find(i=>i.id===a.target);
 const eta=a.path.length?Math.ceil((a.path.length-a.move)*5/(a.id==='silas'?.85:1)):0;
 if(a.task==='travel')return {label:'Occupé · trajet',tone:'busy',detail:`${mission?.place??'Déplacement'} · ${eta} s`};
 if(a.task==='mission')return mission?.phase==='decision'?{label:'À décider',tone:'decision',detail:mission.place}:{label:'Occupé · action',tone:'busy',detail:`${mission?.place??'Intervention'} · ${Math.max(0,Math.ceil((mission?.finishAt??sim.time)-sim.time))} s`};
 if(a.task==='return')return {label:'Retour au QG',tone:'duty',detail:eta?`Arrivée dans ${eta} s`:'Arrivée au QG'};
 if(a.task==='patrol')return {label:'Patrouille',tone:'duty',detail:'Réaffectable'};
 if(a.task==='investigate')return {label:'Enquête',tone:'duty',detail:'Réaffectable'};
 if(a.energy<15)return {label:a.node===5?'Récupération':'Épuisé',tone:'tired',detail:a.node===5?'Au QG':'Retour au QG possible'};
 return {label:'Disponible',tone:'ready',detail:a.node===5?'Au QG':sim.incidents.find(i=>i.node===a.node)?.place??'Dans le quartier'};
}
function toast(s:string){el('toast').textContent=s;el('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>el('toast').classList.remove('visible'),2400);}
function render(){
 el('clock').textContent=clock();el('remaining').textContent=`${Math.max(0,Math.ceil(NIGHT-sim.time))} s avant la relève`;el('impact').textContent=`${sim.saved} civils aidés · confiance ${sim.trust>0?'+':''}${sim.trust}`;
 const visible=sim.visible();el('count').textContent=`${visible.filter(i=>!['resolved','missed'].includes(i.phase)).length} actives`;
 html('alerts',visible.map(i=>`<button id="alert-${i.id}" data-incident="${i.id}" class="alert-pill ${i.id===selectedIncident?'selected':''} ${['resolved','missed'].includes(i.phase)?'done':''}"><span>${i.phase==='resolved'?'✓':i.phase==='missed'?'—':'!'}</span>${i.title}${i.phase==='decision'?'<b>CHOIX</b>':''}</button>`).join(''));
 html('agents',sim.agents.map((a,k)=>{const state=heroStatus(a);return `<button id="agent-${a.id}" class="agent ${selected.has(a.id)?'selected':''} state-${state.tone}" data-agent="${a.id}" aria-pressed="${selected.has(a.id)}" aria-label="${a.name}, ${state.label}, ${state.detail}"><div class="agent-top"><div id="portrait-${a.id}" class="portrait portrait-${k}"><span class="check">${selected.has(a.id)?'✓':'+'}</span></div><div class="agent-identity"><div class="agent-name"><strong>${a.name}</strong><span>${Math.round(a.energy)}%</span></div><div class="energy"><div style="width:${a.energy}%"></div></div>${a.injured?'<span class="injury">Blessé</span>':''}</div></div><strong class="hero-status status-${state.tone}">${state.label}</strong><span class="hero-activity">${state.detail}</span><div class="stats"><span>Corps <b>${a.stats.Corps}</b></span><span>Esprit <b>${a.stats.Esprit}</b></span><span>Âme <b>${a.stats['Âme']}</b></span></div></button>`;}).join(''));
 html('profile-content',sim.agents.map(a=>`<article class="profile"><h3>${a.name} <small>${a.role}</small></h3><p><b>${heroStatus(a).label}</b> · ${heroStatus(a).detail}${a.injured?' · Blessé':''}</p><p>Corps ${a.stats.Corps} · Esprit ${a.stats.Esprit} · Âme ${a.stats['Âme']}</p><div class="tags">${a.tags.map((t,n)=>`<span class="${n===2?'flaw':''}">${t}</span>`).join('')}</div></article>`).join(''));
 el('radio-count').textContent=String(sim.logs.length);

 const i=visible.find(i=>i.id===selectedIncident)||visible[0];if(i){selectedIncident=i.id;const team=sim.team(i);const enroute=sim.agents.filter(a=>a.target===i.id&&a.task==='travel');const usable=sim.agents.filter(a=>selected.has(a.id)&&sim.available(a));
 let controls='';if(i.phase==='signal'||(i.phase==='decision'&&usable.length))controls=`<div id="dispatch" class="dispatch"><p class="muted">${usable.length?`${usable.map(a=>a.name).join(' + ')} · trajet ${Math.max(...usable.map(a=>Math.ceil(route(a.node,i.node).length*5/(a.id==='silas'?.85:1))))} s`:'Sélectionne au moins un agent disponible.'}</p><div class="actions"><button id="send-observe" data-send="observe" ${!usable.length?'disabled':''}>Enquêter</button><button id="send-intervene" data-send="intervene" class="primary" ${!usable.length?'disabled':''}>${team.length?'Renforcer':'Intervenir'} →</button></div></div>`;
 if(i.phase==='decision')controls=`<div id="decision-${i.id}" class="decision"><span class="eyebrow">SUR PLACE · ${team.map(a=>a.name).join(' + ')}</span><p>${i.reveal}</p>${choices[i.type].map(c=>`<button id="choice-${i.id}-${c.id}" class="choice" data-choice="${c.id}"><strong>${c.label}<b>${sim.chance(i,c)}%</b></strong><span>${c.stat} · ${c.tag} · ${c.duration} s${c.risk?' · risque de blessure':''}</span></button>`).join('')}<p class="muted">Décision autonome dans ${Math.max(0,Math.ceil(30-(sim.time-i.decisionAt)))} s.</p></div>`+controls;
 if(i.phase==='working')controls=`<div class="working"><span class="eyebrow">INTERVENTION EN COURS</span><h3>${i.choice!.label}</h3><div class="progress"><span style="width:${100*(1-(i.finishAt-sim.time)/i.choice!.duration)}%"></span></div><p>${Math.max(0,Math.ceil(i.finishAt-sim.time))} s · ${team.map(a=>a.name).join(' + ')}</p></div>`;
 if(['resolved','missed'].includes(i.phase))controls=`<div class="outcome ${i.phase==='missed'?'bad':''}"><span class="eyebrow">${i.police?'POLICE':i.phase==='missed'?'ALERTE TERMINÉE':'RAPPORT DE TERRAIN'}</span><h3>${i.outcome}</h3></div>`;
 html('incident',`<div id="incident-head" class="incident-head"><span class="eyebrow">${i.place.toUpperCase()}</span><h2>${i.title}</h2>${i.phase==='signal'?`<p>${i.brief}</p>`:''}</div>${i.known&&i.phase==='signal'?`<div class="intel"><b>RENSEIGNEMENTS +10%</b><p>${i.reveal}</p></div>`:''}${enroute.length?`<p class="arrival">↗ ${enroute.map(a=>a.name).join(', ')} en route</p>`:''}${i.phase==='signal'?`<p class="deadline">Fenêtre d’intervention : ${Math.max(0,Math.ceil(i.deadline-sim.time))} s</p>`:''}${controls}`);
 }
 html('logs',sim.logs.slice(0,14).map(l=>`<div><time>+${Math.floor(l.time)}s</time><span>${l.text}</span></div>`).join('')||'<p class="muted">La radio est silencieuse.</p>');
 el('selection-label').textContent=`${selected.size} sélectionné${selected.size>1?'s':''}`;
 el('pause').textContent=paused?'Reprendre':'Pause test';el('speed').textContent=`×${speed}`;
}
function reset(){sim=new Simulation(seed);selectedIncident='gare';selected=new Set(['nora','malik']);paused=false;sim.start();render();}
function summary(){const d=el('summary') as HTMLDialogElement;d.innerHTML=`<span class="eyebrow">FIN DE SERVICE / ${clock()}</span><h1>La nuit laisse<br>des traces.</h1><div class="results"><div><b>${sim.saved}</b>Civils aidés</div><div><b>${sim.trust>0?'+':''}${sim.trust}</b>Confiance</div><div><b>${sim.agents.filter(a=>a.injured).length}</b>Blessé(s)</div></div>${sim.incidents.map(i=>`<div class="report"><b>${i.title}</b><p>${i.outcome||'Pas encore signalée.'}</p></div>`).join('')}<p class="muted">À observer : choix des agents, utilité de l’enquête, temps morts et décisions prises par défaut.</p><button id="same-night" class="primary">Rejouer la même nuit</button><button id="new-night">Varier les jets</button>`;d.showModal();el('same-night').onclick=()=>{d.close();reset();};el('new-night').onclick=()=>{seed++;d.close();reset();};}
app.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('button');if(!b)return;feedback(b);
 if(b.dataset.incident){selectedIncident=b.dataset.incident;render();map.focus();}
 if(b.dataset.agent){const id=b.dataset.agent;const a=sim.agents.find(a=>a.id===id)!;if(a.task==='travel'||a.task==='mission'){if(a.target)selectedIncident=a.target;toast(`${a.name} : ${heroStatus(a).label.toLowerCase()}.`);map.focus();}else{selected.has(id)?selected.delete(id):selected.add(id);}render();}
 if(b.dataset.close)(el(b.dataset.close) as HTMLDialogElement).close();
 if(b.dataset.send){const ok=sim.dispatch(selectedIncident,[...selected],b.dataset.send as 'observe'|'intervene');if(ok){selected.clear();toast(b.dataset.send==='observe'?'Enquête assignée. Agents en route.':'Ordre reçu. Agents en route.');}else toast('Aucun agent disponible pour cet envoi.');render();}
 if(b.dataset.choice){if(sim.choose(selectedIncident,b.dataset.choice))toast('Approche confirmée. Intervention en cours.');render();}
 if(b.dataset.duty){let n=0;for(const id of selected)if(sim.assign(id,b.dataset.duty as 'patrol'|'investigate'|'return'))n++;toast(n?`${n} agent(s) réaffecté(s).`:'Sélectionne un agent disponible.');render();}
});
el('radio').onclick=()=>{(el('radio-dialog') as HTMLDialogElement).showModal();};
el('profiles').onclick=()=>{(el('profiles-dialog') as HTMLDialogElement).showModal();};
el('start').onclick=()=>{(el('intro') as HTMLDialogElement).close();sim.start();render();};
el('help').onclick=()=>{el('start').textContent=sim.started?'Retour au quartier':'Commencer la nuit →';(el('intro') as HTMLDialogElement).showModal();};
el('pause').onclick=()=>{paused=!paused;render();};el('speed').onclick=()=>{speed=speed===1?2:speed===2?4:1;render();};el('replay').onclick=reset;el('finish').onclick=()=>{sim.finish();render();summary();};
const map=createMap('map',()=>sim,id=>{selectedIncident=id;render();map.focus();},()=>selectedIncident);el('zoomin').onclick=()=>map.zoom(.2);el('zoomout').onclick=()=>map.zoom(-.2);
render();(el('intro') as HTMLDialogElement).showModal();
let last=performance.now(),acc=0;function loop(now:number){const dt=Math.min((now-last)/1000,.5);last=now;const was=sim.ended;if(!paused)sim.tick(dt*speed);map.update();acc+=dt;if(acc>.2){render();acc=0;}if(!was&&sim.ended)summary();requestAnimationFrame(loop);}requestAnimationFrame(loop);
// Read-only snapshot for automated prototype checks. No account or remote state.
Object.defineProperty(window,'vigilante',{get:()=>({time:sim.time,started:sim.started,ended:sim.ended,agents:sim.agents,incidents:sim.incidents,logs:sim.logs})});
