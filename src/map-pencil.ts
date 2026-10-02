export type PencilPoint=[number,number];
const area=(p:PencilPoint[])=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0));
const cross=(a:PencilPoint,b:PencilPoint)=>a[0]*b[1]-a[1]*b[0];
function intersection(a:PencilPoint,b:PencilPoint,c:PencilPoint,d:PencilPoint):PencilPoint|undefined{
 const r:PencilPoint=[b[0]-a[0],b[1]-a[1]],s:PencilPoint=[d[0]-c[0],d[1]-c[1]],q:PencilPoint=[c[0]-a[0],c[1]-a[1]],den=cross(r,s);if(Math.abs(den)<1e-12)return;
 const t=cross(q,s)/den,u=cross(q,r)/den;if(t>1e-7&&t<1-1e-7&&u>1e-7&&u<1-1e-7)return [a[0]+t*r[0],a[1]+t*r[1]];
}
// Keep the principal hand-drawn loop, remove accidental tails/loops, then round the pencil corners.
export function pencilRing(input:PencilPoint[]):PencilPoint[]{
 let p=input.filter((a,i)=>!i||Math.hypot(a[0]-input[i-1][0],a[1]-input[i-1][1])>1);
 if(p.length<3)return [];
 if(Math.hypot(p[0][0]-p.at(-1)![0],p[0][1]-p.at(-1)![1])<12)p.pop();
 for(let pass=0;pass<100;pass++){
  let found=false;
  outer:for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++){
   if(i===0&&j===p.length-1)continue;
   const x=intersection(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]);if(!x)continue;
   const a=[x,...p.slice(i+1,j+1)],b=[x,...p.slice(j+1),...p.slice(0,i+1)];p=area(a)>=area(b)?a:b;found=true;break outer;
  }
  if(!found)break;
 }
 // Remove narrow backtracking spikes without imposing a circle or a convex hull.
 p=p.filter((a,i)=>{const b=p[(i+p.length-1)%p.length],c=p[(i+1)%p.length],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-a[0],c[1]-a[1]];return (u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)||1)<.94;});
 if(p.length<3)return [];
 // Cap before smoothing to preserve the import budget.
 if(p.length>350)p=p.filter((_,i)=>i%Math.ceil(p.length/350)===0);
 for(let pass=0;pass<2;pass++){const q:PencilPoint[]=[];p.forEach((a,i)=>{const b=p[(i+1)%p.length];q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);});p=q;}
 return [...p,[...p[0]]];
}
