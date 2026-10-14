/* ═══════════════════════════════════════════════════════════════════════
   Notybat — Bibliothèque technique de composants du bâtiment (Croquis Paint)
   v5.41.453

   Chaque élément est dessiné EN MILLIMÈTRES (coupe ou vue en long) puis
   ramené à l'échelle du croquis. Toutes les dimensions restent modifiables
   (champ « Autre dimension ») : les listes ne sont que des raccourcis.

   Sources des dimensions :
   • Profilés acier laminés à chaud : séries normalisées (Euronorm / EN 10365,
     DIN 1025 pour IPN, DIN 1026 pour UPN) — hauteur h, largeur b, âme tw,
     aile tf, telles que publiées dans les catalogues des producteurs
     (ArcelorMittal Sections commerciales, etc.). Rayons de congé non dessinés.
   • Cornières, tubes, plats : dimensions commerciales courantes (EN 10056,
     EN 10219 / 10210, EN 10058).
   • Bois, panneaux, isolants, plaques de plâtre, ossatures métalliques de
     cloison : sections / épaisseurs USUELLES du négoce français — à
     confirmer avec le fournisseur (`ind:true` = indicatif).
   • Couverture, zinguerie, maçonnerie, réseaux : représentations
     symboliques paramétrables (pas de « cote fabricant » imposée).
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── Couleurs ───────────────────────────────────────────────────────── */
const COL = {
  bois:'#f2d98a', boisT:'#5b4a1e', lc:'#ecc86e', lvl:'#e6bf73', clt:'#efcf86',
  acier:'#c4c9d1', acierT:'#2f343b', galva:'#d5dbe2', alu:'#e1e5ea', zinc:'#a9bccb', cuivre:'#c9824a', inox:'#dfe4ea',
  beton:'#dcd8d0', betonT:'#6e6a62', parpaing:'#cfcac0', brique:'#d98a5f', pierre:'#cbbba0', terre:'#b08d62', gravier:'#d6d0c4',
  osb:'#e2b65c', cp:'#e9c27a', mdf:'#c99a62', part:'#d8b989', platre:'#f3f1ea', platreT:'#8c8a80', ciment:'#b9bcbf', fibrebois:'#b88a52',
  lverre:'#f4e08a', lroche:'#d7c7a2', lbois:'#c8975a', ouate:'#cfd3d6', pse:'#f5f5f5', xps:'#9fd0f0', pir:'#f0e6b8', liege:'#a87a4b', chanvre:'#c9c08a',
  pp:'#1aa7e0', pv:'#7b4bd6', fv:'#2ab37a', epdm:'#2b2b2b', bitume:'#333', polyane:'#8fb6c9',
  tuile:'#c45a3a', ardoise:'#4f5862', bac:'#9aa3ad', vert:'#2e8b57',
  pvc:'#9a9a9a', pvcGris:'#7c8590', gaine:'#f39c12', cuivreT:'#b06a35', verre:'#bfe3f3',
};

/* ── Helpers de données ─────────────────────────────────────────────── */
const items = [];
function add(o){ items.push(o); return o; }
const SZ = (l, p) => ({ l, p });
function wh(list){ return list.map(([b, h]) => SZ(b + '×' + h, { b, h })); }
function th(list){ return list.map(e => SZ(e + ' mm', { e })); }

/* Profilés I (h, b, tw, tf) — EN 10365 / Euronorm 19-57 (IPE), Euronorm 53-62 (HE), DIN 1025-1 (IPN) */
const IPE = [[80,80,46,3.8,5.2],[100,100,55,4.1,5.7],[120,120,64,4.4,6.3],[140,140,73,4.7,6.9],[160,160,82,5,7.4],[180,180,91,5.3,8],[200,200,100,5.6,8.5],[220,220,110,5.9,9.2],[240,240,120,6.2,9.8],[270,270,135,6.6,10.2],[300,300,150,7.1,10.7],[330,330,160,7.5,11.5],[360,360,170,8,12.7],[400,400,180,8.6,13.5],[450,450,190,9.4,14.6],[500,500,200,10.2,16],[550,550,210,11.1,17.2],[600,600,220,12,19]];
const IPN = [[80,80,42,3.9,5.9],[100,100,50,4.5,6.8],[120,120,58,5.1,7.7],[140,140,66,5.7,8.6],[160,160,74,6.3,9.5],[180,180,82,6.9,10.4],[200,200,90,7.5,11.3],[220,220,98,8.1,12.2],[240,240,106,8.7,13.1],[260,260,113,9.4,14.1],[280,280,119,10.1,15.2],[300,300,125,10.8,16.2]];
const HEA = [[100,96,100,5,8],[120,114,120,5,8],[140,133,140,5.5,8.5],[160,152,160,6,9],[180,171,180,6,9.5],[200,190,200,6.5,10],[220,210,220,7,11],[240,230,240,7.5,12],[260,250,260,7.5,12.5],[280,270,280,8,13],[300,290,300,8.5,14],[320,310,300,9,15.5],[340,330,300,9.5,16.5],[360,350,300,10,17.5],[400,390,300,11,19]];
const HEB = [[100,100,100,6,10],[120,120,120,6.5,11],[140,140,140,7,12],[160,160,160,8,13],[180,180,180,8.5,14],[200,200,200,9,15],[220,220,220,9.5,16],[240,240,240,10,17],[260,260,260,10,17.5],[280,280,280,10.5,18],[300,300,300,11,19],[320,320,300,11.5,20.5],[340,340,300,12,21.5],[360,360,300,12.5,22.5],[400,400,300,13.5,24]];
const HEM = [[100,120,106,12,20],[120,140,126,12.5,21],[140,160,146,13,22],[160,180,166,14,23],[180,200,186,14.5,24],[200,220,206,15,25],[220,240,226,15.5,26],[240,270,248,18,32],[260,290,268,18,32.5],[280,310,288,18.5,33],[300,340,310,21,39]];
/* Profilés U (h, b, tw, tf) — DIN 1026-1 (UPN, ailes inclinées), EN 10365 (UPE, ailes parallèles) */
const UPN = [[80,80,45,6,8],[100,100,50,6,8.5],[120,120,55,7,9],[140,140,60,7,10],[160,160,65,7.5,10.5],[180,180,70,8,11],[200,200,75,8.5,11.5],[220,220,80,9,12.5],[240,240,85,9.5,13],[260,260,90,10,14],[280,280,95,10,15],[300,300,100,10,16]];
const UPE = [[80,80,50,4,7],[100,100,55,4.5,7.5],[120,120,60,5,8],[140,140,65,5,9],[160,160,70,5.5,9.5],[180,180,75,5.5,10.5],[200,200,80,6,11],[220,220,85,6.5,12],[240,240,90,7,12.5],[270,270,95,7.5,13.5],[300,300,100,9.5,15]];
const iSizes = (pref, t, taper) => t.map(([n, h, b, tw, tf]) => SZ(pref + ' ' + n, { h, b, tw, tf, taper: taper || 0 }));

/* ── Familles ───────────────────────────────────────────────────────── */
const FAM = [
  { k:'bois',    l:'🪵 Bois de construction' },
  { k:'acier',   l:'🔩 Profilés métalliques' },
  { k:'serr',    l:'⚙️ Serrurerie et fixations' },
  { k:'couv',    l:'🏠 Couverture' },
  { k:'zinc',    l:'🌧️ Zinguerie' },
  { k:'paroi',   l:'🧱 Panneaux, ossature, bardage' },
  { k:'iso',     l:'🧶 Isolants' },
  { k:'memb',    l:'🛡️ Membranes et étanchéité' },
  { k:'cloison', l:'🚪 Cloisons et plafonds' },
  { k:'maco',    l:'🏗️ Fondations et maçonnerie' },
  { k:'terr',    l:'🌳 Terrasse et extérieur' },
  { k:'menu',    l:'🪟 Menuiseries' },
  { k:'reseau',  l:'🔌 Réseaux techniques' },
  { k:'annot',   l:'📍 Repères de plan' },
];

/* ═══ A. BOIS ═══════════════════════════════════════════════════════ */
const BOIS_SECT = (id, l, sf, sizes, extra) => add(Object.assign({ id, f:'bois', sf, l, kind:'timber', views:['section','long'], sizes, ind:true }, extra || {}));
BOIS_SECT('b_montant', 'Montant d\'ossature', 'Ossature bois', wh([[45,95],[45,120],[45,145],[45,170],[45,195],[45,220],[45,245],[36,97],[58,145]]), { tags:'mob mur ossature montant' });
BOIS_SECT('b_montant2', 'Montant doublé / assemblé', 'Ossature bois', wh([[90,95],[90,120],[90,145],[90,195],[135,145]]), { pattern:'double' });
BOIS_SECT('b_lisse', 'Lisse basse / haute', 'Ossature bois', wh([[45,95],[45,120],[45,145],[45,170],[45,195],[45,220]]));
BOIS_SECT('b_traverse', 'Traverse / entretoise / renfort', 'Ossature bois', wh([[45,95],[45,120],[45,145],[45,220]]));
BOIS_SECT('b_chevron', 'Chevron', 'Charpente', wh([[50,75],[63,75],[75,75],[60,80],[75,100],[63,175]]));
BOIS_SECT('b_demichev', 'Demi-chevron', 'Charpente', wh([[38,50],[38,63],[40,60]]));
BOIS_SECT('b_panne', 'Panne (faîtière, intermédiaire, sablière)', 'Charpente', wh([[75,200],[75,225],[100,200],[100,225],[120,240],[150,300]]));
BOIS_SECT('b_arbal', 'Arbalétrier', 'Charpente', wh([[75,175],[75,200],[100,200],[120,240]]));
BOIS_SECT('b_entrait', 'Entrait', 'Charpente', wh([[75,200],[100,225],[120,240],[150,300]]));
BOIS_SECT('b_poincon', 'Poinçon', 'Charpente', wh([[100,100],[120,120],[150,150]]));
BOIS_SECT('b_contref', 'Contrefiche / jambe de force', 'Charpente', wh([[75,100],[75,150],[100,100]]));
BOIS_SECT('b_solive', 'Solive', 'Plancher', wh([[63,175],[63,200],[63,225],[75,200],[75,225],[75,250]]));
BOIS_SECT('b_lambourde', 'Lambourde', 'Plancher', wh([[40,60],[45,70],[45,95],[50,75]]));
BOIS_SECT('b_poutre', 'Poutre bois massif', 'Structure', wh([[100,200],[100,250],[150,300],[200,300]]));
BOIS_SECT('b_poteau', 'Poteau', 'Structure', wh([[100,100],[120,120],[145,145],[150,150],[200,200]]));
BOIS_SECT('b_potelet', 'Potelet', 'Structure', wh([[70,70],[90,90]]));
BOIS_SECT('b_liteau', 'Liteau', 'Supports de couverture', wh([[25,38],[27,40],[30,40]]));
BOIS_SECT('b_clatte', 'Contre-latte', 'Supports de couverture', wh([[22,38],[27,40]]));
BOIS_SECT('b_tasseau', 'Tasseau', 'Supports et tasseaux', wh([[22,38],[27,40],[30,40],[40,40],[40,60]]));
BOIS_SECT('b_volige', 'Volige', 'Supports de couverture', wh([[18,105],[22,105]]), { orient:'flat' });
BOIS_SECT('b_planche', 'Planche', 'Sciages', wh([[27,150],[27,200],[27,225],[32,200]]), { orient:'flat' });
BOIS_SECT('b_madrier', 'Madrier', 'Sciages', wh([[75,225],[63,225],[75,200]]));
BOIS_SECT('b_bastaing', 'Bastaing', 'Sciages', wh([[63,175],[50,175]]));
BOIS_SECT('b_chanlatte', 'Chanlatte', 'Charpente', wh([[45,45],[45,60]]), { pattern:'bevel' });
BOIS_SECT('b_rive', 'Planche de rive', 'Habillages', wh([[22,150],[22,200],[27,200]]), { orient:'flat' });
BOIS_SECT('b_lc', 'Lamellé-collé (BLC)', 'Bois techniques', wh([[90,240],[115,280],[140,320],[160,400],[200,480],[90,120]]), { pattern:'lc' });
BOIS_SECT('b_abou', 'Bois massif abouté (BMR / KVH)', 'Bois techniques', wh([[45,145],[45,200],[60,160],[80,200]]), { pattern:'abou' });
BOIS_SECT('b_lvl', 'LVL (lamibois)', 'Bois techniques', wh([[45,200],[45,300],[75,300]]), { pattern:'lvl' });
add({ id:'b_ijoist', f:'bois', sf:'Bois techniques', l:'Poutre en I bois (âme OSB / panneau)', kind:'ijoist', views:['section','long'], ind:true,
  sizes:[SZ('h 200 · semelle 45×45', { h:200, b:45, tf:45, tw:10 }), SZ('h 240 · semelle 58×45', { h:240, b:58, tf:45, tw:10 }), SZ('h 300 · semelle 58×45', { h:300, b:58, tf:45, tw:10 }), SZ('h 360 · semelle 89×45', { h:360, b:89, tf:45, tw:10 }), SZ('h 400 · semelle 89×45', { h:400, b:89, tf:45, tw:10 })] });
