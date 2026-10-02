/** Shared shortest-path search for the prototype graph and geographic street network. */
export function shortestPath<T>(from:T,to:T,neighbours:(node:T)=>Iterable<[T,number]>):T[]{
 const distances=new Map<T,number>([[from,0]]),previous=new Map<T,T>(),heap:{node:T;cost:number;seq:number}[]=[];let seq=0;
 const less=(a:typeof heap[number],b:typeof heap[number])=>a.cost<b.cost||(a.cost===b.cost&&a.seq<b.seq);
 const push=(node:T,cost:number)=>{let i=heap.length;heap.push({node,cost,seq:seq++});while(i){const p=(i-1)>>1;if(!less(heap[i],heap[p]))break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}};
 const pop=()=>{const top=heap[0],last=heap.pop()!;if(heap.length){heap[0]=last;let i=0;for(;;){let k=i,l=i*2+1,r=l+1;if(l<heap.length&&less(heap[l],heap[k]))k=l;if(r<heap.length&&less(heap[r],heap[k]))k=r;if(k===i)break;[heap[i],heap[k]]=[heap[k],heap[i]];i=k;}}return top;};
 push(from,0);while(heap.length){const {node,cost}=pop();if(cost!==distances.get(node))continue;if(node===to){const out=[to];while(out[0]!==from)out.unshift(previous.get(out[0])!);return out;}for(const [next,w] of neighbours(node)){const d=cost+w;if(w>=0&&d<(distances.get(next)??Infinity)){distances.set(next,d);previous.set(next,node);push(next,d);}}}return [];
}
