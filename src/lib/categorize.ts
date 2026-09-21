import type { Category, IconKey } from '../data/reminders';
import { fold } from './format';

export interface Detected { name: string; category: Category; icon: IconKey }
interface Rule extends Detected { stems: string[] }

/**
 * Categoria (ícone + cor) de um lembrete, detectada pela DESCRIÇÃO. Cada radical casa com o início de uma palavra
 * (sem acento, minúsculas): "remedi" pega remédio, remédios, remedinho… Com "=" a palavra tem de ser exatamente aquela
 * ("=casa" não pega "casamento").
 *
 * Vence a categoria com mais radicais distintos na descrição; empate = a ordem desta lista. Por isso Saúde vem antes de
 * Compras: em "Tomar remédio no shopping" o remédio é a ação e o shopping é só o lugar.
 * As cores são as 5 já existentes no design system (algumas categorias compartilham cor; o ícone as diferencia).
 */
const RULES: Rule[] = [
  { name: 'Saúde', category: 'blue', icon: 'pill', stems: [
    'remedi', 'medic', 'comprimid', 'vitamin', 'antibiotic', '=dose', '=doses', 'consulta', 'dentist', 'exame', 'farmaci',
    'hospital', 'vacin', 'saude', 'terapia', 'psicolog', 'fisioterap', 'pressao', 'glicemia', 'curativo', 'cirurgia',
    'tratamento', 'injecao', 'colirio', 'pomada', 'xarope', 'analgesic', 'checkup', 'cardio', 'dermato', 'pediatra',
    'ginecolog', 'nutricion', 'oftalmo', 'ortoped'] },
  { name: 'Exercício', category: 'orange', icon: 'dumbbell', stems: [
    'correr', 'corrida', 'corrend', 'caminhad', 'caminhar', 'academia', 'trein', 'muscul', 'pilates', 'yoga', 'ioga', 'natacao',
    'nadar', 'bike', 'bicicleta', 'pedal', 'futebol', 'esporte', 'exercicio', 'alongam', 'crossfit', 'spinning', 'maratona',
    'zumba', 'volei', 'basquete', 'boxe', 'jiu', 'surf'] },
  { name: 'Reunião / pessoas', category: 'purple', icon: 'users', stems: [
    'reuni', 'encontro', 'equipe', 'cliente', 'fornecedor', 'entrevista', 'apresentacao', 'videochamada', '=call', '=meet',
    'meeting', 'alinhamento', 'diretoria', 'aniversario', 'festa', 'amigo', 'familia', 'churrasco', 'happy'] },
  { name: 'Trabalho', category: 'purple', icon: 'briefcase', stems: [
    'trabalh', 'projeto', 'relatorio', 'escritorio', 'expediente', '=prazo', 'entreg', 'chefe', 'empresa', 'planilha',
    'contrato', 'proposta', 'sprint', 'deploy', 'emprego', 'curriculo'] },
  { name: 'Finanças', category: 'green', icon: 'card', stems: [
    'pagar', 'pagamento', 'pague', 'paguei', '=conta', '=contas', 'boleto', 'fatura', 'cartao', '=banco', 'imposto', 'parcela',
    'aluguel', 'transferi', '=pix', 'salario', 'investiment', 'orcamento', 'dinheiro', 'financ', 'mensalidade', 'seguro',
    'emprestimo', 'deposit', 'saque', 'cobranca', 'iptu', 'ipva', 'irpf', 'condominio', '=taxa'] },
  { name: 'Viagem', category: 'pink', icon: 'plane', stems: [
    'viag', 'viaj', '=voo', 'passagem', 'passaporte', 'aeroporto', 'hotel', 'hospedagem', '=mala', '=malas', 'embarque',
    'checkin', 'turismo', 'ferias', 'cruzeiro', 'rodoviaria', '=visto', 'roteiro', 'excursao'] },
  { name: 'Casa', category: 'orange', icon: 'house', stems: [
    '=casa', 'limpar', 'limpeza', 'faxina', 'lavar', 'roupa', 'louca', 'cozinh', '=lixo', 'jardim', 'regar', 'planta',
    'aspirar', 'arrumar', 'mudanca', 'reforma', '=obra', 'encanador', 'eletricista', 'conserto', 'reparo', 'dedetiz',
    'botijao', 'diarista', 'faxineira'] },
  { name: 'Compras', category: 'green', icon: 'cart', stems: [
    'compra', 'compre', 'comprei', 'mercado', 'supermercado', 'feira', 'shopping', '=loja', 'padaria', 'acougue',
    'hortifruti', 'sacolao', 'atacado', 'encomenda', 'presente', '=shop'] },
];

const hit = (word: string, stem: string) => (stem[0] === '=' ? word === stem.slice(1) : word.startsWith(stem));

/**
 * Sem nenhuma palavra reconhecida, o ícone é neutro: pin se o lembrete tem local, sino se é só por horário
 * (nunca o de uma categoria sem relação com a descrição).
 */
export function detectCategory(title: string, local: boolean): Detected {
  const words = fold(title).split(/[^a-z0-9]+/).filter(Boolean);
  let best: Rule | undefined;
  let top = 0;
  for (const rule of RULES) {
    const score = rule.stems.filter((stem) => words.some((w) => hit(w, stem))).length;   // radicais distintos presentes
    if (score > top) { best = rule; top = score; }                                       // empate: fica o 1º da lista
  }
  if (best) return { name: best.name, category: best.category, icon: best.icon };
  return local ? { name: 'Local (neutro)', category: 'green', icon: 'pin' } : { name: 'Geral (neutro)', category: 'blue', icon: 'bell' };
}
