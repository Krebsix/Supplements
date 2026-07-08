import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getBlockMessage, isBlocked } from '../AbsorptionBlocker';
import { checkAllConflictsForSlot } from '../ConflictLogic';
import useStore from '../useStore';

function formatLastLogged(lastLoggedAt) {
  if (!lastLoggedAt) return 'Noch keine Einnahmen heute erfasst.';

  const date = new Date(lastLoggedAt);
  if (Number.isNaN(date.getTime())) return 'Letzte Aktivität konnte nicht gelesen werden.';

  return `Letzte Aktivität: ${date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function Dashboard() {
  const activeProfileId = useStore((state) => state.activeProfileId);
  const absorptionBlockedAt = useStore((state) => state.absorptionBlockedAt);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);
  const getLoggedToday = useStore((state) => state.getLoggedToday);
  const getTodayProgress = useStore((state) => state.getTodayProgress);
  const getTodaySchedule = useStore((state) => state.getTodaySchedule);
  const logIntake = useStore((state) => state.logIntake);
  const undoIntakeToday = useStore((state) => state.undoIntakeToday);
  const getStock = useStore((state) => state.getStock);

  // Subscribe to changing store slices so the dashboard re-renders after intake/stock/user-supplement updates.
  const intakeLogs = useStore((state) => state.intakeLogs);
  const userSupplements = useStore((state) => state.userSupplements);
  const stockBySupplementId = useStore((state) => state.stockBySupplementId);
  void intakeLogs;
  void userSupplements;
  void stockBySupplementId;

  const loggedToday = getLoggedToday();
  const activeSupplements = getActiveSupplements();
  const dailySchedule = getTodaySchedule();
  const progress = getTodayProgress();
  const fullInventoryCount = activeSupplements.length;
  const scheduledToday = progress.total;
  const pendingToday = progress.pending;
  const lastLoggedAt = loggedToday[0]?.takenAt;
  const blockerState = isBlocked(absorptionBlockedAt);
  const slotAlerts = dailySchedule
    .map((item) => {
      const messages = checkAllConflictsForSlot([], item.supplements);
      return messages.length ? { slot: item.slot, messages } : null;
    })
    .filter(Boolean);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Supplement OS</Text>
      <Text style={styles.subtitle}>
        Tagesuebersicht fuer Profil {activeProfileId}. Die Daten unten kommen aus deinen aktiven Supplements, der Slot-Logik und dem lokalen Store.
      </Text>
      <Text style={styles.statusText}>{formatLastLogged(lastLoggedAt)}</Text>

      {blockerState.blocked ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Absorptions-Block aktiv</Text>
          <Text style={styles.bannerText}>{getBlockMessage(blockerState.remainingMinutes)}</Text>
        </View>
      ) : null}

      <View style={styles.metricGrid}>
        <MetricCard label="Aktiv" value={String(fullInventoryCount)} />
        <MetricCard label="Heute geplant" value={String(scheduledToday)} />
        <MetricCard label="Fortschritt" value={`${progress.done}/${progress.total}`} />
        <MetricCard label="Noch offen" value={String(pendingToday)} />
      </View>

      <SectionHeading
        title="Heutige Slots"
        subtitle="Die Slot-Reihenfolge und Markierungen kommen direkt aus TimingEngine und Store."
      />

      {dailySchedule.map((item) => (
        <View key={item.slot.id} style={styles.slotCard}>
          <View style={styles.slotHeader}>
            <View style={styles.slotHeaderText}>
              <Text style={styles.slotTitle}>
                {item.slot.emoji} {item.slot.label}
              </Text>
              <Text style={styles.slotTime}>{item.slot.time}</Text>
            </View>
            <Text style={styles.slotCount}>{item.supplements.length}</Text>
          </View>

          {item.supplements.length === 0 ? (
            <Text style={styles.emptyText}>Keine Supplements in diesem Slot.</Text>
          ) : (
            item.supplements.map((supplement) => (
              <View key={supplement.id} style={styles.supplementRow}>
                <View style={styles.supplementTextWrap}>
                  <Text style={styles.supplementName}>{supplement.name}</Text>
                  <Text style={styles.supplementMeta}>
                    {supplement.dosage.amount} {supplement.dosage.unit} · {supplement.purpose}
                  </Text>
                  {supplement.notes ? (
                    <Text style={styles.noteText}>{supplement.notes}</Text>
                  ) : null}
                  {getStock(supplement.id)?.currentUnits !== undefined ? (
                    <Text style={styles.noteText}>Bestand: {getStock(supplement.id).currentUnits} {getStock(supplement.id).unit || 'Einheiten'}</Text>
                  ) : null}
                </View>
                <View style={styles.actionWrap}>
                  <Text
                    style={[
                      styles.statePill,
                      supplement.logged ? styles.loggedPill : styles.pendingPill,
                    ]}
                  >
                    {supplement.logged ? 'Erledigt' : 'Offen'}
                  </Text>
                  {supplement.logged ? (
                    <TouchableOpacity style={styles.secondaryAction} onPress={() => undoIntakeToday(supplement.id)}>
                      <Text style={styles.actionText}>Rueckgaengig</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.primaryAction} onPress={() => logIntake(supplement.id, { slotId: item.slot.id })}>
                      <Text style={styles.actionText}>Eingenommen</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      ))}

      <SectionHeading
        title="Konflikte und Hinweise"
        subtitle="Diese Hinweise stammen direkt aus ConflictLogic fuer die aktuell gebildeten Slot-Gruppen."
      />

      {slotAlerts.length === 0 ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Keine Konflikte erkannt</Text>
          <Text style={styles.infoText}>
            Fuer die heutige Slot-Bildung wurden aktuell keine Konflikte oder Synergien gemeldet.
          </Text>
        </View>
      ) : (
        slotAlerts.map((group) => (
          <View key={group.slot.id} style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {group.slot.emoji} {group.slot.label}
            </Text>
            {group.messages.map((message, index) => (
              <Text key={`${group.slot.id}-${index}`} style={styles.infoText}>
                {message.message}
              </Text>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 22,
  },
  statusText: {
    marginTop: 8,
    color: '#71717a',
    fontSize: 13,
  },
  banner: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: '#3f1d1d',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    padding: 16,
  },
  bannerTitle: {
    color: '#fecaca',
    fontSize: 15,
    fontWeight: '700',
  },
  bannerText: {
    marginTop: 6,
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 18,
  },
  metricGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    marginTop: 6,
    color: '#a1a1aa',
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: '#71717a',
    fontSize: 13,
    lineHeight: 18,
  },
  slotCard: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  slotTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  slotTime: {
    marginTop: 3,
    color: '#71717a',
    fontSize: 12,
  },
  slotCount: {
    color: '#60a5fa',
    fontSize: 22,
    fontWeight: '700',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 13,
  },
  supplementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  supplementTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  supplementName: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
  },
  supplementMeta: {
    marginTop: 4,
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 18,
  },
  noteText: {
    marginTop: 4,
    color: '#71717a',
    fontSize: 12,
    lineHeight: 17,
  },
  actionWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  primaryAction: {
    borderRadius: 999,
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  secondaryAction: {
    borderRadius: 999,
    backgroundColor: '#3f3f46',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statePill: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  loggedPill: {
    backgroundColor: '#14532d',
    color: '#bbf7d0',
  },
  pendingPill: {
    backgroundColor: '#1e3a5f',
    color: '#bfdbfe',
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  infoText: {
    marginTop: 8,
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 19,
  },
});
