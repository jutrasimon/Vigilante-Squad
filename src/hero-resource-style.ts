/** Shared resource vocabulary and colors for the full sheet and its map preview. */
export const heroResources={hp:{label:'HP',max:8,icon:'first-aid-kit',color:'#81d8bb'},mental:{label:'Mental',max:10,icon:'brain',color:'#bb93ed'},energy:{label:'Énergie',max:100,icon:'battery',color:'#edc25d'}} as const;

export function resourceSegmentBackground(value:number,index:number){const part=Math.max(0,Math.min(1,value-index));return part>0&&part<1?`linear-gradient(90deg,var(--resource) ${part*100}%,#40525c ${part*100}%)`:'';}
