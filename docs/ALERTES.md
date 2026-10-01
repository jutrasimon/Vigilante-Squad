# Alertes — catalogue et moteur de résolution

Révision du 1er octobre 2026. **Document de travail : règles proposées à tester, pas une mise à jour du moteur.**

Ce document devient le point d’entrée pour concevoir les alertes. `PROTOTYPE.md` conserve l’historique de la tranche jouable; `ROLL-GYM.md` décrit les animations; `HERO-GYM.md` décrit les essais de fiche. Une animation différente ne change jamais les probabilités.

## 1. Ce qui est établi et ce qui reste proposé

| Sujet | État |
|---|---|
| Corps / Esprit / Âme, TAGS positifs et négatifs | Base retenue |
| Repos au QG et patrouille; rencontres autonomes 50/50 intervention ou repérage | Présents dans le prototype |
| Repérage = préparation; enquête = famille de missions | Distinction retenue |
| Objet unique par héros, véhicule individuel compris; changement au QG | Retenu pour le gym, pas raccordé au moteur |
| PV / Mental / Énergie distincts des attributs; vitesse de déplacement | Retenu; implémentation différente entre gym et jeu |
| Épuisé affecte tous les attributs et le déplacement | Intention retenue; −2 et seuil de 3 efforts restent des essais du gym |
| Police et gouvernement ont leurs propres missions | Intention retenue; seule une intervention police existe actuellement |
| Formule 50 + 5 × écart + TAGS et modificateurs, borne 15–95 | Présente dans le moteur; valeurs encore provisoires |
| Plusieurs étapes, vrais échecs, conséquences critiques, nouveau catalogue chiffré ci-dessous | Propositions de cette révision |

Les familles retrouvées dans la doc sont secours, violences, enquêtes, incidents techniques, catastrophes naturelles, émeutes et relations médias. Les anciennes maquettes montraient aussi incendies, accidents et braquages; ce ne sont pas des règles déjà validées. Quatre alertes seulement sont jouables : altercation à la gare, montée des eaux, panne au marché et vidéo médiatique.

## 2. Ce qu’est une alerte

Une alerte contient un **problème**, un **lieu**, un **objectif**, une **fenêtre de prise en charge**, une ou plusieurs **étapes**, et des **conséquences**. La famille sert au classement; la difficulté appartient à l’approche choisie, pas à toute la famille.

Une étape propose généralement deux approches. Chacune précise : action, attribut utilisé, difficulté, TAG pertinent, durée, coût, risque et résultats possibles. On ne demande pas les trois attributs à chaque jet.

**Un jet par étape à enjeu, pour toute l’équipe.** Pas de jets par héros puis de jet collectif supplémentaire. Pas de jet pour une animation, un déplacement normal, changer d’objet ou consulter des renseignements.

- Une étape : choisir → exécuter → tirer → appliquer les conséquences.
- Deux étapes : un premier objectif change la situation, puis un nouveau choix intervient. Exemple : localiser les personnes, puis les évacuer.
- Maximum proposé pour commencer : deux étapes. Une étape supplémentaire doit apporter une décision différente, pas rallonger une barre.
- Un échec ne permet pas de relancer gratuitement la même action. Il ferme l’étape ou ouvre une suite explicitement écrite.

## 3. Calcul du jet

1. Additionner l’attribut **actuel** des héros présents et engagés.
2. Soustraire la difficulté de l’approche. Chaque point d’écart vaut **5 points de pourcentage**.
3. Ajouter la base **50 points**, le TAG adapté **+15**, le repérage **+10**, puis les modificateurs explicitement déclenchés.
4. Borner à **15–95 %**. Afficher le total et garder le détail consultable.

`chance = borne(50 + 5 × (total actuel − difficulté) + TAG + repérage + modificateurs, 15, 95)`

Atteindre la difficulté donne 50 % avant bonus : **ce n’est ni une garantie ni un verrou d’accès**. L’équipe peut tenter une approche sous la difficulté. Aucun bonus anonyme « avantage » supplémentaire : l’écart est déjà converti une fois.

Exemple proposé pour la gare : Malik Corps 6 + Silas Corps 8 = 14; difficulté 12; écart +2 = +10 points. Base +50, Protection +15, Approche risquée −5 : **70 %**. Avec repérage : **80 %**. La difficulté Corps de la gare jouable est encore 8, donc le même duo y obtient actuellement 90 % sans repérage.

### Difficulté initiale