add({ id:'b_clt', f:'bois', sf:'Bois techniques', l:'Panneau CLT (bois lamellé croisé)', kind:'clt', views:['section'], ind:true, sizes:th([60,80,100,120,140,160,200]) });
add({ id:'b_fermette', f:'bois', sf:'Fermes', l:'Fermette industrielle (W)', kind:'fermette', views:['elev'], ind:true,
  sizes:[SZ('portée 6 m · 35°', { L:6000, pente:35, b:36, h:97 }), SZ('portée 8 m · 40°', { L:8000, pente:40, b:36, h:122 }), SZ('portée 10 m · 45°', { L:10000, pente:45, b:36, h:147 }), SZ('portée 8 m · 30° (combles perdus)', { L:8000, pente:30, b:36, h:97 })] });
add({ id:'b_ferme', f:'bois', sf:'Fermes', l:'Ferme traditionnelle (poinçon, contrefiches)', kind:'ferme', views:['elev'], ind:true,
  sizes:[SZ('portée 7 m · 45°', { L:7000, pente:45, b:150 }), SZ('portée 9 m · 40°', { L:9000, pente:40, b:175 }), SZ('portée 6 m · 35°', { L:6000, pente:35, b:150 })] });
add({ id:'b_fermeTC', f:'bois', sf:'Fermes', l:'Ferme à entrait retroussé', kind:'ferme', views:['elev'], ind:true, retrousse:true,
  sizes:[SZ('portée 8 m · 45°', { L:8000, pente:45, b:175 })] });
add({ id:'b_pergola', f:'bois', sf:'Pergola', l:'Pergola (poteaux + poutres)', kind:'pergola', views:['elev'], ind:true,
  sizes:[SZ('3 × 2,5 m', { L:3000, H:2500, b:120 }), SZ('4 × 2,5 m', { L:4000, H:2500, b:145 })] });

/* ═══ B. ACIER ══════════════════════════════════════════════════════ */
add({ id:'a_ipe', f:'acier', sf:'Poutrelles I / H', l:'IPE', kind:'I', views:['section','long'], sizes:iSizes('IPE', IPE), src:'EN 10365' });
add({ id:'a_ipn', f:'acier', sf:'Poutrelles I / H', l:'IPN (ailes inclinées)', kind:'I', views:['section','long'], sizes:iSizes('IPN', IPN, 0.14), src:'DIN 1025-1' });
add({ id:'a_hea', f:'acier', sf:'Poutrelles I / H', l:'HEA', kind:'I', views:['section','long'], sizes:iSizes('HEA', HEA), src:'EN 10365' });
add({ id:'a_heb', f:'acier', sf:'Poutrelles I / H', l:'HEB', kind:'I', views:['section','long'], sizes:iSizes('HEB', HEB), src:'EN 10365' });
add({ id:'a_hem', f:'acier', sf:'Poutrelles I / H', l:'HEM', kind:'I', views:['section','long'], sizes:iSizes('HEM', HEM), src:'EN 10365' });
add({ id:'a_upn', f:'acier', sf:'Profilés U', l:'UPN (ailes inclinées)', kind:'U', views:['section','long'], sizes:iSizes('UPN', UPN, 0.08), src:'DIN 1026-1' });
add({ id:'a_upe', f:'acier', sf:'Profilés U', l:'UPE (ailes parallèles)', kind:'U', views:['section','long'], sizes:iSizes('UPE', UPE), src:'EN 10365' });
add({ id:'a_l', f:'acier', sf:'Cornières', l:'Cornière à ailes égales', kind:'L', views:['section','long'], src:'EN 10056',
  sizes:[[20,3],[25,3],[30,3],[35,4],[40,4],[45,4.5],[50,5],[60,6],[70,7],[80,8],[90,9],[100,10],[120,12]].map(([a, t]) => SZ('L ' + a + '×' + a + '×' + t, { a, b:a, t })) });
add({ id:'a_li', f:'acier', sf:'Cornières', l:'Cornière à ailes inégales', kind:'L', views:['section','long'], src:'EN 10056',
  sizes:[[40,20,4],[60,40,5],[80,40,6],[100,50,8],[100,65,7],[120,80,8],[150,100,10]].map(([a, b, t]) => SZ('L ' + a + '×' + b + '×' + t, { a, b, t })) });
add({ id:'a_t', f:'acier', sf:'Profilés T', l:'Fer T', kind:'T', views:['section','long'], src:'EN 10055',
  sizes:[[30,4],[40,5],[50,6],[60,7],[80,9]].map(([a, t]) => SZ('T ' + a + '×' + a + '×' + t, { b:a, h:a, t })) });
add({ id:'a_tc', f:'acier', sf:'Tubes', l:'Tube carré', kind:'tube', views:['section','long'], src:'EN 10219',
  sizes:[[20,2],[25,2],[30,2],[40,2],[40,3],[50,3],[60,3],[70,3],[80,3],[80,4],[100,4],[120,5],[150,5]].map(([a, t]) => SZ(a + '×' + a + '×' + t, { b:a, h:a, t })) });
add({ id:'a_tr', f:'acier', sf:'Tubes', l:'Tube rectangulaire', kind:'tube', views:['section','long'], src:'EN 10219',
  sizes:[[40,20,2],[50,30,2],[60,40,3],[80,40,3],[100,50,4],[120,60,4],[120,80,5],[150,100,5],[200,100,6]].map(([h, b, t]) => SZ(h + '×' + b + '×' + t, { b, h, t })) });
add({ id:'a_to', f:'acier', sf:'Tubes', l:'Tube rond', kind:'tubeR', views:['section','long'], src:'EN 10219 / EN 10255',
  sizes:[[21.3,2.3],[26.9,2.3],[33.7,2.6],[42.4,2.6],[48.3,2.9],[60.3,2.9],[76.1,2.9],[88.9,3.2],[114.3,3.6],[139.7,4]].map(([d, t]) => SZ('Ø ' + String(d).replace('.', ',') + '×' + String(t).replace('.', ','), { d, t })) });
add({ id:'a_plat', f:'acier', sf:'Barres', l:'Plat acier', kind:'plat', views:['section','long'], src:'EN 10058',
  sizes:[[20,3],[30,4],[40,5],[50,6],[60,8],[80,8],[100,10],[120,10],[150,12]].map(([b, t]) => SZ(b + '×' + t, { b, h:t })) });
add({ id:'a_rond', f:'acier', sf:'Barres', l:'Rond plein / fer rond', kind:'rond', views:['section','long'], src:'EN 10060',
  sizes:[8,10,12,14,16,20,25,30].map(d => SZ('Ø ' + d, { d })) });
add({ id:'a_carre', f:'acier', sf:'Barres', l:'Carré plein', kind:'carre', views:['section','long'], src:'EN 10059',
  sizes:[10,12,14,16,20,25].map(a => SZ(a + '×' + a, { b:a, h:a })) });
add({ id:'a_c', f:'acier', sf:'Profilés formés à froid', l:'Profil C (lèvres)', kind:'C', views:['section','long'], ind:true,
  sizes:[[100,50,15,2],[120,50,15,2],[150,60,20,2.5],[200,70,20,2.5],[250,75,20,3]].map(([h, b, c, t]) => SZ('C ' + h + '×' + b + '×' + t, { h, b, c, t })) });
add({ id:'a_z', f:'acier', sf:'Profilés formés à froid', l:'Profil Z (panne)', kind:'Z', views:['section','long'], ind:true,
  sizes:[[120,50,15,2],[150,60,20,2],[200,70,20,2.5],[250,75,20,3]].map(([h, b, c, t]) => SZ('Z ' + h + '×' + b + '×' + t, { h, b, c, t })) });
add({ id:'a_omega', f:'acier', sf:'Profilés formés à froid', l:'Profil oméga', kind:'omega', views:['section','long'], ind:true,
  sizes:[[30,40,15,1],[40,50,20,1.5],[50,60,20,2]].map(([h, b, c, t]) => SZ('Ω ' + h + '×' + b, { h, b, c, t })) });
add({ id:'a_tole', f:'acier', sf:'Tôles', l:'Tôle plane', kind:'plat', views:['section'], ind:true, sizes:[1,1.5,2,3,4,5,6,8,10].map(e => SZ(e + ' mm', { b:1000, h:e })) });
add({ id:'a_tolep', f:'acier', sf:'Tôles', l:'Tôle pliée (U / équerre)', kind:'L', views:['section'], ind:true, sizes:[[50,50,2],[80,40,2],[100,100,3]].map(([a, b, t]) => SZ(a + '×' + b + '×' + t, { a, b, t })) });

/* ═══ Serrurerie / fixations ═══════════════════════════════════════ */
add({ id:'s_platine', f:'serr', sf:'Platines et goussets', l:'Platine percée', kind:'platine', views:['face','section'], ind:true, sizes:[[150,150,10,4],[200,200,12,4],[250,250,15,4],[300,200,15,6]].map(([b, h, t, n]) => SZ(b + '×' + h + '×' + t + ' · ' + n + ' trous', { b, h, t, n })) });
add({ id:'s_gousset', f:'serr', sf:'Platines et goussets', l:'Gousset / raidisseur', kind:'gousset', views:['face'], ind:true, sizes:[[100,100],[150,150],[200,150]].map(([b, h]) => SZ(b + '×' + h, { b, h })) });
add({ id:'s_eclisse', f:'serr', sf:'Platines et goussets', l:'Éclisse', kind:'platine', views:['face'], ind:true, sizes:[[300,100,8,6],[400,150,10,8]].map(([b, h, t, n]) => SZ(b + '×' + h + '×' + t, { b, h, t, n })) });
add({ id:'s_corbeau', f:'serr', sf:'Platines et goussets', l:'Corbeau / console', kind:'gousset', views:['face'], ind:true, sizes:[[150,200],[200,250]].map(([b, h]) => SZ(b + '×' + h, { b, h, corbeau:1 })) });
add({ id:'s_pied', f:'serr', sf:'Pieds de poteau', l:'Pied de poteau (platine + tige)', kind:'piedpot', views:['face'], ind:true, sizes:[[100,150],[140,200],[160,250]].map(([b, h]) => SZ('platine ' + b + ' · h ' + h, { b, h })) });
add({ id:'s_pied2', f:'serr', sf:'Pieds de poteau', l:'Pied de poteau en U (étrier)', kind:'sabot', views:['face'], ind:true, sizes:[[100,150],[120,150],[150,200]].map(([b, h]) => SZ('U ' + b + ' · h ' + h, { b, h, pied:1 })) });
add({ id:'s_sabot', f:'serr', sf:'Connecteurs bois', l:'Sabot de solive', kind:'sabot', views:['face'], ind:true, sizes:[[45,120],[63,175],[75,200],[100,220]].map(([b, h]) => SZ(b + '×' + h, { b, h })) });
add({ id:'s_equerre', f:'serr', sf:'Connecteurs bois', l:'Équerre renforcée', kind:'equerre', views:['face'], ind:true, sizes:[[70,70,55],[90,90,65],[105,105,90]].map(([a, b, w]) => SZ(a + '×' + b + ' · l ' + w, { a, b, w })) });
add({ id:'s_feuillard', f:'serr', sf:'Connecteurs bois', l:'Feuillard perforé', kind:'feuillard', views:['face'], ind:true, sizes:[20,25,40].map(b => SZ(b + ' mm', { b, h:2 })) });
add({ id:'s_boulon', f:'serr', sf:'Boulonnerie', l:'Boulon + écrou + rondelles (vue de côté)', kind:'boulon', views:['long'], src:'ISO 4014 / 4017 (Ø nominal)', sizes:[8,10,12,14,16,20,24].map(d => SZ('M' + d, { d })) });
add({ id:'s_tige', f:'serr', sf:'Boulonnerie', l:'Tige filetée', kind:'tige', views:['long'], src:'DIN 976', sizes:[8,10,12,14,16,20].map(d => SZ('M' + d, { d })) });
add({ id:'s_ecrou', f:'serr', sf:'Boulonnerie', l:'Écrou hexagonal (vue de face)', kind:'ecrou', views:['face'], src:'ISO 4032', sizes:[[8,13],[10,17],[12,19],[14,22],[16,24],[20,30],[24,36]].map(([d, s]) => SZ('M' + d + ' · s ' + s, { d, s })) });
add({ id:'s_ancrage', f:'serr', sf:'Ancrages', l:'Cheville / goujon d\'ancrage dans béton', kind:'ancrage', views:['long'], ind:true, sizes:[[8,75],[10,90],[12,110],[16,140]].map(([d, l]) => SZ('M' + d + ' · ' + l, { d, L:l })) });
add({ id:'s_scellement', f:'serr', sf:'Ancrages', l:'Scellement chimique (tige + résine)', kind:'ancrage', views:['long'], ind:true, chim:true, sizes:[[10,110],[12,130],[16,165]].map(([d, l]) => SZ('M' + d + ' · ' + l, { d, L:l })) });
add({ id:'s_tirefond', f:'serr', sf:'Boulonnerie', l:'Tire-fond', kind:'tige', views:['long'], src:'DIN 571', tirefond:true, sizes:[6,8,10,12].map(d => SZ('Ø ' + d, { d })) });

