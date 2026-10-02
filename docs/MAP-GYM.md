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
- Nettoyage des routes : « Routes pleines » activé au départ remplace les pointillés/motifs des rues et sentiers par des lignes continues. Le désactiver restaure les motifs du fournisseur; les voies ferrées restent distinctes. « Numéros de routes » masqué au départ supprime les cartouches `road_shield*` et `highway-shield*` sans enlever les noms des rues. Les couches de références de la source `transportation_name` sont aussi reconnues par leur champ `ref`, même si leur nom change. Ces choix sont sauvegardés/exportés, et les ateliers anciens restent importables.
- Affichage simplifié : au plus neuf catégories (fond, terrain, parcs, eau, bâtiments, rues, rail, noms des rues/quartiers, commerces/lieux). Chaque catégorie a une case afficher/masquer, une couleur et une opacité. Les commerces/lieux du fournisseur sont masqués par défaut; les rues, quartiers et points ajoutés manuellement restent indépendants. Le contrôle collectif s’applique à toutes les sous-couches, même déjà retouchées.
- Les couches individuelles sont conservées dans « Avancé · couches techniques », fermé au départ, avec recherche. Les overrides de catégorie sont enregistrés/exportés dans `overrides` sous la clé `@group:<catégorie>`, compatible avec les ateliers existants. Le retour à la palette d’une catégorie efface aussi les overrides de ses sous-couches. Un preset efface les overrides mais garde les points.
- Les regroupements visuels sont déduits des couches du style Liberty : le panneau par couche permet d’affiner les variantes. Les icônes cartographiques fournies par le style ne sont pas toutes recolorables par une couleur de texte.
- Grain monochrome réutilisé depuis les assets du gym héros; surfaces et halos pilotés par couleurs, aucune rue figée dans une image.

## Points d’intérêt

Types : QG, alerte, police, indice, civils, secours, surveillance. Choisir type, nom et couleur, activer « Placer un point » puis toucher la carte; le mode s’arrête après le placement. « Placer au centre » permet aussi d’ajouter avec le clavier ou sur mobile sans viser un lieu précis.

Toucher un point ouvre son éditeur : nom, type, couleur, coordonnées et suppression. Glisser son icône le déplace; la liste de l’atelier recentre la carte sur le point choisi. Les icônes utilisent le catalogue Tabler local. Ces points sont ajoutés manuellement pour tester la carte; ils ne représentent pas un inventaire officiel de lieux publics.

## Mobile et sauvegarde

Dans **Lieu & caméra**, régler inclinaison, rotation et zoom, ou ajuster directement sur la carte. **Verrouiller la caméra** conserve seulement l’inclinaison et la rotation choisies, sans imposer d’angle. Décocher conserve la vue. Le zoom reste actif : boutons +/−, molette, pincement, double clic, rectangle et clavier. Souris, tactile et flèches déplacent toujours la carte; seules rotation/inclinaison et boussole sont bloquées par le verrou d’angle.

Deux cadenas indépendants définissent l’intervalle de zoom. Dézoomer à la vue la plus éloignée désirée, puis fermer **Loin · zoom minimum**; zoomer à la vue la plus rapprochée désirée, puis fermer **Près · zoom maximum**. Chaque cadenas capture le niveau exact courant. Le rouvrir libère seulement cette limite, sans déplacer la caméra ni modifier l’autre limite. Les limites fonctionnent aussi avec l’angle déverrouillé. Le curseur de zoom et les déplacements vers une ville respectent l’intervalle; en vue verrouillée, le changement de ville conserve le zoom courant. Aucun intervalle arbitraire n’est ajouté aux anciens ateliers.

Angles, zoom courant, verrou d’angle et limites (`camera.zoomBounds.min/max`) sont sauvegardés/exportés/restaurés indépendamment. Changer de palette garde ces choix. Les anciens exports sans limites gardent le zoom libre; l’ancien mode « game » devient un verrou d’angle sur ses angles enregistrés. Réinitialiser déverrouille et supprime les limites. L’atelier mobile s’ouvre par un bouton et défile indépendamment.

Palette, réglages par couche, points et caméra enregistrés dans localStorage sur l’appareil. Export/import d’un atelier JSON version 1; export séparé du style MapLibre effectif pour réutiliser la DA (ne contient pas les points DOM, ceux-ci sont dans l’atelier). L’import d’atelier limite les points à 500 et refuse les données de points invalides. Réinitialisation confirmée avant suppression.

## Validation

