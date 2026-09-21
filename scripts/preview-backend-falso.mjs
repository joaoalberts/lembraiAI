#!/usr/bin/env node
// Backend FALSO, só para conferir o visual do app sem conta e sem servidor real.
// Responde o mínimo do GoTrue/PostgREST que as telas usam e devolve lembretes de exemplo. Não guarda nada em disco.
//
//   node scripts/preview-backend-falso.mjs [porta]        (padrão 54399)
//
// 1. Aponte o app para ele num arquivo que o git ignora e reinicie o Expo com `--clear`:
//      EXPO_PUBLIC_SUPABASE_URL=http://localhost:54399
//      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=chave-falsa        (em `.env.development.local`, que vence o `.env.local`)
// 2. Entre sem digitar senha: no console do navegador, com o app aberto,
//      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(await (await fetch('http://localhost:54399/__session')).json()));
//      localStorage.setItem('lembreiai:lembrar-me', '1'); location.reload();
// 3. Troque o que a lista devolve com GET /__mode/full | empty | error | slow (e /__reset volta os exemplos).
//
// APAGUE o `.env.development.local` quando terminar: senão o `expo start` seguinte continua apontando para cá.
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const porta = Number(process.argv[2] ?? 54399);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const agora = () => Math.floor(Date.now() / 1000);

// `.invalid` é um domínio reservado: este e-mail nunca existe de verdade
const USUARIO = {
  id: '11111111-1111-4111-8111-111111111111',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'exemplo@lembreiai.invalid',
  app_metadata: {},
  user_metadata: { name: 'Ana Exemplo' },
  created_at: new Date().toISOString(),
};

function sessao() {
  const exp = agora() + 365 * 24 * 3600;
  const cabecalho = b64({ alg: 'none', typ: 'JWT' });
  const corpo = b64({ sub: USUARIO.id, role: 'authenticated', aud: 'authenticated', exp });
  return {
    access_token: `${cabecalho}.${corpo}.falso`,
    token_type: 'bearer',
    expires_in: 365 * 24 * 3600,
    expires_at: exp,
    refresh_token: 'falso',
    user: USUARIO,
  };
}

const iso = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const linha = (o) => ({ id: randomUUID(), user_id: USUARIO.id, place: null, lat: null, lng: null, radius: null, repeat: 'never', active: true, ...o });

const exemplos = () => [
  linha({ title: 'Comprar água no mercado', kind: 'local', category: 'green', icon: 'cart', place: 'Supermercado Frangolândia', lat: -3.7566, lng: -38.4891, radius: 150, remind_date: iso(0), remind_time: '09:00:00' }),
  linha({ title: 'Academia', kind: 'local', category: 'orange', icon: 'dumbbell', place: 'Smart Fit – Iguatemi', lat: -3.7712, lng: -38.4839, radius: 100, remind_date: iso(0), remind_time: '18:00:00' }),
  linha({ title: 'Tomar vitamina', kind: 'time', category: 'blue', icon: 'pill', remind_date: iso(1), remind_time: '08:00:00', repeat: 'daily' }),
  linha({ title: 'Reunião com fornecedor', kind: 'time', category: 'purple', icon: 'users', remind_date: iso(2), remind_time: '14:00:00' }),
  linha({ title: 'Passaporte – verificar validade', kind: 'time', category: 'pink', icon: 'plane', remind_date: iso(3), remind_time: '10:00:00', active: false }),
];

let modo = 'full';
let linhas = exemplos();

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  'access-control-expose-headers': 'content-range',
  'access-control-max-age': '600',
};

function enviar(res, status, corpo, extra = {}) {
  const texto = corpo === undefined ? '' : JSON.stringify(corpo);
  res.writeHead(status, { ...cors, ...(texto ? { 'content-type': 'application/json' } : {}), ...extra });
  res.end(texto);
}

const idDoFiltro = (url) => (url.searchParams.get('id') ?? '').replace(/^eq\./, '');

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${porta}`);
  const { pathname: p } = url;

  if (req.method === 'OPTIONS') {
    // o navegador pede permissão antes de mandar `authorization`/`apikey`: o `*` não vale para `authorization`, então ecoa
    res.writeHead(204, { ...cors, 'access-control-allow-headers': req.headers['access-control-request-headers'] ?? '*' });
    return res.end();
  }

  let texto = '';
  for await (const pedaco of req) texto += pedaco;
  const json = texto ? JSON.parse(texto) : undefined;
  const umObjeto = (req.headers.accept ?? '').includes('vnd.pgrst.object');
  console.log(`${req.method} ${p}${url.search ? '?…' : ''}  [${modo}]`);

  // controle do próprio servidor
  if (p.startsWith('/__mode/')) { modo = p.slice('/__mode/'.length); if (modo === 'full') linhas = exemplos(); return enviar(res, 200, { modo }); }
  if (p === '/__reset') { modo = 'full'; linhas = exemplos(); return enviar(res, 200, { modo }); }
  if (p === '/__session') return enviar(res, 200, sessao());

  // GoTrue
  if (p === '/auth/v1/user') return enviar(res, 200, USUARIO);
  if (p === '/auth/v1/token') return enviar(res, 200, sessao());
  if (p === '/auth/v1/logout') return enviar(res, 204);
  if (p.startsWith('/auth/v1/')) return enviar(res, 200, {});

  // PostgREST
  if (p === '/rest/v1/profiles') return enviar(res, 200, umObjeto ? { name: USUARIO.user_metadata.name } : [{ name: USUARIO.user_metadata.name }]);
  if (p.startsWith('/rest/v1/rpc/')) return enviar(res, 204);
  if (p === '/rest/v1/reminders') {
    if (req.method === 'GET') {
      if (modo === 'error') return enviar(res, 500, { message: 'erro simulado pelo backend falso' });
      if (modo === 'slow') await new Promise((ok) => setTimeout(ok, 6000));
      const lista = modo === 'empty' ? [] : linhas;
      return enviar(res, 200, lista, { 'content-range': `0-${Math.max(lista.length - 1, 0)}/*` });
    }
    if (req.method === 'POST') {
      const nova = { id: randomUUID(), active: true, ...json };
      linhas.push(nova);
      return enviar(res, 201, umObjeto ? nova : [nova]);
    }
    if (req.method === 'PATCH') {
      const id = idDoFiltro(url);
      linhas = linhas.map((l) => (l.id === id ? { ...l, ...json } : l));
      // como o PostgREST: sem `Prefer: return=representation` (ex.: o interruptor) a resposta é 204; com ele (`.select()`) vem a linha alterada,
      // e o `.single()` sem exatamente uma linha (id que não existe, ou que a política de acesso escondeu) recebe 406/PGRST116
      if (!(req.headers.prefer ?? '').includes('return=representation')) return enviar(res, 204);
      const alteradas = linhas.filter((l) => l.id === id);
      if (umObjeto && alteradas.length !== 1) {
        return enviar(res, 406, { code: 'PGRST116', details: `The result contains ${alteradas.length} rows`, hint: null, message: 'Cannot coerce the result to a single JSON object' });
      }
      return enviar(res, 200, umObjeto ? alteradas[0] : alteradas);
    }
    if (req.method === 'DELETE') {
      linhas = linhas.filter((l) => l.id !== idDoFiltro(url));
      return enviar(res, 204);
    }
  }
  return enviar(res, 404, { message: `sem rota falsa para ${req.method} ${p}` });
}).listen(porta, '127.0.0.1', () => console.log(`Backend falso em http://localhost:${porta} (modo ${modo}). Nada é gravado em disco.`));
