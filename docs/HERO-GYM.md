# Gym héros

Entrée : hero-gym.html, reliée au hub gyms.html. Deux habillages d’une même fiche : Dossier opérationnel et Bulletin de terrain. Mode portrait prioritaire; sur PC la fiche conserve une largeur de lecture verticale.

## Composants réutilisables
- CSS variables : accent, hp, mental, energy, surface, background, text, texture. Palettes indépendantes par design; export CSS depuis l’atelier.
- Cadres et angles coupés CSS, icônes Tabler currentColor, jauges HTML segmentées, cadran SVG. Aucun texte, bouton ou couleur de jauge intégré aux bitmaps.
- Grain SVG monochrome répétable en overlay soft-light; usure SVG blanche transparente. Opacité réglable, pointer-events:none. Les couleurs viennent du fond CSS. Ces couches sont décoratives et peuvent être retirées.
- Portraits carrés et décor mission générés séparément, optimisés en WebP. Ils sont remplaçables; les couleurs illustrées ne sont pas pilotées par les variables UI.
- Phylactère en position absolue, animation et disparition; aucun changement de layout.

## Périmètre
Données de démonstration locales; réglages du gym sans effet sur la partie. Les onglets Équipement, Véhicule et Journal affichent explicitement un contenu à définir. L’état, les jauges, Idle et le trajet sont testables. Voir la mission ouvre le prototype avec la gare sélectionnée et la carte centrée (nouvelle partie de démonstration).

## Assets
public/assets/heroes/ : portrait-dossier.webp, portrait-bulletin.webp, gare.webp, grain.svg, scuffs.svg. Les illustrations sont générées pour le projet, sans UI incrustée. Sources de génération : portrait réaliste peint urbain, portrait encré roman graphique, gare nocturne panoramique. Ne pas exporter de boutons en images : conserver les primitives CSS/SVG.

## Raffinement et édition de la fiche
- En-tête urbain en couches, portrait carré, nom et statut séparés. Les textures restent neutres et les surfaces utilisent les variables de palette.
- Atelier replié pour laisser la fiche visible sur mobile. Corps, Esprit et Âme modifiables (0–20, plage de test).
- TAGs personnalisés : nom, description, caractère défavorable et suppression. Modifications temporaires dans le gym, sans impact sur la simulation.
- Infobulles accessibles au survol, au focus et au toucher ; fermeture par Échap, toucher extérieur ou défilement. Descriptions éditoriales, sans bonus inventé.
- Cadran : groupe chiffre/unité centré indépendamment du libellé.

## Ajustements de la fiche — 30 septembre
Bandeaux de design retirés. Les Halles désigne le squad/joueur. Attributs en emblèmes alignés, surfaces sobres ; bulletin sans coins coupés ni ligne inclinée. Maximums HP/Mental réglables de 1 à 30, valeurs actuelles bornées au maximum. Idle compact : QG restaure HP, Mental et Énergie (indication de comportement, pas de récupération simulée dans ce gym). Accès mission depuis le statut ; annulation confirmée ramène au choix Idle dans le gym. Infobulles sans étiquette TAG ni points d’interrogation ; **mot-clé** produit du gras dans une description personnalisée.

## Propositions des onglets secondaires
Contenu exclusivement expérimental, non raccordé à la simulation principale. Les deux habillages partagent les mêmes données.
- Déplacement : bande compacte sous Tri-Stat, icône route, couleur `speed` indépendante. Vitesse de base à pied réglable de 1 à 20 km/h.
- Équipement : protection légère ou renforcée (−1 km/h à pied ; réduction de dégâts proposée), radio ou outils (TAG contextuel proposé), deux charges de soins (+2 HP plafonnés par charge). Les soins et la pénalité de vitesse fonctionnent dans le gym.
- Véhicule : à pied / vélo 15 km/h / scooter 25 km/h. Comparaison sur 300 m : secondes = plafond(distance / (km/h / 3,6)). Bouton de test instantané : −2 / −1 / 0 énergie, puis entrée au journal. Pas de carburant ni de maintenance pour ce premier essai. La fiche anime un court trajet de 20 m à la vitesse sélectionnée.
- Journal : trois exemples initiaux, puis événements des changements de matériel, soins et trajets. Filtres Tout / Missions / État / Matériel. Entrées de test marquées TEST ; réinitialisation au rechargement.