Compilation TypeScript et build Vite; tests du moteur principal. Tests navigateur sur mobile/ordinateur avec une petite source géographique locale interceptée : chargement WebGL, presets, création/édition/suppression de points, persistance, export et absence de débordement. Cette fixture teste l’atelier sans dépendre de la disponibilité d’OpenFreeMap. Un test supplémentaire charge le fournisseur réel et conserve les captures Dossier/Bulletin dans les artifacts navigateur. Le worker MapLibre est compilé explicitement par Vite pour fonctionner en développement et sur GitHub Pages.

## Règle de caméra du jeu

La politique réutilisable est dans `src/map-camera.ts`. La carte réelle reste dans ce gym : le jeu principal emploie encore la carte SVG du prototype. Lors de l’intégration de la carte réelle, la politique permettra de verrouiller la vue configurée dans les options et de conserver le déplacement et le zoom dans des limites réglables indépendamment. Aucun angle à 45° n’est imposé par le module.


## Référence validée — 1er octobre 2026

Le fichier `public/config/map-reference.json` conserve exactement l’export fourni par Simon. Les manipulations dans le gym modifient uniquement l’atelier local; elles ne réécrivent jamais cette référence versionnée. Sur un appareil sans atelier sauvegardé, le gym démarre avec cette configuration. Les ateliers déjà sauvegardés restent prioritaires.

Dans **Sauvegarde & export**, **Restaurer la référence** remet tous les réglages, les overrides de couches, le QG et la caméra à ces valeurs, après confirmation du remplacement de l’atelier courant. L’export original reste téléchargeable à `config/map-reference.json`.

- Palette sombre bleu/violet, routes principales mauves, accent cyan.
- Bâtiments 3D actifs, hauteur ×1,6; opacité de catégorie 95 %.
- Routes pleines, numéros de routes masqués, commerces masqués.
- Inclinaison 52,741931579895486°, rotation −94,16823827544492°, angle verrouillé.
- Zoom initial/minimum 15,080196839933233; maximum 18,379892533720255. Le zoom reste disponible dans cet intervalle.
- Centre et point QG conservés aux coordonnées exactes de l’export.

Cette référence concerne la carte réelle du gym; la carte SVG du jeu principal reste distincte jusqu’à son intégration.

## Atelier de terrain — 2 octobre 2026

### Cadrage et limites de déplacement

Le cadenas **Loin · zoom minimum** capture maintenant le centre et les quatre coins géographiques de la vue. À cette distance, le centre reste fixé; zoomer ouvre progressivement la portion du secteur dans laquelle déplacer la caméra. La contrainte s'applique avant le rendu, pour la souris, le tactile, le clavier et les déplacements programmatiques. Le module `map-limits.ts` utilise la projection Mercator et le contour de la vue inclinée, sans imposer un nouvel angle.

Les quatre cadenas **Gauche / Droite / Haut / Bas** mémorisent indépendamment la position du centre à la limite choisie. Les axes suivent l'orientation enregistrée au premier cadenas. Un côté ne peut pas croiser son opposé. Le bouton **Limiter aux quatre coins de cette vue** capture le cadrage courant et le fixe aussi comme zoom minimum. Libérer le cadrage libère la limite de zoom loin. Le cadrage loin est prioritaire si des limites de centre entrent en conflit avec son centre.

`camera.movement.frame` conserve centre, zoom, inclinaison, rotation et empreinte géographique; `camera.movement.pan` conserve origine, orientation et côtés définis. Les anciens JSON sans ces champs restent importables. S'ils ont un zoom minimum, une empreinte est créée à cette distance autour du centre enregistré. La référence JSON originale n'est pas réécrite.

### Ambiance

Dans **Direction artistique → Ambiance & effets** : éclairage des volumes, direction et couleur de lumière, contraste, saturation, glow des points/tokens, pulsation des alertes, ombre des tokens et opacité des zones. Trois essais Neutre / Nuit / Chaud permettent une exploration légère. La pulsation respecte la préférence de réduction des animations. Le relief reste contrôlé par les bâtiments en volume et leur hauteur. L'éclairage est celui des extrusions MapLibre; l'ombre des tokens est un effet graphique, sans simulation d'ombres portées des bâtiments.

### Héros, fiche et véhicules

**Héros & véhicules** utilise les portraits existants du Hero Gym. Placer au centre ou activer le placement puis toucher la map; les tokens sont déplaçables par glisser. Les portraits restent lisibles face à l'écran, avec un socle suivant inclinaison/rotation; les véhicules sont alignés sur le plan de la map et disposent d'une orientation réglable.

