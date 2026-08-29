/**
 * data/legalContent.js
 * Datenschutzerklaerung und Impressum als strukturierter Inhalt.
 *
 * Liegt in data/, nicht in i18n/: Das sind keine Oberflaechen-Schnipsel,
 * sondern Rechtstexte mit eigenem Versionsstand. PRIVACY_VERSION wird bei
 * jeder inhaltlichen Aenderung hochgezogen; der Store haelt fest, welche
 * Version zur Kenntnis genommen wurde (consents.privacyVersion).
 *
 * Die Aussagen hier muessen mit dem Code uebereinstimmen — sie sind gegen
 * den tatsaechlichen Datenfluss geschrieben (ScanAnalyzer.js,
 * BarcodeLookup.js, NotificationScheduler.js, useStore.js, AccountLogic.js,
 * supabaseClient.js). Wer einen Datenfluss aendert, aendert diesen Text mit.
 */

export const PRIVACY_VERSION = '2026-08-29';

// Betreiberin laut Nadine (2026-08-09): die bestehende LLC.
// OFFEN vor Veroeffentlichung:
//   1. Vertretungsberechtigte Person ergaenzen.
//   2. Art. 27 DSGVO: Ein Verantwortlicher OHNE Niederlassung in der EU,
//      der Gesundheitsdaten von EU-Nutzerinnen verarbeitet, braucht einen
//      benannten EU-Vertreter. Der muss hier und in der
//      Datenschutzerklaerung namentlich stehen.
export const OPERATOR_PLACEHOLDER = {
  name: 'indoo home LLC',
  address: '30 N Gould St Ste N\nSheridan, WY 82801\nUSA',
  email: 'info@indoohome.com',
  representative: '[Vertretungsberechtigte Person einsetzen]',
  euRepresentative: '[EU-Vertreter nach Art. 27 DSGVO einsetzen]',
};

