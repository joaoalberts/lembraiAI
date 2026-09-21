import { router } from 'expo-router';
import { Onboarding } from '../../src/components/Onboarding';

/** Aba "Início": a mesma abertura do primeiro acesso, com a barra de abas. Os dois botões levam ao formulário de novo lembrete. */
export default function InicioScreen() {
  return <Onboarding onSkip={() => router.navigate('/novo')} onStart={() => router.navigate('/novo')} />;
}