Un clic sur un héros ouvre la **vraie fiche du Hero Gym**, intégrée en mode `?embed=1&hero=...`. La fenêtre flotte sur la map : barre pour déplacer, boutons −/+ et poignée du coin pour redimensionner, bouton × pour fermer. Son canevas conserve une largeur de 520 pixels mise à l’échelle; largeur et hauteur de la fenêtre se règlent indépendamment, avec défilement interne. Un nouveau clic rouvre la fiche. Position, taille, ouverture et héros sélectionné sont sauvegardés. HP, Mental et Énergie sont transmis par messages strictement entre la fiche et son parent de même origine; l'ordre de zone apparaît aussi dans la fiche. Le gym complet conserve son affichage habituel.

### Crayon et zones

Le **Crayon** sur la map et **Encercler un secteur** dans l'atelier activent le dessin. Garder le bouton ou le doigt appuyé, tracer un contour et relâcher : il se ferme en polygone géographique. La map ne se déplace pas pendant le dessin. Échap ou Annuler sort du mode; un trait trop court laisse le crayon actif pour recommencer. Les zones demeurent attachées au terrain pendant déplacement et zoom.

Dans **Crayon & zones**, choisir une zone pour changer nom/couleur, assigner un héros et activer **Surveillance**. Un héros a une zone active; le réassigner libère la précédente. Supprimer une zone libère son héros. Le héros rejoint automatiquement le secteur par les rues, puis se déplace à l’intérieur. Surveillance et patrouille sont une seule activité, avec des pauses entre les parcours. La résolution des interventions n’est pas simulée.

### Persistance et vérification

`scene` conserve ambiance, agents, véhicules, zones et fenêtre dans le même JSON version 1. Ancien export sans scène : scène vide. Import invalide : les nouveaux champs sont validés avant le remplacement de l'atelier. Plafonds : 100 agents, 100 véhicules, 100 zones, 1 500 sommets par contour et 1 Mo par fichier importé. Pas de génération automatique d'événements, pas de maillage 3D supplémentaire ni de service externe ajouté.

`tests/map-scene.spec.ts` vérifie la fiche réelle, ratio/déplacement/fermeture, dessin, affectations, suppression, effets, positions, sauvegarde/rechargement, export/import, rejet de données invalides et caméra bloquée au zoom loin. Les essais navigateur utilisent une source cartographique locale pour vérifier ces interactions indépendamment du fournisseur.

## Raffinements du 2 octobre

- Le crayon conserve le contour libre, retire les boucles de fermeture accidentelles et arrondit les angles. Les contours ne sont pas remplacés par des cercles. Les lignes ont des jointures arrondies.
- Surveillance possède une couleur réglable dans Crayon & zones, sauvegardée dans `scene.zoneColors`. Changer l'ordre actualise la couleur. Le portrait du héros assigné apparaît dans la liste et le libellé sur la carte.
- Un secteur ouvre sa propre fenêtre de réglages sur la carte (nom, héros, ordre, recentrage, suppression). Le bouton cible dans la liste recentre la caméra sur le secteur, dans les limites de déplacement configurées.
- La fiche est toujours le vrai `hero-gym.html` embarqué. Les activités hors mission partagent `hero-activities.ts` (QG, Surveillance). Le choix Surveillance est aussi présent dans le Hero Gym indépendant.
- Sélectionner un héros ou un véhicule, activer Déplacer puis cliquer une destination déclenche un trajet routier visible. Les boutons cible recentrent uniquement la caméra. Le glisser-déposer reste un outil de placement.
- La poignée de la fiche règle maintenant largeur et hauteur indépendamment, avec défilement interne. La hauteur facultative `scene.window.height` conserve la compatibilité avec les exports précédents.
- Le socle du héros est centré exactement sur l'ancrage géographique; le survol des points anime uniquement leur symbole. Les types de points gardent leurs couleurs initiales distinctes, également appliquées lorsqu'on change leur type.
- La référence publique reprend l'export fourni le 2 octobre : caméra, couleurs, trois points et Béton. Les sauvegardes locales restent prioritaires; utiliser Restaurer la référence pour la charger.

### Halo des héros et export complet

