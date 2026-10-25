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
  /* Réductions pour tous :
     - mensuel : le 1er mois est offert (période gratuite Stripe, carte demandée, aucun débit avant 30 jours)
     - annuel  : 2 mois offerts (on paie 10 mois sur 12) */
  monthFreeFirst: true,
  yearlyMonthsFree: 2,
  extraSeat: 4,              // € HT / mois par compte au-delà de 25 (formule Entreprise)
  /* Offre Fondateur : 5 premières entreprises — -20 % sur le 1er mois payé (mensuel) ou sur la 1re année (annuel) */
  founder: { on:true, label:'Offre Fondateur', pct:20, max:5, left:5,
             text:'-20 % sur ton 1er mois (mensuel) ou sur ta 1re année (annuel) — réservé aux 5 premières entreprises' },

  /* Mise en route et options : SUR DEVIS (aucun prix affiché au client).
     Le bouton « Demander un devis » pose les questions pas à pas puis fait choisir
     un rendez-vous téléphonique. Les demandes arrivent dans Supabase › rwood_quotes (+ e-mail si Resend). */
  quote: { on:true, title:'Mise en route personnalisée',
           text:'On installe Notybat pour toi : équipe, chantiers, stock de machines, camions, et même le tableau d\u2019heures que reçoit ton comptable. Réponds à quelques questions et choisis quand on t\u2019appelle.',
           days:14,                       // jours proposés pour l'appel
           weekdays:[1,2,3,4,5],          // 1 = lundi … 5 = vendredi (6 = samedi)
           slots:['08:00','09:00','10:00','11:00','12:00','13:30','14:30','15:30','16:30','17:30','18:30'] },

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
