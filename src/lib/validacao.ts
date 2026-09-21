/**
 * Validação dos formulários de conta. Mensagens em português, prontas para exibir.
 * Port de `Aplicativos/lembreiAI/src/lib/validacao.ts` (as regras precisam bater com o supabase/config.toml).
 */

/** Formato de e-mail: checagem pragmática (um @, algo antes, domínio com ponto), sem tentar cobrir a RFC inteira. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validarEmail = (v: string): string | null => {
  const email = v.trim();
  if (!email) return 'Informe seu e-mail.';
  if (!EMAIL.test(email)) return 'E-mail inválido. Confira o formato, como nome@dominio.com.';
  return null;
};

export const MIN_SENHA = 8;   // igual ao minimum_password_length do supabase/config.toml

/**
 * Força da senha. As regras espelham o `password_requirements = "letters_digits"` do Supabase — se forem
 * afrouxadas aqui, o servidor recusa mesmo assim, e a pessoa levaria um erro sem explicação.
 */
export function validarSenha(v: string): string | null {
  if (!v) return 'Informe uma senha.';
  if (v.length < MIN_SENHA) return `A senha precisa de pelo menos ${MIN_SENHA} caracteres.`;
  if (!/\p{L}/u.test(v)) return 'A senha precisa ter ao menos uma letra.';
  if (!/\d/.test(v)) return 'A senha precisa ter ao menos um número.';
  return null;
}

export type Forca = { nivel: 0 | 1 | 2 | 3; rotulo: string };

/** Medidor exibido no cadastro: conta o que já foi cumprido, para orientar em vez de só reprovar. */
export function forcaDaSenha(v: string): Forca {
  if (!v) return { nivel: 0, rotulo: '' };
  const pontos = [v.length >= MIN_SENHA, /\p{L}/u.test(v), /\d/.test(v)].filter(Boolean).length
    + (v.length >= 12 && /[^\p{L}\d]/u.test(v) ? 1 : 0);
  if (pontos <= 1) return { nivel: 1, rotulo: 'Senha fraca' };
  if (pontos <= 3) return { nivel: 2, rotulo: 'Senha razoável' };
  return { nivel: 3, rotulo: 'Senha forte' };
}

export const validarNome = (v: string): string | null => {
  const nome = v.trim();
  if (!nome) return 'Informe seu nome.';
  if (nome.length < 2) return 'Nome muito curto.';
  if (nome.length > 120) return 'Nome muito longo.';
  return null;
};

export const validarConfirmacao = (senha: string, confirmacao: string): string | null => {
  if (!confirmacao) return 'Repita a senha.';
  if (senha !== confirmacao) return 'As senhas não são iguais.';
  return null;
};

export const CODIGO_TAMANHO = 6;   // otp_length do supabase/config.toml

/** Código de uso único enviado por e-mail na recuperação de senha. */
export const validarCodigo = (v: string): string | null => {
  const codigo = v.trim();
  if (!codigo) return 'Digite o código que chegou no e-mail.';
  if (!new RegExp(`^\\d{${CODIGO_TAMANHO}}$`).test(codigo)) return `O código tem ${CODIGO_TAMANHO} números.`;
  return null;
};

/**
 * Traduz o erro do Supabase Auth.
 *
 * No login, credencial errada e e-mail inexistente devolvem a MESMA mensagem de propósito: dizer "esse e-mail não
 * existe" entregaria a estranhos quem tem conta aqui.
 */
export function mensagemDeErro(e: { message?: string; code?: string; status?: number } | null): string {
  if (!e) return 'Algo deu errado. Tente de novo.';
  const m = (e.message ?? '').toLowerCase();
  const code = e.code ?? '';

  if (code === 'invalid_credentials' || m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (code === 'user_already_exists' || m.includes('already registered') || m.includes('already been registered')) {
    return 'Este e-mail já tem cadastro. Tente entrar ou recuperar a senha.';
  }
  if (code === 'weak_password' || m.includes('password should be')) return `Senha fraca: use ao menos ${MIN_SENHA} caracteres, com letras e números.`;
  if (code === 'over_request_rate_limit' || e.status === 429 || m.includes('rate limit') || m.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.';
  }
  if (code === 'otp_expired' || m.includes('expired') || m.includes('invalid token')) {
    return 'Este código ou link expirou, está incorreto ou já foi usado. Peça um novo e-mail de redefinição.';
  }
  if (code === 'email_not_confirmed' || m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (code === 'same_password' || m.includes('should be different')) return 'A nova senha precisa ser diferente da atual.';
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed')) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return 'Algo deu errado. Tente de novo.';
}
