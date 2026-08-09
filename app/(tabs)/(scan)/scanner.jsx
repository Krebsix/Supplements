import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';


import {
  extractProductCode,
  lookupBarcode,
  mapOffProductToScanResult,
  searchProductsByName,
} from '../../../BarcodeLookup';
import { evaluateVisionScan } from '../../../Entitlements';
import { analyzeCaptures, isAnalyzerConfigured, lookupProductCache } from '../../../ScanAnalyzer';
import mockScanResult from '../../../data/mockScanResult';
import useStore from '../../../useStore';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

const affirmTone = toneFor('affirm');
const cautionTone = toneFor('caution');

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
  const scanUploadConsent = useStore((state) => state.consents?.scanUpload);
  const giveScanConsent = useStore((state) => state.giveScanConsent);
  const entitlement = useStore((state) => state.entitlement);
  const consumeVisionScan = useStore((state) => state.consumeVisionScan);

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
  const [nameQuery, setNameQuery] = useState('');
  const [nameResults, setNameResults] = useState([]);
  const [isSearchingName, setIsSearchingName] = useState(false);
  const [nameSearchDone, setNameSearchDone] = useState(false);

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
      // Wachhund gegen haengende Aufnahmen: takePictureAsync kann auf
      // manchen Geraeten nie aufloesen (beobachtet beim vierten Foto,
      // wenn der Barcode-Leser parallel Frames analysiert). Lieber ein
      // ehrlicher Fehler mit Neuversuch als ein endloser Spinner.
      const photo = await Promise.race([
        cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(t('scanner.error.captureTimeout'))),
            12000
          )
        ),
      ]);

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
    } catch (error) {
      setCaptureError(error?.message || t('scanner.error.captureFailed'));
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleNameSearch() {
    const query = nameQuery.trim();
    if (query.length < 3 || isSearchingName) return;

    setIsSearchingName(true);
    setCaptureError('');
    setNameResults([]);
    setNameSearchDone(false);

    try {
      const results = await searchProductsByName(query);
      setNameResults(results);
      setNameSearchDone(true);
    } catch (error) {
      setCaptureError(error?.message || t('scanner.nameSearch.failed'));
    } finally {
      setIsSearchingName(false);
    }
  }

  async function handlePickNameResult(candidate) {
    if (isSearchingName) return;
    setIsSearchingName(true);
    setCaptureError('');

    try {
      // Der Suchtreffer ist nur ein Zeiger; die vollstaendigen
      // Produktdaten (Zutaten, Menge) kommen aus dem Produkt-Endpoint,
      // demselben Pfad wie beim Barcode-Scan.
      const full = await lookupBarcode(candidate.code);
      const result = full ?? mapOffProductToScanResult(
        { product_name: candidate.productName, brands: candidate.brand },
        candidate.code
      );
      setNameQuery('');
      setNameResults([]);
      setNameSearchDone(false);
      storeAndShowResult({
        ...result,
        captureSummary: buildCaptureSummary(),
      });
    } catch (error) {
      setCaptureError(error?.message || t('scanner.nameSearch.failed'));
    } finally {
      setIsSearchingName(false);
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
    // Frischer Stand fuer den naechsten Scan: Code und Fotos sind im
    // Ergebnis aufgehoben, im Scanner haben sie nichts mehr verloren.
    setScannedBarcode('');
    setCaptures({});
    setActiveIndex(0);
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

    // Kontingent-Gate (Entitlements.js): Freikontingent, Fair Use oder
    // Credits. Solange PAYWALL_ENFORCED aus ist, wird nur gezaehlt.
    if (!evaluateVisionScan(entitlement).allowed) {
      Alert.alert(
        t('scanner.limit.title'),
        t('scanner.limit.message')
      );
      return;
    }

    // Einwilligungs-Gate: Erst ab hier verlassen Fotos das Geraet. Die
    // Zustimmung wird einmal aktiv eingeholt (Art. 6 Abs. 1 lit. a DSGVO),
    // im Store festgehalten und ist in den Einstellungen widerrufbar.
    // Der Mock-Pfad oben braucht sie nicht: dort wird nichts uebertragen.
    if (!scanUploadConsent) {
      Alert.alert(t('scanner.consent.title'), t('scanner.consent.message'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('scanner.consent.confirm'),
          onPress: () => {
            giveScanConsent();
            runVisionAnalysis();
          },
        },
      ]);
      return;
    }

    runVisionAnalysis();
  }

  async function runVisionAnalysis() {
    setIsAnalyzing(true);
    setCaptureError('');

    try {
      // Ein zuvor gescannter, nicht aufgeloester Barcode wandert mit:
      // Er heftet sich ans Ergebnis und fuellt den geteilten Produkt-Cache.
      const analysis = await analyzeCaptures(captures, { barcode: scannedBarcode });

      // Erst nach erfolgreicher Analyse verbrauchen: Ein fehlgeschlagener
      // Scan kostet die Nutzerin nichts.
      consumeVisionScan();

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
    if (!code) return;

    // Produktnummer aus dem Roh-Code ziehen: reine Ziffernfolgen
    // (EAN/UPC/GTIN) direkt, GS1-Digital-Link-QR-Codes ueber den
    // Pfadabschnitt nach "/01/". QR-Codes ohne Produktnummer (URLs,
    // Text) sagen es einmal deutlich, statt stumm zu bleiben.
    const value = extractProductCode(String(code));
    if (!value) {
      if (!scannedBarcode) setCaptureError(t('scanner.error.codeNotProduct'));
      return;
    }

    if (scannedBarcode === value || isLookingUpBarcode) return;
    // Ein neuer, anderer Code ersetzt den alten, solange noch keine
    // Fotos aufgenommen wurden — sonst bliebe die Kamera nach einem
    // Fehlschlag stumm. Sobald Fotos existieren, bleibt der Code
    // angeheftet, damit die Cache-Zuordnung stimmt.
    if (scannedBarcode && completedCount > 0) return;

    setScannedBarcode(value);
    // Sofort nachschlagen statt auf einen zweiten Tipp zu warten: Ein
    // erkannter Code IST bereits die Nutzerabsicht. Der Button in der
    // Barcode-Karte bleibt als manueller Neuversuch bestehen.
    runBarcodeLookup(value);
  }

  async function handleBarcodeLookup() {
    runBarcodeLookup(scannedBarcode);
  }

  async function runBarcodeLookup(code) {
    if (!code || isLookingUpBarcode) return;

    setIsLookingUpBarcode(true);
    setCaptureError('');

    try {
      const result = await lookupBarcode(code);

      if (result) {
        storeAndShowResult({
          ...result,
          captureSummary: buildCaptureSummary(),
        });
        return;
      }

      // Zweite Chance vor dem Foto-Weg: der geteilte Produkt-Cache
      // (fruehere Foto-Analysen anderer Nutzerinnen zum selben Code).
      const cached = await lookupProductCache(code);
      if (cached) {
        storeAndShowResult({
          ...cached,
          captureSummary: buildCaptureSummary(),
        });
        return;
      }

      // Kein Treffer: Der Code bleibt gesetzt, damit die anschliessende
      // Foto-Analyse ihn ans Ergebnis heftet und der naechste Scan
      // desselben Produkts aus dem Cache beantwortet werden kann.
      setCaptureError(
        t('scanner.error.barcodeNotFound', { code })
      );
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

      <View style={styles.barcodeCard}>
        <Text style={styles.barcodeKicker}>{t('scanner.nameSearch.label')}</Text>
        <Text style={styles.barcodeText}>{t('scanner.nameSearch.text')}</Text>

        <TextInput
          value={nameQuery}
          onChangeText={setNameQuery}
          placeholder={t('scanner.nameSearch.placeholder')}
          placeholderTextColor={colors.inkFaint}
          style={styles.nameSearchInput}
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleNameSearch}
          accessibilityLabel={t('scanner.nameSearch.label')}
        />

        <TouchableOpacity
          style={[
            styles.barcodeButton,
            (isSearchingName || nameQuery.trim().length < 3) &&
              styles.primaryButtonDisabled,
          ]}
          onPress={handleNameSearch}
          disabled={isSearchingName || nameQuery.trim().length < 3}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.barcodeButtonText}>
            {isSearchingName
              ? t('scanner.nameSearch.searching')
              : t('scanner.nameSearch.button')}
          </Text>
        </TouchableOpacity>

        {nameSearchDone && nameResults.length === 0 ? (
          <Text style={styles.nameSearchEmpty}>
            {t('scanner.nameSearch.empty')}
          </Text>
        ) : null}

        {nameResults.map((candidate, index) => (
          <TouchableOpacity
            key={candidate.code || `${candidate.productName}-${index}`}
            style={styles.nameResultRow}
            onPress={() => handlePickNameResult(candidate)}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <Text style={styles.nameResultName}>{candidate.productName}</Text>
            {candidate.brand ? (
              <Text style={styles.nameResultBrand}>{candidate.brand}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

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
                // QR und Code128/DataMatrix mitlesen: manche Verpackungen
                // tragen nur solche Codes. Ob der Inhalt eine Produktnummer
                // ist, entscheidet handleBarcodeScanned.
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'datamatrix'],
              }}
              // Zuhoeren, ausser waehrend einer Foto-Aufnahme (die
              // parallele Frame-Analyse kann takePictureAsync blockieren)
              // und nach dem letzten Foto (nichts mehr zu suchen).
              // Sonst entscheidet der Handler, ob ein Code uebernommen,
              // ersetzt oder ignoriert wird.
              onBarcodeScanned={
                isCapturing || allCaptured ? undefined : handleBarcodeScanned
              }
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              {permission === null && (
                <ActivityIndicator size="small" color={colors.accent} />
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

          {/* Sichtbarer Hinweis auf den mitlaufenden Code-Leser: Ohne ihn
              wirkt der Screen wie ein reines Foto-Tool, obwohl die Kamera
              Barcodes und QR-Codes automatisch erkennt. */}
          {permission?.granted && isCameraReady && !scannedBarcode ? (
            <View style={styles.scanHint}>
              <Text style={styles.scanHintText}>
                {isLookingUpBarcode
                  ? t('scanner.liveHint.searching')
                  : t('scanner.liveHint.ready')}
              </Text>
            </View>
          ) : null}

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
        onPress={() => router.push('/menu')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: surfaces.screen,
  screen: surfaces.screen,
  content: {
    paddingHorizontal: space.xl - 2,
    paddingTop: space.xl + 6,
    paddingBottom: 48,
  },
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  title: {
    ...type.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...type.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: space.sm + 2,
    marginBottom: space.lg + 4,
  },
  progressCard: {
    ...surfaces.card,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md + 2,
  },
  progressLabel: {
    ...type.label,
    color: colors.inkMuted,
  },
  progressValue: {
    ...type.numeral,
    fontSize: 17,
    marginTop: 3,
  },
  progressBadge: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 3,
    paddingVertical: space.xs + 2,
  },
  progressBadgeComplete: {
    backgroundColor: affirmTone.surface,
  },
  progressBadgeText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  progressBadgeTextComplete: {
    color: affirmTone.ink,
  },
  progressTrack: {
    height: 7,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  barcodeCard: {
    ...surfaces.card,
    backgroundColor: colors.accentSoft,
  },
  barcodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barcodeKicker: {
    ...type.label,
    color: colors.accent,
  },
  barcodeValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  barcodeText: {
    color: colors.accentInk,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.sm,
  },
  barcodeButton: {
    ...surfaces.buttonPrimary,
    minHeight: 46,
    paddingHorizontal: space.lg - 4,
    marginTop: space.md,
    marginBottom: 0,
  },
  barcodeButtonText: {
    ...surfaces.buttonPrimaryText,
    fontSize: 13,
  },
  captureCard: {
    ...surfaces.card,
    marginBottom: space.xl - 2,
  },
  captureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '900',
  },
  captureHeaderText: {
    flex: 1,
    marginLeft: space.md,
  },
  captureEyebrow: {
    ...type.label,
    color: colors.inkMuted,
  },
  captureTitle: {
    ...type.heading,
    fontSize: 21,
    marginTop: 2,
  },
  captureStatus: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 2,
  },
  captureStatusComplete: {
    backgroundColor: affirmTone.surface,
  },
  captureStatusText: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  captureStatusTextComplete: {
    color: affirmTone.ink,
  },
  captureDescription: {
    ...type.body,
    marginTop: space.lg,
    marginBottom: space.lg,
  },
  cameraFrame: {
    minHeight: 330,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: space.lg + 2,
    paddingBottom: 58,
  },
  cameraFrameComplete: {
    borderColor: affirmTone.rule,
    backgroundColor: affirmTone.surface,
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
    paddingBottom: space.xl - 2,
  },
  cameraPlaceholderTitle: {
    ...type.bodyStrong,
    fontSize: 16,
    textAlign: 'center',
    marginTop: space.md,
  },
  cameraPlaceholderText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: space.sm - 1,
  },
  corner: {
    position: 'absolute',
    zIndex: 2,
    width: 34,
    height: 34,
    borderColor: colors.accent,
  },
  cornerTopLeft: {
    top: 18,
    left: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: radius.md,
  },
  cornerTopRight: {
    top: 18,
    right: 18,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: radius.md,
  },
  cornerBottomLeft: {
    bottom: 58,
    left: 18,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: radius.md,
  },
  cornerBottomRight: {
    right: 18,
    bottom: 58,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: radius.md,
  },
  productPreview: {
    alignItems: 'center',
  },
  productCap: {
    width: 65,
    height: 30,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomWidth: 4,
    borderBottomColor: colors.rule,
    backgroundColor: colors.ink,
  },
  productBody: {
    width: 138,
    height: 186,
    borderRadius: radius.lg + 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: space.lg - 4,
    justifyContent: 'center',
  },
  productLabel: {
    minHeight: 86,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.md + 1,
    justifyContent: 'center',
  },
  productLabelLineStrong: {
    height: 7,
    width: '82%',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    marginBottom: space.sm + 2,
  },
  productLabelLine: {
    height: 5,
    width: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.inkFaint,
    marginBottom: space.sm - 1,
  },
  productLabelLineShort: {
    height: 5,
    width: '64%',
    borderRadius: radius.md,
    backgroundColor: colors.rule,
  },
  nameSearchInput: {
    ...surfaces.input,
    marginTop: space.md,
  },
  nameSearchEmpty: {
    ...type.small,
    marginTop: space.md,
  },
  nameResultRow: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingVertical: space.md - 2,
    marginTop: space.md - 2,
  },
  nameResultName: {
    ...type.bodyStrong,
  },
  nameResultBrand: {
    ...type.small,
    marginTop: 2,
  },
  scanHint: {
    position: 'absolute',
    zIndex: 3,
    left: 14,
    right: 14,
    top: 12,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  scanHintText: {
    color: colors.accentInk,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  frameState: {
    position: 'absolute',
    zIndex: 3,
    left: 14,
    right: 14,
    bottom: 12,
    minHeight: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  frameStateComplete: {
    backgroundColor: affirmTone.surface,
    borderColor: affirmTone.rule,
  },
  frameStateText: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  frameStateTextComplete: {
    color: affirmTone.ink,
  },
  captureErrorBox: {
    backgroundColor: cautionTone.surface,
    borderWidth: 1,
    borderColor: cautionTone.rule,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm + 5,
    paddingVertical: space.sm + 3,
    marginTop: space.md,
  },
  captureErrorText: {
    color: cautionTone.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  guidanceBox: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginTop: space.md + 2,
    marginBottom: space.md + 2,
  },
  guidanceLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: space.xs,
  },
  guidanceText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    ...surfaces.buttonPrimary,
    minHeight: 50,
    paddingHorizontal: space.lg + 2,
    marginBottom: 0,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.inkFaint,
  },
  primaryButtonText: {
    ...surfaces.buttonPrimaryText,
  },
  inlineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    marginTop: 2,
  },
  inlineButtonText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: space.md,
  },
  sectionTitle: {
    ...type.heading,
    fontSize: 20,
  },
  sectionHint: {
    color: colors.inkMuted,
    fontSize: 13,
    marginTop: space.xs,
  },
  stepList: {
    gap: space.sm + 2,
    marginBottom: space.lg + 4,
  },
  stepCard: {
    minHeight: 72,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md + 2,
    paddingVertical: space.md,
  },
  stepCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  stepCardComplete: {
    borderColor: affirmTone.rule,
  },
  stepIndicator: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: colors.accent,
  },
  stepIndicatorComplete: {
    backgroundColor: colors.accent,
  },
  stepIndicatorText: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: '900',
  },
  stepIndicatorTextActive: {
    color: colors.surface,
  },
  stepContent: {
    flex: 1,
    marginLeft: space.md,
  },
  stepTitle: {
    ...type.bodyStrong,
    fontSize: 15,
  },
  stepDescription: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 3,
  },
  stepState: {
    color: colors.inkFaint,
    fontSize: 11,
    fontWeight: '800',
  },
  stepStateComplete: {
    color: colors.accent,
  },
  analysisCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: space.lg + 2,
    marginBottom: space.md,
  },
  analysisCardReady: {
    backgroundColor: affirmTone.surface,
    borderColor: affirmTone.rule,
  },
  analysisKicker: {
    ...type.label,
    color: colors.inkMuted,
  },
  analysisKickerReady: {
    color: affirmTone.ink,
  },
  analysisTitle: {
    ...type.heading,
    fontSize: 19,
    lineHeight: 25,
    marginTop: space.xs + 1,
  },
  analysisText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: space.sm - 1,
    marginBottom: space.md + 2,
  },
  analysisButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md + 2,
  },
  analysisButtonReady: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  analysisButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  analysisButtonTextReady: {
    color: colors.surface,
  },
  secondaryButton: {
    ...surfaces.buttonQuiet,
    minHeight: 50,
    paddingHorizontal: space.lg + 2,
  },
  secondaryButtonText: {
    ...surfaces.buttonQuietText,
  },
  disclaimer: {
    ...type.tiny,
    textAlign: 'center',
    marginTop: space.md,
    paddingHorizontal: space.sm,
  },
});