Le halo reste bleu (`#78dcde`) indépendamment de l'activité. Chaque héros possède un sélecteur dans Héros & véhicules; sa couleur facultative `scene.agents[].color` est enregistrée dans l'atelier. Une ancienne sauvegarde sans couleur retrouve le bleu. L'ouverture de sa fiche sélectionne le token : bordure plus épaisse et pulsation sans déplacement de son ancrage. Fermer la fiche retire l'effet; la préférence système de réduction des animations est respectée.

L'export **Atelier complet (JSON)** inclut les paramètres de caméra, le thème, les couches, les points et toute la scène, notamment couleurs des secteurs, halos, ambiance, positions, affectations et dimensions de la fenêtre. **Style seul (MapLibre)** reste un export du fond de carte. Les tests modifient tous les paramètres d'ambiance et les nouvelles couleurs avant export, puis comparent la scène entière après import et rechargement.


## Navigation routière et atelier Juice

### Déplacements

Ouvrir la fiche d’un héros, choisir **Déplacer le héros**, puis cliquer un point ou le terrain. Un clic ordinaire inspecte seulement le point; sa fenêtre propose aussi **Déplacer ici**. Le petit × du statut annule l’action après confirmation et arrête le héros sur place. Le héros rejoint la rue la plus proche de la destination, avec un trajet en pointillés de la couleur de son halo. La fiche reste ouverte. Son bouton cible recentre la caméra sur sa position actuelle. Sélectionner un véhicule, dans la liste ou sur la carte, utilise le même geste. La vitesse de simulation (×1 à ×30) accélère les essais.

Dans la fiche commune, **Surveillance** (qui englobe la patrouille) affiche un menu de secteurs sans label superflu, avec son effet sur l’énergie dessous. L’affectation fonctionne aussi depuis la fenêtre du secteur. Le héros rejoint le secteur puis parcourt ses rues, en gardant le statut Surveillance. Une marge réglable de 0 à 80 m (35 m par défaut) tolère les imprécisions du crayon et prolonge les petits bouts de rue vers les intersections proches. QG choisit le point QG le plus proche, le rejoint et y reste. Sans QG, secteur accessible ou trajet continu, un message explique le blocage; aucun trajet direct à travers les bâtiments n’est créé.

Le réseau est construit depuis les rues chargées par MapLibre, sans nouveau service de routage : intersections, connexions de ponts/tunnels et distinction rues/sentiers. Les véhicules évitent les sentiers. C’est une simulation de jeu bidirectionnelle, sans feux ni règles de sens unique. La couverture dépend des tuiles chargées : charger la zone en déplaçant/dézoomant la caméra si un trajet manque. Les trajets en cours, destinations, vitesses et affectations sont sauvegardés; un trajet importé reprend là où il était.

`pathfinding.ts` est le moteur de recherche partagé avec le premier gym. `map-roads.ts` construit le graphe géographique; `map-travel.ts` anime les acteurs. La fiche est construite une seule fois par `mountHeroSheet` dans `hero-sheet.ts`, utilisée par l’entrée `hero-gym.ts`; `hero-sheet-bridge.ts` transmet le contexte de la map. Le contexte embarqué masque l’atelier et ajoute le choix de secteur, sans dupliquer la fiche. Les styles de titre, statut et bouton de comparaison sont communs.

### Effets

L’onglet **Juice** configure des règles par **type** (tous les héros, véhicules, alertes, etc.) et **déclencheur**. Clic, arrivée et perte de HP sont branchés; les noms libres comme `solved` peuvent être créés puis testés. Choisir une cible individuelle ou toutes les cibles du type pour l’essai. Pop, squash, flash, shake, zoom, travelling et explosion partagent intensité, durée et couleur. Les nouvelles entités héritent des règles de leur type.

Pour intégrer un événement de jeu : `window.dispatchEvent(new CustomEvent('vigilante:juice', {detail: {type: 'point:alert', event: 'solved'}}))`. Un `target: 'hero:ID'` peut remplacer le type. Créer un nom ne crée pas automatiquement une nouvelle logique de gameplay.

**DA → Pluie** ajoute une pluie d’ambiance indépendante : activation, densité, vitesse, vent, visibilité, teinte et éclaboussures. Elle respecte la réduction des animations et se suspend lorsque l’onglet est masqué. L’ancien effet ponctuel de pluie de particules reste lisible dans les anciens fichiers.

L’export **Atelier complet (JSON)** conserve `scene.juice` (version 2, déclencheurs et règles), `scene.weather`, marges des secteurs, affectations, trajets, vitesse et tous les réglages existants. Les anciens ordres Patrouille deviennent Surveillance; les anciennes règles Juice individuelles sont conservées. Les tests couvrent le déplacement explicite, l’annulation confirmée, les routes tolérantes, les règles par type, la pluie et la comparaison intégrale de la scène après export/import/rechargement.