### Bulles au-dessus du nom
Barks superposés au nom vers la droite, pointe vers le portrait, sans déplacement de la fiche. Dossier : coque sombre anguleuse, contour accent pour les cris. Bulletin : papier tramé, contour en éclats et ombre d’encre. Typographie forte, entrée brève avec rebond, maintien 3,8 s ; mouvement réduit respecté.
Référence de lecture : Absolute Batman #9 (2025), aperçu https://comic-watch.com/comic-book-reviews/absolute-batman-9-a-bane-in-the-neck : contraste fort, texte serré et pointes dirigées vers le locuteur. Les formes anguleuses sont une adaptation à la demande, pas une copie des bulles de cette page.

## Objet unique — remplace les essais Équipement / Véhicule
L’onglet Objet présente quatre cartes égales (2 × 2) : vélo, trousse, jumelles, gilet. Un seul objet équipé, vélo compris. Coche et contour indiquent le choix. Au QG (`rest`), clic/toucher/Entrée équipe immédiatement sans confirmation. En trajet, intervention ou patrouille, les trois alternatives sont désactivées et grisées ; le contrôle interdit également le changement dans le gestionnaire d’action.
Vitesse du gym : base +12 km/h pour le vélo, base −1 pour le gilet (minimum 1), base pour les deux autres. Les TAGS Soins / Repérage / Protection sont des propositions affichées ; aucune nouvelle résolution dans le jeu principal. Le journal consigne les changements. Les anciens soins à charges et véhicules indépendants sont retirés du gym.
Deux habillages préservés : Dossier (fines bordures) et Bulletin (encrage plus fort, grain). Accent = sélection ; Déplacement = bonus de vitesse ; Positif = TAGS ; Négatif = malus. HP/Mental/Énergie et Corps/Esprit/Âme restent indépendants.
Asset réutilisable : `public/assets/heroes/objects.webp`, atlas 2 × 2 sans texte généré avec imagegen intégré. Ordre : vélo, trousse, jumelles, gilet. Prompt : quatre illustrations d’objets comic gritty, fond charbon neutre, sans interface ni texte, chaque objet contenu dans son quadrant. Les cadres, textes, badges et verrouillages sont en HTML/CSS/SVG recolorables.

Les TAGS accordés par les objets partagent les mêmes styles `.tag.positive` que la fiche (cadre, icône bouclier, typographie, palette et variante Bulletin). Ils restent intégrés à la carte cliquable, sans bouton imbriqué. Les valeurs de vitesse gardent leur présentation de statistique.

## Recherche de héros — brute angulaire

Le sélecteur propose les 20 nouveaux héros (8 justiciers et 12 costumes de super-héros), ainsi que Malik comme référence précédente. Les noms sont provisoires. La sélection change uniquement l'identité visuelle de la fiche et les noms dans le journal et la confirmation d'annulation. Les attributs, TAGs, objets et valeurs de démonstration restent les mêmes; aucun pouvoir ou effet lié au handicap n'est ajouté.

Deux cadrages : Portrait et Silhouette. Les images sont des PNG avec un véritable canal alpha, dans `public/assets/heroes/brute-angulaire/` et son sous-dossier `portraits/`. Le portrait est un recadrage de présentation; la silhouette complète reste disponible séparément. Les silhouettes ont été extraites et reproduites à partir des cinq planches approuvées avec imagegen, sans papier, libellé, portrait dupliqué ou fond. Le cadrage et l'optimisation PNG conservent l'alpha. Axiome conserve son fauteuil, Comète sa prothèse, Sentinelle son orthèse et sa béquille, Prisme ses aides auditives et Le Pacte sa canne.