/* ═══ C. COUVERTURE ════════════════════════════════════════════════ */
add({ id:'c_tmeca', f:'couv', sf:'Tuiles', l:'Tuile mécanique seule (coupe)', kind:'tuileMeca', views:['section'], ind:true,
  sizes:[SZ('grand moule · L 470', { L:470, e:18, n:25 }), SZ('moule moyen · L 420', { L:420, e:16, n:22 }), SZ('petit moule · L 360', { L:360, e:15, n:20 })] });
add({ id:'c_tcanal', f:'couv', sf:'Tuiles', l:'Tuile canal (coupe transversale)', kind:'tuileCanal', views:['section'], ind:true, sizes:[SZ('canal 150', { w:150, e:70 }), SZ('canal 180', { w:180, e:80 })] });
add({ id:'c_tplate', f:'couv', sf:'Tuiles', l:'Tuile plate (pureau)', kind:'plate', views:['section'], ind:true, sizes:[SZ('17×27 · pureau 100', { pur:100, e:12 }), SZ('16×24 · pureau 85', { pur:85, e:12 })] });
add({ id:'c_ardoise', f:'couv', sf:'Ardoises', l:'Ardoise (pureau)', kind:'plate', views:['section'], ind:true, ardoise:true, sizes:[SZ('32×22 · pureau 130', { pur:130, e:5 }), SZ('40×24 · pureau 170', { pur:170, e:5 })] });
add({ id:'c_bac', f:'couv', sf:'Tôles et panneaux', l:'Bac acier (coupe)', kind:'bac', views:['section'], ind:true, sizes:[SZ('nervure 39 · pas 333', { h:39, pas:333 }), SZ('nervure 45 · pas 250', { h:45, pas:250 })] });
add({ id:'c_sandwich', f:'couv', sf:'Tôles et panneaux', l:'Panneau sandwich couverture', kind:'sandwich', views:['section'], ind:true, sizes:[40,60,80,100,120].map(e => SZ('isolant ' + e + ' mm', { e, h:39, pas:333 })) });
add({ id:'c_ondule', f:'couv', sf:'Tôles et panneaux', l:'Plaque ondulée (fibres-ciment, acier)', kind:'ondule', views:['section'], ind:true, sizes:[SZ('onde 177 · h 51', { pas:177, h:51 }), SZ('onde 76 · h 18', { pas:76, h:18 })] });
add({ id:'c_zjd', f:'couv', sf:'Métal', l:'Zinc à joint debout (coupe)', kind:'jointDebout', views:['section'], ind:true, sizes:[SZ('entraxe 430 · joint 25', { pas:430, h:25 }), SZ('entraxe 530 · joint 25', { pas:530, h:25 })] });
add({ id:'c_ztass', f:'couv', sf:'Métal', l:'Zinc à tasseaux (coupe)', kind:'tasseauZinc', views:['section'], ind:true, sizes:[SZ('entraxe 600 · tasseau 40', { pas:600, h:40 })] });
add({ id:'c_faitage', f:'couv', sf:'Points singuliers', l:'Faîtage (tuile faîtière)', kind:'faitage', views:['section'], ind:true, sizes:[SZ('demi-rond Ø 280', { w:280, h:140 })] });
add({ id:'c_closoir', f:'couv', sf:'Points singuliers', l:'Closoir ventilé', kind:'closoir', views:['section'], ind:true, sizes:[SZ('h 60', { w:300, h:60 })] });
add({ id:'c_noue', f:'couv', sf:'Points singuliers', l:'Noue (coupe)', kind:'noue', views:['section'], ind:true, sizes:[SZ('noue 500', { w:500, h:120 })] });
add({ id:'c_rive', f:'couv', sf:'Points singuliers', l:'Tuile de rive', kind:'rive', views:['section'], ind:true, sizes:[SZ('rive 100', { w:120, h:110 })] });
add({ id:'c_velux', f:'couv', sf:'Points singuliers', l:'Fenêtre de toit (coupe)', kind:'fenToit', views:['section'], ind:true, sizes:[SZ('h 980', { L:980, h:160 }), SZ('h 1180', { L:1180, h:160 }), SZ('h 1400', { L:1400, h:160 })] });
add({ id:'c_chevetre', f:'couv', sf:'Points singuliers', l:'Chevêtre (vue de dessus)', kind:'chevetre', views:['plan'], ind:true, sizes:[SZ('780 × 980', { b:780, h:980 }), SZ('660 × 1180', { b:660, h:1180 })] });
add({ id:'c_crochet', f:'couv', sf:'Accessoires', l:'Crochet / patte', kind:'crochet', views:['long'], ind:true, sizes:[SZ('crochet ardoise 80', { L:80 }), SZ('patte coulissante 100', { L:100 })] });

/* ═══ Zinguerie ═══════════════════════════════════════════════════ */
add({ id:'z_larmier', f:'zinc', sf:'Bandes et façonnés', l:'Larmier / bande d\'égout', kind:'larmier', views:['section'], ind:true, sizes:[SZ('dév. 250', { a:100, b:80, c:30 }), SZ('dév. 330', { a:140, b:110, c:40 })] });
add({ id:'z_solin', f:'zinc', sf:'Bandes et façonnés', l:'Bande de solin', kind:'solin', views:['section'], ind:true, sizes:[SZ('dév. 200', { a:120, b:80 }), SZ('dév. 250', { a:150, b:100 })] });
add({ id:'z_rive', f:'zinc', sf:'Bandes et façonnés', l:'Bande de rive', kind:'bandeRive', views:['section'], ind:true, sizes:[SZ('dév. 330', { a:150, b:120, c:30 })] });
add({ id:'z_bavette', f:'zinc', sf:'Bandes et façonnés', l:'Bavette', kind:'larmier', views:['section'], ind:true, sizes:[SZ('dév. 200', { a:120, b:40, c:25 })] });
add({ id:'z_couvertine', f:'zinc', sf:'Bandes et façonnés', l:'Couvertine (acrotère)', kind:'couvertine', views:['section'], ind:true, sizes:[SZ('mur 200', { b:240, h:80 }), SZ('mur 300', { b:340, h:80 })] });
add({ id:'z_gdr', f:'zinc', sf:'Gouttières et chéneaux', l:'Gouttière demi-ronde', kind:'gouttiere', views:['section'], ind:true, sizes:[SZ('dév. 25', { d:100 }), SZ('dév. 33', { d:140 }), SZ('dév. 40', { d:170 })] });
add({ id:'z_gnantaise', f:'zinc', sf:'Gouttières et chéneaux', l:'Gouttière nantaise / havraise (moulurée)', kind:'gouttiereM', views:['section'], ind:true, sizes:[SZ('dév. 33', { b:120, h:100 }), SZ('dév. 40', { b:150, h:120 })] });
add({ id:'z_chenau', f:'zinc', sf:'Gouttières et chéneaux', l:'Chéneau encaissé', kind:'chenau', views:['section'], ind:true, sizes:[SZ('250 × 120', { b:250, h:120 }), SZ('350 × 150', { b:350, h:150 })] });
add({ id:'z_desc', f:'zinc', sf:'Descentes', l:'Descente EP (coupe)', kind:'tubeR', views:['section','long'], ind:true, zincCol:true, sizes:[60,80,100,125].map(d => SZ('Ø ' + d, { d, t:0.8 })) });
add({ id:'z_naiss', f:'zinc', sf:'Descentes', l:'Naissance + coude', kind:'naissance', views:['long'], ind:true, sizes:[80,100].map(d => SZ('Ø ' + d, { d })) });
add({ id:'z_crochet', f:'zinc', sf:'Gouttières et chéneaux', l:'Crochet de gouttière', kind:'crochetG', views:['section'], ind:true, sizes:[SZ('dév. 33', { d:140 })] });
add({ id:'z_abergement', f:'zinc', sf:'Bandes et façonnés', l:'Abergement de cheminée (coupe)', kind:'abergement', views:['section'], ind:true, sizes:[SZ('relevé 150', { a:150, b:200 })] });

/* ═══ D. Panneaux, ossature, bardage ══════════════════════════════ */
const PAN = (id, l, sf, mat, list, extra) => add(Object.assign({ id, f:'paroi', sf, l, kind:'panel', mat, views:['section'], ind:true, sizes:th(list) }, extra || {}));
PAN('p_osb', 'OSB 3 / OSB 4', 'Panneaux', 'osb', [9,10,12,15,18,22]);
PAN('p_cp', 'Contreplaqué (CTBX)', 'Panneaux', 'cp', [5,10,12,15,18,22,25]);
PAN('p_mdf', 'MDF / MDF hydrofuge', 'Panneaux', 'mdf', [6,10,12,16,19,22]);
PAN('p_part', 'Panneau de particules (P5 / P7)', 'Panneaux', 'part', [16,19,22]);
PAN('p_dwd', 'Panneau pare-pluie fibre de bois (DWD / rigide)', 'Panneaux', 'fibrebois', [16,18,22,35,60]);
PAN('p_ciment', 'Panneau ciment-bois / plaque ciment', 'Panneaux', 'ciment', [10,12.5,16,22]);
PAN('p_contrev', 'Panneau de contreventement (OSB / fibres)', 'Panneaux', 'osb', [9,12,15]);
add({ id:'p_bard_cv', f:'paroi', sf:'Bardage', l:'Bardage bois claire-voie', kind:'bardage', views:['section'], ind:true, sizes:[[21,70,10],[21,90,10],[27,45,10]].map(([e, w, j]) => SZ(e + '×' + w + ' · jour ' + j, { e, w, j, type:'cv' })) });
add({ id:'p_bard_clin', f:'paroi', sf:'Bardage', l:'Bardage bois à clin', kind:'bardage', views:['section'], ind:true, sizes:[[20,130],[22,145],[22,195]].map(([e, w]) => SZ(e + '×' + w, { e, w, type:'clin' })) });
add({ id:'p_bard_rv', f:'paroi', sf:'Bardage', l:'Bardage rainuré-bouveté (vertical / horizontal)', kind:'bardage', views:['section'], ind:true, sizes:[[19,120],[21,145],[27,145]].map(([e, w]) => SZ(e + '×' + w, { e, w, type:'rb' })) });
add({ id:'p_bard_met', f:'paroi', sf:'Bardage', l:'Bardage métallique (nervuré)', kind:'bac', views:['section'], ind:true, mat:'bac', sizes:[SZ('nervure 35 · pas 200', { h:35, pas:200 })] });
add({ id:'p_bard_comp', f:'paroi', sf:'Bardage', l:'Bardage composite / fibres-ciment (lames)', kind:'bardage', views:['section'], ind:true, mat:'ciment', sizes:[[10,180],[12,190]].map(([e, w]) => SZ(e + '×' + w, { e, w, type:'clin', mat:'ciment' })) });
add({ id:'p_tass_bard', f:'paroi', sf:'Bardage', l:'Tasseau de bardage / contre-ossature', kind:'timber', views:['section','long'], ind:true, sizes:wh([[22,45],[27,45],[27,70],[38,50],[45,45]]) });
add({ id:'p_angle', f:'paroi', sf:'Bardage', l:'Profil d\'angle / finition (alu)', kind:'L', views:['section'], ind:true, mat:'alu', sizes:[[30,30,1.5],[40,40,1.5]].map(([a, b, t]) => SZ(a + '×' + b, { a, b, t })) });
add({ id:'p_grille', f:'paroi', sf:'Bardage', l:'Grille anti-rongeurs (pied de bardage)', kind:'grille', views:['section'], ind:true, sizes:[SZ('30 × 50', { a:30, b:50 })] });

