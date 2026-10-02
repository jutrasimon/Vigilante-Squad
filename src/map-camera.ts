import type {Map} from 'maplibre-gl';

/** Camera rule for the real map: game mode permits panning only. */
export const GAME_CAMERA={pitch:45,bearing:45} as const;
export type CameraMode='workshop'|'game';
export function createCameraPolicy(map:Map){
 let mode:CameraMode='workshop',lockedZoom=map.getZoom();
 const arrows:Record<string,[number,number]>={ArrowLeft:[-70,0],ArrowRight:[70,0],ArrowUp:[0,-70],ArrowDown:[0,70]};
 const keydown=(e:KeyboardEvent)=>{
  if(mode!=='game'||e.target!==map.getCanvas()||!arrows[e.key]||e.ctrlKey||e.metaKey||e.altKey)return;
  e.preventDefault();map.panBy(arrows[e.key],{duration:140});
 };
 map.getContainer().addEventListener('keydown',keydown);
 return {
  apply(next:CameraMode,workshop:{pitch:number;bearing:number},zoom?:number){
   map.stop();mode=next;
   // Release constraints before restoring the workshop view or choosing a new lock.
   map.setMinZoom(0);map.setMaxZoom(22);map.setMinPitch(0);map.setMaxPitch(60);
   map.dragPan.enable();
   if(mode==='game'){
    lockedZoom=zoom??map.getZoom();
    map.dragRotate.disable();map.touchPitch.disable();map.touchZoomRotate.disable();
    map.scrollZoom.disable();map.doubleClickZoom.disable();map.boxZoom.disable();map.keyboard.disable();
    map.jumpTo({...GAME_CAMERA,zoom:lockedZoom,roll:0});
    map.setMinZoom(lockedZoom);map.setMaxZoom(lockedZoom);map.setMinPitch(GAME_CAMERA.pitch);map.setMaxPitch(GAME_CAMERA.pitch);
   }else{
    map.dragRotate.enable();map.touchPitch.enable();map.touchZoomRotate.enable();map.touchZoomRotate.disableRotation();
    map.scrollZoom.enable();map.doubleClickZoom.enable();map.boxZoom.enable();map.keyboard.enable();
    map.jumpTo({...workshop,roll:0,...(zoom===undefined?{}:{zoom})});
   }
   map.getContainer().classList.toggle('game-camera',mode==='game');
   map.getContainer().dataset.cameraMode=mode;
  },
  go(center:[number,number],zoom?:number){
   if(mode==='game')map.easeTo({center,...GAME_CAMERA,zoom:lockedZoom});
   else map.flyTo({center,...(zoom===undefined?{}:{zoom}),essential:false});
  },
  dispose(){map.getContainer().removeEventListener('keydown',keydown);}
 };
}
