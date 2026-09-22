import { router } from 'expo-router';
import { useEffect, useSyncExternalStore, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppBrand } from '../../src/components/AppBrand';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { CartaoDeConfig, DadoDoCartao, ItemDeLimite } from '../../src/components/CartaoDeConfig';
import { GreenHeader, folhaSobreOCabecalho } from '../../src/components/GreenHeader';
import { Toggle } from '../../src/components/Toggle';
import { colors, motion, size, space, textStyles } from '../../src/design/tokens';
import { confirmar } from '../../src/lib/confirm';
import { formatDistance } from '../../src/lib/geo';
import { quandoFoi } from '../../src/lib/quando';
import { installStore, isInstalled, isIOS, promptInstall } from '../../src/lib/pwa';
import { useAuth } from '../../src/state/auth';
import { useGeo } from '../../src/state/geo';
import { useGeofences } from '../../src/state/geofences';
import { useNotifications } from '../../src/state/notifications';

/**
 * Configurações (imagem 08; padrão: docs/DESIGN_SYSTEM.md, seção 11.14): a conta, o monitoramento de lugares com o que o
 * aparelho está lendo, as notificações e os limites do monitoramento, mais o que as lojas exigem (política de privacidade e
 * excluir a conta) e as últimas chegadas. Os textos de estado ("permitida", "há 30s") saem do que o app realmente sabe.
 */
