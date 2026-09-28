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


## Interface V0.3

Les cartes des héros affichent leur état (disponible, occupé en trajet ou en action, décision attendue, patrouille, enquête, retour, épuisement), leur destination et le délai restant. Toucher un héros occupé ouvre son intervention.

La carte, les héros et le panneau d’intervention partagent l’écran. Sur mobile, les trois zones sont empilées; les informations secondaires défilent dans le panneau. La radio et les profils détaillés s’ouvrent dans des fenêtres dédiées. Sous 650 px de hauteur, un défilement de page reste possible.

Les tests navigateur contrôlent les transitions d’état et la présence des héros et des boutons de décision dans le viewport, sur ordinateur et mobile émulé.


## Boucle autonome V0.4

Chaque héros dispose d’une tâche par défaut : repos au QG (initialement) ou patrouille. Le sélecteur « Après » reste accessible pendant une intervention : changer la consigne ne coupe pas la mission. À sa fin, y compris après une enquête, le héros reprend cette consigne. Les boutons de groupe Patrouiller et Retour au QG changent également la consigne.

La patrouille suit un circuit couvrant les rues et les deux rives, sans quartiers définis. Sous 15 % d’énergie, le héros rentre se reposer; à 100 %, il reprend sa patrouille. Un héros suffisamment reposé arrivant sur le nœud d’une alerte active s’y engage automatiquement, même si cela interrompt un trajet vers une autre mission. Il attend ensuite le choix d’approche habituel; une enquête explicitement demandée reste une enquête à sa destination. Les alertes futures ou terminées ne déclenchent rien.

La progression de résolution est le temps de travail écoulé depuis le choix d’approche : barre et pourcentage dans le panneau, pourcentage sur la carte et dans la liste d’alertes, petite barre sur les héros engagés. Ce pourcentage est distinct de la probabilité de réussite.


## Navigation de la carte

La roulette zoome autour du pointeur (1× à 4×). Maintenir le bouton gauche ou central permet de déplacer la carte, y compris à l’échelle initiale. Un glissement ne sélectionne pas une alerte; un clic simple la sélectionne toujours. Le déplacement au doigt reste possible sur mobile. Les boutons +/− zooment autour du centre actuel.


## Préparation V0.5 (remplace la sélection préalable V0.3/V0.4)

Intervenir ouvre la préparation sans héros présélectionné. Cliquer un héros ouvre le même écran avec ce héros sélectionné; l’événement peut être changé dans la liste. Cet écran affiche les héros, leurs stats et leur état, les totaux de l’équipe, les exigences de l’événement et les chances estimées par approche. Les héros occupés sont indisponibles. Seul le bouton Envoyer confirme l’ordre; fermer ne dépêche personne. La simulation continue et l’envoi est revalidé à la confirmation. Les sélecteurs individuels Après remplacent les anciens boutons de groupe.

Valeurs de test des exigences Corps / Esprit / Âme : conflit 8/6/10, secours 12/10/6, technique 6/12/6, médias 4/8/12. Nouvelle formule prototype cohérente avec les totaux : 50 + 5 × (total de l’attribut utilisé − exigence) + 15 si un spécialiste possède le talent + bonus d’approche et renseignements, moins les malus de fatigue/blessure/nervosité. Bornée à 15–95 %. Les exigences des autres attributs servent à comparer les autres approches, sans bloquer l’envoi.

Sur la carte, l’anneau se vide et le centre affiche les secondes restantes : fenêtre d’intervention en phase signal, temps avant choix autonome en phase décision, durée restante en phase résolution. La progression accomplie demeure affichée dans le panneau et les cartes héros.
