import type {Map} from 'maplibre-gl';
import {constrainCenter,type MovementLimits} from './map-limits';

export type CameraPose={pitch:number;bearing:number;zoom:number};
export type ZoomBounds={min?:number;max?:number};
/** Lock only orientation; zoom has independent, optional near/far limits. */
export function createCameraPolicy(map:Map){
 let locked=false,pose:CameraPose,bounds:ZoomBounds={};
 let movement:MovementLimits={};
 map.setTransformCameraUpdate(next=>({center:constrainCenter(next.center,next.zoom,movement),...(locked?{pitch:pose.pitch,bearing:pose.bearing,roll:0}:{})}));
 const clamp=(zoom:number)=>Math.max(bounds.min??0,Math.min(bounds.max??22,zoom));
 return {
  movement(limits:MovementLimits){movement=structuredClone(limits);map.jumpTo({center:map.getCenter()});},
  apply(next:boolean,limits:ZoomBounds,restore?:CameraPose){
   map.stop();
   pose=restore??{pitch:map.getPitch(),bearing:map.getBearing(),zoom:map.getZoom()};
   locked=next;bounds={...limits};
   map.setMinZoom(0);map.setMaxZoom(22);map.setMinPitch(0);map.setMaxPitch(60);
   map.dragPan.enable();map.scrollZoom.enable();map.doubleClickZoom.disable();
   map.boxZoom.enable();map.keyboard.enable();map.touchZoomRotate.enable();
   if(locked){
    map.dragRotate.disable();map.touchPitch.disable();
    map.touchZoomRotate.disableRotation();map.keyboard.disableRotation();
   }else{
    map.dragRotate.enable();map.touchPitch.enable();
    map.touchZoomRotate.enableRotation();map.keyboard.enableRotation();
   }
   map.jumpTo({...pose,zoom:clamp(pose.zoom),roll:0});
   map.setMinZoom(bounds.min??0);map.setMaxZoom(bounds.max??22);
   if(locked){map.setMinPitch(pose.pitch);map.setMaxPitch(pose.pitch);}
   map.getContainer().classList.toggle('camera-locked',locked);
   map.getContainer().dataset.cameraLocked=String(locked);
  },
  go(center:[number,number],zoom?:number){
   if(locked)map.easeTo({center,pitch:pose.pitch,bearing:pose.bearing,zoom:clamp(map.getZoom())});
   else map.flyTo({center,...(zoom===undefined?{}:{zoom:clamp(zoom)}),essential:false});
  }
 };
}