Le décor se trouve dans une couche HTML/CSS indépendante de l'image. Dossier utilise un fond sombre, une grille discrète et des lignes dorées. Bulletin utilise des aplats crème, rouge et bleu, une trame et l'usure neutre. Les couleurs suivent les palettes éditables existantes. L'atelier permet aussi un fond uni ou un damier pour visualiser la transparence. Le damier n'est jamais inclus dans les PNG téléchargés. Les liens Portrait PNG et Silhouette PNG téléchargent les fichiers du héros sélectionné.

Les TAGs et les règles d'objet unique au QG utilisent toujours leurs composants partagés. La recherche reste isolée du prototype de dispatch.

## Profil : état actuel, identité et journal (propositions du gym)
- Valeurs actuelles en gros; bouton « Valeurs de base et effets » pour le calcul Corps / Esprit / Âme et déplacement. Aucun changement au moteur principal.
- Épuisé : −2 aux trois attributs (plancher 0), −2 km/h (plancher 1). Mission normale : 1 effort; difficile : 2. À 3 efforts, Épuisé apparaît. Récupération complète au QG le retire. Ces seuils sont des propositions, ajustables après essai.
- Atelier : boutons de mission normale/difficile, récupération et case Épuisé. Les jauges diminuent et le journal enregistre les conséquences. Les TAGS libres peuvent avoir une durée en missions (0 = permanent); leur texte ne crée pas automatiquement un modificateur numérique.
- Les TAGS d’objet apparaissent sur la fiche, sans doubler un TAG permanent identique. Infobulles : source, permanence/durée. Détails des objets sous l’image.
- Résumé supérieur et panneau mission utilisent la même source pour trajet, repérage, choix, action et retour. Animation de démonstration : trajet → choix → action → retour → activité choisie.
- PV/Mental/Énergie : règles proposées dans un volet repliable de la fiche; conséquences et causes dans le journal. Les réactions à zéro ne sont pas implémentées dans cette démo.
- Identité : histoire et motivation éditables par héros, enregistrées localement sur l’appareil. Pas de biographie inventée et imposée.
- Journal : nuit 01 de démonstration, filtres Tout/Missions/Personnage, conséquences en pastilles et rapport dépliable. Essais en mémoire jusqu’au rechargement; ne constitue pas encore un historique du jeu principal.

### Raffinement du profil
- Journal : « État et équipement » remplace « Personnage ». Les entrées précisent ÉTAT ou ÉQUIPEMENT.
- Identité : récit en lecture seule, défilement interne (molette, toucher ou clavier). Les anciens textes locaux sont conservés et réunis en un récit. Sans texte local, une proposition narrative remplit le gym.
- Comparaison des bases : bouton maintenu au-dessus de Corps/Esprit/Âme, aucun toggle persistant. Pendant l’appui, valeurs actuelles grisées et bases à côté, y compris vitesse à pied sans objet ni altération. Relâchement, annulation, perte de focus ou changement de fenêtre rétablissent la vue normale. Les jauges ne sont pas des attributs de base.

## Publication et vérification indépendantes
- `pages.yml` publie après installation npm, tests du moteur et compilation. Aucun navigateur n’est téléchargé ni exécuté pour publier.
- `browser-checks.yml` exécute les tests UI séparément, à chaque push sur main et sur les PR, ou manuellement. Un échec reste visible sur GitHub sans empêcher Pages de publier.
- Les téléchargements Chromium sont mis en cache par version du lockfile. Installation limitée à 4 minutes, tests à 4 minutes, job à 12 minutes.
- Les captures restent disponibles dans l’artifact `interaction-checks` du workflow navigateur. Les contrôles de compilation et du moteur restent obligatoires pour publier.
