import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getLabMarker } from '../data/labMarkers';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../theme';

/**
 * ComplaintCard
 * Antwort auf eine Beschwerde.
 *
 * Die Reihenfolge ist die eigentliche Aussage:
 *   1. Einordnung (die Beschwerde ist unspezifisch)
 *   2. moegliche Ursachenbereiche, breit und nicht naehrstofflastig
 *   3. Warnsignale fuer aerztliche Abklaerung
 *   4. erst dann Naehrstoffe, mit Bestandsabgleich
 *   5. Fragen fuer das Gespraech
 *
 * Wer bei "muede" mit Eisen anfaengt, hat die Beschwerde bereits
 * gedeutet. Deshalb stehen die Naehrstoffe hier bewusst weit unten und
 * sind eingeklappt, bis jemand sie aufklappt.
 */
export default function ComplaintCard({ view }) {
  const { t } = useTranslation();
  const [showNutrients, setShowNutrients] = useState(false);

  if (!view) return null;

  const alertTone = toneFor('alert');

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('complaint.label')}</Text>
      <Text style={styles.title}>{view.label}</Text>

      {/* 1. Einordnung */}
      <Text style={styles.intro}>{view.intro}</Text>

      {/* 2. Ursachenbereiche */}
      {view.contextAreas.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('complaint.contextAreas')}</Text>
          {view.contextAreas.map((area, index) => (
            <Text key={index} style={styles.listItem}>{area}</Text>
          ))}
        </View>
      ) : null}

      {/* 3. Warnsignale — der sicherheitsrelevante Teil, deshalb
             farblich abgesetzt und nie eingeklappt. */}
      {view.redFlags.length > 0 ? (
        <View
          style={[
            styles.flagBlock,
            { backgroundColor: alertTone.surface, borderColor: alertTone.rule },
          ]}
        >
          <Text style={[styles.blockTitle, { color: alertTone.ink }]}>
            {t('complaint.redFlags')}
          </Text>
          {view.redFlags.map((flag, index) => (
            <Text key={index} style={[styles.listItem, { color: alertTone.ink }]}>
              {flag}
            </Text>
          ))}
        </View>
      ) : null}

      {/* 4. Naehrstoffe, eingeklappt */}
      {view.nutrients.length > 0 ? (
        <View style={styles.block}>
          <TouchableOpacity
            onPress={() => setShowNutrients((current) => !current)}
            activeOpacity={0.7}
            accessibilityRole="button"
            // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={styles.toggle}>
              {showNutrients ? t('complaint.hideNutrients') : t('complaint.showNutrients', {
                count: view.nutrients.length,
              })}
            </Text>
          </TouchableOpacity>

          {showNutrients ? (
            <>
              <Text style={styles.nutrientIntro}>{t('complaint.nutrientIntro')}</Text>

              {view.nutrients.map((nutrient) => (
                <View key={nutrient.substanceId} style={styles.nutrientRow}>
                  <View style={styles.nutrientHead}>
                    <Text style={styles.nutrientName}>{nutrient.name}</Text>
                    {nutrient.inStack ? (
                      <Text style={styles.inStackBadge}>{t('complaint.inStack')}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.nutrientNote}>{nutrient.note}</Text>
                  {nutrient.inStack ? (
                    <Text style={styles.inStackNames}>
                      {t('complaint.inStackNames', { names: nutrient.productNames.join(', ') })}
                    </Text>
                  ) : null}
                </View>
              ))}

              {view.alreadyCovered.length > 0 ? (
                <Text style={styles.coveredNote}>
                  {t(
                    view.alreadyCovered.length === 1
                      ? 'complaint.alreadyCovered_one'
                      : 'complaint.alreadyCovered_other',
                    { count: view.alreadyCovered.length }
                  )}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}

      {/* Laborwerte, die in diesem Zusammenhang bestimmt werden */}
      {view.labMarkers.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('complaint.labMarkers')}</Text>
          <Text style={styles.listItem}>
            {view.labMarkers
              .map((id) => {
                const marker = getLabMarker(id);
                return marker ? t(marker.labelKey) : id;
              })
              .join(', ')}
          </Text>
          <Text style={styles.hint}>{t('complaint.labHint')}</Text>
        </View>
      ) : null}

      {/* 5. Fragen fuer das Gespraech — die eigentliche Leistung */}
      {view.questionsForProfessional.length > 0 ? (
        <View style={styles.questionBlock}>
          <Text style={styles.blockTitle}>{t('complaint.questions')}</Text>
          {view.questionsForProfessional.map((question, index) => (
            <Text key={index} style={styles.question}>{question}</Text>
          ))}
        </View>
      ) : null}

      {view.sources.length > 0 ? (
        <View style={styles.sourceWrap}>
          <Text style={styles.label}>{t('complaint.sources')}</Text>
          {view.sources.map((source, index) => (
            <Text
              key={index}
              style={styles.sourceItem}
              onPress={source.url ? () => Linking.openURL(source.url) : undefined}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              {source.label}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.disclaimer}>{t('complaint.disclaimer')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...surfaces.card, padding: space.lg },
  label: { ...type.label, marginBottom: space.xs },
  title: { ...type.heading, marginBottom: space.sm },
  intro: { ...type.body, marginBottom: space.md },
  block: { marginTop: space.md, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.md },
  blockTitle: { ...type.subheading, fontSize: 14, marginBottom: space.sm },
  listItem: { ...type.small, marginBottom: space.xs },
  flagBlock: {
    marginTop: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
  },
  toggle: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  nutrientIntro: { ...type.tiny, marginTop: space.sm, marginBottom: space.sm },
  nutrientRow: { marginTop: space.sm },
  nutrientHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  nutrientName: { ...type.bodyStrong, fontSize: 13 },
  inStackBadge: {
    ...type.tiny,
    color: colors.accent,
    fontWeight: '700',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  nutrientNote: { ...type.small, marginTop: 2 },
  inStackNames: { ...type.tiny, color: colors.accent, marginTop: 2 },
  coveredNote: { ...type.small, color: colors.accentInk, marginTop: space.md },
  labHint: {},
  hint: { ...type.tiny, marginTop: space.xs },
  questionBlock: {
    marginTop: space.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  question: { ...type.small, color: colors.accentInk, marginBottom: space.xs },
  sourceWrap: { marginTop: space.md, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.sm },
  sourceItem: { ...type.tiny, color: colors.accent, textDecorationLine: 'underline' },
  disclaimer: { ...type.tiny, marginTop: space.md },
});
