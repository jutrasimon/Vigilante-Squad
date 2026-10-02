import type {IconName} from './icons';
export const heroActivities = {
 rest: {label:'Repos au QG',short:'QG',icon:'home' as IconName,order:'ready',color:'#edc25d'},
 watch: {label:'Surveillance',short:'Surveillance',icon:'eye' as IconName,order:'watch',color:'#78dcde'},
 patrol: {label:'Patrouille',short:'Patrouille',icon:'walk' as IconName,order:'patrol',color:'#c49aff'}
} as const;
export const activityForOrder=(order:string)=>heroActivities[order==='watch'?'watch':order==='patrol'?'patrol':'rest'];
