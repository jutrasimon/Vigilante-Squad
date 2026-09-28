"""One-time packaging of already generated reference images; no aesthetic changes."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SCRATCH=ROOT.parent
sources=[
('01-watchmen-jaune','exec-564dd274-f6c7-4c7c-a14f-fcd780b01127.png','Minuit jaune sale — sélection utilisateur'),
('02-noir-pluie','exec-316687d0-7986-4e68-87ba-978baef27a9f.png','Noir sous la pluie — sélection utilisateur'),
('03-cartographie','exec-ab2c9b8a-7ecb-4c18-be8d-1be5dbaa8f22.png','Cartographie nocturne — sélection utilisateur'),
('04-comics','exec-b3b685a7-9bc1-4bf4-9bbf-a6d3eb787100.png','Comics sous contrôle — sélection utilisateur'),
('05-brutalisme','exec-8bbdf171-bebf-481e-b430-74036f68aa02.png','Brutalisme clandestin — sélection utilisateur'),
('06-terminal','exec-1ce361f0-a5b0-4a6e-aebf-b9782cf82e1c.png','Terminal 1998 — sélection utilisateur'),
('07-clair-portraits','exec-982ef5d4-2f6d-4a9d-b4c0-56b47842addb.png','Ville miniature — sélection POUR LES PORTRAITS, pas la carte claire'),
('08-surveillance','exec-40c86a07-f629-42c6-9242-6ae2041c9028.png','Surveillance en mosaïque — sélection utilisateur'),
('A-jaune-sale','exec-f095f185-bb7b-4d3f-b686-ad7bcef8a32b.png','Proposition A — non approuvée'),
('B-pluie-froide','exec-b7071808-1495-488e-a8d4-ef5417b02907.png','Proposition B — non approuvée'),
('C-beton-braise','exec-040076ea-6d37-4dfe-af38-82378f64008a.png','Proposition C — non approuvée'),
('D-comics-minuit','exec-dd09e0ff-8553-4539-9120-91edc5fc7052.png','Proposition D — non approuvée')]
folder=ROOT/'docs/art-direction';folder.mkdir(parents=True,exist_ok=True)
lines=['# Références de direction artistique','','**Aucune DA finale approuvée.** Simon : « pas totalement satisfait mais ça donne une idée ».','','Les huit premières images sont ses préférées. La sélection claire porte explicitement sur les portraits. A–D sont les derniers essais, pas une décision. Images générées pendant la discussion; maquettes de recherche, pas captures du moteur. Copies JPEG pour garder le dépôt léger; aucun changement de composition.','','## Lecture de la sélection','','- Urbain sombre, gritty, quotidien; références d’ambiance Watchmen, Batman, Kick-Ass.','- Portraits expressifs, reconnaissables en petit, encrés ou semi-réalistes. Ne pas masquer tous les visages.','- Carte nocturne lisible et réalisable sur navigateur/mobile; éviter de produire des milliers de détails décoratifs.','- Interface structurée, contrastes francs; jaune sale ou orange sont des pistes, pas une palette validée.','- Le prototype utilise une carte géométrique originale et un atlas de trois portraits. Il ne reproduit pas une maquette pixel à pixel.','','## Planches','']
for name,source,caption in sources:
 p=SCRATCH/'generated_images'/source
 if not p.exists():raise FileNotFoundError(p)
 Image.open(p).convert('RGB').save(folder/(name+'.jpg'),quality=82,optimize=True)
 lines += ['### '+caption,'',f'![{caption}]({name}.jpg)','',f'Source de génération : `{source}`.','']
(folder/'README.md').write_text('\n'.join(lines))
# Format conversion for the runtime atlas, no cropping or creative edit.
Image.open(ROOT/'public/assets/crew.png').convert('RGB').save(ROOT/'public/assets/crew.webp',quality=88)
print('12 références archivées; atlas WebP exporté.')
