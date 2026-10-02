import {mountHeroSheet} from './hero-sheet';
const params=new URLSearchParams(location.search);
mountHeroSheet(document.querySelector<HTMLElement>('#hero-gym')!,{embedded:params.get('embed')==='1',params});
