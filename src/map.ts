import Phaser from 'phaser';
import {Simulation,position,neighbours,xs,ys} from './simulation';
export function createMap(parent:string,getSim:()=>Simulation,onSelect:(id:string)=>void){
 class City extends Phaser.Scene {
 markers!:Phaser.GameObjects.Graphics; labels:Phaser.GameObjects.Text[]=[]; zoom=1;
 create(){
 const g=this.add.graphics();g.fillStyle(0x161d23);g.fillRect(0,0,800,580);
 g.fillStyle(0x0c2936);g.fillRect(584,0,83,580);
 for(let y=16;y<580;y+=23){g.lineStyle(1,0x285060,0.4);g.lineBetween(593,y,614,y);g.lineBetween(629,y+9,654,y+9);}
 // Deliberately geometric, editable blocks: no raster map and no blurry zoom.
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 if(col===3)continue;
 const x=xs[col]+24,y=ys[row]+23,w=xs[col+1]-x-24,h=ys[row+1]-y-23;
 g.fillStyle(0x10171b);g.fillRect(x+5,y+6,w,h);g.fillStyle((row+col)%2?0x30373c:0x343b41);g.fillRect(x,y,w,h);
 g.lineStyle(2,0x42474b);g.strokeRect(x+3,y+3,w-6,h-6);
 g.fillStyle(0x1d262a);g.fillRect(x+20,y+20,w-40,h-40);
 for(let bx=x+8;bx<x+w-8;bx+=17){g.fillStyle(0xb49e64,0.4);g.fillRect(bx,y+6,5,3);}
 }
 for(let n=0;n<20;n++){const p=position(n);for(const next of neighbours(n)){if(next<n)continue;const q=position(next);g.lineStyle(20,0x454a4e);g.lineBetween(p.x,p.y,q.x,q.y);g.lineStyle(14,0x272e34);g.lineBetween(p.x,p.y,q.x,q.y);g.lineStyle(1,0x687075,0.5);g.lineBetween(p.x,p.y,q.x,q.y);}}
 for(let r=0;r<3;r++){g.fillStyle(0x343c42);g.fillRect(736,ys[r]+30,48,65);g.fillRect(18,ys[r]+30,46,70);}
 const label=(x:number,y:number,t:string,size=13,color='#89939a')=>this.add.text(x,y,t,{fontFamily:'Arial, sans-serif',fontSize:size,color,letterSpacing:1}).setOrigin(0.5);
 label(294,35,'LES HALLES',19);label(294,551,'SAINT-ROCH',19);label(626,300,'R\nI\nV\nE\nS',14,'#507181');label(742,48,'QUAI NORD',12);label(525,196,'GARE EST',12);label(90,193,'QG',14,'#e6b94d');
 this.markers=this.add.graphics();
 this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{const point=this.cameras.main.getWorldPoint(p.x,p.y);const i=getSim().visible().find(i=>!['resolved','missed'].includes(i.phase)&&Phaser.Math.Distance.Between(point.x,point.y,position(i.node).x,position(i.node).y)<35);if(i)onSelect(i.id);});
 this.input.on('wheel',(_p:unknown,_o:unknown,_dx:number,dy:number)=>this.setZoom(this.zoom+(dy<0?0.1:-0.1)));
 }
 setZoom(z:number){this.zoom=Phaser.Math.Clamp(z,1,1.6);this.cameras.main.setZoom(this.zoom);}
 update(){if(!this.markers)return;const s=getSim(),g=this.markers;g.clear();for(const l of this.labels)l.destroy();this.labels=[];
 const text=(x:number,y:number,t:string,color:string,size=12)=>{this.labels.push(this.add.text(x,y,t,{fontFamily:'Arial',fontSize:size,color,fontStyle:'bold',backgroundColor:'#11171d',padding:{x:4,y:3}}).setOrigin(.5));};
 for(const i of s.visible())if(!['resolved','missed'].includes(i.phase)){const p=position(i.node),c=i.phase==='working'?0xe6b94d:0xe57665;g.fillStyle(c,0.12);g.fillCircle(p.x,p.y,28+Math.sin(this.time.now/400)*3);g.fillStyle(0x171c23);g.fillCircle(p.x,p.y,18);g.lineStyle(3,c);g.strokeCircle(p.x,p.y,18);text(p.x,p.y,i.phase==='working'?'…':'!',i.phase==='working'?'#e6b94d':'#e57665',18);text(p.x,p.y+37,i.place,'#d7dce1');}
 const unit=(n:number,path:number[],move:number,color:number,label:string,off:number)=>{const p=position(n),q=path.length?position(path[0]):p;const x=p.x+(q.x-p.x)*move,y=p.y+(q.y-p.y)*move;g.lineStyle(2,color,.7);g.beginPath();g.moveTo(x,y);for(const nn of path){const pp=position(nn);g.lineTo(pp.x,pp.y);}g.strokePath();g.fillStyle(0x11171d);g.fillCircle(x+off,y-9,10);g.lineStyle(2,color);g.strokeCircle(x+off,y-9,10);text(x+off,y-30,label,'#'+color.toString(16));};
 s.agents.forEach((a,k)=>unit(a.node,a.path,a.move,[0xe6b94d,0x83c3b0,0xc7a5cf][k],a.name.slice(0,1),k*12-12));unit(s.police.node,s.police.path,s.police.move,0x77b6ea,'POLICE',0);
 }
 }
 const game=new Phaser.Game({type:Phaser.AUTO,parent,backgroundColor:'#161d23',width:800,height:580,scene:City,render:{antialias:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true}});
 return {game,zoom:(delta:number)=>{const s=game.scene.scenes[0] as City;if(s?.cameras)s.setZoom(s.zoom+delta);}};
}
