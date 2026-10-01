# Vigilante Squad

Prototype jetable de dispatch de justiciers, en temps réel, **web et mobile first**. On teste les décisions avant de figer le jeu ou la DA.

## Jouer

Hébergement cible : **GitHub Pages**, indépendant de ChatGPT. Adresse attendue après activation : https://jutrasimon.github.io/Vigilante-Squad/

Le workflow [Publish playable prototype](.github/workflows/pages.yml) teste, compile et publie automatiquement chaque modification de `main`. Première activation : **Settings → Pages → Build and deployment → Source : GitHub Actions**. Si le premier déploiement a échoué avant cette activation, relancer le workflow depuis Actions.

### Lancer localement

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite. Sur téléphone, utiliser l’adresse réseau de la machine sur le même Wi-Fi.

Une nuit dure **4 minutes**. Sélectionner des agents, choisir une alerte, effectuer un repérage ou intervenir. À l’arrivée, choisir une approche; les autres interventions continuent. Pause, ×1/×2/×4, rejouer et bilan sont des **outils de labo**, pas des règles finales.

Le bilan permet de rejouer les mêmes jets ou de les varier. Rien n’est sauvegardé entre deux chargements.

## Contenu de cette tranche

- Trois personnages : Corps / Esprit / Âme, tags positifs et défauts.
- Déplacements sur un graphe de rues avec deux ponts.
- Quatre alertes : confrontation, inondation, problème électrique, médias.
- Repérage, patrouille, choix d’intervention, renfort avant exécution, décision autonome par défaut.
- Probabilités visibles, résultat du jet dans la radio, fatigue et blessures.
- Une unité de police qui se déplace et prend une alerte en charge.
- Fin de nuit et bilan, y compris si aucune action n’est entreprise.

**Solo uniquement pour ce test.** Pas de serveur, compte, lobby ou synchronisation réseau. Le multijoueur reste l’objectif; il n’est pas simulé par des étiquettes J1/J2.

## Documentation

- [Vision et décisions](docs/DESIGN.md)
- [Alertes : catalogue, jets, difficultés et conséquences](docs/ALERTES.md)
- [Règles provisoires de cette tranche](docs/PROTOTYPE.md)
- [Références DA et dernières propositions](docs/art-direction/README.md)
- [Gym de carte réelle et points d’intérêt](docs/MAP-GYM.md)
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

HTML/CSS + SVG + TypeScript + Vite; Morphdom conserve les éléments interactifs entre les mises à jour. Phaser a été retiré en V0.2. Les fichiers compilés sont dans `dist/`. Publication statique possible à la racine ou dans un sous-dossier. Le manifeste `.openai/hosting.json` correspond au laboratoire privé de test.

## V0.2 — Réactivité

Les boutons gardent leur identité DOM pendant les mises à jour (au lieu de remplacer les panneaux toutes les 200 ms). La carte SVG conserve ses marqueurs et textes. Retours immédiats sur sélection et ordre, désélection après envoi, animations natives et respect de la réduction des mouvements. Les tests navigateur souris, tactile et clavier tournent dans un workflow indépendant; les tests du moteur et la compilation restent requis pour publier.
