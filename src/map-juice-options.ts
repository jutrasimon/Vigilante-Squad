import type {JuiceConfig} from './map-juice-state';
export type EffectSettings=Record<string,number|string>;
type Field={key:string;label:string;min:number;max:number;step:number;value:number};
const f=(key:string,label:string,min:number,max:number,step:number,value:number):Field=>({key,label,min,max,step,value});
/** Effect-specific values are optional so old JSON retains its original appearance. */
export const effectFields:Record<string,Field[]>={
 pop:[f('amplitude','Agrandissement (%)',0,150,1,25)],
 squash:[f('stretch','Étirement (%)',0,100,1,30),f('compression','Compression (%)',0,80,1,25)],
 pulse:[f('amplitude','Pulsation (%)',0,100,1,10)],
 glow:[f('radius','Rayon de lueur (px)',0,100,1,28)],
 flash:[f('brightness','Éclaircissement (%)',0,400,10,180),f('opacity','Opacité du halo',0,1,.05,.3)],
 shake:[f('amplitude','Secousse (px)',0,40,1,6),f('count','Oscillations',2,30,1,8)],
 objectShake:[f('amplitude','Secousse (px)',0,40,1,5),f('count','Oscillations',2,30,1,8)],
 zoom:[f('zoom','Variation du zoom',-2,3,.1,.6)],travel:[],
 temporaryZoom:[f('zoom','Variation du zoom',-2,3,.1,.7),f('transition','Trajet aller / retour (ms)',0,3000,50,350)],
 pinpoint:[f('radius','Rayon (px)',10,250,5,75),f('count','Nombre d’anneaux',1,8,1,3),f('width','Épaisseur (px)',1,8,.5,2)],
 burst:[f('radius','Rayon (px hors bâtiment)',10,250,5,95),f('count','Particules / foyers',4,120,1,40)],
 rain:[f('count','Particules',4,150,1,65),f('distance','Distance de chute (px)',20,500,10,200)],
 vignette:[f('opacity','Opacité',0,.9,.05,.4)],
 smoke:[f('density','Densité',0,1,.05,.8),f('rise','Élévation',.2,3,.1,1)],
 debris:[f('distance','Projection',0,2,.1,1),f('count','Nombre de débris',4,120,1,72)]
};
export const coloredEffects=new Set(['glow','flash','pinpoint','burst','rain','vignette','smoke','debris']);
export function effectValue(c:JuiceConfig,e:string,key:string){const own=c.effectSettings?.[e]?.[key];if(typeof own==='number')return own;const fallback=effectFields[e]?.find(f=>f.key===key)?.value??1;if(e==='smoke'&&key==='density')return c.explosion?.smoke??fallback;if(e==='smoke'&&key==='rise')return c.explosion?.rise??fallback;if(e==='debris'&&key==='distance')return c.explosion?.debris??fallback;return ['amplitude','stretch','compression','radius','brightness','zoom','opacity'].includes(key)?fallback*c.intensity:fallback;}
export function effectConfig(c:JuiceConfig,e:keyof typeof import('./map-juice-state').juiceEffects):JuiceConfig{const s=c.effectSettings?.[e];return {...c,effects:[e],duration:typeof s?.duration==='number'?s.duration:e==='smoke'?Math.min(20000,c.duration*8):c.duration,color:typeof s?.color==='string'?s.color:c.color};}
export function validateEffectSettings(value:unknown){if(value===undefined)return;if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Réglages d’effets invalides');for(const [effect,settings] of Object.entries(value)){if(!Object.hasOwn(effectFields,effect)||!settings||typeof settings!=='object'||Array.isArray(settings))throw Error('Effet inconnu');for(const [key,v] of Object.entries(settings)){if(key==='color'){if(typeof v!=='string'||!/^#[a-f0-9]{6}$/i.test(v))throw Error('Couleur invalide');continue;}const field=key==='duration'?f(key,'',100,20000,50,650):effectFields[effect].find(f=>f.key===key);if(!field||typeof v!=='number'||!Number.isFinite(v)||v<field.min||v>field.max)throw Error('Paramètre d’effet invalide');}}}
