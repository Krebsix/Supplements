import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

import mockScanResult from '../data/mockScanResult';
import useStore from '../useStore';

const CAPTURE_STEPS = [
  {
    id: 'front',
    title: 'Vorderseite',
    shortLabel: 'Produkt erkennen',
    description:
      'Fotografiere Marke und Produktname vollständig und gut lesbar.',
    requirement: 'Das gesamte Produkt sollte im Rahmen sichtbar sein.',
  },
  {
    id: 'back',
    title: 'Rückseite',
    shortLabel: 'Produktangaben',
    description:
      'Erfasse die Rückseite mit Hersteller-, Mengen- und weiteren Produktangaben.',
    requirement: 'Vermeide Spiegelungen und verdeckte Textbereiche.',
  },
  {
    id: 'ingredients',
    title: 'Inhaltsstoffe',
    shortLabel: 'Zusammensetzung',
    description:
      'Fotografiere die vollständige Zutaten- oder Wirkstofftabelle.',
    requirement: 'Alle Zeilen und Mengenangaben müssen erkennbar sein.',
  },
  {
    id: 'dosage',
    title: 'Dosierung',
    shortLabel: 'Einnahmehinweise',
    description:
      'Erfasse Dosierung, Portionsgröße und Anwendungshinweise des Herstellers.',
    requirement: 'Achte besonders auf Einheit und empfohlene Tagesmenge.',
  },
];

