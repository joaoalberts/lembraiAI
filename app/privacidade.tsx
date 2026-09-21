import { ScrollView, StyleSheet, Text, View } from 'react-native';

/** Atualize a data sempre que o texto mudar. */
const ATUALIZADO_EM = '20 de setembro de 2026';

interface Secao { titulo: string; paragrafos: string[] }

/**
 * Política de privacidade (as duas lojas exigem uma URL pública: esta rota vira /privacidade no build web).
 * O texto descreve o que o app faz de fato hoje; se o código passar a coletar algo novo, isto precisa mudar junto.
 * `contato` é o EXPO_PUBLIC_CONTACT_EMAIL (lido na hora de renderizar; o Expo o embute no build): sem ele, o texto não remete a um contato que não existe.
 */
const secoesDaPolitica = (contato?: string): Secao[] => [
  {
    titulo: 'Quais dados usamos',
    paragrafos: [
      'Conta: seu nome e seu e-mail. A senha é guardada de forma protegida (com hash) pelo nosso serviço de autenticação; nós nunca a vemos.',
      'Lembretes: título, data, hora, repetição e, nos lembretes por local, o nome do lugar, as coordenadas e o raio de aviso que você escolheu.',
      'No aparelho: a sua preferência de "Manter conectado" e de monitorar lugares.',
    ],
  },
  {
    titulo: 'Sua localização',
    paragrafos: [
      'Para avisar quando você chega a um lugar, o app lê a posição do aparelho enquanto está aberto e compara com os seus lembretes ali mesmo, no aparelho. Essa posição contínua não é enviada aos nossos servidores.',
      'Só quando você toca em "Usar minha localização" ao criar um lembrete, aquela coordenada é salva como o local desse lembrete. Você pode desligar o monitoramento em Configurações e revogar a permissão nos ajustes do aparelho a qualquer momento.',
    ],
  },
  {
    titulo: 'Notificações',
    paragrafos: [
      'Os avisos por horário são agendados no próprio aparelho. Não usamos serviço de notificações push nem coletamos identificador de push.',
    ],
  },
  {
    titulo: 'Mapas',
    paragrafos: [
      'Ao abrir o mapa, o provedor do mapa recebe dados técnicos da conexão, como o endereço IP e a região que você está vendo: Apple Maps no iOS e OpenStreetMap na web e no Android. Cada um trata esses dados segundo a própria política.',
    ],
  },
  {
    titulo: 'Com quem compartilhamos',
    paragrafos: [
      'Não vendemos seus dados e não usamos publicidade nem ferramentas de análise de terceiros.',
      'Sua conta e seus lembretes ficam em um servidor virtual (VPS) contratado pelo desenvolvedor do app junto a uma empresa de hospedagem, com software de código aberto (PostgreSQL e Supabase Auth). As conexões usam criptografia (HTTPS) e cada pessoa só consegue acessar os próprios dados.',
    ],
  },
  {
    titulo: 'Por quanto tempo guardamos',
    paragrafos: [
      'Seus dados ficam guardados enquanto sua conta existir. Você pode apagar lembretes um a um ou excluir a conta inteira em Configurações → "Excluir minha conta": a conta e todos os lembretes são apagados de forma definitiva.',
      'Cópias de segurança automáticas do servidor podem conter esses dados por até 14 dias depois da exclusão; passado esse prazo, elas também são apagadas.',
    ],
  },
  {
    titulo: 'Seus direitos',
    paragrafos: [
      contato
        ? 'Você pode pedir acesso, correção ou exclusão dos seus dados, ou tirar dúvidas sobre esta política, falando com a gente pelo contato abaixo. A exclusão também pode ser feita direto no app.'
        : 'Você pode ver, corrigir e apagar seus lembretes direto no app e, em Configurações → "Excluir minha conta", apagar sua conta e todos os dados.',
      'O LembreiAi não é direcionado a crianças.',
    ],
  },
  {
    titulo: 'Mudanças',
    paragrafos: ['Se esta política mudar, a data abaixo será atualizada e, em mudanças importantes, avisaremos no app.'],
  },
];

export default function PrivacidadeScreen() {
  const contato = process.env.EXPO_PUBLIC_CONTACT_EMAIL;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <Text style={styles.title} accessibilityRole="header">Política de privacidade</Text>
        <Text style={styles.updated}>LembreiAi · atualizada em {ATUALIZADO_EM}</Text>

        {secoesDaPolitica(contato).map((s) => (
          <View key={s.titulo} style={styles.section}>
            <Text style={styles.heading} accessibilityRole="header">{s.titulo}</Text>
            {s.paragrafos.map((p) => (
              <Text key={p} style={styles.paragraph}>{p}</Text>
            ))}
          </View>
        ))}

        {!!contato && (
          <View style={styles.section}>
            <Text style={styles.heading} accessibilityRole="header">Contato</Text>
            <Text style={styles.paragraph}>{contato}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  content: { padding: 24, alignItems: 'center' },
  column: { width: '100%', maxWidth: 720 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0A0A0A', marginBottom: 4 },
  updated: { fontSize: 13, color: '#767880', marginBottom: 24 },
  section: { marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: '700', color: '#0A0A0A', marginBottom: 8 },
  paragraph: { fontSize: 15, lineHeight: 22, color: '#2B2D31', marginBottom: 8 },
});
