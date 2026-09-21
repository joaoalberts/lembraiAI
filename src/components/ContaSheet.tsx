import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '../design/tokens';
import { validarConfirmacao, validarSenha } from '../lib/validacao';
import { useAuth } from '../state/auth';
import { Banner } from './Banner';
import { Button } from './Button';
import { LinhaDeMenu, estiloDaListaDeLinhas } from './LinhaDeMenu';
import { LinkButton } from './LinkButton';
import { Sheet } from './Sheet';
import { TextField } from './TextField';

type Etapa = 'menu' | 'senha' | 'trocada';
interface Erros {
  atual?: string;
  nova?: string;
  confirmacao?: string;
}

interface ContaSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Folha "Minha conta" (imagem 05; abre no botão redondo de conta do cabeçalho), em três etapas na mesma folha: o menu (Alterar
 * senha e Sair), a troca de senha (senha atual, nova e confirmação) e "Senha alterada". Ao fechar, de qualquer jeito, ela
 * volta ao menu e esquece o que foi digitado. Sair só encerra a sessão: quem leva para a tela de entrada é a proteção de
 * rotas do layout raiz. Padrão: docs/DESIGN_SYSTEM.md, seção 11.13.
 */
export function ContaSheet({ visible, onClose }: ContaSheetProps) {
  const { user, nome, sair, trocarSenha } = useAuth();
  const [etapa, setEtapa] = useState<Etapa>('menu');
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);
  // Muda a cada fechamento: a resposta de uma troca de antes não vale para a folha que abrir depois
  const rodada = useRef(0);

  const recomecar = () => {
    rodada.current += 1;
    setEtapa('menu');
    setAtual('');
    setNova('');
    setConfirmacao('');
    setErros({});
    setErroGeral('');
    setSalvando(false);
  };
  const fechar = () => {
    recomecar();
    onClose();
  };
  const sairDaConta = async () => {
    await sair();
    fechar();
  };
  const voltarAoMenu = () => {
    setErros({});
    setErroGeral('');
    setEtapa('menu');
  };
  /** Digitar num campo apaga só o aviso dele. */
  const digitando = (campo: keyof Erros, definir: (texto: string) => void) => (texto: string) => {
    definir(texto);
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const salvar = async () => {
    const achados: Erros = {
      atual: atual === '' ? 'Informe sua senha atual.' : undefined,
      nova: validarSenha(nova) ?? undefined,
      confirmacao: validarConfirmacao(nova, confirmacao) ?? undefined,
    };
    if (achados.atual || achados.nova || achados.confirmacao) {
      setErros(achados);
      return;
    }
    const minha = rodada.current;
    setSalvando(true);
    setErroGeral('');
    const erro = await trocarSenha(atual, nova);
    if (minha !== rodada.current) return; // a folha foi fechada no meio: a resposta é de outra abertura
    setSalvando(false);
    if (erro) setErroGeral(erro);
    else setEtapa('trocada');
  };

  const titulo = etapa === 'menu' ? nome || 'Minha conta' : etapa === 'senha' ? 'Alterar senha' : 'Senha alterada';
  const subtitulo =
    etapa === 'menu' ? user?.email || undefined : etapa === 'senha' ? 'Confirme a senha atual e escolha a nova.' : 'Use a nova senha da próxima vez que entrar.';

  return (
    <Sheet visible={visible} onClose={fechar} title={titulo} subtitle={subtitulo}>
      {etapa === 'menu' ? (
        <View style={styles.lista}>
          <LinhaDeMenu icon="key-round" label="Alterar senha" descricao="Pede a senha atual antes de trocar." primeira onPress={() => setEtapa('senha')} />
          <LinhaDeMenu icon="log-out" label="Sair" descricao="Encerra a sessão neste aparelho." perigo onPress={() => void sairDaConta()} />
        </View>
      ) : null}

      {etapa === 'senha' ? (
        <View>
          {erroGeral !== '' ? <Banner variant="error" icon="triangle-alert" style={styles.aviso}>{erroGeral}</Banner> : null}
          <TextField
            label="Senha atual"
            placeholder="Sua senha de hoje"
            secureTextEntry
            autoComplete="current-password"
            value={atual}
            onChangeText={digitando('atual', setAtual)}
            error={erros.atual}
            editable={!salvando}
          />
          <TextField
            label="Nova senha"
            placeholder="Crie uma senha"
            hint="Pelo menos 8 caracteres, com letras e números."
            secureTextEntry
            autoComplete="new-password"
            value={nova}
            onChangeText={digitando('nova', setNova)}
            error={erros.nova}
            editable={!salvando}
          />
          <TextField
            label="Confirmar nova senha"
            placeholder="Repita a senha"
            secureTextEntry
            autoComplete="new-password"
            value={confirmacao}
            onChangeText={digitando('confirmacao', setConfirmacao)}
            error={erros.confirmacao}
            editable={!salvando}
          />
          <Button label={salvando ? 'Salvando…' : 'Salvar nova senha'} onPress={() => void salvar()} disabled={salvando} style={styles.principal} />
          <View style={styles.voltar}>
            <LinkButton label="Voltar" onPress={voltarAoMenu} />
          </View>
        </View>
      ) : null}

      {etapa === 'trocada' ? (
        <View>
          <Banner variant="success" icon="circle-check" style={styles.aviso}>Pronto, sua senha foi trocada.</Banner>
          <Button variant="secondary" label="Fechar" onPress={fechar} style={styles.principal} />
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  lista: estiloDaListaDeLinhas,
  aviso: { marginTop: space.md },
  principal: { marginTop: space.lg },
  voltar: { marginTop: space.md },
});
