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