## Fluidité, lieux et retours visuels — 2 octobre

Le réseau routier ne se reconstruit que lorsque les données de rues changent. Chaque réseau garde les sous-réseaux de secteurs et leurs destinations en cache, par contour et marge. Le graphe d’un secteur contient seulement ses nœuds utiles. Les nouvelles étapes d’une surveillance réutilisent ces résultats; les mises à jour des autres couches n’invalident plus les rues. Le calcul ignore rapidement les rues éloignées et limite les tentatives de parcours. La progression de la fiche utilise un message léger, sans reconstruire sa fenêtre à chaque frame.

Un point ouvre une fenêtre ancrée près de sa position géographique, en préférant une position qui évite la fiche du héros. Le curseur est une main sur les éléments cliquables. À l’arrivée sur un point (alerte, QG, etc.), le héros est représenté par un petit portrait cliquable à côté du point. Ce lien est sauvegardé dans `agents[].point`; `journey.targetPoint` conserve la destination pendant le trajet. Le bouton QG envoie explicitement le héros au QG le plus proche; l’annulation conserve son arrêt sur place.

La fiche partagée affiche un progress bar et les secondes restantes, calculées sur la distance routière et la vitesse de simulation courantes. `journey.totalDistance` conserve la progression initiale à travers l’export/import. Les anciens trajets sans ce champ restent lisibles.

**DA → Chemins de déplacement** expose la couleur commune ou celle du héros, l’épaisseur, l’opacité, le trait continu/tirets/points, le contour et une pulsation. Tout est conservé dans `scene.routeStyle`.

**DA → Pluie** simule des impacts visibles par petits anneaux elliptiques. **Éclairs** fonctionne indépendamment de la pluie : force, couleur, intervalles minimum et maximum tirés aléatoirement, et bouton de test. Les réglages sont dans `scene.weather.lightning`; le calendrier transitoire du prochain éclair n’est pas enregistré.

**Juice** ajoute Temporary Zoom (verrou des gestes caméra, approche, effet, retour au cadrage initial), Shake de l’objet, Pinpoint, Pulse et Glow. `centered` se déclenche après le bouton de recentrage de chaque type. `focus` active ses règles à la sélection, maintient Pulse/Glow puis les arrête à la désélection. Les autres effets focus sont ponctuels à l’entrée de sélection. Les règles de halo animé proviennent désormais de ce module commun. Les règles `click`, `arrival`, `hit` restent branchées; `solved` et les déclencheurs personnalisés sont prêts à être émis par le jeu et testables dans l’atelier.

Tous les paramètres sont validés dans le JSON **Atelier complet**. Les tests vérifient cache réutilisé, changements de marge, progression réelle, retour QG, portraits persistants, non-chevauchement des fenêtres, fin du focus, déclenchement centered, retour de caméra, éclaboussures, éclairs et scène identique après export/import/rechargement.

## Surveillance simplifiée

À l’affectation, un seul parcours routier traversant le secteur est préparé. Le héros rejoint son départ puis effectue le même aller-retour en continu, sans pause ni nouveau calcul à chaque extrémité. Le parcours intérieur est invisible; le trajet d’approche conserve son tracé et son temps restant. Le trajet d’approche affiche En déplacement et son décompte; la boucle affiche Surveillance et son coût énergétique. La couverture de gameplay reste celle du secteur assigné, indépendante de la position visuelle du héros dans ce parcours.

`journey.loopStart` et `journey.loopActive`, avec le chemin, la position et l’index suivant, sont validés et exportés pour reprendre la boucle à l’import. Une ancienne patrouille à destinations successives est convertie une seule fois au chargement. Changer de secteur/marge, donner un nouvel ordre ou annuler remplace/arrête la boucle; les tours suivants ne déclenchent pas une nouvelle arrivée Juice.

### Équipe, bâtiments et retours visuels