export const PRIVACY_SECTIONS = {
  de: [
    {
      heading: 'Verantwortliche Stelle',
      body: `${OPERATOR_PLACEHOLDER.name}\n${OPERATOR_PLACEHOLDER.address}\nKontakt: ${OPERATOR_PLACEHOLDER.email}\nEU-Vertreter (Art. 27 DSGVO): ${OPERATOR_PLACEHOLDER.euRepresentative}`,
    },
    {
      heading: 'Grundprinzip',
      body:
        'Diese App ist ohne Konto nutzbar. Alles, was du eingibst, bleibt auf deinem Gerät: deine Präparate, Einnahmen, dein Profil, deine Laborwerte und Beobachtungen. Es gibt keine Analyse- oder Werbedienste und kein Tracking. Ein Konto ist freiwillig und Grundlage für spätere Funktionen wie Sync und Cloud-Backup; was dabei übertragen wird, steht im Abschnitt Konto.',
    },
    {
      heading: 'Welche Daten lokal gespeichert werden',
      body:
        'Auf dem Gerät liegen: erfasste Präparate mit Dosierung und Einnahmezeiten, Einnahme-Verlauf, Lagerbestand, Scan-Ergebnisse, dein persönliches Profil (Medikamentengruppen, Erkrankungen, Allergien, Ernährungsweise, Ziele), Laborwerte, Beobachtungen der Wirkungskontrolle, die gewählte Lebensphase und App-Einstellungen. Diese Daten verlassen das Gerät nicht, außer du stößt eine der unten beschriebenen Funktionen selbst an.',
    },
    {
      heading: 'Foto-Scan (nur mit deiner Einwilligung)',
      body:
        'Wenn du die Foto-Analyse nutzt, werden die von dir aufgenommenen Etikettenfotos verkleinert und einmalig zur Auswertung übertragen: zunächst an eine von uns betriebene Funktion bei Supabase, von dort an die Anthropic API (Claude), die den Etikettentext ausliest. Die Fotos werden weder bei Supabase noch in der App-Datenbank gespeichert; zurück kommt nur das strukturierte Ergebnis. Wurde vor der Foto-Analyse ein Barcode gescannt, wird das ausgelesene Etikettenergebnis (Produktname, Wirkstoffe, Dosierung) zusammen mit der Barcode-Nummer zur redaktionellen Prüfung an unsere Produktdatenbank bei Supabase übertragen. Erst nach dieser Prüfung wird der Eintrag für andere Nutzerinnen sichtbar; ungeprüfte Einträge werden niemandem angezeigt. Dieser Eintrag beschreibt ausschließlich das Produkt; er enthält keine Fotos und keine Daten über dich. Die Verarbeitung kann auf Servern außerhalb der EU stattfinden (insbesondere USA). Diese Übertragung findet erst statt, nachdem du ihr in der App ausdrücklich zugestimmt hast. Du kannst die Einwilligung jederzeit in den Einstellungen widerrufen; der Scan per Foto steht dann nicht mehr zur Verfügung. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).',
    },
    {
      heading: 'Barcode-Suche',
      body:
        'Bei der Barcode-Suche wird ausschließlich die gescannte Barcode-Nummer übertragen, um Produktdaten abzurufen: zuerst an die Community-Datenbank Open Food Facts und, wenn dort nichts gefunden wird, an unsere geteilte Produktdatenbank bei Supabase. Fotos, Profildaten oder Laborwerte werden dabei nicht übermittelt. Wie bei jedem Internet-Abruf ist deine IP-Adresse technisch Teil der Anfrage.',
    },
    {
      heading: 'Schutz vor Missbrauch',
      body:
        'Um die Foto-Analyse vor automatisiertem Missbrauch zu schützen, wird serverseitig die IP-Adresse der Anfrage kurzzeitig gespeichert und nach etwa zwei Stunden automatisch gelöscht. Rechtsgrundlage: berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).',
    },
    {
      heading: 'Erinnerungen',
      body:
        'Einnahme-Erinnerungen werden lokal auf deinem Gerät geplant. Es gibt keinen Push-Server; dabei werden keine Daten übertragen.',
    },
    {
      heading: 'Konto (freiwillig)',
      body:
        'Wenn du ein Konto anlegst, werden deine E-Mail-Adresse, ein Passwort-Hash und Zeitstempel bei unserem Auftragsverarbeiter Supabase gespeichert (Serverstandort: EU, Irland). Zusätzlich liegt dort ein Datensatz mit verschlüsselten Schlüsseln: Dein Passwort wird auf dem Gerät in einen Schlüssel umgerechnet, der einen zufälligen Datenschlüssel verschlüsselt; ein zweiter, dir einmalig angezeigter Recovery-Key verschlüsselt denselben Datenschlüssel. Zur Anmeldung wird dein Passwort über eine verschlüsselte Verbindung an Supabase übertragen und dort nur als Hash gespeichert. Der daraus auf dem Gerät abgeleitete Schlüssel, der Datenschlüssel und der Recovery-Key werden nie übertragen. Aus den gespeicherten Daten allein lassen sich keine Inhalte entschlüsseln, weder durch uns noch durch Supabase. In dieser Version werden über das Konto keine Präparate, Laborwerte oder sonstigen Inhalte übertragen; kommt Sync hinzu, wird diese Erklärung vorher aktualisiert. Du kannst das Konto jederzeit in der App löschen; dabei werden Konto und Schlüsseldatensatz entfernt, deine lokalen Daten bleiben. Rechtsgrundlage: Vertrag (Art. 6 Abs. 1 lit. b DSGVO).',
    },
    {
      heading: 'Deine Rechte',
      body:
        'Auskunft und Datenübertragbarkeit: Über den Bericht-Bereich und das Backup kannst du deine Daten jederzeit selbst einsehen und exportieren. Löschung: In den Einstellungen kannst du einzelne Einträge oder mit einem Schritt sämtliche lokalen Daten löschen; ein Konto löschst du im Bereich Konto. Beides ist danach unwiederbringlich. Widerruf: Die Einwilligung zur Foto-Übertragung kannst du jederzeit in den Einstellungen widerrufen. Beschwerde: Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.',
    },
    {
      heading: 'Was diese App nicht tut',
      body:
        'Keine Weitergabe an Dritte über die oben beschriebenen Auftragsverarbeiter hinaus, keine Werbung, kein Verkauf von Daten, kein Konto-Zwang, keine Cloud-Synchronisation in dieser Version. Beachte: Weil es noch keine Synchronisation gibt, bedeutet ein Gerätewechsel ohne Backup den Verlust deiner Daten.',
    },
  ],
  en: [
    {
      heading: 'Controller',
      body: `${OPERATOR_PLACEHOLDER.name}\n${OPERATOR_PLACEHOLDER.address}\nContact: ${OPERATOR_PLACEHOLDER.email}\nEU representative (Art. 27 GDPR): ${OPERATOR_PLACEHOLDER.euRepresentative}`,
    },
    {
      heading: 'Core principle',
      body:
        'This app can be used without an account. Everything you enter stays on your device: your products, intakes, profile, lab values and observations. There are no analytics or advertising services and no tracking. An account is optional and the basis for later features such as sync and cloud backup; what is transmitted for it is described in the Account section.',
    },
    {
      heading: 'What is stored locally',
      body:
        'Stored on the device: recorded products with dosage and intake times, intake history, stock levels, scan results, your personal profile (medication groups, conditions, allergies, dietary pattern, goals), lab values, observation records, the selected life stage and app settings. This data does not leave the device unless you actively trigger one of the functions described below.',
    },
    {
      heading: 'Photo scan (only with your consent)',
      body:
        'If you use the photo analysis, the label photos you take are downscaled and transmitted once for evaluation: first to a function we operate at Supabase, from there to the Anthropic API (Claude), which reads the label text. The photos are stored neither at Supabase nor in any app database; only the structured result is returned. If a barcode was scanned before the photo analysis, the extracted label result (product name, ingredients, dosage) is transmitted together with the barcode number to our product database at Supabase for editorial review. Only after this review does the entry become visible to other users; unreviewed entries are not shown to anyone. This entry describes only the product; it contains no photos and no data about you. Processing may take place on servers outside the EU (in particular the USA). This transmission only happens after you have explicitly agreed to it in the app. You can withdraw this consent at any time in the settings; photo scanning will then no longer be available. Legal basis: consent (Art. 6(1)(a) GDPR).',
    },
    {
      heading: 'Barcode lookup',
      body:
        'The barcode lookup transmits only the scanned barcode number to retrieve product data: first to the community database Open Food Facts and, if nothing is found there, to our shared product database at Supabase. No photos, profile data or lab values are transmitted. As with any internet request, your IP address is technically part of the request.',
    },
    {
      heading: 'Abuse protection',
      body:
        'To protect the photo analysis against automated abuse, the IP address of a request is stored briefly on the server side and deleted automatically after about two hours. Legal basis: legitimate interest (Art. 6(1)(f) GDPR).',
    },
    {
      heading: 'Reminders',
      body:
        'Intake reminders are scheduled locally on your device. There is no push server; no data is transmitted.',
    },
    {
      heading: 'Account (optional)',
      body:
        'If you create an account, your email address, a password hash and timestamps are stored with our processor Supabase (server location: EU, Ireland). In addition, a record with encrypted keys is stored there: your password is converted on the device into a key that encrypts a random data key; a second recovery key, shown to you once, encrypts the same data key. To sign in, your password is transmitted to Supabase over an encrypted connection and stored there only as a hash. The key derived from it on the device, the data key and the recovery key are never transmitted. From the stored data alone, no content can be decrypted, neither by us nor by Supabase. In this version no products, lab values or other content are transmitted via the account; if sync is added, this statement will be updated beforehand. You can delete the account in the app at any time; account and key record are removed, your local data stays. Legal basis: contract (Art. 6(1)(b) GDPR).',
    },
    {
      heading: 'Your rights',
      body:
        'Access and portability: via the report section and the backup you can view and export your data yourself at any time. Erasure: in the settings you can delete individual entries or all local data in one step; an account is deleted in the Account section. Both are irrevocable afterwards. Withdrawal: you can withdraw the consent for photo transmission at any time in the settings. Complaint: you have the right to lodge a complaint with a data protection supervisory authority.',
    },
    {
      heading: 'What this app does not do',
      body:
        'No sharing with third parties beyond the processors described above, no advertising, no sale of data, no mandatory account, no cloud sync in this version. Note: because there is no sync yet, changing devices without a backup means losing your data.',
    },
  ],
};

