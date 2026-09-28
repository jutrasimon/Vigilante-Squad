# Architecture du prototype

- `src/simulation.ts` : état et règles, aucune dépendance à Phaser/DOM. Générateur pseudo-aléatoire seedé, progression en sous-pas ≤0,25 s, graphe routier et trajet BFS.
- `src/map.ts` : rendu Phaser original par formes géométriques, marqueurs mobiles, clic sur alerte et zoom limité. Carte non rasterisée.
- `src/main.ts` : interface, commandes de jeu, horloge, radio, bilan et outils de labo.
- `src/style.css` : interface responsive; trois portraits via atlas WebP et positions CSS.
- `public/assets/crew.webp` : atlas original généré pour ce prototype, sans personnage de franchise.
- `docs/art-direction` : références visuelles choisies et propositions non validées.
- `tests` : invariants de simulation et parcours Playwright mobile/desktop.

## Environnement

Node 24 utilisé. `npm ci`, `npm run dev`, `npm run build`, `npm test`. Le lockfile est versionné. `dist/` et `node_modules/` sont ignorés. Le build est un site statique; aucune clé ou donnée personnelle requise. Polices Google avec repli système.

`window.vigilante` expose un instantané de lecture pour les tests. Le prototype reste entièrement local au navigateur. Un rechargement repart à zéro. Si l’onglet est suspendu, la simulation n’essaie pas de rattraper le temps réel écoulé : choix de labo, à remplacer pour le réseau.

## Cible réseau, non implémentée

Le moteur de simulation séparé permet une future autorité serveur, avec clients envoyant des commandes plutôt que des résultats. Colyseus est la piste recommandée antérieurement, **pas une dépendance ni une fonctionnalité de V0.1**. Il faudra ajouter identité de joueur, propriété des agents, salles, resynchronisation et validation serveur.

## Assets et archivage

Les références sont conservées en JPEG à dimensions originales pour limiter le poids Git. L’atlas runtime est converti en WebP. Aucun asset de Watchmen/Batman/Kick-Ass/SWAT n’est repris. `scripts/archive-art.py` documente les sources de session et leur conversion; il n’est pas requis pour construire le jeu depuis un clone.

## Publication GitHub Pages

Hébergement principal demandé par Simon : GitHub Pages. Le workflow `.github/workflows/pages.yml` exécute les tests et le build puis publie uniquement `dist/`. Source Pages à régler sur **GitHub Actions** dans les paramètres du dépôt. Le jeton automatique du workflow ne peut pas activer Pages à la première utilisation. Aucune clé ou secret personnel à ajouter.

Vite utilise `base: ./` pour que scripts, CSS et portraits fonctionnent sous `/Vigilante-Squad/`. Les références DA restent dans le dépôt et ne sont pas téléchargées par le jeu. L’ancien site ChatGPT est conservé comme archive; il n’est plus la cible des prochaines publications.
