import morphdom from 'morphdom';
import './style.css';
import {Simulation,NIGHT,choices,route,type Agent,type IdleTask,type Stat} from './simulation';
import {createMap} from './map';
let sim=new Simulation(), selectedIncident='gare',selected=new Set<string>(),speed=1,paused=false,seed=42;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><div class="brand">VIGILANTE <b>SQUAD</b><small>PREMIÈRE NUIT · PROTO WEB 0.5</small></div><div class="clock"><strong id="clock">22:00</strong><span>LES HALLES</span></div><button id="help" class="quiet" aria-label="Comment jouer">?</button></header>
<main><section class="city"><div class="map-heading"><span>QUARTIER SOUS SURVEILLANCE</span><span class="live">● DIRECT</span></div><div id="map" aria-label="Carte du quartier, agents et interventions. Les alertes sont aussi accessibles dans la liste."></div><div class="map-tools"><span><i class="legend crew"></i> Équipe <i class="legend police"></i> Police <i class="legend alert"></i> Alerte</span><div><button id="zoomout" aria-label="Réduire la carte">−</button><button id="zoomin" aria-label="Agrandir la carte">+</button></div></div><div id="alerts" class="alert-list"></div></section>
<aside><div class="section-title">INTERVENTION <span id="count"></span></div><div id="incident"></div></aside>
<section class="squad"><div class="section-title">VOTRE ÉQUIPE <span id="selection-label">Toucher pour sélectionner</span><button id="profiles" class="text-button">Profils</button></div><div id="agents"></div><div class="assign hint">Clique sur un héros pour préparer son intervention.</div></section>
</main>
<footer><button id="radio">Radio <span id="radio-count">0</span></button><span class="lab-label">LABO <b id="remaining">4 min / nuit</b></span><div><button id="pause">Pause test</button><button id="speed">×1</button><button id="replay">Rejouer</button><button id="finish">Bilan</button></div></footer>
<dialog id="intro"><span class="eyebrow">TEST 01 / UNE NUIT AUX HALLES</span><h1>On prend<br>la relève.</h1><p>Trois personnes. Un quartier. Les alertes continuent pendant vos interventions.</p><ol><li>Ouvre une alerte et clique sur Intervenir.</li><li>Compare les héros, compose ton équipe, puis confirme l’envoi.</li><li>À leur arrivée, choisis une approche selon leur profil.</li></ol><p class="muted">Nuit de 4 minutes. Pause et accélération sont des outils de test. La police intervient aussi.</p><button id="start" class="primary">Commencer la nuit <span>→</span></button></dialog>
<dialog id="dispatch-dialog" aria-labelledby="dispatch-title"><div class="dialog-heading"><h2 id="dispatch-title">Préparer l’intervention</h2><button data-close="dispatch-dialog" aria-label="Fermer la préparation">×</button></div><div id="dispatch-context"></div><div id="dispatch-heroes"></div><div id="dispatch-comparison"></div><div class="dispatch-footer"><span id="dispatch-message"></span><button id="confirm-dispatch" class="primary">Envoyer l’équipe →</button></div></dialog><dialog id="summary"></dialog><dialog id="radio-dialog"><div class="dialog-heading"><h2>Radio du quartier</h2><button data-close="radio-dialog" aria-label="Fermer la radio">×</button></div><p id="impact"></p><div id="logs" role="log" aria-live="off"></div></dialog><dialog id="profiles-dialog"><div class="dialog-heading"><h2>Profils de l’équipe</h2><button data-close="profiles-dialog" aria-label="Fermer les profils">×</button></div><div id="profile-content"></div></dialog><div id="toast" role="status"></div>`;
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
 return {label:a.node===5?'Repos au QG':'Disponible',tone:'ready',detail:a.node===5?'Disponible':sim.incidents.find(i=>i.node===a.node)?.place??'Dans le quartier'};
}
function toast(s:string){el('toast').textContent=s;el('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>el('toast').classList.remove('visible'),2400);}
let dispatchIncident='gare',dispatchIntent:'observe'|'intervene'='intervene';
const stats:Stat[]=['Corps','Esprit','Âme'];
function openDispatch(intent:'observe'|'intervene',hero?:string){
 dispatchIntent=intent;selected=new Set(hero?[hero]:[]);
 dispatchIncident=selectedIncident;
 const current=sim.visible().find(i=>i.id===dispatchIncident);
 if(!current||!['signal','decision'].includes(current.phase))dispatchIncident=sim.visible().find(i=>['signal','decision'].includes(i.phase))?.id??selectedIncident;
 (el('dispatch-dialog') as HTMLDialogElement).showModal();render();
}
function renderDispatch(){
 const dialog=el('dispatch-dialog') as HTMLDialogElement;if(!dialog.open)return;
 const i=sim.visible().find(i=>i.id===dispatchIncident);
 const valid=!!i&&['signal','decision'].includes(i.phase)&&!sim.ended;
 const team=sim.agents.filter(a=>selected.has(a.id)&&sim.available(a));
 const onSite=i?sim.team(i):[];const combined=[...onSite,...team];
 el('dispatch-title').textContent=dispatchIntent==='observe'?'Préparer l’enquête':'Préparer l’intervention';
 html('dispatch-context',`<label class="event-select">Événement<select id="dispatch-event">${sim.visible().filter(e=>['signal','decision'].includes(e.phase)||e.id===dispatchIncident).map(e=>`<option value="${e.id}" ${e.id===dispatchIncident?'selected':''}>${e.title}${!['signal','decision'].includes(e.phase)?' — indisponible':''}</option>`).join('')}</select></label>${i?`<p>${i.place} · ${valid?`${Math.max(0,Math.ceil((i.phase==='signal'?i.deadline:i.decisionAt+30)-sim.time))} s restantes`:'Envoi fermé'}</p>`:'<p>Aucune alerte disponible.</p>'}`);
 html('dispatch-heroes',sim.agents.map((a,k)=>{const available=sim.available(a);const state=heroStatus(a);return `<button id="pick-${a.id}" data-pick="${a.id}" class="dispatch-hero ${selected.has(a.id)&&available?'selected':''}" aria-pressed="${selected.has(a.id)&&available}" ${!available?'disabled':''}><div class="portrait portrait-${k}"></div><div class="dispatch-hero-info"><strong>${a.name}<span>${selected.has(a.id)&&available?'✓':''}</span></strong><small>${state.label} · ${Math.round(a.energy)}% énergie</small><div class="dispatch-stats">${stats.map(stat=>`<span>${stat} <b>${a.stats[stat]}</b></span>`).join('')}</div><small>${a.tags.join(' · ')}${a.injured?' · Blessé':''}</small></div></button>`;}).join(''));
 html('dispatch-comparison',i?`<h3>Équipe / événement</h3>${onSite.length?`<p>${onSite.map(a=>a.name).join(', ')} déjà sur place, inclus dans les totaux.</p>`:''}<table><thead><tr><th>Attribut</th><th>Total</th><th>Exigence</th><th>Écart</th></tr></thead><tbody>${stats.map(stat=>{const total=combined.reduce((n,a)=>n+a.stats[stat],0),need=i.requirements[stat];return `<tr><th>${stat}</th><td>${total}</td><td>${need}</td><td class="${total>=need?'meets':'shortfall'}">${total>=need?'+':''}${total-need}</td></tr>`;}).join('')}</tbody></table><p class="muted">Totaux additionnés. L’approche utilise son attribut, les talents et l’état des héros.</p><div class="approach-preview">${choices[i.type].map(c=>`<div><span>${c.label}<small>${c.stat} · ${c.tag}</small></span><b>${combined.length?`${sim.chance(i,c,combined)}%`:'—'}</b></div>`).join('')}</div><p class="muted">${dispatchIntent==='observe'?'Enquête : collecte de renseignements, sans résoudre l’événement.':'Chances estimées dans l’état actuel; approche choisie sur place.'} La nuit continue.</p>`:'');
 const eta=i&&team.length?Math.max(...team.map(a=>Math.ceil(route(a.node,i.node).length*5/(a.id==='silas'?.85:1)))):0;
 el('dispatch-message').textContent=!valid?'Cet événement n’accepte plus d’envoi.':team.length?`${team.length} héros · trajet jusqu’à ${eta} s`:'Choisis au moins un héros disponible.';
 (el('confirm-dispatch') as HTMLButtonElement).disabled=!valid||!team.length;
 el('confirm-dispatch').textContent=dispatchIntent==='observe'?'Envoyer enquêter →':'Envoyer l’équipe →';
}
function render(){
 el('clock').textContent=clock();el('remaining').textContent=`${Math.max(0,Math.ceil(NIGHT-sim.time))} s avant la relève`;el('impact').textContent=`${sim.saved} civils aidés · confiance ${sim.trust>0?'+':''}${sim.trust}`;
 const visible=sim.visible();el('count').textContent=`${visible.filter(i=>!['resolved','missed'].includes(i.phase)).length} actives`;
 html('alerts',visible.map(i=>`<button id="alert-${i.id}" data-incident="${i.id}" class="alert-pill ${i.id===selectedIncident?'selected':''} ${['resolved','missed'].includes(i.phase)?'done':''}"><span>${i.phase==='resolved'?'✓':i.phase==='missed'?'—':'!'}</span>${i.title}${i.phase==='decision'?'<b>CHOIX</b>':i.phase==='working'?`<b>${Math.floor(sim.progress(i))}%</b>`:''}</button>`).join(''));
 html('agents',sim.agents.map((a,k)=>{const state=heroStatus(a);return `<article id="slot-${a.id}" class="agent-slot"><button id="agent-${a.id}" class="agent ${selected.has(a.id)?'selected':''} state-${state.tone}" data-agent="${a.id}" aria-pressed="${selected.has(a.id)}" aria-label="${a.name}, ${state.label}, ${state.detail}"><div class="agent-top"><div id="portrait-${a.id}" class="portrait portrait-${k}"><span class="check">${selected.has(a.id)?'✓':'+'}</span></div><div class="agent-identity"><div class="agent-name"><strong>${a.name}</strong><span>${Math.round(a.energy)}%</span></div><div class="energy"><div style="width:${a.energy}%"></div></div>${a.injured?'<span class="injury">Blessé</span>':''}</div></div><strong class="hero-status status-${state.tone}">${state.label}</strong>${a.task==='mission'&&sim.incidents.find(i=>i.id===a.target)?.phase==='working'?`<div class="hero-progress" aria-label="Progression de ${a.name}"><span style="width:${sim.progress(sim.incidents.find(i=>i.id===a.target)!)}%"></span></div>`:''}<span class="hero-activity">${state.detail}</span><div class="stats"><span>Corps <b>${a.stats.Corps}</b></span><span>Esprit <b>${a.stats.Esprit}</b></span><span>Âme <b>${a.stats['Âme']}</b></span></div></button><label class="idle-setting"><span>Après</span><select data-idle="${a.id}" aria-label="Tâche par défaut de ${a.name}"><option value="rest" ${a.idleTask==='rest'?'selected':''}>Repos au QG</option><option value="patrol" ${a.idleTask==='patrol'?'selected':''}>Patrouille</option></select></label></article>`;}).join(''));
 html('profile-content',sim.agents.map(a=>`<article class="profile"><h3>${a.name} <small>${a.role}</small></h3><p><b>${heroStatus(a).label}</b> · ${heroStatus(a).detail}${a.injured?' · Blessé':''}</p><p>Corps ${a.stats.Corps} · Esprit ${a.stats.Esprit} · Âme ${a.stats['Âme']}</p><div class="tags">${a.tags.map((t,n)=>`<span class="${n===2?'flaw':''}">${t}</span>`).join('')}</div></article>`).join(''));
 el('radio-count').textContent=String(sim.logs.length);

 const i=visible.find(i=>i.id===selectedIncident)||visible[0];if(i){selectedIncident=i.id;const team=sim.team(i);const enroute=sim.agents.filter(a=>a.target===i.id&&a.task==='travel');const usable=sim.agents.filter(a=>selected.has(a.id)&&sim.available(a));
 let controls='';if(i.phase==='signal'||i.phase==='decision')controls=`<div id="dispatch" class="dispatch"><div class="actions"><button id="send-observe" data-prepare="observe">Enquêter</button><button id="send-intervene" data-prepare="intervene" class="primary">${team.length?'Renforcer':'Intervenir'} →</button></div></div>`;
 if(i.phase==='decision')controls=`<div id="decision-${i.id}" class="decision"><span class="eyebrow">SUR PLACE · ${team.map(a=>a.name).join(' + ')}</span><p>${i.reveal}</p>${choices[i.type].map(c=>`<button id="choice-${i.id}-${c.id}" class="choice" data-choice="${c.id}"><strong>${c.label}<b>${sim.chance(i,c)}%</b></strong><span>${c.stat} · ${c.tag} · ${c.duration} s${c.risk?' · risque de blessure':''}</span></button>`).join('')}<p class="muted">Décision autonome dans ${Math.max(0,Math.ceil(30-(sim.time-i.decisionAt)))} s.</p></div>`+controls;
 if(i.phase==='working')controls=`<div class="working"><span class="eyebrow">INTERVENTION EN COURS</span><h3>${i.choice!.label}</h3><div class="progress" role="progressbar" aria-label="Résolution de l’intervention" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor(sim.progress(i))}"><span style="width:${sim.progress(i)}%"></span></div><p><b>${Math.floor(sim.progress(i))}% résolu</b> · ${Math.max(0,Math.ceil(i.finishAt-sim.time))} s restantes · ${team.map(a=>a.name).join(' + ')}</p></div>`;
 if(['resolved','missed'].includes(i.phase))controls=`<div class="outcome ${i.phase==='missed'?'bad':''}"><span class="eyebrow">${i.police?'POLICE':i.phase==='missed'?'ALERTE TERMINÉE':'RAPPORT DE TERRAIN'}</span><h3>${i.outcome}</h3></div>`;
 html('incident',`<div id="incident-head" class="incident-head"><span class="eyebrow">${i.place.toUpperCase()}</span><h2>${i.title}</h2>${i.phase==='signal'?`<p>${i.brief}</p>`:''}</div>${i.known&&i.phase==='signal'?`<div class="intel"><b>RENSEIGNEMENTS +10%</b><p>${i.reveal}</p></div>`:''}${enroute.length?`<p class="arrival">↗ ${enroute.map(a=>a.name).join(', ')} en route</p>`:''}${i.phase==='signal'?`<p class="deadline">Fenêtre d’intervention : ${Math.max(0,Math.ceil(i.deadline-sim.time))} s</p>`:''}${controls}`);
 }
 html('logs',sim.logs.slice(0,14).map(l=>`<div><time>+${Math.floor(l.time)}s</time><span>${l.text}</span></div>`).join('')||'<p class="muted">La radio est silencieuse.</p>');
 el('selection-label').textContent=`${sim.agents.filter(a=>sim.available(a)).length} disponibles`;renderDispatch();
 el('pause').textContent=paused?'Reprendre':'Pause test';el('speed').textContent=`×${speed}`;
}
function reset(){sim=new Simulation(seed);selectedIncident='gare';selected=new Set<string>();paused=false;sim.start();render();}
function summary(){(el('dispatch-dialog') as HTMLDialogElement).close();const d=el('summary') as HTMLDialogElement;d.innerHTML=`<span class="eyebrow">FIN DE SERVICE / ${clock()}</span><h1>La nuit laisse<br>des traces.</h1><div class="results"><div><b>${sim.saved}</b>Civils aidés</div><div><b>${sim.trust>0?'+':''}${sim.trust}</b>Confiance</div><div><b>${sim.agents.filter(a=>a.injured).length}</b>Blessé(s)</div></div>${sim.incidents.map(i=>`<div class="report"><b>${i.title}</b><p>${i.outcome||'Pas encore signalée.'}</p></div>`).join('')}<p class="muted">À observer : choix des agents, utilité de l’enquête, temps morts et décisions prises par défaut.</p><button id="same-night" class="primary">Rejouer la même nuit</button><button id="new-night">Varier les jets</button>`;d.showModal();el('same-night').onclick=()=>{d.close();reset();};el('new-night').onclick=()=>{seed++;d.close();reset();};}
app.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('button');if(!b)return;feedback(b);
 if(b.dataset.incident){selectedIncident=b.dataset.incident;render();map.focus();}
 if(b.dataset.agent){openDispatch('intervene',b.dataset.agent);}
 if(b.dataset.close)(el(b.dataset.close) as HTMLDialogElement).close();
 if(b.dataset.prepare)openDispatch(b.dataset.prepare as 'observe'|'intervene');
 if(b.dataset.pick){const a=sim.agents.find(a=>a.id===b.dataset.pick)!;if(sim.available(a)){selected.has(a.id)?selected.delete(a.id):selected.add(a.id);}render();}
 if(b.id==='confirm-dispatch'){
  const ok=sim.dispatch(dispatchIncident,[...selected],dispatchIntent);
  if(ok){selectedIncident=dispatchIncident;selected.clear();(el('dispatch-dialog') as HTMLDialogElement).close();toast(dispatchIntent==='observe'?'Enquête assignée. Agents en route.':'Ordre reçu. Agents en route.');map.focus();}else toast('Envoi impossible : vérifie l’événement et les héros disponibles.');render();
 }
 if(b.dataset.choice){if(sim.choose(selectedIncident,b.dataset.choice))toast('Approche confirmée. Intervention en cours.');render();}
 if(b.dataset.duty){let n=0;for(const id of selected)if(b.dataset.duty==='investigate'?sim.assign(id,'investigate'):sim.setIdleTask(id,b.dataset.duty==='patrol'?'patrol':'rest'))n++;toast(n?`${n} agent(s) réaffecté(s).`:'Sélectionne un agent disponible.');render();}
});
app.addEventListener('change',e=>{const select=e.target as HTMLSelectElement;if(select.id==='dispatch-event'){dispatchIncident=select.value;render();}if(select.dataset.idle){sim.setIdleTask(select.dataset.idle,select.value as IdleTask);render();}});
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