/* ═══ Isolants ════════════════════════════════════════════════════ */
const ISO = (id, l, sf, mat, list, rig) => add({ id, f:'iso', sf, l, kind:'insul', mat, rig:!!rig, views:['section'], ind:true, sizes:th(list) });
ISO('i_lv', 'Laine de verre', 'Isolants souples / semi-rigides', 'lverre', [45,60,80,100,120,140,145,160,200,240,300]);
ISO('i_lr', 'Laine de roche', 'Isolants souples / semi-rigides', 'lroche', [40,50,60,80,100,120,140,160,200]);
ISO('i_lb', 'Laine de bois (souple)', 'Isolants biosourcés', 'lbois', [45,60,80,100,120,145,160,200,220]);
ISO('i_lbr', 'Fibre de bois rigide', 'Isolants biosourcés', 'fibrebois', [20,35,40,60,80,100,120,160], true);
ISO('i_ouate', 'Ouate de cellulose (soufflée / insufflée)', 'Isolants biosourcés', 'ouate', [100,145,200,250,300,350,400]);
ISO('i_chanvre', 'Chanvre / coton / lin', 'Isolants biosourcés', 'chanvre', [45,60,80,100,120,145,200]);
ISO('i_liege', 'Liège expansé', 'Isolants biosourcés', 'liege', [20,40,60,80,100], true);
ISO('i_pse', 'Polystyrène expansé (PSE)', 'Isolants rigides', 'pse', [20,30,40,50,60,80,100,120,140,160,200], true);
ISO('i_xps', 'Polystyrène extrudé (XPS)', 'Isolants rigides', 'xps', [20,30,40,50,60,80,100,120], true);
ISO('i_pir', 'Polyuréthane / PIR', 'Isolants rigides', 'pir', [20,30,40,60,80,100,120,140,160], true);
ISO('i_mince', 'Isolant mince réfléchissant', 'Isolants minces', 'alu', [5,10,20,30]);

/* ═══ Membranes ═══════════════════════════════════════════════════ */
const MEM = (id, l, sf, mat, dash) => add({ id, f:'memb', sf, l, kind:'membrane', mat, dash:dash || '', views:['section'], ind:true, sizes:[SZ('standard', { e:1 })] });
MEM('m_pp', 'Pare-pluie (mur)', 'Écrans', 'pp');
MEM('m_hpv', 'Écran de sous-toiture HPV', 'Écrans', 'pp', 'long');
MEM('m_pv', 'Pare-vapeur', 'Écrans', 'pv');
MEM('m_fv', 'Frein-vapeur hygrovariable', 'Écrans', 'fv', 'dash');
MEM('m_polyane', 'Film polyane (sous dallage)', 'Étanchéité', 'polyane', 'dash');
MEM('m_epdm', 'Membrane EPDM', 'Étanchéité', 'epdm');
MEM('m_bitume', 'Membrane bitumineuse / SBS', 'Étanchéité', 'bitume');
MEM('m_arase', 'Bande d\'arase / coupure de capillarité', 'Étanchéité', 'bitume', 'long');
MEM('m_adh', 'Bande adhésive d\'étanchéité à l\'air', 'Étanchéité', 'fv', 'dot');

/* ═══ E. Cloisons et plafonds ═════════════════════════════════════ */
add({ id:'cl_montant', f:'cloison', sf:'Ossatures métalliques', l:'Montant de cloison (M…)', kind:'C', views:['section','long'], ind:true, mat:'galva',
  sizes:[[48,35],[62,35],[70,35],[90,35],[100,50]].map(([h, b]) => SZ('M' + h + '-' + b, { h, b, c:6, t:0.6 })) });
add({ id:'cl_rail', f:'cloison', sf:'Ossatures métalliques', l:'Rail de cloison (R…)', kind:'U', views:['section','long'], ind:true, mat:'galva',
  sizes:[48,62,70,90,100].map(h => SZ('R' + h + '-28', { h, b:28, tw:0.6, tf:0.6 })) });
add({ id:'cl_fourrure', f:'cloison', sf:'Ossatures métalliques', l:'Fourrure (F530)', kind:'omega', views:['section','long'], ind:true, mat:'galva', sizes:[SZ('F530 · 47×17', { h:17, b:27, c:10, t:0.6 })] });
add({ id:'cl_corn', f:'cloison', sf:'Ossatures métalliques', l:'Cornière de rive', kind:'L', views:['section'], ind:true, mat:'galva', sizes:[SZ('25×30', { a:25, b:30, t:0.6 })] });
add({ id:'cl_susp', f:'cloison', sf:'Ossatures métalliques', l:'Suspente (plafond)', kind:'suspente', views:['long'], ind:true, sizes:[SZ('L 200', { L:200 }), SZ('L 400', { L:400 })] });
const BA = (id, l, mat, list, col) => add({ id, f:'cloison', sf:'Plaques', l, kind:'panel', mat, platreCol:col, views:['section'], ind:true, sizes:th(list) });
BA('cl_ba13', 'Plaque de plâtre standard (BA10, BA13, BA15, BA18, BA25)', 'platre', [9.5,12.5,15,18,25]);
BA('cl_hydro', 'Plaque hydrofuge (H1, verte)', 'platre', [12.5,15], '#cfe8cf');
BA('cl_feu', 'Plaque feu (rose)', 'platre', [12.5,15,18], '#f3d0d6');
BA('cl_phon', 'Plaque phonique (bleue)', 'platre', [12.5], '#cfdcf3');
BA('cl_hd', 'Plaque haute dureté / renforcée', 'platre', [12.5,15], '#e6e2f5');
BA('cl_fg', 'Plaque fibres-gypse', 'platre', [10,12.5,15], '#e8e2d6');

/* ═══ Fondations et maçonnerie ═══════════════════════════════════ */
add({ id:'mc_beton', f:'maco', sf:'Béton', l:'Béton (zone hachurée)', kind:'beton', views:['section'], ind:true, sizes:[SZ('400 × 200', { b:400, h:200 }), SZ('1000 × 200', { b:1000, h:200 })] });
add({ id:'mc_ba', f:'maco', sf:'Béton', l:'Béton armé (avec aciers)', kind:'beton', ferraille:true, views:['section'], ind:true, sizes:[SZ('poutre 200 × 400', { b:200, h:400 }), SZ('dalle 1000 × 160', { b:1000, h:160 })] });
add({ id:'mc_semelle', f:'maco', sf:'Fondations', l:'Semelle filante', kind:'semelle', views:['section'], ind:true, sizes:[SZ('500 × 250', { b:500, h:250 }), SZ('600 × 300', { b:600, h:300 })] });
add({ id:'mc_longrine', f:'maco', sf:'Fondations', l:'Longrine', kind:'beton', ferraille:true, views:['section'], ind:true, sizes:[SZ('200 × 400', { b:200, h:400 }), SZ('250 × 500', { b:250, h:500 })] });
add({ id:'mc_plot', f:'maco', sf:'Fondations', l:'Plot béton / massif', kind:'beton', views:['section'], ind:true, sizes:[SZ('400 × 400 × 600', { b:400, h:600 })] });
add({ id:'mc_dalle', f:'maco', sf:'Fondations', l:'Dallage + hérisson + polyane', kind:'dallage', views:['section'], ind:true, sizes:[SZ('dalle 120 · hérisson 200', { e:120, g:200, L:1500 })] });
add({ id:'mc_parpaing', f:'maco', sf:'Maçonnerie', l:'Bloc béton (parpaing)', kind:'parpaing', views:['section'], ind:true, sizes:[[100,200],[150,200],[200,200],[200,250]].map(([e, h]) => SZ(e + ' mm (h ' + h + ')', { b:e, h })) });
add({ id:'mc_brique', f:'maco', sf:'Maçonnerie', l:'Brique alvéolée / monomur', kind:'brique', views:['section'], ind:true, sizes:[200,250,300,375].map(e => SZ(e + ' mm', { b:e, h:250 })) });
add({ id:'mc_pierre', f:'maco', sf:'Maçonnerie', l:'Mur pierre / moellons', kind:'pierre', views:['section'], ind:true, sizes:[400,500,600].map(e => SZ(e + ' mm', { b:e, h:600 })) });
add({ id:'mc_enduit', f:'maco', sf:'Maçonnerie', l:'Enduit / chape', kind:'panel', mat:'ciment', views:['section'], ind:true, sizes:th([10,15,20,40,50,60]) });
add({ id:'mc_terre', f:'maco', sf:'Sol', l:'Terrain naturel', kind:'terre', views:['section'], ind:true, sizes:[SZ('1000 × 300', { b:1000, h:300 })] });
add({ id:'mc_gravier', f:'maco', sf:'Sol', l:'Gravier / hérisson', kind:'gravier', views:['section'], ind:true, sizes:[SZ('1000 × 150', { b:1000, h:150 })] });
add({ id:'mc_drain', f:'maco', sf:'Sol', l:'Drain agricole', kind:'drain', views:['section'], ind:true, sizes:[80,100,160].map(d => SZ('Ø ' + d, { d })) });

/* ═══ Terrasse et extérieur ══════════════════════════════════════ */
add({ id:'t_lame', f:'terr', sf:'Terrasse bois', l:'Lame de terrasse (coupe)', kind:'lameTerr', views:['section'], ind:true, sizes:[[21,145],[27,145],[28,120],[25,140]].map(([e, w]) => SZ(e + '×' + w, { e, w })) });
add({ id:'t_lambourde', f:'terr', sf:'Terrasse bois', l:'Lambourde', kind:'timber', views:['section','long'], ind:true, sizes:wh([[45,70],[45,95],[45,145],[50,75],[40,60]]) });
add({ id:'t_plot', f:'terr', sf:'Terrasse bois', l:'Plot réglable', kind:'plotTerr', views:['face'], ind:true, sizes:[[30,50],[50,80],[80,140],[140,230]].map(([a, b]) => SZ(a + '–' + b + ' mm', { h:b })) });
add({ id:'t_cale', f:'terr', sf:'Terrasse bois', l:'Cale / bande bitume sous lambourde', kind:'panel', mat:'epdm', views:['section'], ind:true, sizes:th([3,5,10]) });

/* ═══ Menuiseries ════════════════════════════════════════════════ */
add({ id:'me_fen', f:'menu', sf:'Fenêtres', l:'Fenêtre (coupe verticale)', kind:'fenetre', views:['section'], ind:true, sizes:[SZ('dormant 70 · double vitrage', { b:70, H:1250, v:2 }), SZ('dormant 90 · triple vitrage', { b:90, H:1250, v:3 })] });
add({ id:'me_appui', f:'menu', sf:'Fenêtres', l:'Appui / pièce d\'appui', kind:'appui', views:['section'], ind:true, sizes:[SZ('appui 250', { b:250, h:60 })] });
add({ id:'me_porte', f:'menu', sf:'Portes', l:'Porte (coupe : dormant + vantail)', kind:'porte', views:['section'], ind:true, sizes:[SZ('vantail 40', { e:40, b:60, H:2150 }), SZ('vantail 68', { e:68, b:90, H:2150 })] });
add({ id:'me_seuil', f:'menu', sf:'Portes', l:'Seuil alu', kind:'seuil', views:['section'], ind:true, sizes:[SZ('seuil 20 · l 90', { b:90, h:20 })] });
add({ id:'me_coffre', f:'menu', sf:'Fenêtres', l:'Coffre de volet roulant', kind:'coffre', views:['section'], ind:true, sizes:[SZ('180 × 180', { b:180, h:180 }), SZ('210 × 210', { b:210, h:210 })] });

