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

import TabBar from '../components/TabBar';

import { lookupBarcode } from '../BarcodeLookup';
import { analyzeCaptures, isAnalyzerConfigured } from '../ScanAnalyzer';
import mockScanResult from '../data/mockScanResult';
import useStore from '../useStore';
import { useTranslation } from '../i18n';

// Nur Uebersetzungs-Schluessel, keine Texte: Diese Konstante wird beim
// Modulladen ausgewertet, bevor die Sprache feststeht. Aufgeloest wird
// erst beim Rendern per t(step.titleKey) etc.
const CAPTURE_STEPS = [
  {
    id: 'front',
    titleKey: 'scanner.step.front.title',
    shortLabelKey: 'scanner.step.front.shortLabel',
    descriptionKey: 'scanner.step.front.description',
    requirementKey: 'scanner.step.front.requirement',
  },
  {
    id: 'back',
    titleKey: 'scanner.step.back.title',
    shortLabelKey: 'scanner.step.back.shortLabel',
    descriptionKey: 'scanner.step.back.description',
    requirementKey: 'scanner.step.back.requirement',
  },
  {
    id: 'ingredients',
    titleKey: 'scanner.step.ingredients.title',
    shortLabelKey: 'scanner.step.ingredients.shortLabel',
    descriptionKey: 'scanner.step.ingredients.description',
    requirementKey: 'scanner.step.ingredients.requirement',
  },
  {
    id: 'dosage',
    titleKey: 'scanner.step.dosage.title',
    shortLabelKey: 'scanner.step.dosage.shortLabel',
    descriptionKey: 'scanner.step.dosage.description',
    requirementKey: 'scanner.step.dosage.requirement',
  },
];

