import type {IconName} from './icons';
export const heroActivities = {
 rest: {label:'Repos au QG',short:'QG',icon:'home' as IconName,order:'ready',color:'#edc25d'},
 watch: {label:'Surveillance',short:'Surveillance',icon:'eye' as IconName,order:'watch',color:'#78dcde'}
} as const;
export const activityForOrder=(order:string)=>heroActivities[order==='watch'||order==='patrol'?'watch':'rest'];

export const WATCH_ENERGY_PER_SECOND=.15;

export const HQ_RECOVERY_PER_SECOND={hp:.08,mental:.12,energy:.7} as const;