/* ═══ Réseaux techniques ═════════════════════════════════════════ */
add({ id:'r_pvc', f:'reseau', sf:'Évacuations', l:'Tube PVC évacuation', kind:'tubeR', views:['section','long'], ind:true, pvc:true, sizes:[32,40,50,80,100,110,125,160].map(d => SZ('Ø ' + d, { d, t:d <= 50 ? 2.4 : 3.2 })) });
add({ id:'r_gaine', f:'reseau', sf:'Électricité', l:'Gaine ICTA', kind:'gaine', views:['section','long'], ind:true, sizes:[16,20,25,32].map(d => SZ('Ø ' + d, { d })) });
add({ id:'r_vmc', f:'reseau', sf:'Ventilation', l:'Conduit VMC (souple / rigide)', kind:'tubeR', views:['section','long'], ind:true, vmc:true, sizes:[80,125,160].map(d => SZ('Ø ' + d, { d, t:1 })) });
add({ id:'r_cuivre', f:'reseau', sf:'Plomberie', l:'Tube cuivre / multicouche', kind:'tubeR', views:['section','long'], ind:true, cuivre:true, sizes:[12,14,16,18,22].map(d => SZ('Ø ' + d, { d, t:1 })) });
add({ id:'r_boitier', f:'reseau', sf:'Électricité', l:'Boîtier d\'encastrement (cloison)', kind:'boitier', views:['section'], ind:true, sizes:[SZ('Ø 67 · prof. 40', { d:67, p:40 })] });

/* ═══ Repères ═══════════════════════════════════════════════════ */
add({ id:'n_niveau', f:'annot', sf:'Repères', l:'Repère de niveau (⊕ +2600)', kind:'niveau', views:['face'], noScale:true, sizes:[SZ('niveau', { txt:'+0' })] });
add({ id:'n_nord', f:'annot', sf:'Repères', l:'Flèche nord', kind:'nord', views:['face'], noScale:true, sizes:[SZ('nord', {})] });
add({ id:'n_coupe', f:'annot', sf:'Repères', l:'Trait de coupe (A-A)', kind:'traitCoupe', views:['face'], noScale:true, sizes:[SZ('A', { txt:'A' })] });
add({ id:'n_rupture', f:'annot', sf:'Repères', l:'Ligne de rupture', kind:'rupture', views:['face'], noScale:true, sizes:[SZ('rupture', {})] });

/* ── Dimensions dessinées (mm) d'un élément ─────────────────────── */
function dims(it, p, view, L){
  L = +L || 1000;
  switch(it.kind){
    case 'timber': return view === 'long' ? { w:L, h:p.h } : (it.orient === 'flat' ? { w:p.h, h:p.b } : { w:p.b, h:p.h });
    case 'I': case 'U': return view === 'long' ? { w:L, h:p.h } : { w:p.b, h:p.h };
    case 'C': case 'Z': case 'omega': return view === 'long' ? { w:L, h:p.h } : { w:it.kind === 'Z' ? p.b * 2 - (p.t || 1) : (it.kind === 'omega' ? p.b + 2 * (p.c || 10) : p.b), h:p.h };
    case 'L': return view === 'long' ? { w:L, h:p.a } : { w:p.b, h:p.a };
    case 'T': return view === 'long' ? { w:L, h:p.h } : { w:p.b, h:p.h };
    case 'tube': return view === 'long' ? { w:L, h:p.h } : { w:p.b, h:p.h };
    case 'tubeR': case 'rond': case 'gaine': return view === 'long' ? { w:L, h:p.d } : { w:p.d, h:p.d };
    case 'carre': case 'plat': return view === 'long' ? { w:L, h:p.h } : { w:p.b, h:p.h };
    case 'ijoist': return view === 'long' ? { w:L, h:p.h } : { w:p.b, h:p.h };
    case 'clt': case 'panel': case 'insul': return { w:L, h:p.e };
    case 'membrane': return { w:L, h:Math.max(p.e || 1, 1) };
    case 'fermette': case 'ferme': { const hh = p.L / 2 * Math.tan((p.pente || 40) * Math.PI / 180); return { w:p.L, h:hh + (p.h || p.b || 150) }; }
    case 'pergola': return { w:p.L + p.b, h:p.H };
    case 'platine': case 'gousset': return { w:p.b, h:p.h };
    case 'piedpot': case 'sabot': return { w:p.b, h:p.h };
    case 'equerre': return { w:p.b, h:p.a };
    case 'feuillard': return { w:L, h:p.b };
    case 'boulon': return { w:Math.max(L, p.d * 4), h:p.d * 2 };
    case 'tige': return { w:Math.max(L, p.d * 3), h:p.d };
    case 'ecrou': return { w:p.s * 1.155, h:p.s };
    case 'ancrage': return { w:p.L, h:p.d * 1.6 };
    case 'tuileMeca': return { w:p.L, h:p.e + p.n };
    case 'tuileCanal': return { w:L, h:p.e * 1.6 };
    case 'plate': return { w:L, h:p.e * 3 };
    case 'bac': case 'jointDebout': case 'tasseauZinc': return { w:L, h:p.h + 2 };
    case 'sandwich': return { w:L, h:p.e + p.h + 2 };
    case 'ondule': return { w:L, h:p.h + 2 };
    case 'faitage': case 'closoir': case 'noue': case 'rive': return { w:p.w, h:p.h };
    case 'fenToit': return { w:p.L, h:p.h };
    case 'chevetre': return { w:p.b + 100, h:p.h + 100 };
    case 'crochet': return { w:p.L, h:p.L * 0.5 };
    case 'larmier': return { w:p.a + p.c, h:p.b + p.c };
    case 'solin': return { w:p.b, h:p.a };
    case 'bandeRive': return { w:p.b, h:p.a };
    case 'couvertine': return { w:p.b, h:p.h };
    case 'gouttiere': return { w:p.d * 1.15, h:p.d * 0.62 };
    case 'gouttiereM': case 'chenau': return { w:p.b, h:p.h };
    case 'naissance': return { w:p.d * 3, h:p.d * 3 };
    case 'crochetG': return { w:p.d * 1.3, h:p.d * 0.9 };
    case 'abergement': return { w:p.b, h:p.a + 30 };
    case 'bardage': return { w:L, h:(p.type === 'clin' ? p.e * 2.2 : p.e) };
    case 'grille': return { w:p.b, h:p.a };
    case 'beton': case 'semelle': case 'parpaing': case 'brique': case 'pierre': case 'terre': case 'gravier': return { w:view === 'long' ? L : p.b, h:p.h };
    case 'dallage': return { w:p.L || L, h:p.e + p.g + 2 };
    case 'drain': return { w:p.d, h:p.d };
    case 'lameTerr': return { w:p.w, h:p.e };
    case 'plotTerr': return { w:160, h:p.h };
    case 'fenetre': return { w:p.b + 40, h:p.H };
    case 'appui': case 'seuil': return { w:p.b, h:p.h };
    case 'porte': return { w:p.b + 20, h:p.H };
    case 'coffre': return { w:p.b, h:p.h };
    case 'boitier': return { w:p.p, h:p.d };
    case 'suspente': return { w:30, h:p.L };
  }
  return { w:100, h:100 };
}

/* ── Dessin ──────────────────────────────────────────────────────── */
/* ctx est déjà placé en coordonnées « mm » (origine = coin haut-gauche
   de l'élément, axe y vers le bas). u = 1 pixel écran exprimé en mm. */
