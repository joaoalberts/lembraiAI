import {
  CODIGO_TAMANHO, MIN_SENHA, forcaDaSenha, mensagemDeErro, validarCodigo, validarConfirmacao, validarEmail, validarNome, validarSenha,
} from '../validacao';

describe('validarEmail', () => {
  it.each(['a@b.co', 'nome.sobrenome+tag@dominio.com.br', '  a@b.co  '])('aceita %p', (v) => {
    expect(validarEmail(v)).toBeNull();
  });
  it.each(['', '   ', 'sem-arroba', 'a@b', 'a@b.c', '@b.com', 'a b@c.com'])('recusa %p', (v) => {
    expect(validarEmail(v)).not.toBeNull();
  });
});

describe('validarSenha (mesmas regras do servidor: 8+, letra e número)', () => {
  it('aceita senha válida, inclusive com acento', () => {
    expect(validarSenha('senhaboa1')).toBeNull();
    expect(validarSenha('açaí2026x')).toBeNull();
  });
  it('recusa curta, só letras e só números, com mensagem específica', () => {
    expect(validarSenha('')).toMatch(/Informe/);
    expect(validarSenha('abc1')).toContain(String(MIN_SENHA));
    expect(validarSenha('somenteletras')).toMatch(/número/);
    expect(validarSenha('123456789')).toMatch(/letra/);
  });
  it('o mínimo do cliente não pode ficar abaixo do que o servidor exige (8)', () => {
    expect(MIN_SENHA).toBeGreaterThanOrEqual(8);
  });
});

describe('forcaDaSenha', () => {
  it('cresce conforme a senha cumpre as regras', () => {
    expect(forcaDaSenha('').nivel).toBe(0);
    expect(forcaDaSenha('abc').nivel).toBe(1);
    expect(forcaDaSenha('senhaboa1').nivel).toBe(2);
    expect(forcaDaSenha('senha-muito-boa-1234!').nivel).toBe(3);
  });
});

describe('validarNome / validarConfirmacao / validarCodigo', () => {
  it('nome', () => {
    expect(validarNome('Ana')).toBeNull();
    expect(validarNome(' ')).not.toBeNull();
    expect(validarNome('A')).not.toBeNull();
    expect(validarNome('x'.repeat(121))).not.toBeNull();
  });
  it('confirmação', () => {
    expect(validarConfirmacao('abc12345', 'abc12345')).toBeNull();
    expect(validarConfirmacao('abc12345', 'abc12346')).not.toBeNull();
    expect(validarConfirmacao('abc12345', '')).not.toBeNull();
  });
  it(`código tem exatamente ${CODIGO_TAMANHO} números`, () => {
    expect(validarCodigo('123456')).toBeNull();
    expect(validarCodigo(' 123456 ')).toBeNull();
    for (const ruim of ['', '12345', '1234567', '12a456', 'abcdef']) expect(validarCodigo(ruim)).not.toBeNull();
  });
});

describe('mensagemDeErro (traduz o Supabase Auth)', () => {
  it.each([
    [{ code: 'invalid_credentials' }, 'E-mail ou senha incorretos.'],
    [{ message: 'Invalid login credentials' }, 'E-mail ou senha incorretos.'],
    [{ code: 'user_already_exists' }, 'Este e-mail já tem cadastro. Tente entrar ou recuperar a senha.'],
    [{ code: 'weak_password' }, `Senha fraca: use ao menos ${MIN_SENHA} caracteres, com letras e números.`],
    [{ status: 429 }, 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'],
    [{ code: 'email_not_confirmed' }, 'Confirme seu e-mail antes de entrar.'],
    [{ code: 'same_password' }, 'A nova senha precisa ser diferente da atual.'],
    [{ message: 'Failed to fetch' }, 'Sem conexão com o servidor. Verifique sua internet.'],
    [{ message: 'Network request failed' }, 'Sem conexão com o servidor. Verifique sua internet.'],
    [{ message: 'algo inesperado' }, 'Algo deu errado. Tente de novo.'],
    [null, 'Algo deu errado. Tente de novo.'],
  ])('%p -> %p', (erro, texto) => {
    expect(mensagemDeErro(erro)).toBe(texto);
  });

  it('código expirado/errado/usado não diz qual dos três (não entrega nada a quem chuta códigos)', () => {
    for (const e of [{ code: 'otp_expired' }, { message: 'Token has expired or is invalid' }, { message: 'invalid token' }]) {
      expect(mensagemDeErro(e)).toMatch(/expirou, está incorreto ou já foi usado/);
    }
  });

  it('nunca repassa o texto em inglês do servidor', () => {
    expect(mensagemDeErro({ message: 'Database error saving new user' })).not.toMatch(/Database/);
  });
});
