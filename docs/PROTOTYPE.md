# Tranche 0.1 — Une nuit aux Halles

But : fermer la boucle **alerte → déplacement → découverte → choix → jet → conséquences → bilan**.

## Hypothèses modifiables

| Élément | Valeur de test |
|---|---|
| Nuit | 240 secondes, horloge fictive 22 h → 6 h |
| Temps | Continu; ×2/×4 et pause réservés au labo |
| Agents | Nora, Malik, Silas |
| Attributs | Corps / Esprit / Âme, valeurs provisoires sur 10 |
| Trajet | 5 s par segment; Silas à 85% à cause de son genou |
| Information | Enquête ciblée : déplacement puis révélation, +10 points de probabilité |
| Patrouille / enquête de quartier | Un renseignement sur une alerte inconnue toutes les 20 s |
| Décision autonome | Après 30 s sur place, approche ayant la probabilité la plus élevée |
| Renfort | Possible pendant le choix; pas une fois l’action lancée |
| Fatigue | -5 à l’arrivée, -18 à l’action; blessures risquées : -12 supplémentaires |
| Récupération | Au QG, +0,7 énergie/s; ne guérit pas les blessures |
| Déploiement | Minimum 15 énergie |

## Profils

| Agent | Corps | Esprit | Âme | Atouts | Défaut |
|---|---:|---:|---:|---|---|
| Nora | 4 | 8 | 5 | Repérage, Électronique | Nerveuse : -10 points de probabilité en confrontation |
| Malik | 6 | 4 | 8 | Médiation, Protection | Impulsif : tag exploratoire, **aucun effet dans cette tranche** |
| Silas | 8 | 6 | 3 | Protection, Électronique | Genou fragile : déplacement ralenti |

Les défauts ne sont donc pas tous implémentés : l’interface les rend visibles pour discuter des profils. Pas de progression ni gestion de mana.

## Résolution transparente

Pour chaque participant : attribut × 6 + 15 si tag adapté − 15 si blessé − 10 si énergie <35 − malus contextuel. Prendre le meilleur résultat, ajouter 15 de base, 8 par coéquipier, 10 si renseignement, puis le modificateur d’approche. Borner entre 15 et 95%. Tirer 1–100; réussir si jet ≤ seuil. Le jet est affiché dans la radio.

Échec = résultat partiel : un civil aidé au lieu de deux, blessure si action risquée. Médias : confiance +2 ou -1. Succès hors médias : confiance +1. Alerte expirée : -1. Ce modèle volontairement uniforme sert à tester; il ne décrit pas encore des chaînes de missions riches.

## Scénario

| Début | Fenêtre jusqu’à | Alerte | Choix |
|---:|---:|---|---|
| 0 s | 95 s | Altercation gare | Âme / médiation ou Corps / protection |
| 35 s | 155 s | Montée des eaux | Corps / évacuation ou Esprit / itinéraire |
| 80 s | 205 s | Panne marché | Esprit / électronique ou Âme / sécurisation |
| 130 s | 230 s | Relations médias | Âme / explication ou Esprit / faits |

Une fenêtre expire uniquement avant prise en charge. L’arrivée sur place ouvre la décision, puis une action dure 10–22 s. La fin de nuit termine toutes les interventions restantes comme non achevées.

La police choisit à partir de 55 s une alerte encore non prise en charge, s’y rend en suivant les rues, puis la résout après 16 s si elle est toujours libre. Une seule mission police dans cette tranche.

## Ce qu’il faut observer

- Choisit-on un profil, ou seulement l’agent le plus proche ?
- Le déplacement rend-il l’enquête intéressante ou simplement trop coûteuse ?
- A-t-on le temps de lire et choisir sur téléphone ?
- Les agents autonomes aident-ils ou privent-ils le joueur de décisions ?
- Les résultats partiels donnent-ils envie de réagir ?

## Limites assumées

Un seul quartier, quatre alertes scriptées, pas de mission à étapes multiples ou de nouvel événement déclenché par une blessure, pas d’équipement, pas d’économie, pas de coopération réseau. Patrouille et enquête de quartier sont encore trop proches (la première se déplace, la seconde reste à son point). À différencier après test plutôt que d’ajouter des sous-systèmes maintenant.
