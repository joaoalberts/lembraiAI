import fs from 'fs';
import path from 'path';
import { CAMINHOS_DE_TOKEN, aplicarBlocos, blocosGerados, descricaoDoToken, tokensCitadosNoTexto } from '../doc';

const DOC = path.join(__dirname, '../../../docs/DESIGN_SYSTEM.md');
const atualizar = process.env.UPDATE_DESIGN_DOC === '1';

/** Seções que o documento é obrigado a manter (a lista pedida para o Design System). */
const SECOES = [
  'Paleta de cores', 'Tipografia', 'Espaçamento', 'Bordas e arredondamentos', 'Sombras', 'Ícones', 'Botões e seus estados',
  'Campos e formulários', 'Cards, modais, menus e navegação', 'Imagens e ilustrações', 'Animações e transições',
  'Responsividade', 'Estados de carregamento, vazio, sucesso e erro', 'Acessibilidade e contraste',
];

describe('docs/DESIGN_SYSTEM.md', () => {
  const texto = () => fs.readFileSync(DOC, 'utf8');

  it('existe', () => {
    expect(fs.existsSync(DOC)).toBe(true);
  });

  it('as tabelas geradas batem com os tokens do código (rode `npm run design:docs` para atualizar)', () => {
    const atual = texto();
    const esperado = aplicarBlocos(atual, blocosGerados());
    if (atual !== esperado && atualizar) fs.writeFileSync(DOC, esperado);
    else expect(atual).toBe(esperado);
  });

  it('tem um marcador para cada tabela gerada (nenhum bloco fica de fora do documento)', () => {
    const t = texto();
    const faltando = Object.keys(blocosGerados()).filter((id) => !t.includes(`<!-- tokens:${id}:inicio -->`) || !t.includes(`<!-- tokens:${id}:fim -->`));
    expect(faltando).toEqual([]);
  });

  it('todo token tem uma descrição de uso (adicionou um token? descreva-o em src/design/doc.ts)', () => {
    const sem = CAMINHOS_DE_TOKEN.filter((c) => !descricaoDoToken(c));
    expect(sem).toEqual([]);
  });

  it('todo token citado no texto do documento existe no código', () => {
    const inexistentes = tokensCitadosNoTexto(texto()).filter((c) => !CAMINHOS_DE_TOKEN.includes(c) && !CAMINHOS_DE_TOKEN.some((t) => t.startsWith(`${c}.`)));
    expect(inexistentes).toEqual([]);
  });

  it.each(SECOES)('mantém a seção "%s"', (secao) => {
    expect(texto()).toMatch(new RegExp(`^#{2,3} .*${secao.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'));
  });

  it('registra as decisões visuais com data (histórico de por que cada valor foi escolhido)', () => {
    expect(texto()).toMatch(/^## (\d+\. )?Registro de decisões/m);
    expect(texto()).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
