# Vigilante Squad

Prototype jetable de dispatch de justiciers, en temps réel, **web et mobile first**. On teste les décisions avant de figer le jeu ou la DA.

## Jouer

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite. Sur téléphone, utiliser l’adresse réseau de la machine sur le même Wi-Fi.

Une nuit dure **4 minutes**. Sélectionner des agents, choisir une alerte, enquêter ou intervenir. À l’arrivée, choisir une approche; les autres interventions continuent. Pause, ×1/×2/×4, rejouer et bilan sont des **outils de labo**, pas des règles finales.

Le bilan permet de rejouer les mêmes jets ou de les varier. Rien n’est sauvegardé entre deux chargements.

## Contenu de cette tranche

- Trois personnages : Corps / Esprit / Âme, tags positifs et défauts.
- Déplacements sur un graphe de rues avec deux ponts.
- Quatre alertes : confrontation, inondation, problème électrique, médias.
- Enquête, patrouille, choix d’intervention, renfort avant exécution, décision autonome par défaut.
- Probabilités visibles, résultat du jet dans la radio, fatigue et blessures.
- Une unité de police qui se déplace et prend une alerte en charge.
- Fin de nuit et bilan, y compris si aucune action n’est entreprise.

**Solo uniquement pour ce test.** Pas de serveur, compte, lobby ou synchronisation réseau. Le multijoueur reste l’objectif; il n’est pas simulé par des étiquettes J1/J2.

## Documentation

- [Vision et décisions](docs/DESIGN.md)
- [Règles provisoires de cette tranche](docs/PROTOTYPE.md)
- [Références DA et dernières propositions](docs/art-direction/README.md)
- [Architecture et lancement](docs/TECHNIQUE.md)
- [Tests réalisés et limites](docs/TESTS.md)

## Vérifier

```sh
npm test
npm run build
# Avec Chromium installé :
npx playwright install chromium
npm run test:ui
```

Phaser 3 + TypeScript + Vite; interface HTML/CSS. Les fichiers compilés sont dans `dist/`. Publication statique possible à la racine ou dans un sous-dossier. Le manifeste `.openai/hosting.json` correspond au laboratoire privé de test.
