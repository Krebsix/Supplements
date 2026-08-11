-- Fallback-Schluessel fuer barcode-lose Scans (Nadines Entscheidung
-- 2026-08-11): Bisher landete eine erfolgreiche Foto-Analyse NUR dann in
-- der Pruef-Schleuse, wenn Vorab-Scan oder Vision-Auswertung einen echten
-- Barcode/PZN lieferten (product_cache_barcode_format erzwang das). Bei
-- Produkten ohne sichtbaren oder lesbaren Strichcode (kleine Marken,
-- Etikett verdeckt/gewoelbt, Barcode auf dem Boden) griff das nie — das
-- Ergebnis blieb ausschliesslich im lokalen, unsynchronisierten Bestand
-- der scannenden Person und musste bei jedem weiteren Scan desselben
-- Produkts erneut voll (kostenpflichtig) analysiert werden. Beobachtet
-- am 2026-08-11: von 12 barcode-losen Scans in einer Sitzung landete nur
-- 1 im Cache, 11 verpufften spurlos.
--
-- Der Barcode bleibt die bevorzugte Kennung. Nur wenn KEIN Barcode
-- ermittelbar ist, erlaubt diese Migration einen Text-Fallback-Schluessel
-- aus normalisierter Marke und Produktname ("text-<marke>__<produkt>"),
-- damit die Analyse wenigstens der redaktionellen Pruefung (Vollpruefung)
-- zur Verfuegung steht — dort kann ein Mensch den echten Barcode
-- nachtragen und den Eintrag auf den regulaeren Schluessel migrieren.

alter table public.product_cache
  drop constraint if exists product_cache_barcode_format;

alter table public.product_cache
  add constraint product_cache_barcode_format check (
    barcode ~ '^[0-9]{6,14}$'
    or barcode ~ '^text-[a-z0-9]+(-[a-z0-9]+)*__[a-z0-9]+(-[a-z0-9]+)*$'
  );
