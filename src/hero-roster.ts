export type HeroArt = {id:string;name:string;collection:'reference'|'justiciers'|'costumes'};

// Visual research only: changing a hero does not assign gameplay rules or bonuses.
export const heroRoster:HeroArt[] = [
  {id:'malik',name:'Malik',collection:'reference'},
  {id:'beton',name:'Béton',collection:'justiciers'},
  {id:'rupture',name:'Rupture',collection:'justiciers'},
  {id:'veilleur',name:'Le Veilleur',collection:'justiciers'},
  {id:'rempart',name:'Rempart',collection:'justiciers'},
  {id:'eclair',name:'Éclair',collection:'justiciers'},
  {id:'tenaille',name:'La Tenaille',collection:'justiciers'},
  {id:'balise',name:'Balise',collection:'justiciers'},
  {id:'corbeau',name:'Corbeau',collection:'justiciers'},
  {id:'nyx',name:'Nyx',collection:'costumes'},
  {id:'voltige',name:'Voltige',collection:'costumes'},
  {id:'amazone',name:'Amazone',collection:'costumes'},
  {id:'comete',name:'Comète',collection:'costumes'},
  {id:'axiome',name:'Axiome',collection:'costumes'},
  {id:'sentinelle',name:'Sentinelle',collection:'costumes'},
  {id:'prisme',name:'Prisme',collection:'costumes'},
  {id:'pacte',name:'Le Pacte',collection:'costumes'},
  {id:'etincelle',name:'Étincelle',collection:'costumes'},
  {id:'ricochet',name:'Ricochet',collection:'costumes'},
  {id:'neon',name:'Néon',collection:'costumes'},
  {id:'bloc',name:'Bloc',collection:'costumes'}
];

export function heroAsset(id:string,view:'portrait'|'silhouette',theme:'dossier'|'bulletin'){
  if(id==='malik')return `./assets/heroes/portrait-${theme}.webp`;
  return `./assets/heroes/brute-angulaire/${view==='portrait'?'portraits/':''}${id}.png`;
}
