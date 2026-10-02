# Gym carte réelle

Entrée : `map-gym.html`, accessible depuis `gyms.html` et le bouton Gyms du jeu. Atelier indépendant des alertes et du moteur de déplacement.

## Carte et données

MapLibre GL JS 6.11.2, installé par npm et chargé uniquement par cette page. Style de départ Liberty d’OpenFreeMap, données géographiques OpenStreetMap/OpenMapTiles. La carte utilise de vraies rues et bâtiments, pas un décor inventé. Les géométries disponibles dépendent du lieu et du niveau de zoom.

Sources officielles : https://maplibre.org/maplibre-gl-js/docs/ et https://openfreemap.org/quick_start/ ; service public https://openfreemap.org/ sans clé API. Attribution cartographique conservée et visible sur la carte. Une connexion réseau et WebGL sont nécessaires; message visible si une ressource ne charge pas. Le jeu principal ne dépend pas du chargement de ce gym.

## Atelier

- Départ Montréal/Plateau; raccourcis Québec/Saint-Roch et Paris/Les Halles. Toute autre localisation par latitude/longitude. Pas de recherche d’adresse ni de service de géocodage ajouté.
- Presets Dossier, Bulletin et Nuit électrique; couleurs indépendantes : fond, sol, eau, parcs, bâtiments et contours, rues, axes principaux, rail, texte, halo, accent.
- Largeur des rues, opacité des bâtiments, taille des libellés, hauteur 3D, inclinaison, rotation, grain et vignette.
- Affichage des bâtiments, parcs et libellés; taille et noms des points d’intérêt. « Bâtiments en volume » est accessible dans Affichage de la carte. Les palettes conservent ce choix et le réglage de hauteur 3D; le verrou de caméra ne désactive pas les volumes.
- Nettoyage des routes : « Routes pleines » activé au départ remplace les pointillés/motifs des rues et sentiers par des lignes continues. Le désactiver restaure les motifs du fournisseur; les voies ferrées restent distinctes. « Numéros de routes » masqué au départ supprime les cartouches `road_shield*` sans enlever les noms des rues. Ces choix sont sauvegardés/exportés, et les ateliers anciens restent importables.
- Affichage simplifié : au plus neuf catégories (fond, terrain, parcs, eau, bâtiments, rues, rail, noms des rues/quartiers, commerces/lieux). Chaque catégorie a une case afficher/masquer, une couleur et une opacité. Les commerces/lieux du fournisseur sont masqués par défaut; les rues, quartiers et points ajoutés manuellement restent indépendants. Le contrôle collectif s’applique à toutes les sous-couches, même déjà retouchées.
- Les couches individuelles sont conservées dans « Avancé · couches techniques », fermé au départ, avec recherche. Les overrides de catégorie sont enregistrés/exportés dans `overrides` sous la clé `@group:<catégorie>`, compatible avec les ateliers existants. Le retour à la palette d’une catégorie efface aussi les overrides de ses sous-couches. Un preset efface les overrides mais garde les points.
- Les regroupements visuels sont déduits des couches du style Liberty : le panneau par couche permet d’affiner les variantes. Les icônes cartographiques fournies par le style ne sont pas toutes recolorables par une couleur de texte.
- Grain monochrome réutilisé depuis les assets du gym héros; surfaces et halos pilotés par couleurs, aucune rue figée dans une image.

## Points d’intérêt

Types : QG, alerte, police, indice, civils, secours, surveillance. Choisir type, nom et couleur, activer « Placer un point » puis toucher la carte; le mode s’arrête après le placement. « Placer au centre » permet aussi d’ajouter avec le clavier ou sur mobile sans viser un lieu précis.

Toucher un point ouvre son éditeur : nom, type, couleur, coordonnées et suppression. Glisser son icône le déplace; la liste de l’atelier recentre la carte sur le point choisi. Les icônes utilisent le catalogue Tabler local. Ces points sont ajoutés manuellement pour tester la carte; ils ne représentent pas un inventaire officiel de lieux publics.

## Mobile et sauvegarde

Dans **Lieu & caméra**, régler inclinaison, rotation et zoom, ou ajuster directement sur la carte. Cocher **Verrouiller la caméra** mémorise exactement la vue choisie, sans angle imposé. Décocher conserve cette même vue pour la retoucher. Le verrou laisse le glissement à la souris, le déplacement à un doigt et les flèches du clavier; molette, pincement, double clic, zoom par rectangle, rotation, inclinaison et raccourcis de zoom sont bloqués. Les boutons zoom/boussole sont cachés et les trois curseurs désactivés. Changer de ville, recentrer un point ou changer de palette garde la vue verrouillée. Angle, zoom et verrou sont sauvegardés et exportés ensemble, puis restaurés au chargement/import. Les anciens exports sans verrou restent libres; l’ancien mode « game » devient un verrou sur ses angles enregistrés. Réinitialiser l’atelier déverrouille et remet la caméra à ses valeurs de départ. L’atelier mobile s’ouvre par un bouton et défile indépendamment.

Palette, réglages par couche, points et caméra enregistrés dans localStorage sur l’appareil. Export/import d’un atelier JSON version 1; export séparé du style MapLibre effectif pour réutiliser la DA (ne contient pas les points DOM, ceux-ci sont dans l’atelier). L’import d’atelier limite les points à 500 et refuse les données de points invalides. Réinitialisation confirmée avant suppression.

## Validation

Compilation TypeScript et build Vite; tests du moteur principal. Tests navigateur sur mobile/ordinateur avec une petite source géographique locale interceptée : chargement WebGL, presets, création/édition/suppression de points, persistance, export et absence de débordement. Cette fixture teste l’atelier sans dépendre de la disponibilité d’OpenFreeMap. Un test supplémentaire charge le fournisseur réel et conserve les captures Dossier/Bulletin dans les artifacts navigateur. Le worker MapLibre est compilé explicitement par Vite pour fonctionner en développement et sur GitHub Pages.

## Règle de caméra du jeu

La politique réutilisable est dans `src/map-camera.ts`. La carte réelle reste dans ce gym : le jeu principal emploie encore la carte SVG du prototype. Lors de l’intégration de la carte réelle, la politique permettra de verrouiller la vue configurée dans les options et de conserver uniquement le déplacement de caméra. Aucun angle à 45° n’est imposé par le module.
