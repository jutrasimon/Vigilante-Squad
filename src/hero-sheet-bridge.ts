/** One embedding entry point for the shared Hero Gym sheet. */
export const HERO_SHEET_WIDTH=520;
export type HeroMapContext={agent:string;hero:string;hp:number;mental:number;energy:number;order:string;zone?:string;zones:{id:string;name:string}[];seconds?:number;progress?:number;travel?:boolean;duty?:boolean;moveArmed?:boolean;destination?:string};
export function heroSheetURL(a:HeroMapContext){return `./hero-gym.html?${new URLSearchParams({embed:'1',hero:a.hero,agent:a.agent,hp:String(a.hp),mental:String(a.mental),energy:String(a.energy),order:a.order})}`;}
export function updateHeroSheet(frame:HTMLIFrameElement,context:HeroMapContext){frame.contentWindow?.postMessage({type:'map-hero-context',...context},location.origin);}