export default function ScannerScreen() {
  const router = useRouter();
  const saveScanResult = useStore((state) => state.saveScanResult);
  const setPendingScanResult = useStore(
    (state) => state.setPendingScanResult
  );

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [activeIndex, setActiveIndex] = useState(0);
  const [captures, setCaptures] = useState({});
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState('');

  const activeStep = CAPTURE_STEPS[activeIndex];
  const activeCapture = captures[activeStep.id] || null;
  const activeCaptured = Boolean(activeCapture);
  const capturedIds = CAPTURE_STEPS.filter((step) =>
    Boolean(captures[step.id])
  ).map((step) => step.id);
  const completedCount = capturedIds.length;
  const remainingCount = CAPTURE_STEPS.length - completedCount;
  const allCaptured = remainingCount === 0;
  const progress = `${(completedCount / CAPTURE_STEPS.length) * 100}%`;
  const cameraPermissionBlocked =
    permission && !permission.granted && permission.canAskAgain === false;

  async function handlePermissionAction() {
    setCaptureError('');

    try {
      if (permission?.canAskAgain === false) {
        await Linking.openSettings();
        return;
      }

      const nextPermission = await requestPermission();

      if (!nextPermission.granted) {
        setCaptureError(
          'Ohne Kamerazugriff können keine Produktfotos aufgenommen werden.'
        );
      }
    } catch {
      setCaptureError(
        'Der Kamerazugriff konnte nicht angefragt werden. Bitte versuche es erneut.'
      );
    }
  }

  async function handleCapture() {
    if (!permission?.granted) {
      await handlePermissionAction();
      return;
    }

    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return;
    }

    const captureIndex = activeIndex;
    const stepId = activeStep.id;

    setIsCapturing(true);
    setCaptureError('');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Die Kamera hat keine Bilddatei zurückgegeben.');
      }

      setCaptures((current) => ({
        ...current,
        [stepId]: {
          uri: photo.uri,
          width: photo.width ?? null,
          height: photo.height ?? null,
          capturedAt: new Date().toISOString(),
        },
      }));

      if (captureIndex < CAPTURE_STEPS.length - 1) {
        setIsCameraReady(false);
        setActiveIndex(captureIndex + 1);
      }
    } catch {
      setCaptureError(
        'Das Foto konnte nicht gespeichert werden. Halte das Produkt ruhig und versuche es erneut.'
      );
    } finally {
      setIsCapturing(false);
    }
  }

  function handleRemoveCapture() {
    setCaptures((current) => {
      const nextCaptures = { ...current };
      delete nextCaptures[activeStep.id];
      return nextCaptures;
    });

    setIsCameraReady(false);
    setCaptureError('');
  }

  function handleSelectStep(index) {
    setActiveIndex(index);
    setIsCameraReady(false);
    setCaptureError('');
  }

  function handleNextOpenStep() {
    const nextOpenIndex = CAPTURE_STEPS.findIndex(
      (step) => !captures[step.id]
    );

    if (nextOpenIndex >= 0) {
      handleSelectStep(nextOpenIndex);
    }
  }

  function handleCameraMountError(error) {
    setIsCameraReady(false);
    setCaptureError(
      error?.message ||
        'Die Kamera konnte nicht gestartet werden. Bitte öffne den Scanner erneut.'
    );
  }

  function handleMockScan() {
    if (!allCaptured) {
      handleNextOpenStep();
      return;
    }

    const scanDraft = {
      ...mockScanResult,
      analysisMode: 'mock',
      captureSummary: {
        completedCount,
        requiredCount: CAPTURE_STEPS.length,
        steps: CAPTURE_STEPS.map((step) => {
          const capture = captures[step.id];

          return {
            id: step.id,
            width: capture?.width ?? null,
            height: capture?.height ?? null,
            capturedAt: capture?.capturedAt ?? null,
          };
        }),
      },
    };

    const storedScan = saveScanResult(scanDraft);

    setPendingScanResult(storedScan);
    router.push('/results');
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>Geführter Produktscan</Text>
      <Text style={styles.title}>Vier Fotos. Ein klares Ergebnis.</Text>
      <Text style={styles.subtitle}>
        Die App führt dich Schritt für Schritt durch alle relevanten
        Produktseiten. So können Angaben später vollständig und nachvollziehbar
        geprüft werden.
      </Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>Scan-Fortschritt</Text>
            <Text style={styles.progressValue}>
              {completedCount} von {CAPTURE_STEPS.length} Aufnahmen
            </Text>
          </View>

          <View
            style={[
              styles.progressBadge,
              allCaptured && styles.progressBadgeComplete,
            ]}
          >
            <Text
              style={[
                styles.progressBadgeText,
                allCaptured && styles.progressBadgeTextComplete,
              ]}
            >
              {allCaptured ? 'Vollständig' : `${remainingCount} offen`}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progress }]} />
        </View>
      </View>

      <View style={styles.captureCard}>
        <View style={styles.captureHeader}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>{activeIndex + 1}</Text>
          </View>

          <View style={styles.captureHeaderText}>
            <Text style={styles.captureEyebrow}>
              Aufnahme {activeIndex + 1} von {CAPTURE_STEPS.length}
            </Text>
            <Text style={styles.captureTitle}>{activeStep.title}</Text>
          </View>

          <View
            style={[
              styles.captureStatus,
              activeCaptured && styles.captureStatusComplete,
            ]}
          >
            <Text
              style={[
                styles.captureStatusText,
                activeCaptured && styles.captureStatusTextComplete,
              ]}
            >
              {activeCaptured ? 'Gespeichert' : 'Offen'}
            </Text>
          </View>
        </View>

        <Text style={styles.captureDescription}>
          {activeStep.description}
        </Text>

        <View
          style={[
            styles.cameraFrame,
            activeCaptured && styles.cameraFrameComplete,
          ]}
        >
          {activeCapture ? (
            <Image
              source={{ uri: activeCapture.uri }}
              style={styles.capturedImage}
              resizeMode="cover"
            />
          ) : permission?.granted ? (
            <CameraView
              key={activeStep.id}
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="back"
              onCameraReady={() => {
                setIsCameraReady(true);
                setCaptureError('');
              }}
              onMountError={handleCameraMountError}
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              {permission === null && (
                <ActivityIndicator size="small" color="#0f766e" />
              )}

              <Text style={styles.cameraPlaceholderTitle}>
                {permission === null
                  ? 'Kamerazugriff wird geprüft'
                  : cameraPermissionBlocked
                    ? 'Kamerazugriff ist deaktiviert'
                    : 'Kamerazugriff erforderlich'}
              </Text>

              <Text style={styles.cameraPlaceholderText}>
                {cameraPermissionBlocked
                  ? 'Aktiviere die Kamera für Expo Go in den iPhone-Einstellungen.'
                  : 'Die Kamera wird ausschließlich für die vier Produktaufnahmen verwendet.'}
              </Text>
            </View>
          )}

          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          <View
            style={[
              styles.frameState,
              activeCaptured && styles.frameStateComplete,
            ]}
          >
            <Text
              style={[
                styles.frameStateText,
                activeCaptured && styles.frameStateTextComplete,
              ]}
            >
              {activeCaptured
                ? 'Echte Aufnahme für diesen Schritt gespeichert'
                : permission?.granted
                  ? isCameraReady
                    ? 'Produkt ruhig und vollständig im Rahmen positionieren'
                    : 'Kamera wird vorbereitet'
                  : cameraPermissionBlocked
                    ? 'Kamerazugriff in den iPhone-Einstellungen aktivieren'
                    : 'Kamerazugriff für die Aufnahme erlauben'}
            </Text>
          </View>
        </View>

        {captureError ? (
          <View style={styles.captureErrorBox}>
            <Text style={styles.captureErrorText}>{captureError}</Text>
          </View>
        ) : null}

        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceLabel}>Für eine gute Erkennung</Text>
          <Text style={styles.guidanceText}>
            {activeStep.requirement}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (isCapturing ||
              (permission?.granted &&
                !activeCaptured &&
                !isCameraReady)) &&
              styles.primaryButtonDisabled,
          ]}
          onPress={
            activeCaptured
              ? handleRemoveCapture
              : permission?.granted
                ? handleCapture
                : handlePermissionAction
          }
          disabled={
            isCapturing ||
            Boolean(
              permission?.granted &&
                !activeCaptured &&
                !isCameraReady
            )
          }
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {activeCaptured
              ? 'Foto neu aufnehmen'
              : isCapturing
                ? 'Foto wird gespeichert'
                : !permission?.granted
                  ? cameraPermissionBlocked
                    ? 'iPhone-Einstellungen öffnen'
                    : 'Kamerazugriff erlauben'
                  : !isCameraReady
                    ? 'Kamera wird vorbereitet'
                    : 'Foto aufnehmen'}
          </Text>
        </TouchableOpacity>

        {activeCaptured && (
          <TouchableOpacity
            style={styles.inlineButton}
            onPress={handleRemoveCapture}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <Text style={styles.inlineButtonText}>
              Gespeicherte Aufnahme entfernen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Benötigte Aufnahmen</Text>
        <Text style={styles.sectionHint}>
          Tippe auf einen Schritt, um ihn zu öffnen.
        </Text>
      </View>

      <View style={styles.stepList}>
        {CAPTURE_STEPS.map((step, index) => {
          const isComplete = capturedIds.includes(step.id);
          const isActive = index === activeIndex;

          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepCard,
                isActive && styles.stepCardActive,
                isComplete && styles.stepCardComplete,
              ]}
              onPress={() => handleSelectStep(index)}
              activeOpacity={0.8}
              accessibilityRole="button"
              disabled={isCapturing}
            >
              <View
                style={[
                  styles.stepIndicator,
                  isActive && styles.stepIndicatorActive,
                  isComplete && styles.stepIndicatorComplete,
                ]}
              >
                <Text
                  style={[
                    styles.stepIndicatorText,
                    (isActive || isComplete) &&
                      styles.stepIndicatorTextActive,
                  ]}
                >
                  {isComplete ? '✓' : index + 1}
                </Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>
                  {step.shortLabel}
                </Text>
              </View>

              <Text
                style={[
                  styles.stepState,
                  isComplete && styles.stepStateComplete,
                ]}
              >
                {isComplete ? 'Erledigt' : isActive ? 'Aktiv' : 'Offen'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.analysisCard,
          allCaptured && styles.analysisCardReady,
        ]}
      >
        <Text
          style={[
            styles.analysisKicker,
            allCaptured && styles.analysisKickerReady,
          ]}
        >
          {allCaptured ? 'Bereit zur Prüfung' : 'Aufnahmen vervollständigen'}
        </Text>

        <Text style={styles.analysisTitle}>
          {allCaptured
            ? 'Alle Produktseiten sind erfasst.'
            : `${remainingCount} ${
                remainingCount === 1 ? 'Aufnahme fehlt' : 'Aufnahmen fehlen'
              } noch.`}
        </Text>

        <Text style={styles.analysisText}>
          {allCaptured
            ? 'Im nächsten Schritt werden die erkannten Produktdaten angezeigt und können vor dem Speichern kontrolliert werden.'
            : 'Die Analyse startet erst, wenn alle erforderlichen Produktbereiche aufgenommen wurden.'}
        </Text>

        <TouchableOpacity
          style={[
            styles.analysisButton,
            allCaptured && styles.analysisButtonReady,
          ]}
          onPress={handleMockScan}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.analysisButtonText,
              allCaptured && styles.analysisButtonTextReady,
            ]}
          >
            {allCaptured
              ? 'Test-Analyse starten'
              : 'Nächste offene Aufnahme'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/')}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>
          Zurück zur Startseite
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Die Fotos werden nur für den laufenden Scan im App-Speicher gehalten.
        Die Auswertung nutzt in dieser Phase weiterhin ein kontrolliertes
        Test-Ergebnis. OCR und echte Produkterkennung sind noch nicht verbunden.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 48,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.35,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressValue: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 3,
  },
  progressBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  progressBadgeComplete: {
    backgroundColor: '#ccfbf1',
  },
  progressBadgeText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  progressBadgeTextComplete: {
    color: '#0f766e',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0f766e',
  },
  captureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dbe4ee',
    padding: 18,
    marginBottom: 24,
  },
  captureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#e6fffb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '900',
  },
  captureHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  captureEyebrow: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  captureTitle: {
    color: '#0f172a',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 2,
  },
  captureStatus: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  captureStatusComplete: {
    backgroundColor: '#ccfbf1',
  },
  captureStatusText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  captureStatusTextComplete: {
    color: '#0f766e',
  },
  captureDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
    marginBottom: 16,
  },
  cameraFrame: {
    minHeight: 330,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 22,
    paddingBottom: 58,
  },
  cameraFrameComplete: {
    borderColor: '#5eead4',
    backgroundColor: '#f0fdfa',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingBottom: 28,
  },
  cameraPlaceholderTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },
  cameraPlaceholderText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  corner: {
    position: 'absolute',
    zIndex: 2,
    width: 34,
    height: 34,
    borderColor: '#0f766e',
  },
  cornerTopLeft: {
    top: 18,
    left: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 18,
    right: 18,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 58,
    left: 18,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    right: 18,
    bottom: 58,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  productPreview: {
    alignItems: 'center',
  },
  productCap: {
    width: 65,
    height: 30,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#cbd5e1',
    backgroundColor: '#334155',
  },
  productBody: {
    width: 138,
    height: 186,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  productLabel: {
    minHeight: 86,
    borderRadius: 12,
    backgroundColor: '#e6fffb',
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  productLabelLineStrong: {
    height: 7,
    width: '82%',
    borderRadius: 999,
    backgroundColor: '#0f766e',
    marginBottom: 10,
  },
  productLabelLine: {
    height: 5,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#94a3b8',
    marginBottom: 7,
  },
  productLabelLineShort: {
    height: 5,
    width: '64%',
    borderRadius: 999,
    backgroundColor: '#cbd5e1',
  },
  frameState: {
    position: 'absolute',
    zIndex: 3,
    left: 14,
    right: 14,
    bottom: 12,
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  frameStateComplete: {
    backgroundColor: '#ccfbf1',
    borderColor: '#99f6e4',
  },
  frameStateText: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  frameStateTextComplete: {
    color: '#0f766e',
  },
  captureErrorBox: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginTop: 12,
  },
  captureErrorText: {
    color: '#9a3412',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  guidanceBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    marginBottom: 14,
  },
  guidanceLabel: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  guidanceText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  inlineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 2,
  },
  inlineButtonText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  stepList: {
    gap: 10,
    marginBottom: 20,
  },
  stepCard: {
    minHeight: 72,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepCardActive: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  stepCardComplete: {
    borderColor: '#99f6e4',
  },
  stepIndicator: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: '#0f766e',
  },
  stepIndicatorComplete: {
    backgroundColor: '#0f766e',
  },
  stepIndicatorText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '900',
  },
  stepIndicatorTextActive: {
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  stepDescription: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 3,
  },
  stepState: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
  },
  stepStateComplete: {
    color: '#0f766e',
  },
  analysisCard: {
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    marginBottom: 12,
  },
  analysisCardReady: {
    backgroundColor: '#ecfdf5',
    borderColor: '#99f6e4',
  },
  analysisKicker: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  analysisKickerReady: {
    color: '#0f766e',
  },
  analysisTitle: {
    color: '#0f172a',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    marginTop: 5,
  },
  analysisText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 14,
  },
  analysisButton: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  analysisButtonReady: {
    borderColor: '#0f766e',
    backgroundColor: '#0f766e',
  },
  analysisButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
  },
  analysisButtonTextReady: {
    color: '#ffffff',
  },
  secondaryButton: {
    minHeight: 50,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  disclaimer: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
});
