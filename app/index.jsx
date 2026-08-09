import { Redirect } from 'expo-router';

// Einstieg: direkt in den Tagesplan. Der staerkste Erstkontakt ist das
// Dashboard mit seinem gefuehrten Leer-Zustand, nicht ein Menue-Hub.
export default function Index() {
  return <Redirect href="/Dashboard" />;
}
