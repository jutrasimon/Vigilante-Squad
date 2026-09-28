import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,route,neighbours,NIGHT,choices} from '../src/simulation.ts';

test('Routes remain on streets and cross only bridges',()=>{for(let from=0;from<20;from++)for(let to=0;to<20;to++){let n=from;for(const next of route(from,to)){assert.ok(neighbours(n).includes(next));n=next;}assert.equal(n,to);}});
test('Complete dispatch, arrival, decision, resolution and release',()=>{const s=new Simulation();s.start();assert.equal(s.dispatch('gare',['malik'],'intervene'),true);s.tick(18);const i=s.incidents[0];assert.equal(i.phase,'decision');assert.equal(s.agents[1].task,'mission');assert.ok(s.chance(i,choices.conflict[0])>50);s.choose('gare','talk');s.tick(16);assert.equal(i.phase,'resolved');assert.equal(s.agents[1].task,'return');assert.ok(i.outcome?.includes('jet'));assert.ok(s.saved>=1);});
test('Investigation uncovers intel without locking the agent',()=>{const s=new Simulation();s.start();s.dispatch('gare',['nora'],'observe');s.tick(18);assert.equal(s.incidents[0].known,true);assert.equal(s.incidents[0].phase,'signal');assert.equal(s.agents[0].task,'return');});
test('Unanswered decisions resolve autonomously and night always ends',()=>{const s=new Simulation();s.start();s.dispatch('gare',['silas'],'intervene');s.tick(NIGHT);assert.equal(s.ended,true);assert.ok(s.logs.some(l=>l.text.includes('autonome')));assert.ok(s.incidents.every(i=>['resolved','missed'].includes(i.phase)));assert.ok(s.agents.every(a=>a.task!=='mission'));});
test('Unavailable agents cannot be dispatched twice, and future alerts cannot be used',()=>{const s=new Simulation();s.start();assert.equal(s.dispatch('presse',['nora'],'intervene'),false);assert.equal(s.dispatch('gare',['nora'],'intervene'),true);assert.equal(s.dispatch('gare',['nora'],'observe'),false);});
test('Police independently resolves an unattended incident',()=>{const s=new Simulation();s.start();s.tick(110);assert.ok(s.incidents.some(i=>i.police&&i.phase==='resolved'));});
test('Seeded results reproduce across frame rates',()=>{const a=new Simulation(42),b=new Simulation(42);for(const s of [a,b]){s.start();s.dispatch('gare',['malik'],'intervene');}a.tick(100);for(let i=0;i<400;i++)b.tick(.25);assert.equal(a.incidents[0].outcome,b.incidents[0].outcome);assert.equal(a.saved,b.saved);});

test('Exhausted agents can still return to HQ and recover',()=>{const s=new Simulation();s.start();const a=s.agents[0];a.node=6;a.energy=0;assert.equal(s.assign(a.id,'patrol'),false);assert.equal(s.assign(a.id,'return'),true);s.tick(20);assert.equal(a.node,5);assert.equal(a.task,'idle');assert.ok(a.energy>0);});


test('Idle orders can change during a mission and resume after resolution',()=>{
 const s=new Simulation();s.start();s.dispatch('gare',['malik'],'intervene');s.tick(18);
 const a=s.agents[1];assert.equal(s.setIdleTask(a.id,'patrol'),true);assert.equal(a.task,'mission');
 s.choose('gare','talk');s.tick(16);assert.equal(a.task,'patrol');assert.ok(a.path.length>0);
 s.setIdleTask(a.id,'rest');assert.equal(a.task,'return');s.tick(30);assert.equal(a.node,5);assert.equal(a.task,'idle');
});
test('Patrol moves continuously through the map and resumes after recovery',()=>{
 const s=new Simulation();s.start();s.incidents=[];s.setIdleTask('nora','patrol');const a=s.agents[0];const visited=new Set<number>();
 for(let k=0;k<160;k++){s.tick(1);visited.add(a.node);}assert.ok(visited.size>=18);
 a.energy=14;s.tick(35);assert.equal(a.node,5);assert.equal(a.task,'idle');assert.equal(a.idleTask,'patrol');
 a.energy=99.9;s.tick(.25);assert.equal(a.task,'patrol');
});
test('Crossing an event interrupts travel and engages without a dispatch click',()=>{
 const s=new Simulation();s.start();const a=s.agents[0];const crossed=s.incidents[1];crossed.at=0;crossed.node=6;
 s.dispatch('gare',[a.id],'intervene');s.tick(5.25);
 assert.equal(a.node,6);assert.equal(a.target,'quai');assert.equal(a.task,'mission');assert.equal(crossed.phase,'decision');
 assert.ok(crossed.agents.includes(a.id));assert.equal(s.incidents[0].phase,'signal');
 s.choose('quai','guide');s.tick(22);assert.equal(a.task,'return');assert.equal(a.idleTask,'rest');
});
test('Future, expired and resolved alerts do not catch a passing hero',()=>{
 for(const kind of ['future','expired','resolved']){
 const s=new Simulation();s.start();const i=s.incidents[1];i.node=6;i.at=kind==='future'?50:0;
 if(kind==='expired')i.deadline=1;if(kind==='resolved')i.phase='resolved';
 s.dispatch('gare',['nora'],'intervene');s.tick(6);assert.equal(s.agents[0].target,'gare');
 }
});
test('Resolution progress measures elapsed work and reaches 100 percent',()=>{
 const s=new Simulation();s.start();s.dispatch('gare',['malik'],'intervene');s.tick(18);const i=s.incidents[0];
 assert.equal(s.progress(i),0);s.choose(i.id,'talk');s.tick(7.5);assert.equal(s.progress(i),50);s.tick(7.5);assert.equal(s.progress(i),100);
});