export default function ConfigScreen() {
  const { user, nome, sair, excluirConta } = useAuth();
  const { monitoring, setMonitoring, permissionGranted: geoOk, position, error: geoError } = useGeo();
  const { supported, modo, permissionGranted: notifOk, scheduledCount, permissaoDoNavegador, requestPermission } = useNotifications();
  const soComAppAberto = modo === 'so-com-o-app-aberto';
  const { fences, insideIds, nearest, arrivals, segundoPlano } = useGeofences();
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');
  // o "há N s" acompanha o relógio: a tela se atualiza sozinha
  const [agora, setAgora] = useState(() => Date.now());
  const instalavel = useSyncExternalStore(installStore.subscribe, installStore.get);
  const [instalado, setInstalado] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    try { return isInstalled(); } catch { return false; }
  });

  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), motion.duration.relogio);
    return () => clearInterval(relogio);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setInterval(() => setInstalado(isInstalled()), 15_000);
    return () => clearInterval(timer);
  }, []);

  const excluir = async () => {
    const certeza = await confirmar(
      'Excluir sua conta?',
      'Sua conta e todos os seus lembretes serão apagados para sempre. Isso não pode ser desfeito.',
      'Excluir conta',
    );
    if (!certeza) return;
    setExcluindo(true);
    setErroExcluir('');
    const erro = await excluirConta();
    setExcluindo(false);
    // sucesso: a sessão some e o layout raiz leva à tela de entrar
    if (erro) setErroExcluir(erro);
  };

  const instalar = async () => {
    if (await promptInstall()) setInstalado(true);
  };

  return (
    <View style={styles.tela}>
      <GreenHeader>
        <AppBrand />
        <View style={styles.titulos}>
          <Text accessibilityRole="header" style={styles.titulo}>Configurações</Text>
          <Text style={styles.subtitulo}>Permissões e monitoramento.</Text>
        </View>
      </GreenHeader>

      <View style={styles.folha}>
        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          <CartaoDeConfig
            icon="user-round"
            titulo={nome || 'Minha conta'}
            subtitulo={user?.email || undefined}
            acao={<Button compact variant="secondary" label="Sair" onPress={() => void sair()} disabled={excluindo} />}
          />

          <CartaoDeConfig
            icon="map-pin"
            titulo="Lembretes por local"
            subtitulo="Avisa quando você entra no raio de um lembrete."
            acao={<Toggle variant="form" value={monitoring} onValueChange={(ligado) => void setMonitoring(ligado)} accessibilityLabel="Monitorar lembretes por local" />}
          >
            {geoError ? <Banner variant="error" icon="triangle-alert">{geoError}</Banner> : null}
            <View style={styles.dados}>
              <DadoDoCartao rotulo="Permissão de localização" valor={geoOk ? 'permitida' : 'não permitida'} />
              <DadoDoCartao rotulo="Lembretes monitorados" valor={String(fences.length)} />
              {monitoring ? <DadoDoCartao rotulo="Dentro do raio agora" valor={String(insideIds.length)} /> : null}
              <DadoDoCartao rotulo="Última posição" valor={monitoring ? quandoFoi(position?.at, agora) : '—'} />
              <DadoDoCartao rotulo="Precisão do sinal" valor={monitoring && position?.accuracy != null ? `± ${Math.round(position.accuracy)} m` : '—'} />
              {monitoring && nearest ? <DadoDoCartao rotulo="Mais próximo" valor={`${nearest.fence.title} · ${formatDistance(nearest.meters)}`} /> : null}
            </View>
            {arrivals[0] ? <Banner variant="info" icon="info">{`Último aviso: ${arrivals[0].title} (${quandoFoi(arrivals[0].at, agora)}).`}</Banner> : null}
            {segundoPlano.estado === 'ativo' ? (
              <>
                <Text style={styles.nota}>Com o app fechado: ativo. O sistema do aparelho avisa quando você chega.</Text>
                <Text style={styles.nota}>O aviso costuma levar alguns minutos para chegar depois que você entra no raio, e o raio mínimo é de 100 m com o app fechado.</Text>
              </>
            ) : null}
            {segundoPlano.estado === 'sem-permissao' && segundoPlano.permissao !== 'negada' ? (
              <>
                <Text style={styles.nota}>Para avisar com o app fechado, permita a localização "o tempo todo" (no iPhone, "Sempre").</Text>
                <Button compact variant="secondary" label="Permitir localização o tempo todo" onPress={() => void segundoPlano.pedirPermissao()} />
              </>
            ) : null}
            {segundoPlano.estado === 'sem-permissao' && segundoPlano.permissao === 'negada' ? (
              <Text style={styles.nota}>A localização "o tempo todo" está bloqueada: libere nos ajustes do aparelho para o aviso funcionar com o app fechado.</Text>
            ) : null}
            {segundoPlano.estado === 'indisponivel' ? (
              <Text style={styles.nota}>
                {soComAppAberto
                  ? 'Na web o aviso de chegada só funciona com o app aberto: o navegador não acompanha a localização com a aba fechada.'
                  : 'No Expo Go o aviso com o app fechado não funciona: precisa do app instalado (build próprio).'}
              </Text>
            ) : null}
            {segundoPlano.estado === 'erro' ? <Text style={styles.nota}>Não foi possível ativar o aviso com o app fechado. Tente reabrir o app.</Text> : null}
          </CartaoDeConfig>

          <CartaoDeConfig
            icon="bell"
            titulo="Notificações"
            subtitulo={!supported ? 'Não estão disponíveis na versão web.' : soComAppAberto ? 'Avisos na tela enquanto o app está aberto.' : `Estado: ${notifOk ? 'permitida' : 'não permitida'}.`}
          >
            {supported && !soComAppAberto && !notifOk ? (
              <Banner variant="error" icon="triangle-alert">As notificações não estão permitidas. Para receber avisos, libere-as nos ajustes do aparelho.</Banner>
            ) : null}
            {soComAppAberto ? (
              <>
                <Banner variant="info" icon="info">No navegador os avisos só chegam com o app aberto: com a aba fechada nada é entregue.</Banner>
                {permissaoDoNavegador === 'concedida' ? <Text style={styles.nota}>Avisos do navegador permitidos.</Text> : null}
                {permissaoDoNavegador === 'negada' ? <Text style={styles.nota}>Os avisos do navegador estão bloqueados para este site: libere nas configurações do site.</Text> : null}
                {permissaoDoNavegador === 'indisponivel' ? (
                  <Text style={styles.nota}>Este navegador não mostra avisos do sistema (no iPhone só com o app instalado na tela de início). Os avisos aparecem na tela do app.</Text>
                ) : null}
                {permissaoDoNavegador === 'pendente' && requestPermission ? (
                  <Button compact variant="secondary" label="Permitir avisos do navegador" onPress={() => void requestPermission()} />
                ) : null}
              </>
            ) : null}
            {supported ? <DadoDoCartao rotulo={soComAppAberto ? 'Avisos por horário nas próximas 24 h' : 'Avisos por horário agendados'} valor={String(scheduledCount)} /> : null}
          </CartaoDeConfig>

          {typeof window !== 'undefined' ? (
            <CartaoDeConfig
              icon={typeof window !== 'undefined' && isIOS() ? 'share' : 'download'}
              titulo="Instalar o app"
              subtitulo={instalado ? 'Instalado na tela de início.' : 'Melhora as notificações e abre em tela cheia.'}
              acao={!instalado && instalavel ? <Button compact variant="secondary" label="Instalar" onPress={() => void instalar()} /> : undefined}
            >
              {!instalado && !instalavel && typeof window !== 'undefined' && isIOS() ? (
                <Banner variant="info" icon="info">
                  No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início". No iOS, as notificações só funcionam com o app instalado assim.
                </Banner>
              ) : null}
            </CartaoDeConfig>
          ) : null}

          <CartaoDeConfig titulo="Até onde vai o monitoramento">
            {segundoPlano.estado === 'ativo' ? (
              <View style={styles.dados}>
                <ItemDeLimite destaque="App aberto:">o aviso chega em segundos.</ItemDeLimite>
                <ItemDeLimite destaque="App minimizado ou fechado:">o sistema do aparelho avisa, em geral em poucos minutos (no Android, de 2 a 6). Se você forçar a parada do app, o sistema desfaz o monitoramento até você abri-lo de novo.</ItemDeLimite>
              </View>
            ) : (
              <View style={styles.dados}>
                <ItemDeLimite destaque="App aberto:">o aviso chega em segundos. É o único cenário garantido.</ItemDeLimite>
                <ItemDeLimite destaque="App aberto e minimizado:">costuma continuar, mas o sistema pode encerrar o app a qualquer momento.</ItemDeLimite>
                <ItemDeLimite destaque="App fechado:">o monitoramento de localização para. Os avisos por horário continuam chegando no celular.</ItemDeLimite>
              </View>
            )}
          </CartaoDeConfig>

          {arrivals.length > 0 ? (
            <CartaoDeConfig titulo="Últimas chegadas">
              <View style={styles.dados}>
                {arrivals.slice(0, 5).map((a, i) => (
                  <DadoDoCartao
                    key={`${a.id}-${a.at}-${i}`}
                    rotulo={a.title}
                    valor={`${new Date(a.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${a.place ? ` · ${a.place}` : ''}`}
                  />
                ))}
              </View>
            </CartaoDeConfig>
          ) : null}

          <CartaoDeConfig
            icon="file-text"
            titulo="Política de privacidade"
            subtitulo="Como seus dados são guardados e apagados."
            acao={<Button compact variant="secondary" label="Abrir" onPress={() => router.push('/privacidade')} />}
          />

          <CartaoDeConfig perigo titulo="Excluir conta" subtitulo="Apaga sua conta e todos os seus lembretes de forma definitiva.">
            {erroExcluir !== '' ? <Banner variant="error" icon="triangle-alert">{erroExcluir}</Banner> : null}
            <Button variant="danger" label={excluindo ? 'Excluindo...' : 'Excluir minha conta'} onPress={() => void excluir()} disabled={excluindo} />
          </CartaoDeConfig>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg.page },
  titulos: { marginTop: space.sm },
  titulo: { ...textStyles.display, color: colors.text.onDarkWarm },
  subtitulo: { ...textStyles.body, color: colors.text.onHeader },
  folha: folhaSobreOCabecalho,
  conteudo: { gap: size.config.cardsGap, paddingTop: size.config.scrollTop, paddingHorizontal: size.config.scrollSide, paddingBottom: size.config.scrollBottom },
  dados: { gap: size.config.rowsGap },
  nota: { ...textStyles.body, color: colors.text.secondary },
});
