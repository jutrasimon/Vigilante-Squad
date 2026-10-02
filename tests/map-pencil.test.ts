import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pencilRing,type PencilPoint} from '../src/map-pencil';
function crosses(r:PencilPoint[]){const cross=(a:PencilPoint,b:PencilPoint,c:PencilPoint)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);for(let i=0;i<r.length-1;i++)for(let j=i+2;j<r.length-1;j++){if(!i&&j===r.length-2)continue;if(cross(r[i],r[i+1],r[j])*cross(r[i],r[i+1],r[j+1])<0&&cross(r[j],r[j+1],r[i])*cross(r[j],r[j+1],r[i+1])<0)return true;}return false;}
test('Pencil preserves an irregular concave outline and rounds its closure',()=>{const r=pencilRing([[0,0],[100,0],[100,100],[50,45],[0,100],[2,3]]);assert.deepEqual(r[0],r.at(-1));assert.ok(r.length>12);assert.equal(crosses(r),false);assert.ok(r.some(p=>p[0]>40&&p[0]<60&&p[1]>40&&p[1]<65));});
test('Pencil removes a crossed overshoot at the closing seam',()=>{const r=pencilRing([[0,0],[100,0],[110,70],[70,100],[0,80],[-10,20],[15,-10],[8,15]]);assert.equal(crosses(r),false);assert.deepEqual(r[0],r.at(-1));});
