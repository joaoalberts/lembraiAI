import { Image } from 'expo-image';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotaoDeAcao } from '../../src/components/BotaoDeAcao';
import { Button } from '../../src/components/Button';
import { CartaoDeResumo } from '../../src/components/CartaoDeResumo';
import { ConfirmSheet } from '../../src/components/ConfirmSheet';
import { DicaInteligente } from '../../src/components/DicaInteligente';
import { GlassButton } from '../../src/components/GlassButton';
import { LinkButton } from '../../src/components/LinkButton';
import { Subida } from '../../src/components/Subida';
import { SucessoHeroi } from '../../src/components/SucessoHeroi';
import { HEROI } from '../../src/design/heroi';
import { colors, fontSize, lineHeight, motion, size, space, textStyles, fontFamily } from '../../src/design/tokens';
import { compartilhar } from '../../src/lib/compartilhar';
import { useReminders } from '../../src/state/reminders';

const FUNDO = require('../../assets/art/bg-success.jpg');

type Retorno = 'copiado' | 'indisponivel';
const ROTULO_DO_COMPARTILHAR: Record<Retorno | 'normal', string> = { normal: 'Compartilhar', copiado: 'Copiado', indisponivel: 'Indisponível' };

/**
 * Lembrete criado (`/sucesso?id=…`, imagem 09; padrão: docs/DESIGN_SYSTEM.md, seção 11.12). Só existe enquanto a aba está em
 * foco: as abas ficam montadas, e o herói (com pulso infinito) não deve rodar escondido; chegar de novo repete a animação.
 */
export default function SucessoScreen() {
  return useIsFocused() ? <Sucesso /> : null;
}

function Sucesso() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { reminders, carregando, remove } = useReminders();
  const { top, bottom } = useSafeAreaInsets();
  const [excluindo, setExcluindo] = useState(false);
  const [saiu, setSaiu] = useState(false);
  const [retorno, setRetorno] = useState<Retorno | null>(null);
  const lembrete = reminders.find((r) => r.id === id);

  // a resposta do "Compartilhar" (copiou, não deu) ocupa o lugar do rótulo por um instante
  useEffect(() => {
    if (retorno === null) return undefined;
    const espera = setTimeout(() => setRetorno(null), motion.duration.aviso);
    return () => clearTimeout(espera);
  }, [retorno]);

  // depois de excluir, a tela não mostra nada até sair (senão piscaria "não existe mais" por um quadro)
  if (saiu) return null;

  if (!lembrete) {
    return (
      <View style={styles.aviso}>
        {carregando ? (
          <ActivityIndicator size="large" color={colors.spinner} />
        ) : (
          <>
            <Text style={styles.avisoTexto}>Esse lembrete não existe mais.</Text>
            <Button label="Ver todos os lembretes" onPress={() => router.navigate('/')} />
          </>
        )}
      </View>
    );
  }

  const irParaLista = () => router.navigate('/');
  const criarOutro = () => router.navigate('/novo');
  const editar = () => router.navigate({ pathname: '/editar', params: { id: lembrete.id } });
  const confirmarExclusao = () => {
    setExcluindo(false);
    setSaiu(true);
    void remove(lembrete.id);
    irParaLista();
  };
  const compartilharLembrete = async () => {
    try {
      const resultado = await compartilhar(lembrete);
      if (resultado === 'copiado' || resultado === 'indisponivel') setRetorno(resultado);
    } catch {
      setRetorno('indisponivel');
    }
  };
  // com entalhe ou ilha dinâmica tudo desce o que a barra de status passar da distância do botão de fechar
  const descido = Math.max(0, top - size.sucesso.fecharTop);

  return (
    <View style={styles.tela}>
      <Image source={FUNDO} contentFit="cover" contentPosition="top" accessible={false} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.canvas}>
        <View testID="sucesso-topo" style={[styles.topo, { top: descido }]}>
          <SucessoHeroi />
          <View style={styles.fechar}>
            <GlassButton icon="x" label="Fechar" tamanho="fechar" onPress={irParaLista} />
          </View>
        </View>

        <View style={{ paddingTop: size.sucesso.tituloTop + descido }}>
          <Subida janela={HEROI.subida.titulo} style={styles.tituloBox}>
            <Text accessibilityRole="header" style={styles.titulo}>{'Lembrete criado\ncom sucesso!'}</Text>
          </Subida>
          <Subida janela={HEROI.subida.subtitulo} style={styles.subtituloBox}>
            <Text style={styles.subtitulo}>{'Você será avisado na hora certa.\nPode ficar tranquilo.'}</Text>
          </Subida>
        </View>

        <View style={styles.reservaDoResumo}>
          <CartaoDeResumo lembrete={lembrete} />
        </View>

        <View style={styles.acoes}>
          <BotaoDeAcao icon="pencil" label="Editar" onPress={editar} />
          <BotaoDeAcao icon="trash" label="Excluir" onPress={() => setExcluindo(true)} />
          <BotaoDeAcao icon="share" label={ROTULO_DO_COMPARTILHAR[retorno ?? 'normal']} onPress={compartilharLembrete} />
        </View>

        <View style={styles.dica}>
          <DicaInteligente onPress={criarOutro} />
        </View>

        <View style={styles.cta}>
          <Button variant="secondary" label="Ver todos os lembretes" iconEnd="arrow-right" onPress={irParaLista} style={styles.ctaBotao} />
        </View>

        <View style={[styles.link, { paddingBottom: size.sucesso.espaco.fim + bottom }]}>
          <LinkButton label="Criar outro lembrete" onPress={criarOutro} />
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={excluindo}
        title="Excluir lembrete?"
        message={`“${lembrete.title}” será removido e você não receberá mais esse aviso.`}
        confirmLabel="Excluir lembrete"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg.page },
  // rola por cima do fundo, que fica parado; em tela mais alta que o desenho o canvas cresce até o fim
  canvas: { flexGrow: 1, minHeight: size.sucesso.canvas },
  topo: { position: 'absolute', left: 0, right: 0 },
  fechar: { position: 'absolute', top: size.sucesso.fecharTop, right: size.sucesso.fecharSide },
  // altura reservada: o texto de duas linhas e a folga mudam de fonte para fonte, e as posições de baixo não se mexem
  tituloBox: { height: size.sucesso.tituloBox },
  titulo: { fontFamily: fontFamily.serif, fontSize: fontSize.sucessoTitulo, lineHeight: lineHeight.sucessoTitulo, color: colors.text.primary, textAlign: 'center' },
  subtituloBox: { height: size.sucesso.subtituloBox, marginTop: size.sucesso.subtituloGap },
  subtitulo: { ...textStyles.sucessoSubtitulo, color: colors.text.secondary, textAlign: 'center' },
  reservaDoResumo: { minHeight: size.sucesso.resumo.slot, marginTop: size.sucesso.resumoGap, paddingHorizontal: size.sucesso.side },
  acoes: { flexDirection: 'row', gap: size.sucesso.acao.gap, marginTop: size.sucesso.espaco.acoes, paddingHorizontal: size.sucesso.acao.side },
  dica: { marginTop: size.sucesso.espaco.dica, paddingHorizontal: size.sucesso.side },
  cta: { marginTop: size.sucesso.espaco.cta, paddingHorizontal: size.sucesso.ctaSide },
  ctaBotao: { minHeight: size.sucesso.cta },
  link: { marginTop: size.sucesso.espaco.link },
  aviso: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl, backgroundColor: colors.bg.page },
  avisoTexto: { ...textStyles.bodyLg, color: colors.text.secondary, textAlign: 'center' },
});
