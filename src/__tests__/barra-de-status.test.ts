import fs from 'fs';
import path from 'path';

const ler = (arquivo: string) => fs.readFileSync(path.join(__dirname, '../..', arquivo), 'utf8');

describe('barra de status (relógio e bateria) legível em toda tela', () => {
  it('a raiz declara o padrão (texto escuro, para as telas claras) uma vez: tela que não declara herda dele', () => {
    const raiz = ler('app/_layout.tsx');
    expect(raiz).toContain("import { BarraDeStatusPadrao } from '../src/components/BarraDeStatus';");
    expect(raiz).toContain('<BarraDeStatusPadrao />');
  });

  it('as telas de fundo escuro declaram texto claro pelo BarraDeStatus (Onboarding, GreenHeader, AuthLayout)', () => {
    for (const arquivo of ['src/components/Onboarding.tsx', 'src/components/GreenHeader.tsx', 'src/components/AuthLayout.tsx']) {
      expect({ arquivo, declara: ler(arquivo).includes('<BarraDeStatus sobre="escuro" />') }).toEqual({ arquivo, declara: true });
    }
  });

  it('ninguém usa a StatusBar direto: só o BarraDeStatus (que declara só com a tela em foco)', () => {
    const usam: string[] = [];
    const varrer = (pasta: string) => {
      for (const e of fs.readdirSync(path.join(__dirname, '../..', pasta), { withFileTypes: true })) {
        const rel = path.posix.join(pasta, e.name);
        if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '__tests__') varrer(rel); continue; }
        if (!/\.tsx$/.test(e.name) || /BarraDeStatus\.tsx$/.test(e.name)) continue;
        if (/from 'expo-status-bar'/.test(ler(rel)) || /\bStatusBar\b.*from 'react-native'/.test(ler(rel))) usam.push(rel);
      }
    };
    varrer('app');
    varrer('src');
    expect(usam).toEqual([]);
  });
});
