package fr.rwood.app;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.Person;
import androidx.core.app.RemoteInput;
import java.util.Iterator;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Construit les notifications RWOOD « à la WhatsApp » :
 *  - une notification par conversation, avec les derniers messages empilés,
 *  - bouton « Répondre » directement dans la notification,
 *  - compteur de non-lus (pastille sur l'icône + widget),
 *  - regroupement de toutes les conversations sous un résumé RWOOD.
 */
public class RwoodNotifier {

    static final String PREFS = "rwood_notif";
    static final String GROUP_MSG = "fr.rwood.app.MESSAGES";
    static final int SUMMARY_ID = 424242;
    static final String KEY_REPLY = "rwood_reply_text";

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static int idFor(String key) {
        return (key.hashCode() & 0x7fffffff) % 1000000 + 1000;
    }

    static String channelFor(String tag, String url, String given) {
        if (given != null && !given.isEmpty()) return given;
        String t = tag == null ? "" : tag.toLowerCase();
        String u = url == null ? "" : url;
        if (t.startsWith("meteo")) return "rwood_meteo";
        if (t.equals("magasin") || t.contains("sav") || t.startsWith("route") || t.contains("alerte")) return "rwood_alertes";
        if (u.startsWith("conv:")) return "rwood_messages";
        return "rwood_general";
    }

    static PendingIntent openIntent(Context c, String url, int reqCode) {
        Intent i = new Intent(c, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        // « google.message_id » : le plugin Capacitor transmet alors l'appui à l'app web
        // (événement pushNotificationActionPerformed → ouvre le bon écran).
        i.putExtra("google.message_id", "rw-" + System.currentTimeMillis());
        i.putExtra("url", url == null ? "" : url);
        return PendingIntent.getActivity(c, reqCode, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Point d'entrée : un message Firebase « riche » vient d'arriver. */
    public static synchronized void show(Context c, Map<String, String> d) {
        // v5.80 — pas d'émojis du téléphone dans les notifications (icône Notybat à la place)
        String title = nz(noEmo(d.get("title")), "Notybat");
        String body = nz(noEmo(d.get("body")), "");
        String url = nz(d.get("url"), "");
        String tag = nz(d.get("tag"), "rwood");
        String channel = channelFor(tag, url, d.get("channel"));
        String fromAuth = nz(d.get("from_auth"), "");
        String fromName = nz(d.get("from_name"), "");

        if (url.startsWith("conv:")) {
            String text = body;
            // Le corps arrive souvent sous la forme « Prénom Nom : message »
            if (!fromName.isEmpty() && text.startsWith(fromName + " : ")) text = text.substring(fromName.length() + 3);
            if (fromName.isEmpty()) {
                int k = body.indexOf(" : ");
                if (k > 0 && k < 40) { fromName = body.substring(0, k); text = body.substring(k + 3); }
                else fromName = title.replace("Notybat — ", "").replace("RWOOD — ", "");
            }
            addToHistory(c, url, fromName, text, false);
            incrementUnread(c, url);
            showConversation(c, url, fromName, fromAuth.isEmpty() ? url.substring(5) : fromAuth, channel);
        } else {
            int id = tag.startsWith("meteo") ? idFor("tag:" + tag) : idFor("n:" + tag + System.currentTimeMillis());
            NotificationCompat.Builder b = new NotificationCompat.Builder(c, channel)
                .setSmallIcon(R.drawable.ic_stat_rwood)
                .setColor(0xFFEE8A2E)
                .setLargeIcon(logo(c))
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(openIntent(c, url, id));
            // v5.91 — livraison prévue (nouvelle / date modifiée) : bouton « Ajouter à l'agenda »
            if (url.matches("^liv:[^:]+:.+") && !tag.startsWith("liv-cr-")) {
                b.addAction(new NotificationCompat.Action.Builder(R.drawable.ic_stat_rwood, "Ajouter à l'agenda",
                    openIntent(c, "livag:" + url.substring(4), id + 1)).build());
            }
            notify(c, id, b);
        }
        RwoodWidget.refreshAll(c);
    }

    /** (Re)dessine la notification d'une conversation avec son historique. */
    public static synchronized void showConversation(Context c, String convKey, String fromName, String fromAuth, String channel) {
        showConversation(c, convKey, fromName, fromAuth, channel, false);
    }

    public static synchronized void showConversation(Context c, String convKey, String fromName, String fromAuth, String channel, boolean silent) {
        SharedPreferences p = prefs(c);
        String myName = nz(p.getString("me_name", null), "Moi");
        Person me = new Person.Builder().setName(myName).setKey("me").build();
        Person other = new Person.Builder().setName(fromName).setKey(convKey).build();
        NotificationCompat.MessagingStyle style = new NotificationCompat.MessagingStyle(me);
        JSONArray hist = history(c, convKey);
        for (int i = 0; i < hist.length(); i++) {
            JSONObject m = hist.optJSONObject(i);
            if (m == null) continue;
            boolean mine = m.optBoolean("me", false);
            style.addMessage(m.optString("t", ""), m.optLong("ts", System.currentTimeMillis()), mine ? null : other);
        }
        int id = idFor(convKey);
        int unread = unread(c, convKey);

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, channel == null ? "rwood_messages" : channel)
            .setSmallIcon(R.drawable.ic_stat_rwood)
            .setColor(0xFFEE8A2E)
            .setStyle(style)
            .setContentTitle(fromName)
            .setGroup(GROUP_MSG)
            .setNumber(unread)
            .setShortcutId(convKey)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setSilent(silent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(openIntent(c, convKey, id));

        // Bouton « Répondre » (champ de texte directement dans la notification)
        if (fromAuth != null && !fromAuth.isEmpty() && p.getString("me_auth", null) != null) {
            RemoteInput ri = new RemoteInput.Builder(KEY_REPLY).setLabel("Répondre à " + fromName + "…").build();
            Intent ri2 = new Intent(c, ReplyReceiver.class);
            ri2.setAction("fr.rwood.app.REPLY");
            ri2.putExtra("conv", convKey);
            ri2.putExtra("to_auth", fromAuth);
            ri2.putExtra("to_name", fromName);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
            PendingIntent pi = PendingIntent.getBroadcast(c, id, ri2, flags);
            NotificationCompat.Action act = new NotificationCompat.Action.Builder(R.drawable.ic_stat_rwood, "Répondre", pi)
                .addRemoteInput(ri)
                .setAllowGeneratedReplies(true)
                .setSemanticAction(NotificationCompat.Action.SEMANTIC_ACTION_REPLY)
                .setShowsUserInterface(false) // Android Auto : réponse dictée à la voix
                .build();
            b.addAction(act);

            Intent readI = new Intent(c, ReplyReceiver.class);
            readI.setAction("fr.rwood.app.READ");
            readI.putExtra("conv", convKey);
            PendingIntent readPi = PendingIntent.getBroadcast(c, id + 1, readI, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            NotificationCompat.Action readAct = new NotificationCompat.Action.Builder(R.drawable.ic_stat_rwood, "Marquer comme lu", readPi)
                .setSemanticAction(NotificationCompat.Action.SEMANTIC_ACTION_MARK_AS_READ)
                .setShowsUserInterface(false).build();
            b.addAction(readAct);
            b.addInvisibleAction(readAct); // Android Auto : « lu » quand Google a lu le message
        }
        notify(c, id, b);
        showSummary(c, silent);
    }

    /** Résumé qui regroupe toutes les conversations sous « RWOOD ». */
    static void showSummary(Context c) { showSummary(c, true); }

    static void showSummary(Context c, boolean silent) {
        int total = totalUnread(c);
        NotificationCompat.InboxStyle inbox = new NotificationCompat.InboxStyle();
        try {
            JSONObject counts = new JSONObject(prefs(c).getString("unread", "{}"));
            Iterator<String> it = counts.keys();
            while (it.hasNext()) {
                String k = it.next();
                JSONArray h = history(c, k);
                JSONObject last = h.length() > 0 ? h.optJSONObject(h.length() - 1) : null;
                if (last != null) inbox.addLine(last.optString("from", "") + " : " + last.optString("t", ""));
            }
        } catch (Exception ignored) {}
        inbox.setSummaryText(total + " message" + (total > 1 ? "s" : "") + " non lu" + (total > 1 ? "s" : ""));
        NotificationCompat.Builder s = new NotificationCompat.Builder(c, "rwood_messages")
            .setSmallIcon(R.drawable.ic_stat_rwood)
            .setColor(0xFFEE8A2E)
            .setContentTitle("Notybat")
            .setContentText(total + " message(s) non lu(s)")
            .setStyle(inbox)
            .setGroup(GROUP_MSG)
            .setGroupSummary(true)
            .setNumber(total)
            .setAutoCancel(true)
            .setGroupAlertBehavior(NotificationCompat.GROUP_ALERT_CHILDREN)
            .setSilent(silent)
            .setContentIntent(openIntent(c, "alertes-conducteur", SUMMARY_ID));
        notify(c, SUMMARY_ID, s);
    }

    /** Logo Notybat en couleur (grande icône de la notification). */
    static android.graphics.Bitmap logo(Context c) {
        try { return android.graphics.BitmapFactory.decodeResource(c.getResources(), R.drawable.ic_notybat_large); } catch (Throwable e) { return null; }
    }

    /** Retire les émojis (ceux du téléphone) d'un texte de notification. */
    static String noEmo(String s) {
        if (s == null) return null;
        StringBuilder o = new StringBuilder();
        int i = 0, n = s.length();
        while (i < n) {
            int cp = s.codePointAt(i); i += Character.charCount(cp);
            boolean emo = (cp >= 0x1F000 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF) || (cp >= 0x2B00 && cp <= 0x2BFF)
                || (cp >= 0x2300 && cp <= 0x23FF) || cp == 0xFE0F || cp == 0xFE0E || cp == 0x200D || cp == 0x20E3
                || (cp >= 0x1F1E6 && cp <= 0x1F1FF) || cp == 0x2190 || cp == 0x2194 || cp == 0x21A9 || cp == 0x2122 || cp == 0x2139
                || cp == 0x24C2 || cp == 0x3030 || cp == 0x303D || cp == 0x3297 || cp == 0x3299 || (cp >= 0x25AA && cp <= 0x25FE && cp != 0x25CF);
            if (!emo) o.appendCodePoint(cp);
        }
        String r = o.toString().replaceAll("[ \\t]{2,}", " ").replaceAll("(?m)^[ \\t]+", "").trim();
        if (r.startsWith("— ") || r.startsWith("- ") || r.startsWith("· ")) r = r.substring(2).trim();
        return r;
    }

    static void notify(Context c, int id, NotificationCompat.Builder b) {
        try {
            NotificationManagerCompat.from(c).notify(id, b.build());
        } catch (SecurityException e) {
            android.util.Log.w("RWOOD", "permission notifications refusée");
        }
    }

    // ── Historique / non-lus (stockés sur le téléphone) ─────────────────

    static JSONArray history(Context c, String key) {
        try { return new JSONArray(prefs(c).getString("hist_" + key, "[]")); } catch (Exception e) { return new JSONArray(); }
    }

    public static synchronized void addToHistory(Context c, String key, String from, String text, boolean mine) {
        try {
            JSONArray h = history(c, key);
            JSONObject m = new JSONObject();
            m.put("t", text); m.put("from", from); m.put("me", mine); m.put("ts", System.currentTimeMillis());
            h.put(m);
            JSONArray keep = new JSONArray();
            for (int i = Math.max(0, h.length() - 8); i < h.length(); i++) keep.put(h.get(i));
            prefs(c).edit().putString("hist_" + key, keep.toString()).apply();
        } catch (Exception ignored) {}
    }

    static void incrementUnread(Context c, String key) {
        try {
            JSONObject o = new JSONObject(prefs(c).getString("unread", "{}"));
            o.put(key, o.optInt(key, 0) + 1);
            prefs(c).edit().putString("unread", o.toString()).apply();
        } catch (Exception ignored) {}
    }

    static int unread(Context c, String key) {
        try { return new JSONObject(prefs(c).getString("unread", "{}")).optInt(key, 0); } catch (Exception e) { return 0; }
    }

    public static int totalUnread(Context c) {
        int t = 0;
        try {
            JSONObject o = new JSONObject(prefs(c).getString("unread", "{}"));
            Iterator<String> it = o.keys();
            while (it.hasNext()) t += o.optInt(it.next(), 0);
        } catch (Exception ignored) {}
        return t;
    }

    /** Conversation lue (ouverte dans l'app, ou « Marquer comme lu ») : on efface tout. */
    public static synchronized void clearConversation(Context c, String key) {
        try {
            JSONObject o = new JSONObject(prefs(c).getString("unread", "{}"));
            o.remove(key);
            prefs(c).edit().putString("unread", o.toString()).remove("hist_" + key).apply();
        } catch (Exception ignored) {}
        NotificationManagerCompat nm = NotificationManagerCompat.from(c);
        nm.cancel(idFor(key));
        if (totalUnread(c) == 0) nm.cancel(SUMMARY_ID); else showSummary(c);
        RwoodWidget.refreshAll(c);
    }

    public static synchronized void clearAll(Context c) {
        SharedPreferences p = prefs(c);
        SharedPreferences.Editor e = p.edit();
        for (String k : p.getAll().keySet()) if (k.startsWith("hist_")) e.remove(k);
        e.putString("unread", "{}").apply();
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancelAll();
        RwoodWidget.refreshAll(c);
    }

    static String nz(String s, String def) {
        return (s == null || s.isEmpty()) ? def : s;
    }
}