| Difficulté | Usage de départ | Héros total 8, sans bonus | Équipe total 14, sans bonus |
|---:|---|---:|---:|
| 6 | Incident limité | 60 % | 90 % |
| 8 | Intervention courante | 50 % | 80 % |
| 10 | Situation exigeante | 40 % | 70 % |
| 12 | Situation difficile | 30 % | 60 % |
| 16 | Opération lourde | 15 % (borne) | 40 % |

Ce sont des points de départ, pas des niveaux liés au nombre de héros envoyés. Ajouter un héros améliore le total mais mobilise quelqu’un ailleurs et expose ses ressources. Pour les premiers essais : trois participants maximum par étape, même en coopération, afin d’éviter des totaux sans limite. Cette limite est proposée, non décidée.

### TAGS et état actuel

- Un seul TAG favorable désigné par approche donne +15. Plusieurs porteurs du même TAG ne cumulent pas : `Protection — Malik / Silas (non cumulable)`.
- Un TAG provenant de l’objet fonctionne comme le même TAG permanent. Pas de deuxième bonus pour les avoir tous les deux.
- Les malus contextuels doivent nommer leur déclencheur. Proposition : `Nerveuse −10` en confrontation pour chaque porteur engagé, avec noms consultables. `Impulsif` reste sans effet tant qu’un déclencheur n’est pas défini.
- `Approche risquée −5` doit correspondre à un avantage réel : durée réduite ou objectif plus ambitieux. Un risque de blessure, à lui seul, n’impose pas automatiquement −5.
- Épuisé modifie les valeurs **avant** leur addition. Pas de deuxième ligne « fatigue » pour refaire payer la même baisse.
- Proposition de migration : retirer l’ancien −10 sous 35 énergie et le −15 « blessé » lorsque les états altérés auront des effets explicites sur les valeurs. Ne pas superposer les deux générations de règles.
- Les descriptions de TAGS ne sont pas du code : chaque effet nécessite un identifiant, un déclencheur et une valeur explicites.

### Quand fixer le résultat

Proposition : à la confirmation de l’action, figer participants, valeurs actuelles, objet, difficulté, bonus et chance; déterminer un unique entier uniforme de 1 à 100. Le révéler après l’exécution. Les quatre animations montrent ce même résultat sans nouveau tirage.

Les renforts arrivés avant confirmation peuvent participer. Après confirmation, ils attendent l’étape suivante. Un repérage tardif bénéficie à la prochaine étape, pas rétroactivement au jet en cours. L’annulation ferme l’action sans rendre le jet rejouable; ses coûts restent acquis.

**Différence actuelle :** le moteur recalcule la chance et tire à la fin; une rencontre autonome peut rejoindre une action en cours. Ces comportements devront être corrigés lors de l’intégration de cette proposition.

## 4. Résultats et conséquences

Proposition avec un seul d100, sans deuxième jet de dégâts :

| Jet | Résultat |
|---|---|
| 1 | Réussite critique |
| 2 à chance incluse | Réussite |
| chance + 1 à min(chance + 15, 99) | Résultat partiel |
| Au-delà jusqu’à 99 | Échec |
| 100 (00 au compteur) | Échec critique |

La chance affichée comprend le critique positif. À 70 % : 70 résultats réussis (dont 1 critique), 15 partiels, 15 échecs (dont 1 critique). Les animations gardent 70 cases vertes et 30 rouges; le rouge signifie « objectif complet non atteint ». Le bilan distingue ensuite partiel en ambre, échec en rouge et critiques avec un symbole. Aucun sens ne dépend uniquement de la couleur.

Chaque approche écrit ses conséquences dans quatre champs : **objectif obtenu**, **effet sur la ville**, **effet sur chaque héros**, **suite éventuelle**. Pas de « civils sauvés » générique pour une réparation ou une déclaration publique.

### Coûts et dégâts proposés

| Élément | Règle de test |
|---|---|
| Prise en charge sur place | −5 énergie par héros, une fois par alerte |
| Étape ordinaire | −10 énergie par participant, à la confirmation |
| Étape intense | −20 énergie par participant, à la confirmation |
| Mental | −1 à l’issue d’une réussite; −2 à l’issue d’un partiel ou échec, uniquement pour une étape explicitement marquée éprouvante |
| PV | 0 par défaut. Approche physiquement risquée : −1 en partiel, −2 en échec, par participant exposé |
| Critique positif | Résultat réussi + avantage propre à l’approche; à défaut, récupération de 5 énergie du coût de l’étape |
| Critique négatif | Résultat échoué + complication propre; à défaut, −1 mental supplémentaire par participant |

Le coût normal n’est pas facturé une deuxième fois au résultat. Les pertes sont bornées à zéro et le journal inscrit les pertes réelles. Une approche non violente peut échouer sans blesser quiconque. Les risques sont annoncés avant confirmation.

