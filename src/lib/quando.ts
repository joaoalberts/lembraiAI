/**
 * "Há quanto tempo" de uma posição ou de um aviso, como as Configurações escrevem: "nunca", "há 45s" (menos de um minuto) ou
 * "há 3 min" (arredondado). `agora` vem de quem chama, para a tela poder atualizar a cada instante sem depender do relógio.
 */
export function quandoFoi(instante: number | null | undefined, agora: number): string {
  if (instante == null) return 'nunca';
  const segundos = Math.max(0, Math.round((agora - instante) / 1000));
  return segundos < 60 ? `há ${segundos}s` : `há ${Math.round(segundos / 60)} min`;
}
