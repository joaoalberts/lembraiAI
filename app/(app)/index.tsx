import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppBrand } from '../../src/components/AppBrand';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { ConfirmSheet } from '../../src/components/ConfirmSheet';
import { ContaSheet } from '../../src/components/ContaSheet';
import { GlassButton } from '../../src/components/GlassButton';
import { GreenHeader, folhaSobreOCabecalho } from '../../src/components/GreenHeader';
import { ReminderCard } from '../../src/components/ReminderCard';
import { ReminderMenu } from '../../src/components/ReminderMenu';
import { SearchField } from '../../src/components/SearchField';
import { TipCard } from '../../src/components/TipCard';
import type { Reminder } from '../../src/data/reminders';
import { colors, radius, size, space, textStyles } from '../../src/design/tokens';
import { FILTROS, agruparPorSecao, contagensDosFiltros, dataDaSecao, lembretesVisiveis, textoDeAtivos, type FiltroDaLista } from '../../src/lib/lista';
import { useGeofences } from '../../src/state/geofences';
import { useReminders } from '../../src/state/reminders';

export default function LembretesScreen() {
  const { reminders, carregando, erro, recarregar, toggle, remove } = useReminders();
  const { insideIds } = useGeofences();
  const [buscando, setBuscando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroDaLista>('todos');
  const [menu, setMenu] = useState<Reminder | null>(null);
  const [aExcluir, setAExcluir] = useState<Reminder | null>(null);
  const [contaAberta, setContaAberta] = useState(false);

  const contagens = useMemo(() => contagensDosFiltros(reminders, busca), [reminders, busca]);
  const grupos = useMemo(() => agruparPorSecao(lembretesVisiveis(reminders, busca, filtro)), [reminders, busca, filtro]);
  const buscaAtiva = busca.trim() !== '';

  // Fechar a busca zera o texto e mantém o filtro escolhido; abrir e fechar não mexe no filtro
  const alternarBusca = useCallback(() => {
    setBuscando((aberta) => !aberta);
    setBusca('');
  }, []);

  const editar = () => {
    if (menu) router.navigate({ pathname: '/editar', params: { id: menu.id } });
    setMenu(null);
  };
  const pedirExclusao = () => {
    setAExcluir(menu);
    setMenu(null);
  };
  const confirmarExclusao = () => {
    if (aExcluir) void remove(aExcluir.id);
    setAExcluir(null);
  };

  return (
    <View style={styles.tela}>
      <GreenHeader>
        <View style={styles.topo}>
          {buscando ? (
            <View style={styles.campo}>
              <SearchField value={busca} onChangeText={setBusca} onClose={alternarBusca} />
            </View>
          ) : (
            <AppBrand />
          )}
          <View style={styles.botoes}>
            <GlassButton icon={buscando ? 'x' : 'search'} label={buscando ? 'Fechar busca' : 'Buscar'} onPress={alternarBusca} />
            <GlassButton icon="user-round" label="Minha conta" onPress={() => setContaAberta(true)} />
          </View>
        </View>
        <View style={styles.titulos}>
          <View style={styles.textos}>
            <Text accessibilityRole="header" style={styles.titulo}>Meus lembretes</Text>
            <Text style={styles.subtitulo}>{textoDeAtivos(reminders)}</Text>
          </View>
          <Button compact icon="plus" label="Novo lembrete" onPress={() => router.navigate('/novo')} />
        </View>
      </GreenHeader>

      <View style={styles.folha}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRolagem} contentContainerStyle={styles.chips}>
          {FILTROS.map(({ chave, rotulo }) => (
            <Chip key={chave} label={rotulo} count={contagens[chave]} selected={filtro === chave} onPress={() => setFiltro(chave)} style={styles.chip} />
          ))}
        </ScrollView>

        <ScrollView
          style={styles.rolagem}
          contentContainerStyle={styles.conteudo}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} />}
          keyboardShouldPersistTaps="handled"
        >
          {erro && (
            <View style={styles.erro}>
              <Banner variant="error">{erro}</Banner>
              <Button label="Tentar novamente" onPress={recarregar} variant="ghost" />
            </View>
          )}

          {insideIds.length > 0 && (
            <Banner variant="info" style={styles.aviso}>
              Você está dentro do raio de {insideIds.length} lembrete{insideIds.length !== 1 ? 's' : ''}
            </Banner>
          )}

          {grupos.map(({ secao, itens }, i) => (
            <View key={secao} style={i > 0 ? styles.secaoSeguinte : null}>
              <View style={[styles.cabecalhoDaSecao, i === 0 ? styles.primeiraSecao : null]}>
                <Text accessibilityRole="header" style={styles.secao}>{secao}</Text>
                {dataDaSecao(secao) ? <Text style={styles.dataDaSecao}>{dataDaSecao(secao)}</Text> : null}
              </View>
              <View style={styles.cartoes}>
                {itens.map((r) => (
                  <ReminderCard key={r.id} reminder={r} nearby={insideIds.includes(r.id)} onToggle={() => void toggle(r.id)} onMenu={() => setMenu(r)} />
                ))}
              </View>
            </View>
          ))}

          {carregando && reminders.length === 0 && <Text style={styles.carregandoTexto}>Carregando seus lembretes…</Text>}

          {!carregando && !erro && reminders.length === 0 && (
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>Nenhum lembrete ainda</Text>
              <Text style={styles.vazioTexto}>Crie o primeiro e escolha se ele avisa por horário ou ao chegar num lugar.</Text>
              <Button compact icon="plus" label="Novo lembrete" onPress={() => router.navigate('/novo')} />
            </View>
          )}

          {reminders.length > 0 && grupos.length === 0 && buscaAtiva && (
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>Nenhum resultado para “{busca.trim()}”</Text>
              <Text style={styles.vazioTexto}>Confira a grafia ou busque por outro nome ou local.</Text>
            </View>
          )}

          {reminders.length > 0 && !buscaAtiva && (
            <View style={styles.dica}>
              <TipCard title="Dica para você" text={'Ative lembretes por local para nunca mais esquecer das suas tarefas fora de casa.'} />
            </View>
          )}
        </ScrollView>
      </View>

      <ReminderMenu reminder={menu} onClose={() => setMenu(null)} onEdit={editar} onDelete={pedirExclusao} />
      <ContaSheet visible={contaAberta} onClose={() => setContaAberta(false)} />
      <ConfirmSheet
        visible={aExcluir !== null}
        title="Excluir lembrete?"
        message={`“${aExcluir?.title ?? ''}” será removido e você não receberá mais esse aviso.`}
        confirmLabel="Excluir lembrete"
        onConfirm={confirmarExclusao}
        onCancel={() => setAExcluir(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg.page },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  campo: { flex: 1, marginRight: space.md },
  botoes: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  titulos: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, marginTop: space.sm },
  textos: { flexShrink: 1 },
  titulo: { ...textStyles.display, color: colors.text.onDarkWarm },
  subtitulo: { ...textStyles.body, color: colors.text.onHeader },
  // a folha clara sobe sobre a parte de baixo do cabeçalho
  folha: folhaSobreOCabecalho,
  chipsRolagem: { flexGrow: 0, paddingTop: size.list.chipsTop },
  chips: { flexGrow: 1, gap: size.list.chipsGap, paddingHorizontal: size.header.side },
  chip: { flexGrow: 1 },
  rolagem: { flex: 1 },
  conteudo: { paddingTop: size.list.listTop, paddingHorizontal: size.header.side, paddingBottom: space.huge },
  erro: { gap: space.sm, marginBottom: space.lg },
  aviso: { marginBottom: space.lg },
  carregandoTexto: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center', paddingVertical: space.xl },
  cabecalhoDaSecao: { minHeight: size.list.sectionHead, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primeiraSecao: { marginBottom: size.list.firstHeadGap - size.list.headGap },
  secaoSeguinte: { marginTop: size.list.sectionGap },
  secao: { ...textStyles.heading, color: colors.text.primary },
  dataDaSecao: { ...textStyles.micro, color: colors.text.secondary },
  cartoes: { gap: size.list.cardGap, marginTop: size.list.headGap },
  dica: { marginTop: size.list.tipGap },
  vazio: { alignItems: 'center', gap: space.sm, paddingTop: size.list.emptyTop, paddingHorizontal: space.xl },
  vazioTitulo: { ...textStyles.title, color: colors.text.primary, textAlign: 'center' },
  vazioTexto: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center', marginBottom: space.md },
});
