# Vérification — V0.1

## Exécuté avec succès

- `npm test` : 8 tests de simulation (trajets et ponts, cycle complet, enquête, autonomie/fin de nuit, interdiction de double affectation, police indépendante, reproductibilité des jets, retour au QG même sans énergie).
- `npm run build` : vérification TypeScript stricte et compilation Vite réussies.

## Non exécuté dans cet environnement

Le parcours Playwright est présent pour 390 px et 1365 px, mais le téléchargement Chromium a échoué (archive fournie par le réseau invalide). Le navigateur de contrôle requis par l’environnement Sites n’est pas disponible. **Aucun test visuel mobile réel n’est revendiqué.**

Pour l’exécuter ailleurs : `npx playwright install chromium`, puis `npm run test:ui`.

## Parcours manuel proposé

1. Commencer la nuit, envoyer Nora et Malik à la gare.
2. Choisir la médiation; observer trajet, chance affichée, durée, jet et libération des agents.
3. Envoyer un agent enquêter sur le quai, puis un autre intervenir; vérifier l’effet du renseignement.
4. Laisser une alerte à la police et un agent en patrouille.
5. Essayer la panne électrique avec un profil adapté, puis avec un profil peu adapté.
6. Lire le bilan; rejouer les mêmes jets, puis les varier.
7. Sur téléphone : vérifier sélection, lecture, boutons, défilement et absence de débordement horizontal.

## Régression de clics V0.2

Le workflow GitHub exécute désormais trois parcours Chromium avant publication : souris desktop, tactile 390 px et maintien du focus clavier. Ils testent un appui de 650 ms traversant plusieurs mises à jour, l’identité DOM des boutons et des agents, les sélections répétées, les ordres, le cycle mission, la sélection SVG et le bilan. Des captures sont conservées dans l’artifact `interaction-checks`. Voir le résultat du workflow associé au commit pour le statut d’exécution.
