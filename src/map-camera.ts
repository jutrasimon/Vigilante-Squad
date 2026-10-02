import type {Map} from 'maplibre-gl';

export type CameraPose={pitch:number;bearing:number;zoom:number};
/** Lock the chosen view; moving across the map remains available. */
export function createCameraPolicy(map:Map){
 let locked=false,pose:CameraPose;
 const arrows:Record<string,[number,number]>={ArrowLeft:[-70,0],ArrowRight:[70,0],ArrowUp:[0,-70],ArrowDown:[0,70]};
 const keydown=(e:KeyboardEvent)=>{
  if(!locked||e.target!==map.getCanvas()||!arrows[e.key]||e.ctrlKey||e.metaKey||e.altKey)return;
  e.preventDefault();map.panBy(arrows[e.key],{duration:140});
 };
 map.getContainer().addEventListener('keydown',keydown);
 return {
  apply(next:boolean,restore?:CameraPose){
   map.stop();
   // Capture before releasing constraints: locking/unlocking never changes the view.
   pose=restore??{pitch:map.getPitch(),bearing:map.getBearing(),zoom:map.getZoom()};
   locked=next;
   map.setMinZoom(0);map.setMaxZoom(22);map.setMinPitch(0);map.setMaxPitch(60);
   map.dragPan.enable();
   if(locked){
    map.dragRotate.disable();map.touchPitch.disable();map.touchZoomRotate.disable();
    map.scrollZoom.disable();map.doubleClickZoom.disable();map.boxZoom.disable();map.keyboard.disable();
   }else{
    map.dragRotate.enable();map.touchPitch.enable();map.touchZoomRotate.enable();
    map.scrollZoom.enable();map.doubleClickZoom.enable();map.boxZoom.enable();map.keyboard.enable();
   }
   map.jumpTo({...pose,roll:0});
   if(locked){
    map.setMinZoom(pose.zoom);map.setMaxZoom(pose.zoom);
    map.setMinPitch(pose.pitch);map.setMaxPitch(pose.pitch);
   }
   map.getContainer().classList.toggle('camera-locked',locked);
   map.getContainer().dataset.cameraLocked=String(locked);
  },
  go(center:[number,number],zoom?:number){
   if(locked)map.easeTo({center,...pose});
   else map.flyTo({center,...(zoom===undefined?{}:{zoom}),essential:false});
  },
  dispose(){map.getContainer().removeEventListener('keydown',keydown);}
 };
}