export default function ScannerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);

  const analyzerReady = isAnalyzerConfigured();

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
        setCaptureError(t('scanner.error.permissionDenied'));
      }
    } catch {
      setCaptureError(t('scanner.error.permissionRequestFailed'));
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
        throw new Error(t('scanner.error.noPhotoFile'));
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
      setCaptureError(t('scanner.error.captureFailed'));
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
    setCaptureError(error?.message || t('scanner.error.cameraMountFailed'));
  }

  function buildCaptureSummary() {
    return {
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
    };
  }

  function storeAndShowResult(scanDraft) {
    const storedScan = saveScanResult(scanDraft);
    setPendingScanResult(storedScan);
    router.push('/results');
  }

  async function handleStartAnalysis() {
    if (!allCaptured) {
      handleNextOpenStep();
      return;
    }

    if (isAnalyzing) return;

    // Ohne konfiguriertes Analyse-Backend: klar gekennzeichnetes Mock-Ergebnis
    if (!analyzerReady) {
      storeAndShowResult({
        ...mockScanResult,
        analysisMode: 'mock',
        captureSummary: buildCaptureSummary(),
      });
      return;
    }

    setIsAnalyzing(true);
    setCaptureError('');

    try {
      const analysis = await analyzeCaptures(captures);

      storeAndShowResult({
        ...analysis,
        captureSummary: buildCaptureSummary(),
      });
    } catch (error) {
      // Kein stilles Demo-Ergebnis bei Fehlern — das waere ein erfundener Wert.
      setCaptureError(error?.message || t('scanner.error.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleBarcodeScanned(scan) {
    const code = scan?.data;
    if (!code || scannedBarcode) return;
    setScannedBarcode(String(code));
  }

  async function handleBarcodeLookup() {
    if (!scannedBarcode || isLookingUpBarcode) return;

    setIsLookingUpBarcode(true);
    setCaptureError('');

    try {
      const result = await lookupBarcode(scannedBarcode);

      if (!result) {
        setCaptureError(
          t('scanner.error.barcodeNotFound', { code: scannedBarcode })
        );
        setScannedBarcode('');
        return;
      }

      storeAndShowResult({
        ...result,
        captureSummary: buildCaptureSummary(),
      });
    } catch (error) {
      setCaptureError(error?.message || t('scanner.error.barcodeLookupFailed'));
    } finally {
      setIsLookingUpBarcode(false);
    }
  }

  return (
    <View style={styles.screenWrap}>
      <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>{t('scanner.kicker')}</Text>
      <Text style={styles.title}>{t('scanner.title')}</Text>
      <Text style={styles.subtitle}>{t('scanner.subtitle')}</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>
              {t('scanner.progress.label')}
            </Text>
            <Text style={styles.progressValue}>
              {t('scanner.progress.count', {
                completed: completedCount,
                total: CAPTURE_STEPS.length,
              })}
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
              {allCaptured
                ? t('scanner.progress.complete')
                : t('scanner.progress.remaining', { count: remainingCount })}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progress }]} />
        </View>
      </View>

      {scannedBarcode ? (
        <View style={styles.barcodeCard}>
          <View style={styles.barcodeHeader}>
            <Text style={styles.barcodeKicker}>
              {t('scanner.barcode.detected')}
            </Text>
            <Text style={styles.barcodeValue}>{scannedBarcode}</Text>
          </View>

          <Text style={styles.barcodeText}>{t('scanner.barcode.text')}</Text>

          <TouchableOpacity
            style={[
              styles.barcodeButton,
              isLookingUpBarcode && styles.primaryButtonDisabled,
            ]}
            onPress={handleBarcodeLookup}
            disabled={isLookingUpBarcode}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.barcodeButtonText}>
              {isLookingUpBarcode
                ? t('scanner.barcode.searching')
                : t('scanner.barcode.search')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inlineButton}
            onPress={() => setScannedBarcode('')}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <Text style={styles.inlineButtonText}>
              {t('scanner.barcode.discard')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.captureCard}>
        <View style={styles.captureHeader}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>{activeIndex + 1}</Text>
          </View>

          <View style={styles.captureHeaderText}>
            <Text style={styles.captureEyebrow}>
              {t('scanner.capture.eyebrow', {
                current: activeIndex + 1,
                total: CAPTURE_STEPS.length,
              })}
            </Text>
            <Text style={styles.captureTitle}>{t(activeStep.titleKey)}</Text>
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
              {activeCaptured
                ? t('scanner.capture.statusSaved')
                : t('scanner.capture.statusOpen')}
            </Text>
          </View>
        </View>

        <Text style={styles.captureDescription}>
          {t(activeStep.descriptionKey)}
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
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
              }}
              onBarcodeScanned={
                scannedBarcode ? undefined : handleBarcodeScanned
              }
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              {permission === null && (
                <ActivityIndicator size="small" color="#0f766e" />
              )}

              <Text style={styles.cameraPlaceholderTitle}>
                {permission === null
                  ? t('scanner.camera.checkingPermission')
                  : cameraPermissionBlocked
                    ? t('scanner.camera.permissionBlocked')
                    : t('scanner.camera.permissionRequired')}
              </Text>

              <Text style={styles.cameraPlaceholderText}>
                {cameraPermissionBlocked
                  ? t('scanner.camera.enableInSettings')
                  : t('scanner.camera.purpose')}
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
                ? t('scanner.frame.saved')
                : permission?.granted
                  ? isCameraReady
                    ? t('scanner.frame.positionProduct')
                    : t('scanner.frame.preparing')
                  : cameraPermissionBlocked
                    ? t('scanner.frame.enableInSettings')
                    : t('scanner.frame.allowAccess')}
            </Text>
          </View>
        </View>

        {captureError ? (
          <View style={styles.captureErrorBox}>
            <Text style={styles.captureErrorText}>{captureError}</Text>
          </View>
        ) : null}

        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceLabel}>
            {t('scanner.guidance.label')}
          </Text>
          <Text style={styles.guidanceText}>
            {t(activeStep.requirementKey)}
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
              ? t('scanner.primaryButton.retake')
              : isCapturing
                ? t('scanner.primaryButton.saving')
                : !permission?.granted
                  ? cameraPermissionBlocked
                    ? t('scanner.primaryButton.openSettings')
                    : t('scanner.primaryButton.allowAccess')
                  : !isCameraReady
                    ? t('scanner.primaryButton.preparing')
                    : t('scanner.primaryButton.capture')}
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
              {t('scanner.inline.removeCapture')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('scanner.section.title')}</Text>
        <Text style={styles.sectionHint}>{t('scanner.section.hint')}</Text>
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
                <Text style={styles.stepTitle}>{t(step.titleKey)}</Text>
                <Text style={styles.stepDescription}>
                  {t(step.shortLabelKey)}
                </Text>
              </View>

              <Text
                style={[
                  styles.stepState,
                  isComplete && styles.stepStateComplete,
                ]}
              >
                {isComplete
                  ? t('scanner.step.stateDone')
                  : isActive
                    ? t('scanner.step.stateActive')
                    : t('scanner.step.stateOpen')}
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
          {allCaptured
            ? t('scanner.analysis.readyKicker')
            : t('scanner.analysis.pendingKicker')}
        </Text>

        <Text style={styles.analysisTitle}>
          {allCaptured
            ? t('scanner.analysis.readyTitle')
            : t(
                remainingCount === 1
                  ? 'scanner.analysis.remaining_one'
                  : 'scanner.analysis.remaining_other',
                { count: remainingCount }
              )}
        </Text>

        <Text style={styles.analysisText}>
          {allCaptured
            ? t('scanner.analysis.readyText')
            : t('scanner.analysis.pendingText')}
        </Text>

        <TouchableOpacity
          style={[
            styles.analysisButton,
            allCaptured && styles.analysisButtonReady,
          ]}
          onPress={handleStartAnalysis}
          disabled={isAnalyzing}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.analysisButtonText,
              allCaptured && styles.analysisButtonTextReady,
            ]}
          >
            {isAnalyzing
              ? t('scanner.analysis.running')
              : allCaptured
                ? analyzerReady
                  ? t('scanner.analysis.start')
                  : t('scanner.analysis.startTest')
                : t('scanner.analysis.nextOpen')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/')}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>{t('scanner.backHome')}</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        {analyzerReady
          ? t('scanner.disclaimer.vision')
          : t('scanner.disclaimer.mock')}
      </Text>
    </ScrollView>
      <TabBar active="scan" />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: { flex: 1, backgroundColor: '#f8fafc' },
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
  barcodeCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#99f6e4',
    padding: 16,
    marginBottom: 16,
  },
  barcodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barcodeKicker: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  barcodeValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  barcodeText: {
    color: '#0f766e',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  barcodeButton: {
    minHeight: 46,
    backgroundColor: '#0f766e',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  barcodeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
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
