import { nomeDoArquivoDeImagem } from '../compartilhar-imagem';
import type { Reminder } from '../../data/reminders';

describe('compartilhar-imagem', () => {
  const base: Reminder = {
    id: '1',
    title: 'Comprar leite',
    category: 'green',
    icon: 'cart',
    kind: 'time',
    dateISO: '2026-09-21',
    time: '10:00',
    repeat: 'never',
    active: true,
  };

  describe('nomeDoArquivoDeImagem', () => {
    it('converte título para slug sem acentos', () => {
      expect(nomeDoArquivoDeImagem({ ...base, title: 'Tomar café com açúcar' })).toBe('lembrete-tomar-cafe-com-acucar.jpg');
    });

    it('limita a 40 caracteres', () => {
      const titulo = 'a'.repeat(50);
      const nome = nomeDoArquivoDeImagem({ ...base, title: titulo });
      expect(nome).toBe('lembrete-' + 'a'.repeat(40) + '.jpg');
    });

    it('remove acentos e caracteres especiais', () => {
      expect(nomeDoArquivoDeImagem({ ...base, title: 'Cão @ trabalho' })).toBe('lembrete-cao-trabalho.jpg');
    });

    it('usa "lembrete" se título for vazio', () => {
      expect(nomeDoArquivoDeImagem({ ...base, title: '' })).toBe('lembrete-lembrete.jpg');
    });

    it('normaliza múltiplos hífens em um', () => {
      expect(nomeDoArquivoDeImagem({ ...base, title: 'Ir ---no--- mercado' })).toBe('lembrete-ir-no-mercado.jpg');
    });
  });
});