function hatch(ctx, x, y, w, h, gap, angle, col, lw){
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  const d = w + h, a = (angle || 45) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  for(let s = -d; s <= d * 2; s += gap){ ctx.moveTo(x + s, y + h); ctx.lineTo(x + s + h * ca / Math.max(sa, .01), y); }
  ctx.stroke(); ctx.restore();
}
function poly(ctx, pts, fill, stroke, lw, close){
  ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); if(close !== false) ctx.closePath();
  if(fill){ ctx.fillStyle = fill; ctx.fill(); }
  if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function rect(ctx, x, y, w, h, fill, stroke, lw){ ctx.beginPath(); ctx.rect(x, y, w, h); if(fill){ ctx.fillStyle = fill; ctx.fill(); } if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function circ(ctx, cx, cy, r, fill, stroke, lw){ ctx.beginPath(); ctx.arc(cx, cy, Math.max(r, 0.01), 0, Math.PI * 2); if(fill){ ctx.fillStyle = fill; ctx.fill(); } if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function line(ctx, x1, y1, x2, y2, col, lw, dash){ ctx.save(); if(dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.restore(); }
function steelCol(it){ return it.mat === 'galva' ? COL.galva : it.mat === 'alu' ? COL.alu : it.zincCol ? COL.zinc : COL.acier; }

function draw(ctx, it, p, view, W, H, u, s){
  const lw = 1.4 * u, lwT = 0.8 * u, T = COL.acierT;
  const k = it.kind;
  if(k === 'timber'){
    const fill = it.pattern === 'lc' ? COL.lc : it.pattern === 'lvl' ? COL.lvl : COL.bois;
    rect(ctx, 0, 0, W, H, fill, COL.boisT, lw);
    if(view === 'long'){
      line(ctx, 0, H * .33, W, H * .36, 'rgba(91,74,30,.35)', lwT); line(ctx, 0, H * .68, W, H * .64, 'rgba(91,74,30,.35)', lwT);
    } else if(it.pattern === 'lc'){
      const n = Math.max(2, Math.round(H / 40)); for(let i = 1; i < n; i++) line(ctx, 0, H * i / n, W, H * i / n, COL.boisT, lwT);
      line(ctx, 0, 0, W, H, 'rgba(91,74,30,.45)', lwT); line(ctx, W, 0, 0, H, 'rgba(91,74,30,.45)', lwT);
    } else if(it.pattern === 'lvl'){
      const n = Math.max(6, Math.round(W / 3.2)); for(let i = 1; i < n; i++) line(ctx, W * i / n, 0, W * i / n, H, 'rgba(91,74,30,.35)', lwT);
    } else if(it.pattern === 'double'){
      line(ctx, W / 2, 0, W / 2, H, COL.boisT, lw);
      [[0, W / 2], [W / 2, W]].forEach(([a, b]) => { line(ctx, a, 0, b, H, COL.boisT, lwT); line(ctx, b, 0, a, H, COL.boisT, lwT); });
    } else if(it.pattern === 'bevel'){
      rect(ctx, 0, 0, W, H, COL.bois, null); poly(ctx, [[0, H], [W, 0], [W, H]], 'rgba(0,0,0,.08)', COL.boisT, lwT);
      line(ctx, 0, 0, W, H, COL.boisT, lwT);
    } else {
      line(ctx, 0, 0, W, H, COL.boisT, lwT); line(ctx, W, 0, 0, H, COL.boisT, lwT);
      if(it.pattern === 'abou'){ line(ctx, 0, H / 2, W, H / 2, 'rgba(91,74,30,.5)', lwT, [3 * u, 3 * u]); }
    }
    return;
  }
  if(k === 'I'){
    const fill = steelCol(it);
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, p.tf, W, p.tf, T, lwT); line(ctx, 0, H - p.tf, W, H - p.tf, T, lwT); return; }
    const b = W, h = H, tw = p.tw, tf = p.tf, xc = b / 2, tp = p.taper ? (b - tw) / 4 * p.taper : 0;
    poly(ctx, [[0, 0], [b, 0], [b, tf - tp], [xc + tw / 2, tf + tp], [xc + tw / 2, h - tf - tp], [b, h - tf + tp], [b, h], [0, h], [0, h - tf + tp], [xc - tw / 2, h - tf - tp], [xc - tw / 2, tf + tp], [0, tf - tp]], fill, T, lw);
    return;
  }
  if(k === 'U'){
    const fill = steelCol(it);
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, p.tf, W, p.tf, T, lwT); line(ctx, 0, H - p.tf, W, H - p.tf, T, lwT); return; }
    const b = W, h = H, tw = p.tw, tf = p.tf, tp = p.taper ? (b - tw) / 2 * p.taper : 0;
    poly(ctx, [[0, 0], [b, 0], [b, tf - tp], [tw, tf + tp], [tw, h - tf - tp], [b, h - tf + tp], [b, h], [0, h]], fill, T, lw);
    return;
  }
  if(k === 'C' || k === 'Z' || k === 'omega'){
    const fill = steelCol(it), t = Math.max(p.t || 1, u * 1.2), c = p.c || 0;
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, t * 2, W, t * 2, T, lwT); line(ctx, 0, H - t * 2, W, H - t * 2, T, lwT); return; }
    ctx.lineJoin = 'miter';
    let path;
    if(k === 'C') path = [[W, c], [W, 0], [0, 0], [0, H], [W, H], [W, H - c]];
    else if(k === 'Z'){ const b = p.b; path = [[0, c], [0, 0], [b - t / 2, 0], [b - t / 2, H], [W, H], [W, H - c]]; }
    else { const b = p.b; path = [[0, H], [c, H], [c, 0], [c + b, 0], [c + b, H], [W, H]]; }
    ctx.beginPath(); path.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
    ctx.strokeStyle = T; ctx.lineWidth = t + lwT; ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = Math.max(t - lwT, u * .6); ctx.stroke();
    return;
  }
  if(k === 'L'){
    const fill = steelCol(it), t = Math.max(p.t, u);
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, t, W, t, T, lwT); return; }
    poly(ctx, [[0, 0], [t, 0], [t, H - t], [W, H - t], [W, H], [0, H]], fill, T, lw); return;
  }
  if(k === 'T'){
    const fill = steelCol(it), t = p.t;
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, t, W, t, T, lwT); return; }
    poly(ctx, [[0, 0], [W, 0], [W, t], [W / 2 + t / 2, t], [W / 2 + t / 2, H], [W / 2 - t / 2, H], [W / 2 - t / 2, t], [0, t]], fill, T, lw); return;
  }
  if(k === 'tube'){
    const fill = steelCol(it), t = Math.max(p.t, u);
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, t, W, t, T, lwT, [4 * u, 3 * u]); line(ctx, 0, H - t, W, H - t, T, lwT, [4 * u, 3 * u]); return; }
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(t, H - t, W - 2 * t, -(H - 2 * t)); ctx.fillStyle = fill; ctx.fill('evenodd');
    rect(ctx, 0, 0, W, H, null, T, lw); rect(ctx, t, t, W - 2 * t, H - 2 * t, null, T, lwT); return;
  }
  if(k === 'tubeR' || k === 'gaine'){
    const fill = it.pvc ? COL.pvcGris : it.cuivre ? COL.cuivre : it.vmc ? COL.alu : it.zincCol ? COL.zinc : k === 'gaine' ? COL.gaine : steelCol(it);
    const t = Math.max(p.t || (k === 'gaine' ? p.d * 0.12 : 1), u);
    if(view === 'long'){
      rect(ctx, 0, 0, W, H, fill, T, lw);
      if(k === 'gaine' || it.vmc){ const n = Math.max(4, Math.round(W / (H * .35))); for(let i = 1; i < n; i++) line(ctx, W * i / n, 0, W * i / n, H, 'rgba(0,0,0,.35)', lwT); }
      else { line(ctx, 0, t, W, t, T, lwT, [4 * u, 3 * u]); line(ctx, 0, H - t, W, H - t, T, lwT, [4 * u, 3 * u]); }
      return;
    }
    const r = W / 2; ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.arc(r, r, Math.max(r - t, 0.01), 0, Math.PI * 2, true); ctx.fillStyle = fill; ctx.fill();
    circ(ctx, r, r, r, null, T, lw); circ(ctx, r, r, r - t, null, T, lwT); return;
  }
  if(k === 'rond'){
    const fill = steelCol(it);
    if(view === 'long'){ rect(ctx, 0, 0, W, H, fill, T, lw); line(ctx, 0, H / 2, W, H / 2, 'rgba(0,0,0,.25)', lwT, [6 * u, 4 * u]); return; }
    circ(ctx, W / 2, H / 2, W / 2, fill, T, lw); return;
  }
  if(k === 'carre' || k === 'plat'){ rect(ctx, 0, 0, W, H, steelCol(it), T, lw); if(view !== 'long' && k === 'carre'){ line(ctx, 0, 0, W, H, 'rgba(0,0,0,.25)', lwT); } return; }
  if(k === 'ijoist'){
    if(view === 'long'){ rect(ctx, 0, p.tf, W, H - 2 * p.tf, COL.osb, COL.boisT, lwT); rect(ctx, 0, 0, W, p.tf, COL.bois, COL.boisT, lw); rect(ctx, 0, H - p.tf, W, p.tf, COL.bois, COL.boisT, lw); return; }
    const tw = p.tw, xc = W / 2;
    rect(ctx, xc - tw / 2, p.tf, tw, H - 2 * p.tf, COL.osb, COL.boisT, lwT);
    [[0, 0], [0, H - p.tf]].forEach(([x, y]) => { rect(ctx, x, y, W, p.tf, COL.bois, COL.boisT, lw); line(ctx, x, y, x + W, y + p.tf, COL.boisT, lwT); line(ctx, x + W, y, x, y + p.tf, COL.boisT, lwT); });
    return;
  }
  if(k === 'clt'){
    const n = Math.max(3, Math.round(p.e / 20)), h = H / n;
    for(let i = 0; i < n; i++){ rect(ctx, 0, i * h, W, h, i % 2 ? '#e9c77a' : COL.clt, COL.boisT, lwT); if(i % 2){ const m = Math.max(2, Math.round(W / 30)); for(let j = 1; j < m; j++) line(ctx, W * j / m, i * h, W * j / m, (i + 1) * h, 'rgba(91,74,30,.45)', lwT); } }
    rect(ctx, 0, 0, W, H, null, COL.boisT, lw); return;
  }
  if(k === 'panel'){
    const m = it.mat, fill = it.platreCol || COL[m] || '#ddd';
    rect(ctx, 0, 0, W, H, fill, m === 'platre' ? COL.platreT : COL.boisT, lw);
    if(m === 'osb'){ ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); ctx.strokeStyle = 'rgba(120,80,20,.45)'; ctx.lineWidth = lwT; const st = Math.max(H * .9, 4 * u); for(let x = 0; x < W; x += st * 1.7){ ctx.beginPath(); ctx.moveTo(x, H * .3); ctx.lineTo(x + st, H * .7); ctx.stroke(); } ctx.restore(); }
    else if(m === 'cp'){ const n = Math.max(3, Math.round(p.e / 3)); for(let i = 1; i < n; i++) line(ctx, 0, H * i / n, W, H * i / n, 'rgba(91,74,30,.35)', lwT); }
    else if(m === 'platre'){ line(ctx, 0, Math.min(.6, H * .1), W, Math.min(.6, H * .1), COL.platreT, lwT); line(ctx, 0, H - Math.min(.6, H * .1), W, H - Math.min(.6, H * .1), COL.platreT, lwT); }
    else if(m === 'ciment'){ hatch(ctx, 0, 0, W, H, Math.max(H * .8, 5 * u), 60, 'rgba(0,0,0,.18)', lwT); }
    else if(m === 'fibrebois'){ hatch(ctx, 0, 0, W, H, Math.max(H * .35, 4 * u), 20, 'rgba(90,60,20,.4)', lwT); }
    return;
  }
  if(k === 'insul'){
    const fill = COL[it.mat] || '#eee';
    rect(ctx, 0, 0, W, H, fill, '#888', lwT);
    if(it.rig){ hatch(ctx, 0, 0, W, H, Math.max(H / 2.2, 6 * u), 45, 'rgba(0,0,0,.35)', lwT); hatch(ctx, 0, 0, W, H, Math.max(H / 2.2, 6 * u), 135, 'rgba(0,0,0,.35)', lwT); }
    else if(it.mat === 'ouate'){ ctx.fillStyle = 'rgba(80,90,100,.45)'; for(let x = H * .2; x < W; x += H * .45) for(let y = H * .2; y < H; y += H * .35) circ(ctx, x + ((y * 7) % (H * .2)), y, Math.max(H * .03, u * .9), 'rgba(80,90,100,.45)'); }
    else { const step = Math.max(H * .6, 6 * u); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); ctx.beginPath(); ctx.moveTo(0, H); for(let x = 0; x <= W + step; x += step){ ctx.lineTo(x + step / 2, 0); ctx.lineTo(x + step, H); } ctx.strokeStyle = '#c7372b'; ctx.lineWidth = lw * 0.9; ctx.stroke(); ctx.restore(); }
    rect(ctx, 0, 0, W, H, null, '#777', lwT); return;
  }
  if(k === 'membrane'){
    const col = COL[it.mat] || '#1aa7e0', y = H / 2, wpx = Math.max(H, 3 * u);
    const dash = it.dash === 'dash' ? [10 * u, 6 * u] : it.dash === 'long' ? [24 * u, 6 * u] : it.dash === 'dot' ? [2 * u, 4 * u] : null;
    line(ctx, 0, y, W, y, col, wpx, dash); return;
  }
  if(k === 'fermette' || k === 'ferme'){
    const L = p.L, a = (p.pente || 40) * Math.PI / 180, hh = L / 2 * Math.tan(a), e = k === 'fermette' ? (p.h || 100) : (p.b || 150), y0 = hh;
    const bar = (x1, y1, x2, y2, wd) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * wd / 2, ny = dx / l * wd / 2; poly(ctx, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], COL.bois, COL.boisT, lwT); };
    bar(0, y0 + e / 2, L, y0 + e / 2, e);
    bar(0, y0, L / 2, 0 + e / 2, e); bar(L, y0, L / 2, 0 + e / 2, e);
    if(k === 'fermette'){
      const xs = [L / 6, L / 3, L / 2, 2 * L / 3, 5 * L / 6], yTop = x => x <= L / 2 ? y0 - (x / (L / 2)) * (y0 - e / 2) : y0 - ((L - x) / (L / 2)) * (y0 - e / 2);
      bar(L / 3, y0, xs[0] + L / 12, yTop(xs[0] + L / 12), e * .75); bar(L / 3, y0, L / 2 - L / 12, yTop(L / 2 - L / 12), e * .75);
      bar(2 * L / 3, y0, L / 2 + L / 12, yTop(L / 2 + L / 12), e * .75); bar(2 * L / 3, y0, xs[4] - L / 12, yTop(xs[4] - L / 12), e * .75);
      [[L / 3, y0 + e / 2], [2 * L / 3, y0 + e / 2]].forEach(([x, y]) => rect(ctx, x - e * .45, y - e * .35, e * .9, e * .7, COL.galva, T, lwT));
    } else {
      const ye = it.retrousse ? y0 * .45 : y0;
      if(it.retrousse){ bar(L * .22, ye, L * .78, ye, e * .9); }
      bar(L / 2, e / 2, L / 2, ye, e * .9);
      if(!it.retrousse){ bar(L / 2, y0 * .7, L * .3, y0 * .4, e * .7); bar(L / 2, y0 * .7, L * .7, y0 * .4, e * .7); }
    }
    return;
  }
  if(k === 'pergola'){
    const b = p.b, L = p.L, Hh = p.H;
    rect(ctx, 0, b * 1.4, b, Hh - b * 1.4, COL.bois, COL.boisT, lw); rect(ctx, L, b * 1.4, b, Hh - b * 1.4, COL.bois, COL.boisT, lw);
    rect(ctx, -b * .2, b * .4, L + b * 1.4, b, COL.bois, COL.boisT, lw);
    for(let x = b; x < L; x += 500) rect(ctx, x, 0, b * .35, b * .4, COL.bois, COL.boisT, lwT);
    return;
  }
  if(k === 'platine' || k === 'gousset'){
    if(k === 'platine'){ rect(ctx, 0, 0, W, H, steelCol(it), T, lw); const n = p.n || 4, m = Math.min(W, H) * .15, r = Math.min(W, H) * .05; const pts = n === 4 ? [[m, m], [W - m, m], [m, H - m], [W - m, H - m]] : Array.from({ length:n }, (_, i) => [m + (W - 2 * m) * (i % (n / 2)) / Math.max(1, n / 2 - 1), i < n / 2 ? m : H - m]); pts.forEach(([x, y]) => circ(ctx, x, y, r, '#fff', T, lwT)); return; }
    poly(ctx, p.corbeau ? [[0, 0], [W, 0], [W, H * .25], [W * .2, H], [0, H]] : [[0, 0], [W, H], [0, H]], steelCol(it), T, lw); return;
  }
  if(k === 'piedpot'){
    rect(ctx, 0, H - 10, W, 10, steelCol(it), T, lw); rect(ctx, W * .3, 0, W * .4, 8, steelCol(it), T, lw);
    rect(ctx, W / 2 - 10, 8, 20, H - 18, '#b7bec7', T, lwT); for(let y = 14; y < H - 14; y += 6) line(ctx, W / 2 - 10, y, W / 2 + 10, y + 3, T, lwT * .7);
    return;
  }
  if(k === 'sabot'){ const t = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, 0); ctx.strokeStyle = T; ctx.lineWidth = t + lwT; ctx.stroke(); ctx.strokeStyle = COL.galva; ctx.lineWidth = t; ctx.stroke(); if(!p.pied){ for(let y = H * .2; y < H * .9; y += H * .2){ circ(ctx, 0, y, 2.5, '#fff', T, lwT); circ(ctx, W, y, 2.5, '#fff', T, lwT); } } else { line(ctx, W / 2, H, W / 2, H + 60, T, 6); } return; }
  if(k === 'equerre'){ const t = 3; poly(ctx, [[0, 0], [t, 0], [t, H - t], [W, H - t], [W, H], [0, H]], COL.galva, T, lw); poly(ctx, [[t, H - t - H * .35], [t, H - t], [t + W * .35, H - t]], 'rgba(0,0,0,.12)', T, lwT); return; }
  if(k === 'feuillard'){ rect(ctx, 0, 0, W, H, COL.galva, T, lwT); for(let x = H * .6; x < W; x += H * .9) circ(ctx, x, H / 2, H * .18, '#fff', T, lwT * .6); return; }
  if(k === 'boulon' || k === 'tige'){
    const d = p.d, Hh = H, y = Hh / 2;
    if(k === 'boulon'){
      const hk = d * .7, L = W - hk * 2; rect(ctx, 0, y - d, hk, d * 2, COL.acier, T, lw);
      rect(ctx, hk, y - d / 2, L, d, '#cfd4da', T, lwT);
      for(let x = hk + L * .45; x < hk + L; x += d * .35) line(ctx, x, y - d / 2, x + d * .2, y + d / 2, T, lwT * .7);
      rect(ctx, hk + L * .8, y - d * 1.1, d * .15, d * 2.2, COL.galva, T, lwT); rect(ctx, hk + L * .8 + d * .15, y - d, d * .8, d * 2, COL.acier, T, lw);
    } else {
      rect(ctx, 0, 0, W, Hh, '#cfd4da', T, lwT); for(let x = 0; x < W; x += d * .35) line(ctx, x, 0, x + d * .2, Hh, T, lwT * .7);
      if(it.tirefond){ rect(ctx, -d * .7, -d * .2, d * .7, Hh + d * .4, COL.acier, T, lw); poly(ctx, [[W, 0], [W + d, Hh / 2], [W, Hh]], '#cfd4da', T, lwT); }
    }
    return;
  }
  if(k === 'ecrou'){ const r = W / 2, cx = W / 2, cy = H / 2; poly(ctx, Array.from({ length:6 }, (_, i) => [cx + r * Math.cos(i * Math.PI / 3), cy + r * Math.sin(i * Math.PI / 3)]), COL.acier, T, lw); circ(ctx, cx, cy, p.d / 2, '#fff', T, lwT); return; }
  if(k === 'ancrage'){
    const d = p.d, y = H / 2; rect(ctx, 0, y - d / 2, W, d, it.chim ? '#cfd4da' : COL.galva, T, lwT);
    if(it.chim) rect(ctx, W * .25, y - d * .8, W * .75, d * 1.6, 'rgba(120,120,120,.35)', null);
    else { poly(ctx, [[W * .7, y - d * .8], [W, y - d * .6], [W, y + d * .6], [W * .7, y + d * .8]], '#b7bec7', T, lwT); }
    rect(ctx, -d * .25, y - d * .9, d * .25, d * 1.8, COL.galva, T, lwT); rect(ctx, -d * 1.05, y - d * .8, d * .8, d * 1.6, COL.acier, T, lw);
    return;
  }
  if(k === 'tuileMeca'){
    // une tuile seule : corps (épaisseur e) + ergot d'accroche sous la tête (n × n), comme vue en coupe
    const e = p.e, n = p.n, x0 = n * .6;
    rect(ctx, 0, 0, W, e, COL.tuile, '#6e2c1b', lw);
    rect(ctx, x0, e, n, n, COL.tuile, '#6e2c1b', lw);
    line(ctx, W * .08, e * .5, W * .97, e * .5, 'rgba(110,44,27,.25)', lwT);
    return;
  }
  if(k === 'tuileCanal'){ const w = p.w; for(let x = 0, i = 0; x < W; x += w * .85, i++){ ctx.beginPath(); if(i % 2){ ctx.arc(x + w / 2, H * .55, w / 2, Math.PI, 0); } else { ctx.arc(x + w / 2, H * .15, w / 2, 0, Math.PI); } ctx.strokeStyle = '#6e2c1b'; ctx.lineWidth = Math.max(lw * 2.5, 10); ctx.stroke(); ctx.strokeStyle = COL.tuile; ctx.lineWidth = Math.max(lw * 2.5, 10) * .75; ctx.stroke(); } return; }
  if(k === 'plate'){ const pur = p.pur, e = p.e, col = it.ardoise ? COL.ardoise : COL.tuile; for(let x = 0; x < W; x += pur){ poly(ctx, [[x, H - e * .2], [x + pur * 2.6, H * .1], [x + pur * 2.6, H * .1 + e], [x, H]], col, '#333', lwT); } return; }
  if(k === 'bac' || k === 'sandwich'){
    const pas = p.pas, h = p.h, y0 = 1, col = it.mat === 'bac' || k === 'bac' ? COL.bac : COL.bac;
    if(k === 'sandwich'){ rect(ctx, 0, h + 1, W, p.e, COL.pir, '#777', lwT); hatch(ctx, 0, h + 1, W, p.e, Math.max(p.e / 2, 8 * u), 45, 'rgba(0,0,0,.25)', lwT); line(ctx, 0, h + 1 + p.e, W, h + 1 + p.e, T, lw * 1.4); }
    ctx.beginPath(); let x = 0; ctx.moveTo(0, y0 + h); while(x < W){ const a = pas * .2; ctx.lineTo(x + a * .3, y0 + h); ctx.lineTo(x + a * .6, y0); ctx.lineTo(x + a * 1.4, y0); ctx.lineTo(x + a * 1.7, y0 + h); ctx.lineTo(x + pas, y0 + h); x += pas; }
    ctx.strokeStyle = T; ctx.lineWidth = lw * 1.6; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); return;
  }
  if(k === 'ondule'){ ctx.beginPath(); for(let x = 0; x <= W; x += p.pas / 16){ const y = 1 + p.h / 2 - Math.sin(x / p.pas * Math.PI * 2) * p.h / 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = '#555'; ctx.lineWidth = Math.max(6, lw * 2); ctx.stroke(); ctx.strokeStyle = '#b9bcbf'; ctx.lineWidth = Math.max(4, lw * 1.3); ctx.stroke(); return; }
  if(k === 'jointDebout' || k === 'tasseauZinc'){
    const pas = p.pas, h = p.h, y = h + 1;
    if(k === 'tasseauZinc'){ for(let x = pas; x < W; x += pas) rect(ctx, x - h * .5, y - h, h, h, COL.bois, COL.boisT, lwT); }
    ctx.beginPath(); ctx.moveTo(0, y); for(let x = pas; x < W; x += pas){ ctx.lineTo(x - (k === 'tasseauZinc' ? h * .55 : 3), y); ctx.lineTo(x - (k === 'tasseauZinc' ? h * .55 : 3), y - h - 1); ctx.lineTo(x + (k === 'tasseauZinc' ? h * .55 : 3), y - h - 1); ctx.lineTo(x + (k === 'tasseauZinc' ? h * .55 : 3), y); } ctx.lineTo(W, y);
    ctx.strokeStyle = '#4a5966'; ctx.lineWidth = lw * 1.8; ctx.stroke(); ctx.strokeStyle = COL.zinc; ctx.lineWidth = lw; ctx.stroke(); return;
  }
  if(k === 'faitage'){ ctx.beginPath(); ctx.arc(W / 2, H, W / 2, Math.PI, 0); ctx.strokeStyle = '#6e2c1b'; ctx.lineWidth = Math.max(14, lw * 3); ctx.stroke(); ctx.strokeStyle = COL.tuile; ctx.lineWidth = Math.max(10, lw * 2.2); ctx.stroke(); return; }
  if(k === 'closoir'){ rect(ctx, 0, H * .3, W, H * .4, '#555', T, lwT); for(let x = 0; x < W; x += 12) line(ctx, x, H * .3, x + 6, 0, '#555', lwT * 1.4); for(let x = 0; x < W; x += 12) line(ctx, x, H * .7, x + 6, H, '#555', lwT * 1.4); return; }
  if(k === 'noue'){ poly(ctx, [[0, 0], [W / 2, H], [W, 0]], null, '#4a5966', lw * 2.2, false); poly(ctx, [[0, 0], [W / 2, H], [W, 0]], null, COL.zinc, lw * 1.3, false); return; }
  if(k === 'rive'){ poly(ctx, [[0, 0], [W, 0], [W, H], [W - 15, H], [W - 15, 15], [0, 15]], COL.tuile, '#6e2c1b', lw); return; }
  if(k === 'fenToit'){ rect(ctx, 0, 0, W, H, '#7b8794', T, lw); rect(ctx, 30, 25, W - 60, H - 70, COL.verre, T, lwT); line(ctx, W * .5, 25, W * .5, H - 45, '#fff', lwT); rect(ctx, -20, -8, W + 40, 14, '#4a5966', T, lwT); return; }
  if(k === 'chevetre'){ const e = 50; rect(ctx, 0, 0, e, H, COL.bois, COL.boisT, lw); rect(ctx, W - e, 0, e, H, COL.bois, COL.boisT, lw); rect(ctx, e, 0, W - 2 * e, e, COL.bois, COL.boisT, lw); rect(ctx, e, H - e, W - 2 * e, e, COL.bois, COL.boisT, lw); line(ctx, e, e, W - e, H - e, '#999', lwT, [8 * u, 6 * u]); line(ctx, W - e, e, e, H - e, '#999', lwT, [8 * u, 6 * u]); return; }
  if(k === 'crochet'){ ctx.beginPath(); ctx.moveTo(0, H * .2); ctx.lineTo(W * .85, H * .2); ctx.quadraticCurveTo(W, H * .2, W, H * .6); ctx.lineTo(W * .8, H * .9); ctx.strokeStyle = '#4a5966'; ctx.lineWidth = Math.max(3, lw * 1.6); ctx.stroke(); return; }
  const zinc = (pts) => { ctx.lineJoin = 'round'; poly(ctx, pts, null, '#2f6f95', Math.max(lw * 2.4, 3), false); poly(ctx, pts, null, '#1aa7e0', Math.max(lw * 1.4, 2), false); };
  if(k === 'larmier'){ zinc([[0, 0], [p.a, 0], [p.a, p.b], [p.a + p.c, p.b + p.c]]); return; }
  if(k === 'solin'){ zinc([[W - 8, 0], [W, 0], [W, H], [0, H], [0, H - 15]]); return; }
  if(k === 'bandeRive'){ zinc([[0, 0], [W, 0], [W, H - p.c], [W + p.c * .6, H]]); return; }
  if(k === 'couvertine'){ zinc([[0, H], [0, 0], [W, 15], [W, H]]); line(ctx, 0, H, -12, H - 6, '#1aa7e0', lw * 1.4); line(ctx, W, H, W + 12, H - 6, '#1aa7e0', lw * 1.4); return; }
  if(k === 'gouttiere'){ const r = p.d / 2; ctx.beginPath(); ctx.arc(r, 0, r, 0, Math.PI); ctx.strokeStyle = '#4a5966'; ctx.lineWidth = Math.max(lw * 2.2, 3); ctx.stroke(); ctx.strokeStyle = COL.zinc; ctx.lineWidth = Math.max(lw * 1.3, 2); ctx.stroke(); circ(ctx, 2 * r + 4, 0, 5, COL.zinc, '#4a5966', lwT); return; }
  if(k === 'gouttiereM'){ zinc([[0, 0], [0, H], [W * .8, H], [W, H * .6], [W * .85, H * .45], [W, H * .2], [W, 0]]); return; }
  if(k === 'chenau'){ rect(ctx, -20, -10, W + 40, H + 20, COL.bois, COL.boisT, lwT); zinc([[-20, -10], [0, 0], [0, H], [W, H], [W, 0], [W + 20, -10]]); return; }
  if(k === 'naissance'){ const d = p.d; rect(ctx, d, d * 1.2, d, H - d * 1.2, COL.zinc, '#4a5966', lw); poly(ctx, [[0, 0], [W, 0], [d * 2, d * 1.2], [d, d * 1.2]], COL.zinc, '#4a5966', lw); return; }
  if(k === 'crochetG'){ ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * .2, 0); ctx.arc(W * .55, 0, W * .35, Math.PI, 0, true); ctx.strokeStyle = '#4a5966'; ctx.lineWidth = Math.max(lw * 2, 4); ctx.stroke(); return; }
  if(k === 'abergement'){ zinc([[0, 0], [0, p.a], [p.b, p.a + 30]]); return; }
  if(k === 'bardage'){
    const w = p.w, e = p.e, j = p.j || 0, col = p.mat === 'ciment' ? COL.ciment : COL.bois;
    if(p.type === 'clin'){ for(let x = 0; x < W; x += w * .85){ poly(ctx, [[x, H], [x + w, H - e * 1.2], [x + w, H - e * 2.2], [x, H - e]], col, COL.boisT, lwT); } return; }
    for(let x = 0; x < W; x += w + j){ rect(ctx, x, 0, Math.min(w, W - x), H, col, COL.boisT, lwT); if(p.type === 'rb'){ line(ctx, x + w * .92, H * .35, x + w * .92, H * .65, COL.boisT, lwT); } }
    return;
  }
  if(k === 'grille'){ poly(ctx, [[0, 0], [0, H], [W, H]], null, '#555', lw, false); for(let y = 6; y < H; y += 6) line(ctx, 2, y, W * (y / H), y, '#777', lwT * .6); return; }
  if(k === 'beton' || k === 'semelle'){
    rect(ctx, 0, 0, W, H, COL.beton, COL.betonT, lw); hatch(ctx, 0, 0, W, H, Math.max(Math.min(W, H) / 5, 10 * u), 45, 'rgba(0,0,0,.25)', lwT);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for(let x = 15; x < W; x += 37) for(let y = 12; y < H; y += 29) circ(ctx, x + ((y * 3) % 11), y, Math.max(1.4, u), 'rgba(0,0,0,.35)');
    if(it.ferraille || k === 'semelle'){ const c = 35, r = 6; [[c, H - c], [W - c, H - c], [W / 2, H - c]].concat(it.ferraille ? [[c, c], [W - c, c]] : []).forEach(([x, y]) => circ(ctx, x, y, r, '#333')); rect(ctx, c - 8, c - 8, W - 2 * c + 16, H - 2 * c + 16, null, '#333', lwT); }
    return;
  }
  if(k === 'dallage'){ const e = p.e, g = p.g; rect(ctx, 0, 0, W, e, COL.beton, COL.betonT, lw); hatch(ctx, 0, 0, W, e, 30, 45, 'rgba(0,0,0,.25)', lwT); line(ctx, 0, e + 1, W, e + 1, COL.polyane, 3 * u, [10 * u, 6 * u]); rect(ctx, 0, e + 2, W, g, COL.gravier, '#888', lwT); for(let x = 10; x < W; x += 26) for(let y = e + 14; y < e + g; y += 22) circ(ctx, x + ((y * 5) % 13), y, 7, null, '#777', lwT); return; }
  if(k === 'parpaing'){ rect(ctx, 0, 0, W, H, COL.parpaing, COL.betonT, lw); const t = Math.max(W * .15, 25); if(W > 120){ rect(ctx, t, t, W - 2 * t, (H - 3 * t) / 2, '#fff', COL.betonT, lwT); rect(ctx, t, H / 2 + t / 2, W - 2 * t, (H - 3 * t) / 2, '#fff', COL.betonT, lwT); } return; }
  if(k === 'brique'){ rect(ctx, 0, 0, W, H, COL.brique, '#7a3d22', lw); const nx = Math.max(3, Math.round(W / 22)), ny = Math.max(3, Math.round(H / 22)); for(let i = 0; i < nx; i++) for(let j = 0; j < ny; j++) rect(ctx, W * (i + .2) / nx, H * (j + .2) / ny, W * .6 / nx, H * .6 / ny, '#f2e1d6', '#7a3d22', lwT * .6); return; }
  if(k === 'pierre'){ rect(ctx, 0, 0, W, H, '#e8e1d3', '#666', lw); let y = 0, r = 0; while(y < H){ const hh = 70 + (r * 37) % 60; let x = (r % 2) * 40; while(x < W){ const ww = 120 + (x * 13 + r * 29) % 90; rect(ctx, x + 3, y + 3, Math.min(ww, W - x) - 6, Math.min(hh, H - y) - 6, COL.pierre, '#6b604d', lwT); x += ww; } y += hh; r++; } return; }
  if(k === 'terre'){ ctx.fillStyle = COL.terre; ctx.fillRect(0, 0, W, H); line(ctx, 0, 0, W, 0, '#3e2b17', lw * 1.6); for(let x = 0; x < W; x += 40){ line(ctx, x, 6, x + 20, 26, '#3e2b17', lwT); line(ctx, x + 10, 6, x + 30, 26, '#3e2b17', lwT); } return; }
  if(k === 'gravier'){ rect(ctx, 0, 0, W, H, COL.gravier, '#888', lwT); for(let x = 10; x < W; x += 26) for(let y = 12; y < H; y += 22) circ(ctx, x + ((y * 5) % 13), y, 7, null, '#777', lwT); return; }
  if(k === 'drain'){ const r = W / 2; circ(ctx, r, r, r, '#f3d36b', '#8a6d10', lw); circ(ctx, r, r, r * .8, '#fff', '#8a6d10', lwT); for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4; circ(ctx, r + Math.cos(a) * r * .9, r + Math.sin(a) * r * .9, r * .06, '#8a6d10'); } return; }
  if(k === 'lameTerr'){ poly(ctx, [[0, 0], [W, 0], [W, H * .6], [W - 4, H * .6], [W - 4, H], [4, H], [4, H * .6], [0, H * .6]], COL.lbois, COL.boisT, lw); for(let x = W * .1; x < W; x += W / 7) line(ctx, x, 0, x, 1.6, COL.boisT, lwT); return; }
  if(k === 'plotTerr'){ rect(ctx, 30, 0, 100, 8, '#555', '#222', lwT); rect(ctx, 65, 8, 30, H - 30, '#777', '#222', lwT); for(let y = 14; y < H - 24; y += 8) line(ctx, 65, y, 95, y + 4, '#222', lwT * .6); rect(ctx, 0, H - 22, 160, 22, '#555', '#222', lwT); return; }
  if(k === 'fenetre'){ const b = p.b, v = p.v || 2; rect(ctx, 20, 0, b, H, '#f2f2f2', '#555', lw); rect(ctx, 20, H - 60, b, 60, '#f2f2f2', '#555', lwT); const vg = b * .5, x0 = 20 + b * .25; for(let i = 0; i < v; i++) line(ctx, x0 + i * vg / (v - 1 || 1), 60, x0 + i * vg / (v - 1 || 1), H - 60, '#4aa3c8', Math.max(4, lw * 1.5)); poly(ctx, [[0, H], [b + 40, H], [b + 40, H + 20], [0, H + 6]], '#ddd', '#555', lwT); return; }
  if(k === 'appui'){ poly(ctx, [[0, 0], [W, H * .25], [W, H * .6], [W - 15, H * .6], [W - 15, H * .45], [0, H]], '#d9d6cf', '#666', lw); return; }
  if(k === 'porte'){ rect(ctx, 0, 0, p.b, 60, '#c99a62', COL.boisT, lw); rect(ctx, p.b * .3, 60, p.e, H - 70, COL.bois, COL.boisT, lw); return; }
  if(k === 'seuil'){ poly(ctx, [[0, H], [0, H * .5], [W * .6, 0], [W, 0], [W, H]], COL.alu, '#555', lw); return; }
  if(k === 'coffre'){ rect(ctx, 0, 0, W, H, '#f2f2f2', '#555', lw); circ(ctx, W / 2, H / 2, Math.min(W, H) * .32, null, '#888', lwT); circ(ctx, W / 2, H / 2, Math.min(W, H) * .1, '#888'); return; }
  if(k === 'boitier'){ poly(ctx, [[0, 0], [W, 0], [W, H], [0, H]], '#2b6cb0', '#123', lw); rect(ctx, -3, -4, 3, H + 8, '#2b6cb0', '#123', lwT); return; }
  if(k === 'suspente'){ line(ctx, W / 2, 0, W / 2, H, '#555', 2); rect(ctx, W * .1, H * .55, W * .8, 12, COL.galva, '#444', lwT); return; }
  /* ── Repères (taille fixe à l'écran) ── */
  if(k === 'niveau'){ const r = Math.min(W, H) * .32, txt = (s && s.label) || p.txt || '+0'; line(ctx, 0, H / 2, W * .55, H / 2, '#2c3e50', lw, [6 * u, 4 * u]); circ(ctx, W * .55 + r, H / 2, r, '#fff', '#2c3e50', lw); line(ctx, W * .55, H / 2, W * .55 + 2 * r, H / 2, '#2c3e50', lwT); line(ctx, W * .55 + r, H / 2 - r, W * .55 + r, H / 2 + r, '#2c3e50', lwT); return 'text:' + txt; }
  if(k === 'nord'){ poly(ctx, [[W / 2, 0], [W * .8, H], [W / 2, H * .75], [W * .2, H]], '#2c3e50', '#2c3e50', lwT); return 'textTop:N'; }
  if(k === 'traitCoupe'){ line(ctx, W * .1, H / 2, W * .9, H / 2, '#c0392b', lw * 1.4, [14 * u, 5 * u, 3 * u, 5 * u]); poly(ctx, [[W * .1, H / 2], [W * .1, H * .1], [W * .02, H * .3]], '#c0392b', '#c0392b', lwT); poly(ctx, [[W * .9, H / 2], [W * .9, H * .1], [W * .98, H * .3]], '#c0392b', '#c0392b', lwT); return 'text2:' + ((s && s.label) || p.txt || 'A'); }
  if(k === 'rupture'){ poly(ctx, [[0, H / 2], [W * .42, H / 2], [W * .47, H * .1], [W * .53, H * .9], [W * .58, H / 2], [W, H / 2]], null, '#333', lw, false); return; }
  rect(ctx, 0, 0, W, H, '#eee', '#999', lw);
}

