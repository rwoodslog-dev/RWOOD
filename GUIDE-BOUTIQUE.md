# Notybat — Boutique et téléchargements : mise en route

Tout est déjà en place sur le site (`presentation.html`) : tarifs, panier, formulaire entreprise, CGV, mentions légales.
Tant que `live: false` dans `boutique-config.js`, le panier enregistre des **réservations** (aucun paiement).

---

## A. Maintenant (sans SIRET)

1. **Supabase › SQL Editor** : coller et lancer `supabase/boutique.sql` (crée `rwood_orders` et `rwood_billing`).
2. **Déployer la fonction boutique** :
   `supabase functions deploy notybat-shop`
   Tant qu'elle n'est pas déployée, le bouton « Réserver » ouvre un e-mail tout prêt vers rwoods.log@gmail.com, donc aucune réservation n'est perdue.
3. **(Facultatif) Être prévenu par e-mail** : créer un compte gratuit sur resend.com, puis ajouter dans Supabase › Edge Functions › Secrets :
   - `RESEND_API_KEY` ;
   - `OWNER_EMAIL` = rwoods.log@gmail.com.
4. **Voir les réservations** : Supabase › Table editor › `rwood_orders`.

## B. Les 3 liens de téléchargement (1 appui)

| Appareil | Fichier | Où le mettre | Puis dans `boutique-config.js` |
|---|---|---|---|
| **Android** | `Notybat.apk` | GitHub › RWOOD › **Releases** › nouvelle release › joindre le fichier sous ce nom exact | `android: { ready:true }` |
| **iPhone** | `Notybat.mobileconfig` (fourni) | à la racine du dépôt (déjà dans le zip) | déjà `ready:true` |
| **Windows** | `Notybat.msix` | GitHub › Releases, même release | `windows: { ready:true }` |

Les liens `…/releases/latest/download/Notybat.apk` et `….msix` pointent toujours vers la **dernière** release : une fois le lien partagé, il n'a plus besoin de changer.

**Android, version « directe »** (indispensable pour vendre hors Google Play) :
- **Identifiant différent** : dans Android Studio, crée une 2ᵉ variante de l'app avec l'identifiant **`fr.rwood.app.direct`** (`productFlavors { direct { applicationIdSuffix ".direct" } }`). La version `fr.rwood.app` reste celle du Play Store pour les testeurs.
- **Ce que change l'identifiant** : l'appli le lit toute seule. Dans la version `.direct`, les prix et le bouton d'achat s'affichent. Dans la version Play, ils restent cachés (règles Google).
- **Construire le fichier** : Build › Generate Signed APK, variante `directRelease`, renommé en `Notybat.apk`.
- **Mises à jour** : elles se font déjà toutes seules (`rwood-files.json`). Il faut republier l'APK seulement si la partie native change.

**Windows** : va sur pwabuilder.com, colle `https://rwoodslog-dev.github.io/RWOOD/`, puis Package › Windows. Renomme le fichier `.msix` obtenu en `Notybat.msix`.
- En attendant, le site propose l'installation par Chrome ou Edge (bouton « Installer sur cet ordinateur »), en 1 clic.
- Remarque : un MSIX non signé par une autorité affiche un avertissement Windows. Pour l'éviter, il faut un certificat de signature de code (≈ 100 à 300 €/an), ou passer par le Microsoft Store (compte développeur ≈ 19 € une fois).

**iPhone** : le profil installe l'icône Notybat en plein écran.
- iOS affiche « Non vérifié » car le profil n'est pas signé : c'est normal.
- La méthode Safari › Partager › « Sur l'écran d'accueil » reste proposée juste en dessous.

## C. Le jour où tu as le SIRET

1. **`boutique-config.js`** : remplir `seller` (SIRET, adresse, forme, directeur de la publication) et choisir :
   - `vatFranchise: true` si tu es en franchise de TVA (micro-entreprise) ;
   - `vatFranchise: false` + `vatNumber` sinon.
2. **Stripe** (stripe.com) : créer le compte avec le SIRET et l'IBAN, puis activer les paiements.
3. **Supabase › Secrets** :
   - `STRIPE_SECRET_KEY` = `sk_live_…` (commencer par `sk_test_…` pour tester) ;
   - `SHOP_LIVE` = `1` ;
   - `SHOP_VAT` = `0` (franchise) ou `20` ;
   - si TVA : `STRIPE_TAX_RATE` = id du taux 20 % créé dans Stripe (`txr_…`) ;
   - `SITE_URL` = `https://rwoodslog-dev.github.io/RWOOD/presentation.html`.
4. **Webhook Stripe** :
   - Stripe › Développeurs › Webhooks › Ajouter : `https://espiotysnvxgjxrzkfta.supabase.co/functions/v1/stripe-webhook` ;
   - événements à cocher : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` ;
   - copier le secret `whsec_…` dans le secret Supabase `STRIPE_WEBHOOK_SECRET` ;
   - déployer : `supabase functions deploy stripe-webhook --no-verify-jwt`.
5. **Espace client** : Stripe › Paramètres › Facturation › Portail client, activer, copier le « lien de connexion » dans `portalUrl`. C'est ce lien qu'ouvre le bouton « Gérer mon abonnement et mes factures » de l'appli.
6. **`boutique-config.js`** : passer `live: true`.
7. **Réservations** : envoyer le lien du site aux entreprises de `rwood_orders` (statut `reserved`).

## D. Ce qui reste à brancher (1 point)

Après un paiement, le webhook écrit la formule payée dans **`rwood_billing`** (code entreprise, formule, comptes en plus, statut, fin de période).
La fonction **`rwood-gateway`** (celle qui renvoie `company_info` à l'appli) doit lire cette table pour appliquer la formule à l'entreprise. Son code n'était pas dans le zip : envoie-moi `supabase/functions/rwood-gateway/index.ts` et je fais ce branchement.

## E. Avant d'ouvrir la vente

- **Relecture juridique** : les CGV (`cgv.html`) sont un modèle B2B ; fais-les relire, par exemple par ton expert-comptable ou la CCI.
- **Prix** : `boutique-config.js` › `plans` pour le site. Les mêmes valeurs sont dans `supabase/functions/notybat-shop/index.ts` (constante `PLANS`) : ce sont celles-là que Stripe facture, il faut garder les deux identiques.
- **Offre Fondateur** : `founder.left` affiche les places restantes ; le serveur limite à 10.