PV à zéro : proposition d’indisponibilité et retour assisté, sans mort permanente. Mental à zéro : retrait de l’intervention et récupération au QG. Énergie insuffisante pour payer l’action : confirmation désactivée. Si l’énergie atteint zéro après paiement, l’action déjà engagée se termine puis retour au QG. Ces règles restent à implémenter; le jeu actuel n’applique pas ces réactions.

Épuisé : proposition conservant l’essai du gym, +1 effort pour une alerte ordinaire terminée, +2 si au moins une étape intense; jamais +1 par jet. À 3 efforts : −2 aux attributs, −2 km/h, planchers 0 / 1. Retrait après récupération complète au QG. Les TAGS temporaires en « missions restantes » diminuent une fois à la fermeture d’une alerte à laquelle le héros a participé, pas à chaque étape; un TAG reçu à la clôture commence à décompter à la suivante. Le repérage seul ne compte pas comme une mission terminée.

## 5. Catalogue révisé

Toutes les valeurs de cette section sont **proposées**. `D` = difficulté. Les durées sont des secondes du prototype, hors trajet et choix. TAG absent : l’action reste possible, sans +15. Les approches n’ont aucun modificateur implicite supplémentaire.

| Famille / alerte | Approche A | Approche B | Ce que le jet décide |
|---|---|---|---|
| Violences — altercation à la gare | Désamorcer : Âme D10, Médiation, 15 s | Protéger les civils : Corps D12, Protection, 10 s, Risquée −5 | Fin de la confrontation ou extraction des personnes |
| Criminalité — braquage | Négocier une sortie : Âme D12, Médiation, 20 s | Extraire les otages : Corps D14, Protection, 15 s | Mise en sécurité; le suspect peut s’échapper selon l’approche |
| Secours — accident routier | Dégager les occupants : Corps D10, Protection, 16 s | Stabiliser les blessés : Esprit D8, Soins, 18 s | Extraction ou stabilisation en attendant les secours |
| Incendie — immeuble évacué partiellement | Ouvrir un passage : Corps D12, Protection, 16 s | Trouver un accès sûr : Esprit D10, Repérage, 20 s | Accès aux personnes, puis éventuelle évacuation |
| Catastrophe naturelle — montée des eaux | Évacuer par l’escalier : Corps D12, Protection, 16 s | Guider vers le toit : Esprit D10, Repérage, 22 s | Mise en sécurité immédiate ou attente sécurisée des secours |
| Technique — panne au marché | Isoler le circuit : Esprit D12, Électronique, 18 s | Établir un périmètre : Âme D8, Médiation, 12 s | Danger supprimé ou public protégé en attendant les techniciens |
| Émeute — place centrale | Calmer la foule : Âme D12, Médiation, 20 s | Identifier les agitateurs : Esprit D10, Repérage, 18 s | Dispersion ou identification permettant une seconde étape |
| Enquête — disparition signalée | Reconstituer le parcours : Esprit D10, Repérage, 20 s | Recueillir un témoignage : Âme D8, Médiation, 18 s | Piste exploitable, puis localisation de la personne |
| Relations médias — vidéo d’intervention | Expliquer les décisions : Âme D10, Médiation, 14 s | Présenter des faits vérifiés : Esprit D8, Repérage, 18 s | Confiance publique; les faits doivent avoir été obtenus auparavant |

Les nouvelles familles ne supposent pas de nouveaux attributs. Un accident n’est pas forcément un combat; une émeute ne se réduit pas à frapper la foule. Les missions de factions utilisent les mêmes objectifs concrets.

### Résultats propres à chaque alerte

Valeurs de confiance de test, accordées **une fois à la clôture**, pas à chaque étape. Les coûts personnels ci-dessus s’ajoutent. Un résultat partiel conserve une utilité sans produire automatiquement une victoire complète.

