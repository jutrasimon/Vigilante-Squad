/** Draw in CSS pixels: the corners, outline and tail never stretch with the text. */
let observer:ResizeObserver|undefined;
export function observeBark(bubble:HTMLElement|null){
 observer?.disconnect();
 if(!bubble)return;
 const portrait=bubble.closest('.identity')?.querySelector<HTMLElement>('.portrait-wrap');
 const anchor=bubble.parentElement;
 const draw=()=>{
  if(portrait&&anchor){
   const p=portrait.getBoundingClientRect(),a=anchor.getBoundingClientRect();
   const overlap=Math.max(0,a.left-(p.right-p.width*.18));
   bubble.style.setProperty('--bark-overlap',`${overlap}px`);
  }
  const w=bubble.offsetWidth,h=bubble.offsetHeight;
  if(!w||!h)return;
  const svg=bubble.querySelector<SVGSVGElement>('svg')!;
  const tail=22,left=tail+2,right=left+w-4,top=2,bottom=h-2,cut=Math.min(12,h/4);
  const y=Math.min(h-18,Math.max(18,h*.52));
  const path=`M ${left+cut} ${top} H ${right-cut} L ${right} ${top+cut} V ${bottom-cut} L ${right-cut} ${bottom} H ${left+cut} L ${left} ${bottom-cut} V ${y+8} L 2 ${y+5} L ${left} ${y-8} V ${top+cut} Z`;
  svg.setAttribute('viewBox',`0 0 ${w+tail+8} ${h+8}`);
  svg.querySelectorAll('path').forEach(p=>p.setAttribute('d',path));
 };
 observer=new ResizeObserver(draw);observer.observe(bubble);if(portrait)observer.observe(portrait);if(anchor)observer.observe(anchor);draw();
}
