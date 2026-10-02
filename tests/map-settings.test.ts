import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyJuice,defaultJuiceConfig,readJuice,matchingJuice} from '../src/map-juice-state';
import {defaultWeather,readWeather} from '../src/map-weather';
test('Type and custom event rules apply to existing and future heroes',()=>{const s=emptyJuice();s.events.push('blessure');s.rules.push({id:'rule',type:'hero',event:'blessure',config:defaultJuiceConfig()});const copy=readJuice(JSON.parse(JSON.stringify(s)));assert.equal(matchingJuice(copy,'hero','blessure','hero:future').length,1);assert.equal(matchingJuice(copy,'point:alert','blessure','point:a').length,0);assert.deepEqual(copy,s);});
test('Legacy per-target effects remain scoped and are preserved',()=>{const s=readJuice({'hero:a':{...defaultJuiceConfig(),trigger:'click'}});assert.equal(s.version,2);assert.equal(matchingJuice(s,'hero','click','hero:a').length,1);assert.equal(matchingJuice(s,'hero','click','hero:b').length,0);});
test('Rain and custom effects reject invalid values before import',()=>{assert.deepEqual(readWeather(undefined),defaultWeather);assert.deepEqual(readWeather({...defaultWeather,enabled:true,wind:-.5}),{...defaultWeather,enabled:true,wind:-.5});assert.throws(()=>readWeather({...defaultWeather,speed:NaN}));const s=emptyJuice();s.events.push('<script>');assert.throws(()=>readJuice(s));});
