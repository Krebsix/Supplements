import React from 'react';
import { useRouter } from 'expo-router';

import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SupplementResultCard from '../components/SupplementResultCard';
import mockScanResult from '../data/mockScanResult';
import useStore from '../useStore';

export default function ResultsScreen() {
  const router = useRouter();
  const pendingScanResult = useStore((state) => state.pendingScanResult);
  const result = pendingScanResult || mockScanResult;

  return (
    <ScreenContainer>
      <AppHeader
        title="Analyse-Ergebnis"
        subtitle="Demo-Ergebnis mit Mock-Daten. Die echte Erkennung wird später über Wirkstoffnamen, Synonyme und Dosierungen abgesichert."
      />

      <SupplementResultCard result={result} />

      <PrimaryButton title="Als Supplement hinzufügen" onPress={() => router.push('/AddSupplement?fromScan=1')} />
      <PrimaryButton title="Zurück zur Startseite" variant="secondary" onPress={() => router.push('/')} />
    </ScreenContainer>
  );
}