| Alerte | Réussite | Partiel | Échec | Expiration sans prise en charge |
|---|---|---|---|---|
| Altercation | 2 civils en sécurité, confiance +1; violence stoppée si dialogue | 1 civil en sécurité, confiance 0; relais nécessaire | Aucun civil sécurisé par l’équipe, confiance −1 | Confrontation aggravée, confiance −1 |
| Braquage | Otages sécurisés, confiance +1; fuite possible du suspect si extraction | Une partie des otages extraite, confiance 0 | Otages toujours menacés, confiance −1; relais police | Suspect fuit; secours encore nécessaires, confiance −1 |
| Accident | Occupants extraits OU stabilisés, confiance +1 | Une personne assistée; secours requis, confiance 0 | Aucun objectif atteint, confiance −1 | Relais secours retardé, confiance −1 |
| Incendie | Accès ouvert puis habitants évacués, confiance +1 | Une partie évacuée; pompiers prennent le relais, confiance 0 | Accès perdu; retrait, confiance −1 | Zone condamnée, confiance −1 |
| Inondation | 2 résidents sécurisés, confiance +1 | 1 résident sécurisé, confiance 0 | Aucun résident sécurisé par l’équipe, confiance −1 | Accès fermé; relais secours, confiance −1 |
| Panne | Circuit isolé OU périmètre tenu, confiance +1; réparation requise après périmètre | Zone partiellement sécurisée, confiance 0 | Danger toujours présent, confiance −1 | Panne étendue, confiance −1 |
| Émeute | Foule apaisée OU menace ciblée traitée, confiance +1 | Zone refuge établie; tension persistante, confiance 0 | Tension accrue, confiance −1 | Dispersion policière à gérer, confiance −1 |
| Disparition | Personne localisée et sécurisée, confiance +1 | Piste fiable transmise pour suivi, confiance 0 | Piste perdue, confiance 0 | Piste refroidie, confiance 0 |
| Médias | Confiance +2 | Version partiellement retenue, confiance 0 | Confiance −1 | Version non contestée, confiance −1 |

Le nombre d’otages, d’occupants ou d’habitants doit être une donnée de chaque instance : pas de compteur universel de deux civils. « Aucun civil sécurisé par l’équipe » ne signifie pas « civil mort ». Aucun décès automatique n’est ajouté par cette proposition.

## 6. Trois fiches complètes pour tester le moteur

### A. Altercation à la gare — une étape

- Fenêtre : 95 s après apparition; objectif : mettre deux civils à l’abri.
- Choix automatique après 30 s sur place; approche ayant la meilleure chance, puis risque PV le plus faible en cas d’égalité, puis ordre stable du catalogue.
- Dialogue : Âme D10, Médiation +15, 15 s, coût ordinaire, éprouvant, aucun dégât PV.
- Protection : Corps D12, Protection +15, Risquée −5, 10 s, coût ordinaire, éprouvant, risque PV.
- Résultats : table du catalogue. Critique positif : résultat réussi et +1 confiance supplémentaire. Critique négatif : résultat échoué et −1 mental supplémentaire.
- Test de référence : duo Malik/Silas, Protection, sans renseignement = 70 %. Jet 1 critique; 64 réussite; 70 réussite; 71 et 84 partiels; 85 partiel; 86 échec; 100 critique négatif.

### B. Émeute — deux étapes conditionnelles

- Fenêtre de prise en charge : 100 s. L’approche Dialogue peut terminer directement l’alerte.
- Étape 1 : calmer la foule (Âme D12, Médiation, 20 s, ordinaire, éprouvant) OU identifier les agitateurs (Esprit D10, Repérage, 18 s, ordinaire, aucun coût mental).
- Dialogue réussi : clôture réussie. Partiel : zone refuge, clôture partielle. Échec : relais police, clôture échouée.
- Identification réussie : étape 2 débloquée, acteurs identifiés. Partiel : étape 2 débloquée mais renseignements incomplets. Échec : pas d’intervention ciblée à l’aveugle; relais police, clôture échouée.
- Étape 2 : convaincre les agitateurs de se retirer (Âme D10, Médiation, 15 s, ordinaire, éprouvant) OU extraire les personnes menacées (Corps D12, Protection, 12 s, intense, éprouvant, risque PV).
- Identification réussie donne +10 à l’étape 2; identification partielle donne 0. Ce +10 utilise le même emplacement de renseignement que le repérage, donc jamais +20.
- Le résultat de l’étape 2 détermine la clôture selon le catalogue. Les coûts de l’étape 1 restent acquis. Un repérage préalable n’identifie pas automatiquement les agitateurs : il prépare l’étape, sans accomplir son objectif.
- Critiques : bonus par défaut énergie/mental. Aucun bonus de confiance au milieu de la chaîne.

### C. Médias — une étape sans dégât physique

- Fenêtre : 100 s après apparition. Objectif : répondre à une vidéo incomplète.
- Explication : Âme D10, Médiation, 14 s; toujours disponible.
- Faits vérifiés : Esprit D8, Repérage, 18 s; nécessite le renseignement « faits vérifiés » lié à cet incident, issu d’un repérage ou d’un rapport pertinent. Un TAG Repérage seul n’est pas une preuve.
- Coût ordinaire; aucune perte PV ni mentale par défaut. Résultats : confiance +2 / 0 / −1. Critique positif : +3 au lieu de +2; critique négatif : −2 au lieu de −1. Ces valeurs remplacent les bonus critiques génériques.
- Le rapport peut parler de blessés antérieurs mais le jet médiatique ne crée pas de nouvelle blessure.