/* ── API ─────────────────────────────────────────────────────────── */
function byId(id){ return items.find(x => x.id === id) || null; }
function norm(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function search(q, fam){
  const n = norm(q).trim();
  return items.filter(it => (!fam || it.f === fam) && (!n || norm(it.l + ' ' + it.sf + ' ' + (it.tags || '') + ' ' + it.sizes.map(z => z.l).join(' ')).includes(n)));
}
/* Paramètres modifiables (pour la saisie « Autre dimension ») */
const PARAM_LABELS = { b:'Largeur b', h:'Hauteur h', e:'Épaisseur', tw:'Âme tw', tf:'Aile tf', t:'Épaisseur t', a:'Aile a', d:'Diamètre', c:'Lèvre / aile', L:'Portée', pente:'Pente (°)', H:'Hauteur', w:'Largeur', pur:'Pureau', pas:'Entraxe / pas', j:'Jour', n:'Nb trous', s:'Sur plats', p:'Profondeur', g:'Hérisson' };
function editableParams(it, p){ const lab = k => (it && it.kind === 'tuileMeca') ? ({ n:'Ergot', L:'Longueur' })[k] || PARAM_LABELS[k] : PARAM_LABELS[k]; return Object.keys(p || {}).filter(k => typeof p[k] === 'number' && lab(k)).map(k => ({ k, l:lab(k), v:p[k] })); }
function viewLabel(v){ return ({ section:'Coupe (section)', long:'Vue en long', elev:'Élévation', face:'Vue de face', plan:'Vue de dessus' })[v] || v; }
function needsLength(it, view){ const d0 = dims(it, it.sizes[0].p, view, 1000), d1 = dims(it, it.sizes[0].p, view, 2000); return d0.w !== d1.w || d0.h !== d1.h; }

window.RWB = { FAM, items, COL, byId, search, dims, draw, editableParams, viewLabel, needsLength, version:'5.41.453' };
})();
