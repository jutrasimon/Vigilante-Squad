// SVGs are bundled locally; the full pinned Tabler catalog remains available in node_modules.
import svg0 from '@tabler/icons/outline/barbell.svg?raw';
import svg1 from '@tabler/icons/outline/brain.svg?raw';
import svg2 from '@tabler/icons/outline/heart.svg?raw';
import svg3 from '@tabler/icons/outline/clock.svg?raw';
import svg4 from '@tabler/icons/outline/map-pin.svg?raw';
import svg5 from '@tabler/icons/outline/route.svg?raw';
import svg6 from '@tabler/icons/outline/target.svg?raw';
import svg7 from '@tabler/icons/outline/shield.svg?raw';
import svg8 from '@tabler/icons/outline/shield-check.svg?raw';
import svg9 from '@tabler/icons/outline/alert-triangle.svg?raw';
import svg10 from '@tabler/icons/outline/users.svg?raw';
import svg11 from '@tabler/icons/outline/search.svg?raw';
import svg12 from '@tabler/icons/outline/check.svg?raw';
import svg13 from '@tabler/icons/outline/x.svg?raw';
import svg14 from '@tabler/icons/outline/arrow-left.svg?raw';
import svg15 from '@tabler/icons/outline/arrow-right.svg?raw';
import svg16 from '@tabler/icons/outline/battery.svg?raw';
import svg17 from '@tabler/icons/outline/first-aid-kit.svg?raw';
import svg18 from '@tabler/icons/outline/home.svg?raw';
import svg19 from '@tabler/icons/outline/walk.svg?raw';
import svg20 from '@tabler/icons/outline/eye.svg?raw';
import svg21 from '@tabler/icons/outline/eye-off.svg?raw';
import svg22 from '@tabler/icons/outline/bolt.svg?raw';
import svg23 from '@tabler/icons/outline/message-circle.svg?raw';
import svg24 from '@tabler/icons/outline/lifebuoy.svg?raw';
import svg25 from '@tabler/icons/outline/tools.svg?raw';
import svg26 from '@tabler/icons/outline/speakerphone.svg?raw';
import svg27 from '@tabler/icons/outline/list-check.svg?raw';
import svg28 from '@tabler/icons/outline/player-play.svg?raw';
import svg29 from '@tabler/icons/outline/flag.svg?raw';
import svg30 from '@tabler/icons/outline/info-circle.svg?raw';
const icons={'barbell':svg0,'brain':svg1,'heart':svg2,'clock':svg3,'map-pin':svg4,'route':svg5,'target':svg6,'shield':svg7,'shield-check':svg8,'alert-triangle':svg9,'users':svg10,'search':svg11,'check':svg12,'x':svg13,'arrow-left':svg14,'arrow-right':svg15,'battery':svg16,'first-aid-kit':svg17,'home':svg18,'walk':svg19,'eye':svg20,'eye-off':svg21,'bolt':svg22,'message-circle':svg23,'lifebuoy':svg24,'tools':svg25,'speakerphone':svg26,'list-check':svg27,'player-play':svg28,'flag':svg29,'info-circle':svg30};
export type IconName=keyof typeof icons;
export function icon(name:IconName){return icons[name].replace('<svg','<svg aria-hidden="true" focusable="false"');}
export const statIcon={Corps:'barbell',Esprit:'brain','Âme':'heart'} as const;
export const statColor={Corps:'#f1b269',Esprit:'#7ed4e8','Âme':'#c4a6ff'} as const;
export function gauge(value:number,label:string,tone='good',suffix='%'){
 const v=Math.max(0,Math.min(100,value));
 return `<span class="dial ${tone}" role="img" aria-label="${label} : ${Math.round(value)}${suffix}"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="dial-track" cx="22" cy="22" r="18"/><circle class="dial-value" cx="22" cy="22" r="18" pathLength="100" stroke-dasharray="${v} 100" transform="rotate(-90 22 22)"/></svg><b>${Math.round(value)}<small>${suffix}</small></b></span>`;
}
export const chanceTone=(value:number)=>value>=70?'good':value>=40?'caution':'danger';
