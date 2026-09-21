# Versionamento do lembreiai-expo

Cada mudança vira **um commit pequeno e verificado**. Antes de uma fase grande existe uma **tag de recuperação**. Nada é apagado: voltar é sempre criar um ramo ou um commit novo.

## O ritual de cada mudança

```bash
npm run typecheck && npm test     # só commita se passar (o teste também confere o Design System)
git status --short                # são só os arquivos que você quis mexer?
git add caminho/do/arquivo        # prefira nomes a `git add -A`
git commit -m "feat(design): resumo curto, no imperativo"
```

## Mensagem: `tipo(escopo): resumo`

| Tipo | Quando | Exemplo real do histórico |
|---|---|---|
| `feat` | muda o que o usuário vê ou faz | `feat(design): botão, campo, chip, aviso, interruptor e cartão seguem o Design System` |
| `fix` | corrige um defeito | |
| `docs` | só documentação | `docs: README, guia do projeto (CLAUDE.md) e roteiro de lançamento` |
| `chore` | configuração, dependência, script | `chore(dev): backend falso para conferir o visual sem conta e sem servidor real` |
| `refactor` / `test` | reorganiza sem mudar comportamento / só testes | |

## Regras

1. **Um commit, uma mudança.** Nunca misturar visual, funcionalidade e refatoração.
2. **Verificar antes.** `npm run typecheck && npm test`. O teste falha se o `docs/DESIGN_SYSTEM.md` divergir dos tokens ou se houver cor, tamanho ou peso escritos à mão fora de `src/design/`.
3. **Decisão visual nova entra no Design System no mesmo commit:** token, descrição em `src/design/doc.ts`, `npm run design:docs` e o registro na seção 18 do documento.
4. **Arte e fontes** (imagens, `.ttf`) ganham commit próprio, com o tamanho dos arquivos no corpo da mensagem, para o histórico não esconder peso.
5. **Ponto de recuperação antes de fase grande:** tag anotada `ponto-de-recuperacao/NN-descricao` (lista abaixo).
6. **Segredo nunca entra.** `.env*`, keystores e chaves estão no `.gitignore`; confira o `git status` antes de `git add`. `node ../../scripts/verificar-tudo.mjs` varre o workspace.
7. **Sem `push` sem pedido do João.** O e-mail do autor dos commits vira público no primeiro push: decidir antes (tarefa `email-do-autor-nos-commits`).

## Pontos de recuperação

| Tag | O que guarda |
|---|---|
| `ponto-de-recuperacao/01-antes-do-design-system` | o app portado, antes dos tokens e do documento do Design System |
| `ponto-de-recuperacao/02-design-system-aplicado` | tokens, documento, contraste testado e todos os componentes e telas migrados |
| `ponto-de-recuperacao/03-antes-do-visual-original` | igual ao 02, antes de fontes, imagens, efeitos e telas do original |
| `ponto-de-recuperacao/04-visual-original` | depois das 15 telas das referências portadas, com o Design System em dia; ainda sem conferência em aparelho |

## Como voltar sem perder nada

```bash
git tag -l -n1 'ponto-de-recuperacao/*'                                     # ver os pontos
git diff --stat ponto-de-recuperacao/03-antes-do-visual-original..HEAD      # o que mudou desde o ponto
git switch -c volta-03 ponto-de-recuperacao/03-antes-do-visual-original     # ramo novo a partir do ponto (o main fica como está; árvore limpa)
git switch main                                                             # voltar
git revert <hash>                                                           # desfaz UM commit criando outro
```

## Nunca

`git reset --hard`, `git checkout -- arquivo`, `git clean`, `git push --force`, reescrever commits já criados (`--amend` só no último, antes de qualquer push).

## O design original está em outro repositório

O app web `../lembreiAI` é a especificação visual e tem repositório próprio (com GitHub). O estado mais novo dele fica no disco e pode estar sem commit: por isso a arte e as fontes que o app usa são **copiadas para cá** e versionadas aqui. Andamento: tarefa `visual-original-no-expo`, no quadro `Tarefas/` do workspace.
