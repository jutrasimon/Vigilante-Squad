# Icônes du projet

Kit : **Tabler Icons 3.48.0**, licence MIT. 6 220 SVG (5 166 outline, 1 054 filled).

- Catalogue officiel : https://tabler.io/icons
- Source : https://github.com/tabler/tabler-icons
- Dépendance exacte `@tabler/icons` dans package.json et package-lock.json : `npm ci` restaure tout le catalogue.
- SVG disponibles dans `node_modules/@tabler/icons/icons/outline/` et `filled/`.
- Métadonnées et mots-clés : `node_modules/@tabler/icons/icons.json`.
- Licence conservée dans TABLER-LICENSE.txt.

## Ajouter une icône

Importer son SVG avec `?raw` dans `src/icons.ts`, l’ajouter au dictionnaire, puis utiliser `icon('nom')`. Le helper produit du SVG décoratif avec `aria-hidden`; garder un libellé visible ou un aria-label sur les commandes. Seuls les SVG explicitement importés sont intégrés au jeu, aucun appel CDN ni police d’icônes.

## Codes visuels

Corps : haltère/orange. Esprit : cerveau/cyan. Âme : cœur/violet.
Vert : favorable/disponible. Ambre : incertain/en cours. Corail : risque/urgence.
Les barres d’équipe partagent une échelle fixe 0–24, avec un marqueur blanc pour la difficulté. Les jauges circulaires de réussite sont distinctes du compte à rebours et indiquent explicitement un %.
