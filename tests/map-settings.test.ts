import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyJuice,defaultJuiceConfig,readJuice,matchingJuice} from '../src/map-juice-state';
import {defaultWeather,readWeather} from '../src/map-weather';
test('Type and custom event rules apply to existing and future heroes',()=>{const s=emptyJuice();s.events.push('blessure');s.rules.push({id:'rule',type:'hero',event:'blessure',config:defaultJuiceConfig()});const copy=readJuice(JSON.parse(JSON.stringify(s)));assert.equal(matchingJuice(copy,'hero','blessure','hero:future').length,1);assert.equal(matchingJuice(copy,'point:alert','blessure','point:a').length,0);assert.deepEqual(copy,s);});
test('Legacy per-target effects remain scoped and are preserved',()=>{const s=readJuice({'hero:a':{...defaultJuiceConfig(),trigger:'click'}});assert.equal(s.version,2);assert.equal(matchingJuice(s,'hero','click','hero:a').length,1);assert.equal(matchingJuice(s,'hero','click','hero:b').length,0);});
test('Rain and custom effects reject invalid values before import',()=>{assert.deepEqual(readWeather(undefined),defaultWeather);assert.deepEqual(readWeather({...defaultWeather,enabled:true,wind:-.5}),{...defaultWeather,enabled:true,wind:-.5});assert.throws(()=>readWeather({...defaultWeather,speed:NaN}));const s=emptyJuice();s.events.push('<script>');assert.throws(()=>readJuice(s));});

import {readRouteStyle,defaultRouteStyle} from '../src/map-route-style';
import {advanceJourney,journeyProgress,type Traveller} from '../src/map-travel';
test('Route appearance, extended Juice and lightning validate and roundtrip',()=>{assert.deepEqual(readRouteStyle(undefined),defaultRouteStyle);assert.throws(()=>readRouteStyle({...defaultRouteStyle,width:99}));assert.throws(()=>readWeather({...defaultWeather,lightning:{enabled:true,strength:.5,color:'#aabbcc',minInterval:30,maxInterval:5}}));const s=emptyJuice();s.rules[0].config.effects=['temporaryZoom','objectShake','pinpoint','pulse','glow'];assert.deepEqual(readJuice(JSON.parse(JSON.stringify(s))),s);});
test('Journey progress uses remaining road distance and current simulation speed',()=>{const a={id:'a',position:[.0005,0] as [number,number],speed:36,journey:{path:[[0,0],[.001,0]] as [number,number][],next:1,destination:'QG'}};const p=journeyProgress(a,1);assert.ok(Math.abs(p.progress-.5)<.001);assert.ok(Math.abs(p.seconds-5.566)<.01);assert.equal(journeyProgress(a,2).seconds,p.seconds/2);assert.deepEqual(journeyProgress({id:'a',position:[0,0]},1),{seconds:0,progress:1});});

test('Patrol repeats the same path without stopping or emitting repeated arrivals',()=>{const a:Traveller={id:'a',position:[0,0],journey:{path:[[0,0],[.001,0],[.002,0],[.001,0]],next:1,destination:'Secteur',loopStart:1,loopActive:false}};const path=a.journey!.path;let entries=0;for(let k=0;k<1000;k++){const result=advanceJourney(a,3);assert.equal(result.arrived,false);entries+=Number(result.entered);assert.equal(a.journey!.path,path);assert.ok(a.journey!.next<path.length);}assert.equal(entries,1);assert.equal(a.journey!.loopActive,true);assert.deepEqual(journeyProgress(a,1),{seconds:0,progress:1});});

import {readBuildings,buildingSelector,type BuildingEdit} from '../src/map-building-state';
test('Building edits validate, deep-clone and retain destroyed state and point link',()=>{const b:BuildingEdit={id:'one',source:'vector',sourceLayer:'building',featureId:10,name:'Tour',geometry:{type:'Polygon',coordinates:[[[0,0],[.001,0],[.001,.001],[0,0]]]},height:30,color:'#aa55cc',effect:'pulse',point:'alert1',destroyed:true};const copy=readBuildings(JSON.parse(JSON.stringify([b])));assert.deepEqual(copy,[b]);assert.equal(buildingSelector(b)[0],'within');assert.throws(()=>readBuildings([{...b,height:-1}]));assert.throws(()=>readBuildings([b,b]));assert.throws(()=>readBuildings([{...b,geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[2,2]]]}}]));});
test('Connected Juice triggers are restored even when absent from older saved lists',()=>{const s=emptyJuice();s.events=['manual'];s.rules=[];const restored=readJuice(s);for(const key of ['click','arrival','hit','centered','focus'])assert.ok(restored.events.includes(key));});

import {readScreenTheme,screenDefaults} from '../src/map-screen-effects';
test('Screen effects migrate legacy vignette and reject malformed values before applying',()=>{assert.deepEqual(readScreenTheme(undefined),screenDefaults);assert.equal(readScreenTheme({vignette:.6}).vignette,.6);const s={...screenDefaults,edgeColor:'#aabbcc',vignetteX:30,vignetteSoftness:50};assert.deepEqual(readScreenTheme(JSON.parse(JSON.stringify(s))),s);assert.throws(()=>readScreenTheme({edgeWidth:999}));assert.throws(()=>readScreenTheme({vignetteColor:'url(bad)'}));assert.throws(()=>readScreenTheme({edgeFeedback:'false'}));const juice=emptyJuice();juice.rules[0].config.effects=['vignette'];assert.deepEqual(readJuice(JSON.parse(JSON.stringify(juice))),juice);});
import {pickBuildingPart} from '../src/map-building-state';
import {lightningSequence} from '../src/map-weather';
test('Grouped building geometry isolates the clicked polygon; lightning timing respects configured ranges',()=>{const p1=[[[0,0],[1,0],[1,1],[0,1],[0,0]]],p2=[[[3,0],[4,0],[4,1],[3,1],[3,0]]];const part=pickBuildingPart({type:'MultiPolygon',coordinates:[p1,p2]},[3.5,.5],p=>p as [number,number]);assert.deepEqual(part.coordinates,p2);const lightning={...defaultWeather.lightning!,minFlashes:3,maxFlashes:5,minGap:200,maxGap:500,flashDuration:300};const seq=lightningSequence(lightning,()=>0);assert.equal(seq.count,3);assert.equal(seq.duration,1300);assert.equal(seq.frames.filter(f=>f.opacity>0).length,3);assert.throws(()=>readWeather({...defaultWeather,lightning:{...lightning,minFlashes:6,maxFlashes:2}}));});

