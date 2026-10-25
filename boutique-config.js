/* ═══ Notybat — RÉGLAGES DE LA BOUTIQUE ═══════════════════════════════════
   Seul fichier à modifier le jour où tu as ton SIRET.
   Utilisé par presentation.html (site), cgv.html, mentions-legales.html.
   Aucune clé secrète ici : les clés Stripe vont UNIQUEMENT dans les secrets Supabase.
   ═══════════════════════════════════════════════════════════════════════ */
window.NB_SHOP = {

  /* 1) INTERRUPTEUR PRINCIPAL
     false = boutique « en préparation » : le panier marche, mais le bouton final
             enregistre une RÉSERVATION (aucun paiement), et on te prévient par e-mail.
     true  = paiement en ligne réel par carte (Stripe). À passer à true seulement quand
             le SIRET est rempli ci-dessous ET que Stripe est configuré (voir GUIDE). */
  live: false,

  /* 2) TON ENTREPRISE (obligatoire pour vendre — apparaît dans les CGV, mentions, factures) */
  seller: {
    name:     'Notybat',                 // raison sociale ou « Prénom NOM EI »
    form:     'Entreprise individuelle', // EI, micro-entreprise, SASU, EURL…
    siret:    '',                        // ← 14 chiffres, à remplir
    rcs:      '',                        // ex. « RCS Nancy 123 456 789 » (ou vide en micro-entreprise RNE)
    address:  '',                        // adresse du siège
    email:    'rwoods.log@gmail.com',
    phone:    '',
    director: '',                        // directeur de la publication (ton nom)
    vatNumber: '',                       // n° TVA intracom (vide si franchise)
    /* TVA : true = franchise en base (micro-entreprise) → « TVA non applicable, art. 293 B du CGI »
             false = TVA 20 % ajoutée aux prix HT */
    vatFranchise: true,
    host: 'GitHub Pages — GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA',
    mediator: '',                        // médiateur de la consommation (si clients particuliers)
  },

  /* 3) LES FORMULES (prix HT par mois) — mêmes formules que dans l'appli */
  plans: [
    { id:'solo',       name:'Solo',       month:19, seats:3,  seatsTxt:'1 à 3 comptes',     tag:'' ,
      pitch:"Pour l'artisan et son équipe de 1 à 3 personnes." },
    { id:'equipe',     name:'Équipe',     month:49, seats:10, seatsTxt:"jusqu'à 10 comptes", tag:'Le plus choisi',
      pitch:'Pour une entreprise avec plusieurs équipes sur les chantiers.' },
    { id:'entreprise', name:'Entreprise', month:99, seats:25, seatsTxt:"jusqu'à 25 comptes", tag:'',
      pitch:'Pour les structures avec bureau, conducteurs et plusieurs pôles.' },
  ],
  yearlyMonthsFree: 2,       // annuel : 2 mois offerts (paie 10 mois sur 12)
  extraSeat: 4,              // € HT / mois par compte au-delà de 25 (formule Entreprise)
  trialDays: 30,             // essai gratuit
  founder: { on:true, label:'Offre Fondateur', text:'-30 % à vie pour les 10 premières entreprises', pct:30, left:10 },
  onboarding: { on:true, name:'Mise en service', price:290, text:'On configure ton entreprise à ta place : chantiers, équipe, contacts, formation à distance (2 h).' },

  /* 4) TÉLÉCHARGEMENTS DIRECTS (1 appui)
     ready:false → le bouton ouvre le guide d'installation à la place, en attendant le fichier. */
  downloads: {
    android: { ready:false, url:'https://github.com/rwoodslog-dev/RWOOD/releases/latest/download/Notybat.apk', size:'≈ 8 Mo' },
    iphone:  { ready:true,  url:'Notybat.mobileconfig', size:'43 Ko' },
    windows: { ready:false, url:'https://github.com/rwoodslog-dev/RWOOD/releases/latest/download/Notybat.msix', size:'≈ 2 Mo' },
  },

  /* 5) ESPACE CLIENT Stripe (factures, carte, résiliation) — lien « Customer portal » de Stripe
     (Stripe › Paramètres › Facturation › Portail client › « Lien de connexion »). Vide = e-mail. */
  portalUrl: '',

  /* 6) SERVEUR (Supabase) — clé publique uniquement */
  api: 'https://espiotysnvxgjxrzkfta.supabase.co/functions/v1/notybat-shop',
  apiKey: 'sb_publishable_Q8V0-K4HERye-JKhcbjm1Q_fyEsBxMu',
};
