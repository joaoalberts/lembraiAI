import { router } from 'expo-router';
import { Onboarding } from '../../src/components/Onboarding';

/**
 * Primeira tela de quem ainda não entrou. Os dois botões levam ao login (o app web mandava ao formulário, que pedia o
 * login antes; aqui o login vem direto e a pessoa cai na lista ao entrar).
 */
export default function BemVindoScreen() {
  return <Onboarding standalone onSkip={() => router.push('/auth/login')} onStart={() => router.push('/auth/login')} />;
}
