import React from 'react';

import LegalSections from '../components/LegalSections';
import { IMPRINT_SECTIONS } from '../data/legalContent';

// Impressum. Wie die Datenschutzerklaerung ausserhalb des Onboarding-Gates.
export default function ImprintScreen() {
  return <LegalSections sections={IMPRINT_SECTIONS} />;
}
