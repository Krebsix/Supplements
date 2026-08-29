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
 * supabaseClient.js, PurchaseLogic.js, PurchaseStore.js). Wer einen
 * Datenfluss aendert, aendert diesen Text mit.
 */

export const PRIVACY_VERSION = '2026-08-30';

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
      heading: 'Käufe (Pro-Abo und Scan-Pakete)',
      body:
        'Kaufst du ein Pro-Abo oder ein Scan-Paket, wickelt Apple bzw. Google den Kauf ab; Zahlungsdaten sehen wir nicht. Zur Prüfung der Kaufbelege und zur Anzeige deines Abo-Status nutzen wir den Dienst RevenueCat (RevenueCat, Inc., USA, Standardvertragsklauseln). Übertragen werden eine zufällige Geräte-Kennung oder, wenn du angemeldet bist, deine Konto-Kennung (eine zufällige ID, nicht deine E-Mail-Adresse), die Kaufbelege des Stores, Gerätetyp und Land. Keine Präparate, keine Laborwerte, keine Gesundheitsdaten. Rechtsgrundlage: Vertrag (Art. 6 Abs. 1 lit. b DSGVO). Kündigung und Rückerstattung laufen über dein Apple- oder Google-Konto.',
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
      heading: 'Purchases (Pro subscription and scan packs)',
      body:
        "If you purchase a Pro subscription or a scan pack, Apple or Google handles the purchase; we never see payment data. To verify purchase receipts and show your subscription status, we use the service RevenueCat (RevenueCat, Inc., USA, standard contractual clauses). Transmitted are a random device identifier or, if you are signed in, your account identifier (a random ID, not your email address), the store's purchase receipts, device type and country. No products, lab values or health data. Legal basis: contract (Art. 6(1)(b) GDPR). Cancellation and refunds are handled via your Apple or Google account.",
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

export const TERMS_VERSION = '2026-08-29';

