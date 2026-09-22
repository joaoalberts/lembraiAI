import { Platform, Share } from 'react-native';
import { repeatLabel, type Reminder } from '../data/reminders';
import { formatDate } from './format';
import { gerarImagemNaWeb, compartilharNoExpo } from './compartilhar-imagem';

export type ResultadoDoCompartilhar = 'compartilhado' | 'copiado' | 'cancelado' | 'indisponivel';

/** O que chega para quem recebe: só o que o lembrete diz, sem emoji (muda de aparelho para aparelho). */
export function textoDoLembrete(r: Reminder): string {
  const linhas = [r.title, `${formatDate(r.dateISO)} às ${r.time}`];
  if (r.kind === 'local' && r.place) linhas.push(`Local: ${r.place}${r.radius ? ` (raio de ${r.radius} m)` : ''}`);
  if (r.repeat !== 'never') linhas.push(`Repete: ${repeatLabel(r.repeat)}`);
  linhas.push('', 'Criado no LembreiAi');
  return linhas.join('\n');
}

/** Web: a folha de compartilhamento do navegador quando existe; senão copia o texto. Fechar a folha não é erro. */
export async function compartilharNaWeb(
  r: Reminder,
  nav: Pick<Navigator, 'share' | 'clipboard'> | undefined = typeof navigator === 'undefined' ? undefined : navigator,
): Promise<ResultadoDoCompartilhar> {
  // Tenta compartilhar a imagem primeiro
  const imagem = await gerarImagemNaWeb(r);
  if (imagem && nav?.share) {
    try {
      await nav.share({ files: [imagem], title: r.title });
      return 'compartilhado';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelado';
      // Falha ao compartilhar a imagem: tenta o texto como fallback
    }
  }

  // Fallback: compartilha o texto
  const texto = textoDoLembrete(r);
  if (nav?.share) {
    try {
      await nav.share({ title: r.title, text: texto });
      return 'compartilhado';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelado';
      // qualquer outra falha do compartilhamento: tenta copiar
    }
  }
  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(texto);
      return 'copiado';
    } catch {
      // sem permissão para a área de transferência: cai em "indisponível"
    }
  }
  return 'indisponivel';
}

/** iOS e Android: a folha de compartilhamento do sistema. */
export async function compartilharNoCelular(r: Reminder): Promise<ResultadoDoCompartilhar> {
  const resposta = await Share.share({ message: textoDoLembrete(r), title: r.title });
  return resposta.action === Share.dismissedAction ? 'cancelado' : 'compartilhado';
}

export const compartilhar = (r: Reminder): Promise<ResultadoDoCompartilhar> =>
  Platform.OS === 'web' ? compartilharNaWeb(r) : compartilharNoCelular(r);

/** iOS e Android: tenta compartilhar a imagem do cartão; fallback para texto se falhar. */
export async function compartilharNoCelularComImagem(
  r: Reminder,
  cartaoRef: { current: any },
): Promise<ResultadoDoCompartilhar> {
  // Tenta compartilhar a imagem primeiro
  const imagemResultado = await compartilharNoExpo(r, cartaoRef);
  if (imagemResultado === 'compartilhado') return 'compartilhado';
  if (imagemResultado === 'cancelado') return 'cancelado';

  // Fallback: compartilha o texto se a imagem falhar
  return compartilharNoCelular(r);
}
