import { Tabs } from 'expo-router/js-tabs';
import { BarraDeAbas } from '../../src/components/BarraDeAbas';
import { colors, textStyles } from '../../src/design/tokens';

// A proteção por sessão fica no layout raiz (Stack.Protected); aqui só as abas.
// A barra é a do app (BarraDeAbas): Criar (o formulário `novo`), Lembretes, Mapa e Configurações. A edição é uma tela sob "Lembretes".
// `backBehavior="history"`: o voltar leva à aba de onde a pessoa veio (lista → Editar → Salvar volta à lista). O padrão (`firstRoute`) levaria
// sempre à primeira aba (Criar) e faria `canGoBack()` mentir num acesso direto, o que esconde o "sem histórico → lista" do formulário.
// `initialRouteName="novo"`: depois de entrar o Stack.Protected da raiz cai na rota inicial deste grupo, e o João quer o formulário de novo lembrete. Hoje já é a primeira aba;
// a prop deixa a decisão explícita e a mantém se alguém reordenar as abas (só essa abertura; o endereço manda no resto).
export default function AppLayout() {
  return (
    <Tabs
      backBehavior="history"
      initialRouteName="novo"
      tabBar={(props) => <BarraDeAbas {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg.page },
        headerShadowVisible: false,
        headerTitleStyle: { ...textStyles.heading, color: colors.text.primary },
        sceneStyle: { backgroundColor: colors.bg.page },
      }}
    >
      <Tabs.Screen name="novo" options={{ title: 'Novo lembrete', headerShown: false }} />
      <Tabs.Screen name="index" options={{ title: 'Lembretes', headerShown: false }} />
      <Tabs.Screen name="editar" options={{ title: 'Editar lembrete', headerShown: false }} />
      <Tabs.Screen name="sucesso" options={{ title: 'Lembrete criado', headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa', headerTitle: 'Mapa' }} />
      <Tabs.Screen name="config" options={{ title: 'Configurações', headerShown: false }} />
    </Tabs>
  );
}