export const TERMS_SECTIONS = {
  de: [
    {
      heading: 'Geltungsbereich',
      body: `Diese Nutzungsbedingungen gelten zwischen dir und ${OPERATOR_PLACEHOLDER.name}, ${OPERATOR_PLACEHOLDER.address} (Kontakt: ${OPERATOR_PLACEHOLDER.email}), für die Nutzung dieser App und des optionalen Kontos. Mit dem Start der App stimmst du diesen Bedingungen zu.`,
    },
    {
      heading: 'Was die App ist und nicht ist',
      body:
        'Die App ordnet deine Einnahmezeitpunkte, vergleicht erfasste Mengen mit veröffentlichten Referenzwerten und zeigt Hinweise mit Quellenangabe. Sie gibt keine Empfehlungen, stellt keine Diagnosen und ersetzt keine ärztliche oder pharmazeutische Beratung. Für Entscheidungen rund um deine Präparate bist du selbst verantwortlich; bei Fragen wende dich an Arztpraxis oder Apotheke.',
    },
    {
      heading: 'Konto (freiwillig)',
      body:
        'Die App funktioniert ohne Konto. Legst du eines an, brauchst du eine gültige E-Mail-Adresse und ein Passwort mit mindestens 10 Zeichen; das Mindestalter beträgt 16 Jahre, und ein Konto gehört zu einer Person. Du bist dafür verantwortlich, Passwort und Recovery-Key sicher aufzubewahren: Fehlen beide, lassen sich synchronisierte Daten nicht wiederherstellen, deine lokalen Daten auf dem Gerät sind davon nicht betroffen. Du kannst dein Konto jederzeit in der App löschen. Wir können Konten löschen, die 30 Tage lang unbestätigt bleiben oder missbräuchlich genutzt werden.',
    },
    {
      heading: 'Kostenlose Nutzung und Pro',
      body:
        'Die App ist kostenlos nutzbar. Zusätzlich können über den App Store bzw. Google Play ein kostenpflichtiger Pro-Umfang und einzelne Scan-Guthaben angeboten werden. Kauf, Kündigung und Rückerstattung laufen über Apple bzw. Google und deren Bedingungen; Preise werden dir vor dem Kauf im jeweiligen Store angezeigt.',
    },
    {
      heading: 'Inhalte und Quellen',
      body:
        'Referenzwerte und Hinweise stammen aus öffentlichen Quellen (u. a. EFSA, BfR, HMPC, NIH, D-A-CH-Referenzwerte). Produktdaten stammen teilweise von Open Food Facts unter der Open Data Commons Open Database License (ODbL). Für Vollständigkeit und Richtigkeit der Inhalte wird keine Gewähr übernommen; Fehler kannst du an die oben genannte Kontaktadresse melden.',
    },
    {
      heading: 'Haftung',
      body:
        'Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei der Verletzung wesentlicher Vertragspflichten, dort begrenzt auf den vorhersehbaren, vertragstypischen Schaden. Für Schäden aus der Verletzung von Leben, Körper oder Gesundheit gilt diese Begrenzung nicht. Gesetzliche Rechte, die dir als Verbraucherin oder Verbraucher zustehen, bleiben unberührt. [PRUEFEN: Haftungsklausel von einer Juristin/einem Juristen gegenlesen lassen, insbesondere im Zusammenspiel mit dem Sitz der Betreiberin in den USA.]',
    },
    {
      heading: 'Änderungen',
      body:
        'Wir können diese Nutzungsbedingungen ändern. Wesentliche Änderungen zeigen wir dir vor ihrem Wirksamwerden in der App an; nutzt du die App danach weiter, gilt das als Zustimmung. Version und Datum stehen am Ende dieses Dokuments.',
    },
    {
      heading: 'Anwendbares Recht und Kontakt',
      body: `Für Verbraucherinnen und Verbraucher mit gewöhnlichem Aufenthalt in der EU gilt deutsches Recht, soweit zwingendes Verbraucherschutzrecht des Aufenthaltsstaats nicht entgegensteht; im Übrigen gilt das Recht am Sitz der Betreiberin. [PRUEFEN: Rechtswahlklausel von einer Juristin/einem Juristen bestätigen lassen.] Kontakt: ${OPERATOR_PLACEHOLDER.email}. Der EU-Vertreter nach Art. 27 DSGVO ist in der Datenschutzerklärung genannt.`,
    },
  ],
  en: [
    {
      heading: 'Scope',
      body: `These terms of use apply between you and ${OPERATOR_PLACEHOLDER.name}, ${OPERATOR_PLACEHOLDER.address} (contact: ${OPERATOR_PLACEHOLDER.email}), for using this app and the optional account. By starting the app, you agree to these terms.`,
    },
    {
      heading: 'What the app is and is not',
      body:
        'The app organises your intake timing, compares recorded amounts with published reference values and shows notes with a cited source. It gives no recommendations, makes no diagnosis and does not replace medical or pharmaceutical advice. You remain responsible for your own decisions about your supplements; for questions, contact a doctor or pharmacy.',
    },
    {
      heading: 'Account (optional)',
      body:
        'The app works without an account. If you create one, you need a valid email address and a password of at least 10 characters; the minimum age is 16, and one account belongs to one person. You are responsible for keeping your password and recovery key safe: without both, synced data cannot be restored, your local data on the device is not affected. You can delete your account in the app at any time. We may delete accounts that remain unconfirmed for 30 days or that are misused.',
    },
    {
      heading: 'Free use and Pro',
      body:
        'The app is free to use. In addition, a paid Pro plan and individual scan credits may be offered through the App Store or Google Play. Purchase, cancellation and refunds are handled by Apple or Google under their respective terms; prices are shown to you in the store before purchase.',
    },
    {
      heading: 'Content and sources',
      body:
        'Reference values and notes come from public sources (including EFSA, BfR, HMPC, NIH, D-A-CH reference values). Product data comes in part from Open Food Facts under the Open Data Commons Open Database License (ODbL). No guarantee is given for the completeness or correctness of the content; you can report errors to the contact address above.',
    },
    {
      heading: 'Liability',
      body:
        'We are liable without limitation for intent and gross negligence, and for breaches of essential contractual obligations, in the latter case limited to foreseeable, contract-typical damage. This limitation does not apply to damages from injury to life, body or health. Statutory rights you have as a consumer remain unaffected. [PRUEFEN: have the liability clause reviewed by a lawyer, in particular given the operator being based in the USA.]',
    },
    {
      heading: 'Changes',
      body:
        'We may change these terms. Material changes are shown to you in the app before they take effect; continued use of the app afterwards counts as acceptance. Version and date are shown at the end of this document.',
    },
    {
      heading: 'Applicable law and contact',
      body: `For consumers habitually resident in the EU, German law applies to the extent that mandatory consumer protection law of their country of residence does not conflict; otherwise the law at the operator's seat applies. [PRUEFEN: have the governing-law clause confirmed by a lawyer.] Contact: ${OPERATOR_PLACEHOLDER.email}. The EU representative under Art. 27 GDPR is named in the privacy statement.`,
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
