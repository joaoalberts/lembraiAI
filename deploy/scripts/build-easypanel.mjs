#!/usr/bin/env node
// Gera dist/docker-compose.easypanel.yml: o modelo easypanel/docker-compose.template.yml com os arquivos-fonte embutidos.
//   node scripts/build-easypanel.mjs          escreve dist/docker-compose.easypanel.yml
//   node scripts/build-easypanel.mjs --check  só confere se o arquivo em dist/ está em dia (código de saída 1 se não)
// O Compose interpola `$VAR` até dentro de `content:`, então todo `$` do conteúdo embutido vira `$$`.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const le = (rel) => readFileSync(join(raiz, rel), 'utf8');

/** Bloco YAML literal: cada linha recebe o recuo; linhas vazias ficam vazias. */
const bloco = (texto, recuo) =>
  texto
    .replace(/\$/g, '$$$$')
    .replace(/\n+$/, '')
    .split('\n')
    .map((linha) => (linha === '' ? '' : recuo + linha))
    .join('\n');

const migrations = readdirSync(join(raiz, 'migrations'))
  .filter((n) => n.endsWith('.sql'))
  .sort();
if (migrations.length === 0) throw new Error('nenhuma migration em deploy/migrations');

const saida = le('easypanel/docker-compose.template.yml')
  .split('\n')
  .flatMap((linha) => {
    const inclusao = linha.match(/^(\s*)@@INCLUDE (\S+)@@\s*$/);
    if (inclusao) return [bloco(le(inclusao[2]), inclusao[1])];
    const configs = linha.match(/^(\s*)@@CONFIGS_MIGRATIONS@@\s*$/);
    if (configs) {
      const [, r] = configs;
      return migrations.map((nome, i) => `${r}mig_${i + 1}:\n${r}  content: |\n${bloco(le(`migrations/${nome}`), `${r}    `)}`);
    }
    const montagens = linha.match(/^(\s*)@@MOUNTS_MIGRATIONS@@\s*$/);
    if (montagens) {
      const [, r] = montagens;
      return migrations.map((nome, i) => `${r}- source: mig_${i + 1}\n${r}  target: /migrations/${nome}`);
    }
    return [linha];
  })
  .join('\n');

if (saida.includes('@@')) throw new Error('sobrou um marcador @@ sem substituir');

const cabecalho =
  '# GERADO por scripts/build-easypanel.mjs. NÃO edite: mude easypanel/docker-compose.template.yml (ou os arquivos-fonte) e gere de novo.\n';
const destino = join(raiz, 'dist', 'docker-compose.easypanel.yml');
const conteudo = cabecalho + saida;

if (process.argv.includes('--check')) {
  let atual = '';
  try { atual = readFileSync(destino, 'utf8'); } catch { /* ainda não existe */ }
  if (atual !== conteudo) { console.error('dist/docker-compose.easypanel.yml está desatualizado: rode node scripts/build-easypanel.mjs'); process.exit(1); }
  console.log('dist/docker-compose.easypanel.yml em dia.');
} else {
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, conteudo);
  console.log(`gerado: dist/docker-compose.easypanel.yml (${conteudo.length} bytes, ${migrations.length} migrations)`);
}