## 7. Temps, repérage et factions

Trois temps distincts : **avant prise en charge**, **avant choix automatique**, **avant fin d’action**. La barre d’exécution montre le temps, jamais le pourcentage d’objectif réellement résolu. L’animation du jet et sa pause finale sont de la présentation : elles ne retardent pas artificiellement les conséquences dans le monde partagé.

Pour les premiers essais, la prise en charge arrête l’expiration initiale. Pas de minuterie cachée entre étapes. Une future mission avec catastrophe imminente devra annoncer séparément son échéance absolue.

Repérage : pas de jet dans cette version; trajet, −5 énergie, renseignement +10 non cumulable puis retour à la consigne. La vitesse et l’objet influencent l’heure d’arrivée, pas directement la chance. Le TAG Repérage peut en revanche servir sur une approche qui le demande. Ne pas renommer l’action « enquête ».

Rencontre autonome : garder le 50/50 actuel comme réglage de test. Si une action est déjà lancée, le héros ne rejoint pas son jet; si le renseignement est déjà obtenu, ne pas repayer un repérage inutile. Ces deux protections sont à intégrer.

Police : violences, braquage, foule, protection de périmètre. Gouvernement/services municipaux : hébergement, évacuation, rétablissement de services. Ils annoncent destination, objectif et délai; leur réussite peut résoudre tout ou partie du problème sans donner au joueur les crédits d’une action qu’il n’a pas faite. Pas de pénalité automatique pour avoir laissé une faction réussir.

Proposition minimale : faction en route → sur place → résultat, sans simuler immédiatement tous ses agents. À la prise en charge par le joueur, proposer un objectif complémentaire ou un relais, éviter deux résolutions du même objectif. En coopération, l’action et ses conséquences ont un identifiant unique partagé; l’hôte/serveur décide une seule fois du jet. Aucun réseau n’est ajouté par cette doc.

Retrait : confirmer l’annulation, conserver les coûts et objectifs déjà acquis, libérer les héros vers leur consigne. S’il reste du temps, l’alerte redevient disponible avec son état modifié; même étape abandonnée non rejouable par la même équipe. Fin de nuit : rapport « interrompue », objectifs déjà acquis conservés, aucun jet fictif pour les actions inachevées.

## 8. Données minimales et lecture dans l’interface

| Objet de données | Champs nécessaires |
|---|---|
| Alerte | identifiant, famille, titre, lieu, apparition, échéance, objectifs, renseignement, faction, étapes |
| Approche | identifiant, libellé, attribut, difficulté, TAG pertinent, prérequis éventuel, modificateurs nommés, durée, coût, risques |
| Étape en cours | participants, approche, début/fin, instantané du calcul, jet unique, état |
| Résultat | catégorie, objectifs acquis, confiance, pertes/gains réels par héros, TAGS appliqués, prochaine étape ou clôture |
| Journal | heure, alerte/étape, action, participants, résultat, conséquences, détail du calcul replié |

Préparation : objectif et lieu; attribut actuel cumulé face à la difficulté; écart; base; TAGS déclenchés avec porteurs; total à droite; durée et conséquences possibles. Les autres attributs restent dans la fiche héros, pas dans une nouvelle salade de chiffres.

Action : intitulé précis, participants, temps restant. Tirage : chance et seuil visibles, effet final puis pause. Conséquences : objectif obtenu, impacts sur le monde, impacts par portrait; aucun besoin de conserver le module animé. Le résumé du héros doit toujours suivre l’état réel.

## 9. Intégration à venir et points à éprouver

Ordre proposé : gare à une étape → panne avec objectifs distincts → médias sans dégâts génériques → émeute à deux étapes → autres familles. Conserver les quatre animations comme habillages interchangeables du même jet.

À vérifier avant de modifier le moteur : fréquence des résultats partiels (15 points), limite de trois participants, durée utile du repérage, seuil de fatigue, coût d’une chaîne comparé à une mission simple. La formule additive peut favoriser une grosse équipe; observer si le coût d’opportunité suffit avant d’ajouter un autre calcul.

Contrôles requis lors de l’implémentation : bornes 15/95, jets 1/100, frontières du partiel, TAG partagé/objet compté une fois, Épuisé appliqué une fois, aucune variation du jet après lancement, pas de double coût ni double conséquence, expiration/retrait, faction concurrente, états cohérents mobile et journal. Cette révision est documentaire; ces contrôles ne prétendent pas être déjà implémentés.
