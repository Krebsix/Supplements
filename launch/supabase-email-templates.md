# Supabase Auth-Mails mit MySuplea-Absender und Logo

Stand 2026-08-31. Die Standard-Mails von Supabase sind textlich generisch
und kommen von `noreply@mail.app.supabase.io`. Zwei Baustellen, in dieser
Reihenfolge:

## 1. Eigener Absender (SMTP) — das wirkt staerker als jedes Logo

Ohne eigenen SMTP bleibt der Absender supabase.io, egal wie die Mail
aussieht. Einrichtung (einmalig, ca. 20 Minuten):

1. SMTP-Anbieter waehlen. Empfehlung: Resend (resend.com), kostenlos bis
   3.000 Mails/Monat, AVV/DPA vorhanden, Domain-Verifikation per DNS.
   Alternativen: Postmark, Brevo.
2. Dort die Domain mysuplea.com verifizieren (zwei DNS-Eintraege bei
   united-domains: DKIM + Return-Path, der Anbieter zeigt sie an).
3. Absender anlegen: `konto@mysuplea.com` (oder `no-reply@mysuplea.com`).
4. Supabase Dashboard → Project Settings → Authentication → SMTP Settings:
   Host, Port, User, Passwort vom Anbieter eintragen, Absendername
   "MySuplea".
5. AVV des SMTP-Anbieters in launch/avv-dokumentation.md nachtragen
   (er verarbeitet E-Mail-Adressen der Nutzerinnen).

## 2. E-Mail-Vorlagen mit Logo

Supabase Dashboard → Authentication → Email Templates. Fuer jede Vorlage
(Confirm signup, Reset password, Change email address) den Body ersetzen.
Das Logo muss oeffentlich gehostet sein; die Landingpage liegt auf
mysuplea.com, dort das App-Icon als PNG ablegen (z. B.
`/email/logo.png`, 96x96 oder 192x192) und die URL unten eintragen.

Vorlage "Confirm signup" (Betreff: `Bestätige deine E-Mail-Adresse`):

```html
<div style="background:#f2f2f7;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px;">
    <img src="https://mysuplea.com/email/logo.png" width="48" height="48" alt="MySuplea" style="display:block;margin-bottom:16px;border-radius:10px;" />
    <h1 style="font-size:20px;line-height:28px;color:#1c1c1e;margin:0 0 12px;">Bestätige deine E-Mail-Adresse</h1>
    <p style="font-size:15px;line-height:22px;color:#6c6c70;margin:0 0 20px;">
      Du hast ein MySuplea-Konto angelegt. Öffne diesen Link auf dem Gerät,
      auf dem die App installiert ist, dann ist dein Konto aktiv.
    </p>
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1c4f5c;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:10px;">
      E-Mail-Adresse bestätigen
    </a>
    <p style="font-size:13px;line-height:18px;color:#8e8e93;margin:24px 0 0;">
      Du hast kein Konto angelegt? Dann kannst du diese Mail ignorieren;
      ohne Bestätigung passiert nichts.
    </p>
  </div>
  <p style="max-width:440px;margin:16px auto 0;font-size:12px;line-height:16px;color:#8e8e93;text-align:center;">
    MySuplea. Deine Daten bleiben Ende-zu-Ende verschlüsselt.
  </p>
</div>
```

Vorlage "Reset password" (Betreff: `Passwort neu setzen`): gleicher
Rahmen, H1 `Passwort neu setzen`, Text: "Du hast einen Passwort-Reset
angefordert. Öffne den Link auf dem Gerät mit der App. Hinweis: Für die
verschlüsselten Cloud-Daten brauchst du zusätzlich deinen Recovery-Key."
Knopf-Text `Passwort neu setzen`, Link `{{ .ConfirmationURL }}`.

Vorlage "Change email" (Betreff: `Neue E-Mail-Adresse bestätigen`):
gleicher Rahmen, Text: "Für dein Konto wurde eine neue E-Mail-Adresse
eingetragen. Bestätige die Änderung über den Link." Link
`{{ .ConfirmationURL }}`.

Hinweise:
- Farben sind die App-Tokens (canvas #f2f2f7, ink #1c1c1e, inkMuted
  #6c6c70, accent #1c4f5c); Mail-HTML braucht Inline-Styles, deshalb
  stehen die Hex-Werte hier und nicht in Komponenten.
- Kein Tracking-Pixel, keine externen Fonts: passt zur
  Datenschutzerklaerung.
- Nach dem Speichern eine Test-Registrierung machen und die Mail auf dem
  Handy ansehen (Dark Mode der Mail-App prueft den Kontrast).
