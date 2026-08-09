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
 * BarcodeLookup.js, NotificationScheduler.js, useStore.js). Wer einen
 * Datenfluss aendert, aendert diesen Text mit.
 */

export const PRIVACY_VERSION = '2026-08-09';

// VOR VEROEFFENTLICHUNG EINSETZEN: echte Betreiberdaten. Ohne vollstaendiges
// Impressum ist ein Launch im DACH-Raum nicht zulaessig (§ 5 DDG).
export const OPERATOR_PLACEHOLDER = {
  name: '[Name der Betreiberin]',
  address: '[Anschrift]',
  email: '[Kontakt-E-Mail]',
};

export const PRIVACY_SECTIONS = {
  de: [
    {
      heading: 'Grundprinzip',
      body:
        'Diese App arbeitet ohne Konto und ohne Server-Datenbank. Alles, was du eingibst, bleibt auf deinem Gerät: deine Präparate, Einnahmen, dein Profil, deine Laborwerte und Beobachtungen. Es gibt keine Analyse- oder Werbedienste und kein Tracking.',
    },
    {
      heading: 'Welche Daten lokal gespeichert werden',
      body:
        'Auf dem Gerät liegen: erfasste Präparate mit Dosierung und Einnahmezeiten, Einnahme-Verlauf, Lagerbestand, Scan-Ergebnisse, dein persönliches Profil (Medikamentengruppen, Erkrankungen, Allergien, Ernährungsweise, Ziele), Laborwerte, Beobachtungen der Wirkungskontrolle, die gewählte Lebensphase und App-Einstellungen. Diese Daten verlassen das Gerät nicht, außer du stößt eine der unten beschriebenen Funktionen selbst an.',
    },
    {
      heading: 'Foto-Scan (nur mit deiner Einwilligung)',
      body:
        'Wenn du die Foto-Analyse nutzt, werden die von dir aufgenommenen Etikettenfotos verkleinert und einmalig zur Auswertung übertragen: zunächst an eine von uns betriebene Funktion bei Supabase, von dort an die Anthropic API (Claude), die den Etikettentext ausliest. Die Fotos werden weder bei Supabase noch in der App-Datenbank gespeichert; zurück kommt nur das strukturierte Ergebnis. Die Verarbeitung kann auf Servern außerhalb der EU stattfinden (insbesondere USA). Diese Übertragung findet erst statt, nachdem du ihr in der App ausdrücklich zugestimmt hast. Du kannst die Einwilligung jederzeit in den Einstellungen widerrufen; der Scan per Foto steht dann nicht mehr zur Verfügung. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).',
    },
    {
      heading: 'Barcode-Suche',
      body:
        'Bei der Barcode-Suche wird ausschließlich die gescannte Barcode-Nummer an die Community-Datenbank Open Food Facts übertragen, um Produktdaten abzurufen. Fotos, Profildaten oder Laborwerte werden dabei nicht übermittelt. Wie bei jedem Internet-Abruf ist deine IP-Adresse technisch Teil der Anfrage.',
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
      heading: 'Deine Rechte',
      body:
        'Auskunft und Datenübertragbarkeit: Über den Bericht-Bereich und das Backup kannst du deine Daten jederzeit selbst einsehen und exportieren. Löschung: In den Einstellungen kannst du einzelne Einträge oder mit einem Schritt sämtliche Daten löschen; da die Daten nur auf deinem Gerät liegen, sind sie danach unwiederbringlich entfernt. Widerruf: Die Einwilligung zur Foto-Übertragung kannst du jederzeit in den Einstellungen widerrufen. Beschwerde: Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.',
    },
    {
      heading: 'Was diese App nicht tut',
      body:
        'Keine Weitergabe an Dritte über die oben beschriebenen Auftragsverarbeiter hinaus, keine Werbung, kein Verkauf von Daten, keine Konten, keine Cloud-Synchronisation. Beachte: Weil es keine Synchronisation gibt, bedeutet ein Gerätewechsel ohne Backup den Verlust deiner Daten.',
    },
  ],
  en: [
    {
      heading: 'Core principle',
      body:
        'This app works without an account and without a server database. Everything you enter stays on your device: your products, intakes, profile, lab values and observations. There are no analytics or advertising services and no tracking.',
    },
    {
      heading: 'What is stored locally',
      body:
        'Stored on the device: recorded products with dosage and intake times, intake history, stock levels, scan results, your personal profile (medication groups, conditions, allergies, dietary pattern, goals), lab values, observation records, the selected life stage and app settings. This data does not leave the device unless you actively trigger one of the functions described below.',
    },
    {
      heading: 'Photo scan (only with your consent)',
      body:
        'If you use the photo analysis, the label photos you take are downscaled and transmitted once for evaluation: first to a function we operate at Supabase, from there to the Anthropic API (Claude), which reads the label text. The photos are stored neither at Supabase nor in any app database; only the structured result is returned. Processing may take place on servers outside the EU (in particular the USA). This transmission only happens after you have explicitly agreed to it in the app. You can withdraw this consent at any time in the settings; photo scanning will then no longer be available. Legal basis: consent (Art. 6(1)(a) GDPR).',
    },
    {
      heading: 'Barcode lookup',
      body:
        'The barcode lookup transmits only the scanned barcode number to the community database Open Food Facts to retrieve product data. No photos, profile data or lab values are transmitted. As with any internet request, your IP address is technically part of the request.',
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
      heading: 'Your rights',
      body:
        'Access and portability: via the report section and the backup you can view and export your data yourself at any time. Erasure: in the settings you can delete individual entries or all data in one step; since the data only lives on your device, it is irrevocably removed afterwards. Withdrawal: you can withdraw the consent for photo transmission at any time in the settings. Complaint: you have the right to lodge a complaint with a data protection supervisory authority.',
    },
    {
      heading: 'What this app does not do',
      body:
        'No sharing with third parties beyond the processors described above, no advertising, no sale of data, no accounts, no cloud sync. Note: because there is no sync, changing devices without a backup means losing your data.',
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