export const IMPRINT_SECTIONS = {
  de: [
    {
      heading: 'Angaben gemäß § 5 DDG',
      body: `${OPERATOR_PLACEHOLDER.name}\n${OPERATOR_PLACEHOLDER.address}`,
    },
    {
      heading: 'Kontakt',
      body: OPERATOR_PLACEHOLDER.email,
    },
    {
      heading: 'Vertreten durch',
      body: OPERATOR_PLACEHOLDER.representative,
    },
    {
      heading: 'EU-Vertreter (Art. 27 DSGVO)',
      body: OPERATOR_PLACEHOLDER.euRepresentative,
    },
    {
      heading: 'Inhaltlich verantwortlich',
      body: OPERATOR_PLACEHOLDER.name,
    },
    {
      heading: 'Einordnung der Inhalte',
      body:
        'Diese App ordnet Einnahmezeitpunkte, dokumentiert und zeigt Referenzwerte sowie hinterlegte Hinweise aus den zitierten Quellen. Sie stellt keine Diagnosen, gibt keine Dosierungs- oder Therapieempfehlungen und ersetzt keine ärztliche oder pharmazeutische Beratung.',
    },
  ],
  en: [
    {
      heading: 'Provider information (§ 5 DDG, German law)',
      body: `${OPERATOR_PLACEHOLDER.name}\n${OPERATOR_PLACEHOLDER.address}`,
    },
    {
      heading: 'Contact',
      body: OPERATOR_PLACEHOLDER.email,
    },
    {
      heading: 'Responsible for content',
      body: OPERATOR_PLACEHOLDER.name,
    },
    {
      heading: 'Scope of the content',
      body:
        'This app organises intake timing, documents your entries and shows reference values and recorded notes from the cited sources. It does not diagnose, does not give dosage or therapy recommendations and does not replace medical or pharmaceutical advice.',
    },
  ],
};