- Barre d’équipe en bas : portrait, HP, mental, énergie, activité, centrage. Le portrait ouvre la fiche partagée du Hero Gym, sans copie de son interface.
- Le résumé de la fiche reprend le décompte du trajet. Surveillance conserve le nom du secteur et son coût (0,15 énergie/s), pendant la boucle de surveillance, après le trajet d’approche. Le coût est partagé avec la simulation et appliqué aux héros affectés; les ressources sont sauvegardées.
- Les héros au repos rejoignent automatiquement le QG le plus proche. L’activité idle est mémorisée séparément des ordres temporaires : à leur fin, le héros reprend son secteur ou rejoint le QG le plus proche. Annuler l’activité idle la suspend sans effacer sa préférence.
- Les déclencheurs Juice `click`, `arrival`, `hit`, `centered`, `focus` sont connectés et non supprimables. Toute modification de règle s’applique et se sauvegarde immédiatement. `solved` et les événements personnalisés restent appelables via `vigilante:juice`. L’édition laisse les clics du jeu actifs; « Choisir une cible sur la carte » active explicitement la sélection d’une cible d’essai. Pinpoint est dessiné derrière les marqueurs.
- Bâtiments interactifs : choisir un bâtiment, changer sa couleur, l’associer à un point (sa sélection souligne le bâtiment), le détruire avec une explosion, puis le restaurer. Les empreintes et les états sont enregistrés dans `scene.buildings`. Cela masque les volumes cartographiques dans cet atelier; ce n’est pas une simulation de fracture physique. Les géométries proviennent des tuiles chargées au moment de la sélection.
- La pluie masque les éclaboussures devant les bâtiments visibles, avec cache spatial invalidé aux mouvements et modifications. Le nombre de flashs, leur durée et les intervalles entre flashs sont réglables par plages.
- Le double-clic ne zoome plus. Les commandes de navigation, l’échelle et la bannière de statut visuelle sont retirées; une attribution discrète reste présente. Ville et pays sont modifiables dans Lieu & caméra et enregistrés dans `place`.
- L’export complet inclut ces réglages et les bâtiments détruits. L’export « style seul » demeure un style MapLibre, pas une sauvegarde du jeu.

### Bords de carte et vignette

Direction artistique propose une vignette réglable : intensité, couleur, ouverture centrale, douceur, rondeur et centre horizontal/vertical. Les anciens exports conservent leur intensité de vignette.

Le signal des limites dessine une brume lumineuse sur le côté bloqué lors d’un déplacement à la souris, au clavier ou au toucher. Le zoom à sa limite produit une pulsation périphérique. Les mouvements programmatiques ne déclenchent pas le signal. Activation, couleur, intensité, largeur, fondu et durée sont réglables en DA, avec un bouton de prévisualisation; les animations respectent la préférence de mouvement réduit et ne capturent aucun clic.

Juice inclut « Vignette écran ». Sa forme suit la DA, avec la couleur/intensité/durée propres à la règle. Sur `focus`, elle reste active pendant la sélection; autrement elle apparaît puis disparaît. Elle ne modifie pas la vignette permanente. Tous ces paramètres sont enregistrés dans l’atelier JSON.

### Corrections de la carte et personnalisation

- La barre héros reprend les icônes, couleurs de ressources et jauges segmentées de la fiche partagée : HP menthe, mental mauve, énergie or. Elle distingue trajet, tâche actuelle et idle mémorisé.
- Le parcours de surveillance couvre les rues et ruelles connectées du secteur. La marge vaut 12 m par défaut, sans extension cachée; le parcours est préparé une fois puis bouclé. Les anciens parcours sont recalculés une seule fois au chargement (`patrolVersion: 2`).
- `agents[].idle` et `resumeIdle` conservent l’activité préférée et le retour après un ordre temporaire, même à l’import. Le glisser de token reste un outil de placement.
- Une sélection isole un polygone de bâtiment, même lorsque la tuile regroupe plusieurs bâtiments ou réutilise un identifiant. Les voisins du groupe restent affichés. Les anciennes sélections groupées sont réduites à leur premier bâtiment, faute de position de clic enregistrée.
- Les bâtiments sont des cibles Juice normales. `destroyed` et `restored` sont connectés et protégés. La règle de destruction par défaut combine explosion, débris et fumée; sa modification est immédiate. Le panneau bâtiment conserve les couleurs normale/détruite, l’association à un point et les actions détruire/restaurer. Un volume de décombres bas reste après destruction.
- Les éclaboussures utilisent la position exacte du point pour éviter que les bâtiments voisins ne masquent toute une rue étroite. Les libellés sont placés avant les volumes dans le style pour l’occlusion.
- L’attribution est repliée dans un bouton d’information et un compteur FPS apparaît en bas à droite.
- L’export complet comprend les préférences idle, parcours, couleurs, bâtiments, règles Juice, météo et paramètres de fondu; la configuration de référence n’est pas remplacée.
