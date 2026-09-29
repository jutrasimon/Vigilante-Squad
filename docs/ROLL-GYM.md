# Gym des tirages

Accessible à `roll-gym.html`, indépendant du jeu. Les quatre variantes reprennent les préférences visuelles : ruban numéroté, grille de cent cases, compteur mécanique et curseur sur seuil.

Préparation : contributions chiffrées, portraits carrés, chance globale. Résultat : jet contre seuil, conséquences communes (civils/confiance), PV et mental sous chaque portrait.

Le scénario illustratif est fixe à 70 % : base 50 + équipe 20 + talents 15 − risque 5 − fatigue 10. Il ne remplace pas le calcul de la simulation. Scénarios forcés 64/84 pour comparer, ou jet uniforme 1–100 via crypto et rejet du reliquat. Le résultat est déterminé une seule fois, l’animation ne le modifie pas. Durées 1,2 / 2,4 / 4 secondes, révélation immédiate si réduction des animations demandée.

Conséquences d’exemple : réussite = 2 civils, confiance +1, mental −1 par héros ; partiel = 1 civil, confiance inchangée, PV −2 et mental −2 par héros. Aucune mutation de la partie. Les tests couvrent chaque animation, les résultats et les débordements à 320, 390 et 1365 px.

## Ajustements du ressenti
- Durée par défaut : 4 secondes (options 1,2 / 4 / 6).
- Ruban : 20 cases parcourues dans un seul sens, ralentissement progressif.
- Grille : sauts aléatoires non consécutifs, cadence décroissante, case active verte ou rouge selon sa zone.
- Compteur : les trois chiffres deviennent verts ou rouges selon le nombre affiché, y compris pendant le tirage.
- Curseur : montée de 1 à 97, oscillations amorties autour de 70, puis déplacement vers le résultat final. Cette chorégraphie est décorative et ne représente pas une évolution des chances.