import {continuousJuice} from '../src/map-juice-state';
import {connectedBuildingBlock} from '../src/map-building-block';
test('Continuous Juice resolves competing channels and restores lower priority after recovery',()=>{const s=emptyJuice();for(const [event,color,effects] of [['idle','#111111',['glow']],['focus','#222222',['glow','pulse']],['low_energy','#333333',['glow']],['low_hp','#ff0000',['glow']]] as const)s.rules.push({id:event,type:'point:alert',event,config:{effects:[...effects],color,intensity:1,duration:1000}});const rules=continuousJuice(s,'point:alert','point:a',['idle','focus','low_energy','low_hp']);assert.deepEqual(rules.map(r=>[r.event,r.config.effects]),[['low_hp',['glow']],['focus',['pulse']]]);assert.equal(continuousJuice(s,'point:alert','point:a',['idle'])[0].event,'idle');});
test('Building blocks join touching footprints, preserve heights and stop at streets',()=>{const part=(x:number,height:number)=>({height,geometry:{type:'Polygon' as const,coordinates:[[[x,45],[x+.0001,45],[x+.0001,45.0001],[x,45.0001],[x,45]]]}});const a=part(-73,10),b=part(-72.9999,20),c=part(-72.9995,30);assert.deepEqual(connectedBuildingBlock(a,[a,b,c]).map(p=>p.height),[10,20]);});

import {validateJuiceConfig} from '../src/map-juice-state';
import {effectConfig,effectValue} from '../src/map-juice-options';
test('Point Juice resolves exactly one scope per trigger, ignoring reset overrides',()=>{
 const s=emptyJuice();s.rules=[{id:'all',type:'point',event:'idle',config:{effects:['glow'],intensity:1,duration:1000,color:'#112233'}},{id:'alert',type:'point:alert',event:'idle',config:{effects:['pulse'],intensity:1,duration:1000,color:'#334455'}},{id:'one',type:'point:alert',target:'point:a',event:'idle',config:{effects:[],intensity:1,duration:1000,color:'#556677'}}];
 assert.deepEqual(matchingJuice(s,'point:hq','idle','point:q').map(r=>r.id),['all']);assert.deepEqual(matchingJuice(s,'point:alert','idle','point:b').map(r=>r.id),['alert']);assert.deepEqual(matchingJuice(s,'point:alert','idle','point:a').map(r=>r.id),['alert']);assert.equal(matchingJuice(s,'hero','idle','hero:a').length,0);
 const c={effects:['glow' as const,'pulse' as const],intensity:1,duration:650,color:'#112233',effectSettings:{glow:{radius:60,duration:1700,color:'#ff0000'},pulse:{amplitude:30,duration:2300}}};validateJuiceConfig(c);assert.equal(effectConfig(c,'glow').duration,1700);assert.equal(effectConfig(c,'pulse').duration,2300);assert.equal(effectValue(c,'glow','radius'),60);assert.throws(()=>validateJuiceConfig({...c,effectSettings:{glow:{radius:Infinity}}}));
});
import {boundaryDirections} from '../src/map-screen-effects';
import {buildingOutline} from '../src/map-building-outline';
assert.deepEqual(boundaryDirections(-30,12,[-20,0]),['left']);
assert.deepEqual(boundaryDirections(30,-12,[20,0]),['right']);
assert.deepEqual(boundaryDirections(-30,-12,[-20,-20]),['left','top']);
const outline=buildingOutline({type:'Polygon',coordinates:[[[0,0],[.001,0],[.001,.001],[0,.001],[0,0]]]},20,'#ffffff','b');
assert.equal(outline.length,8);assert.equal(outline.filter(f=>f.properties?.base>20).length,4);assert.ok(outline.every(f=>f.properties?.height>20));
import {cutBuildings} from '../src/map-building-cut';
const rect=(x:number,y:number,w:number,h:number)=>({type:'Polygon' as const,coordinates:[[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]]]});
assert.deepEqual(cutBuildings(rect(0,0,4,4),[rect(1,0,2,4)]).coordinates.length,2);
assert.deepEqual(cutBuildings(rect(0,0,4,4),[rect(-1,-1,6,6)]).coordinates,[]);
assert.deepEqual(cutBuildings(rect(5,5,1,1),[rect(0,0,4,4)]).coordinates,[rect(5,5,1,1).coordinates]);

test('Reset point types inherit all-points effects on every trigger',()=>{const s=emptyJuice();s.rules=[];for(const event of ['idle','click','focus']){s.rules.push({id:event,type:'point',event,config:defaultJuiceConfig()});for(const type of ['alert','hq','clue','police','civil','hospital','watch']){s.rules.push({id:type+event,type:'point:'+type,event,config:{...defaultJuiceConfig(),effects:[]}});assert.equal(matchingJuice(s,'point:'+type,event,'point:'+type)[0]?.id,event);}}});
