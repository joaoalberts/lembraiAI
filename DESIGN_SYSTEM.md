# LembreiAi — Design System

> **Versão 0.2 · Fase 1 aprovada · Fase 2 implementada**
> Extraído de `./ref/1.png … 5.png`.
>
> **Decisões aprovadas** (resposta às perguntas do §11):
> 1. Lista = **versão B (`5.png`)**.
> 2. **Uma só serif:** Source Serif 4 (o `opsz` é fixado por estilo, ver `vite.config.ts`).
> 3. **Texto proporcional às imagens** (sem piso de legibilidade). Unidade `du` = 1 px do frame de 851.
> 4. **Assets recortados das próprias referências** (`tools/build-assets.py`): fundos com a UI removida por inpainting, mapas e miniaturas. Interface 100 % em código.
> 5. Inconsistências das imagens (dias da semana, pino na tag "Por horário", tag laranja com texto escuro) são **dados de exemplo**: mantidas como estão nas imagens.
> 6. Comportamentos sem imagem: ações do sucesso funcionais com estado local; abas, busca, ⋯, "Repetir" e slides 2–3 do onboarding **sem ação** até a revisão.
>
> **Fase 4 — alterações pedidas depois da aprovação** (não vêm das imagens; valem no lugar do que estiver em contrário abaixo):
> - **Navegação:** "Pular" e "Criar meu primeiro lembrete" → Novo lembrete · voltar (Novo lembrete) → Onboarding · "Ver todos os lembretes" → lista · "Criar outro lembrete" e o card "Dica inteligente" → Novo lembrete.
> - **Onboarding (§7.7):** os balões de vidro "Na hora certa" / "No lugar certo" ficam na **arte de fundo** (passam por trás do pino 3D); só o ícone e o texto são código. O título agora é **"Lembre de tudo!"** e o app passou a se chamar **"LembreiAi"** em todo lugar (marca do onboarding e da lista, imagem e título do compartilhamento, aba do navegador, README); o nome vive em `src/lib/brand.ts`. As imagens de `ref/` e as medidas abaixo ainda citam "Lembrete Geo" porque descrevem o que está nelas.
> - **Novo lembrete:** o topo deixou de ser foto (§10) e virou CSS (névoa pinheiro/menta + anéis de raio). "Repetir" abre uma folha inferior com 6 opções: Nunca, Todos os dias, Dias úteis, Toda semana, Todo mês, Todo ano. A data já nasce em **hoje** (dia da semana calculado; a lista agrupa em Hoje/Amanhã/Esta semana pela data real). O horário abre uma folha com duas rodas roláveis (hora 00–23 e minutos 00–59, com encaixe no item central): cada valor é salvo ao parar de rolar, e a folha fecha sozinha 0,8 s depois que os minutos param; "Pronto", Esc ou o fundo fecham a qualquer momento. As rodas não "dão a volta" (23 → 00). A lista de exemplo (§1, ref/5.png) segue com as datas fixas de 16–20/09.
> - **Barra de menu (§7.6):** agora navega — Início → onboarding, Lembretes → lista, Mapa → `/mapa`, Configurações → `/config` (essas duas são telas provisórias "Em breve", no padrão da lista, até existir referência). Também aparece no **Novo lembrete** (aba Lembretes ativa): cabeçalho e cartões rolam nas coordenadas da ref/2.png, e o botão "Criar lembrete" fica fixo 16 acima da barra, sobre um degradê.
> - **Lista — fundo do cabeçalho (§2.4/§10):** a foto de montanhas desfocadas (feita da ref/5.png com o texto apagado) foi trocada por um fundo em código (`ListHeaderBg`): degradê verde profundo, luz menta atrás dos botões, **curvas de nível** de mapa topográfico (SVG gerado por `tools/build-assets.py` → `topo-header.svg`, uma curva "mestra" a cada 4) que somem para a esquerda e para baixo, e grão fino. Vale também para as telas "Em breve".
> - **Lista — "⋯" dos cartões:** abre uma folha com **Editar** (formulário já preenchido, com título "Editar lembrete" e botão "Salvar alterações"; ao salvar volta para a lista) e **Excluir** (com confirmação). Editar preserva ícone/categoria temáticos, miniatura, status e seção (se a data não mudar). O glifo segue pequeno como na ref/5.png (centro em 741; 34,5 no cartão), mas a área de toque é 88 × 66 du (era 34 × 41). O "⋯" do cabeçalho da lista continua sem ação.
> - **Lista:** a lupa abre a busca (campo de vidro no lugar da marca; filtra título, local, data e hora, sem acento/maiúscula; os contadores dos chips acompanham).
> - **Sucesso (topo, §7.7/§10):** o ícone 3D deixou de ser imagem: o fundo foi regenerado sem ele e sem o texto (preenchimento por difusão, sem mancha) e o selo virou código (`SuccessHero`), com entrada animada em uma sequência única — selo com mola, check que se desenha, duas ondas de raio, faíscas, brilho atravessando o selo, título e subtítulo subindo; depois só dois pontos cintilam. `prefers-reduced-motion` mostra o estado final, sem ondas nem faíscas.
> - **Sucesso (ações):** sem "Duplicar" (3 ações de largura igual, §7.1) · "Excluir" pede confirmação (vermelho de erro `#D43A2A`, o [PROPOSTO] do §8) · "Compartilhar" gera uma imagem JPEG do lembrete e abre o compartilhamento do sistema (sem suporte a arquivos, baixa a imagem). O compartilhamento nativo só existe em HTTPS ou `localhost`.

---

## 0. Como ler este documento

### Método
- As 5 imagens têm **851 × 1848 px**. Cada cor foi **amostrada por pixel** com script (mediana de um recorte 5×5 em áreas planas; para texto, mediana do *núcleo* do traço, ignorando bordas com anti-aliasing). Não há cor "estimada a olho".
- **Precisão:** áreas planas ±1 nível RGB · texto fino ±4 (anti-aliasing) · fotos/gradientes: apresentados como faixas.
- **Fontes tipográficas não são extraíveis de PNG.** As famílias abaixo foram identificadas por **renderização comparativa** (candidatas do Google Fonts desenhadas ao lado dos recortes). É a melhor correspondência, não um dado exato.

### Unidades
| Unidade | Definição |
|---|---|
| **du** | 1 pixel da imagem de referência (frame de 851 px de largura) |
| **dp** | `du ÷ 2,165`. Assume frame **393 × 852** (iPhone 15/16). Sustentado por: tab bar = 83 dp (49 + 34 de área segura, padrão iOS) e home indicator ≈ 131 dp (iOS = 134 dp) |

Para uma tela de 393 px de largura, **1 dp = 1 px CSS**.

### Etiquetas de confiança
- **[MEDIDO]** lido diretamente da imagem
- **[INFERIDO]** deduzido de forma razoável (ex.: nome da família tipográfica)
- **[PROPOSTO]** não aparece nas imagens; sugestão coerente para você aprovar

---

## 1. Telas de referência

| Arquivo | Tela | Observações |
|---|---|---|
| `1.png` | **Onboarding / Boas-vindas** | Fundo fotográfico verde, pino 3D, CTA laranja. Pager com 3 pontos (1º ativo); os slides 2 e 3 não foram fornecidos. |
| `2.png` | **Novo lembrete** | Formulário. Modo "Por data e horário" selecionado; toggle "Local (opcional)" ligado. |
| `3.png` | **Meus lembretes — versão A** | Lista com 5 lembretes. |
| `4.png` | **Lembrete criado com sucesso** | Confirmação + resumo + ações. |
| `5.png` | **Meus lembretes — versão B** | Mesmo layout do `3.png`, com **divergências reais** (ver §2.6). É o arquivo mais recente (20:51 vs 20:47). |

Nenhuma imagem desenha a **status bar** (hora/bateria). A área segura superior está vazia: o primeiro elemento começa entre 26 e 51 dp do topo.
Todas as telas são **claras**; não há referência de modo escuro.

---

## 2. Cores

### 2.1 Primitivas

**Forest — verdes escuros**

| Token | Hex | Onde foi medido | Uso |
|---|---|---|---|
| `forest-950` | `#0D2A1B` | 1.png · fundo (mediana de 5 pontos: `#0D2A1B` `#0D2A1A` `#0E2A1B`) | Fundo mais escuro do onboarding |
| `forest-900` | `#12432F` | 5.png · chip ativo *(3.png: `#194134`)* | Chip de filtro ativo |
| `forest-800` | `#254233` | 4.png · botão "Ver todos os lembretes" (4 pontos, ±1) | Botão escuro |
| `forest-700` | `#185C4B` | 2.png · borda do card selecionado (`#185C4B`) e círculo do check (`#195A48`) | Seleção |
| `forest-600` | `#216955` | 2.png · preenchimento do slider (`#216955`), trilho do toggle (`#256855`) | Controles ligados |
| `forest-pin` | `#054C39` | 2.png · pino do mapa (`#054C39` / `#044533`) | Pino |

**Mint — verdes claros e aqua**

| Token | Hex | Onde foi medido | Uso |
|---|---|---|---|
| `mint-50` | `#E7F4EB` | 4.png · pílula "Ativo" | Fundo de status |
| `mint-100` | `#DBF1E5` | 3.png `#DBF1E5` · 5.png `#DBF1E4` · 2.png `#DCEEE5` | Círculo atrás de ícones |
| `mint-200` | `#C6E4D5` | 3.png · círculo do card de dica *(5.png: `#C3DFCE`)* | Círculo de ícone do card de dica |
| `mint-tint` | `#E2EAE2` | 3.png · fundo do card "Dica para você" *(5.png: `#DDE8DD`)* | Card de dica |
| `mint-300` | `#94F9CD` | 1.png · núcleo de "de viver." | Destaque de texto sobre fundo escuro |
| `mint-400` | `#7FEAC6` | 5.png tile `#7DEAC4…#84EBC6` · 1.png tile `#7AE6C5…#82F9D7` | Tile do app |
| `status-green` | `#029554` | 4.png · ponto da pílula "Ativo" | Indicador de ativo |

**Orange — ação principal**

| Token | Hex | Onde foi medido |
|---|---|---|
| `orange-500` | `#FE532A` | 2.png · CTA (`#FD5429` `#FE532A` `#FE5328`). Variações: 1.png `#FE4A23` · 3.png/5.png botão "Novo lembrete" `#FD572D` / `#FD5B2B` |
| `orange-glow` | `rgba(254,83,42,.30)` | Calculado a partir do halo abaixo do CTA em 1.png e 2.png (alfa 0,23–0,30 na borda inferior) |

> A laranja varia entre as telas (de `#FE4A23` a `#FD5B2B`). Adotei a de 2.png (mediana) como canônica.

**Neutros quentes**

| Token | Hex | Onde foi medido | Uso |
|---|---|---|---|
| `white` | `#FFFFFF` | 2.png `#FFFFFF`/`#FEFEFE` (inputs, card selecionado, botão voltar) | Inputs, card ativo |
| `cream-100` | `#FAF9F6` | 2.png `#FAF9F6` · 3.png `#FAF8F6` · 5.png `#F9F8F5` · 4.png `#F8F6F4` | Superfície de card e tab bar |
| `cream-200` | `#F5F2ED` | 2.png `#F6F2ED` · 3.png `#F4F2EE` *(5.png: `#EFF0EA`)* | Fundo de página |
| `chip-off` | `#F3F2F0` | 3.png *(5.png: `#F3F4EF`)* | Chip de filtro inativo |
| `border-subtle` | `#E7E8EA` | 2.png · borda de input | Bordas de campo |
| `divider` | `#E8E7E6` | 4.png · divisórias do card | Divisórias |
| `border-strong` | `#B9B8BB` | 2.png · anel do radio não selecionado | Radio "vazio" |
| `track-off` | `#D6D5D5` | 2.png · trilho do slider | Trilhos inativos |
| `frost` | `#E3E7DC` | 4.png · fundo dos botões Editar/Duplicar/Excluir/Compartilhar | Botão translúcido sobre foto clara |
| `home-indicator` | `#B7B3AE` | 2.png | Barra home iOS |

**Tinta (texto)**

| Token | Hex | Onde foi medido | Uso |
|---|---|---|---|
| `ink-900` | `#0A0A0A` | núcleo de "Novo lembrete" em 2.png. Outras: 4.png `#020809` · 3.png `#040609` · 5.png `#0C0D14` | Texto principal. **É preto quase puro, não verde.** |
| `ink-brand` | `#0A3924` | 5.png · rótulo da tab ativa *(3.png: `#112824`)* | Tab ativa, itens de marca |
| `ink-600` | `#767880` | Mediana de ~20 amostras: 2.png `#72727A` `#73747B`; 3.png `#6D747A`; 5.png `#747B86`; 4.png `#6F7279` | Texto secundário (cinza levemente azulado) |
| `ink-400` | `#85858F` | 2.png · placeholder (`#80808E` por pico; `#898996` por núcleo) | Placeholder, terciário |
| `text-accent` | `#086952` | 2.png · "150 m" (núcleo) | Valor destacado em verde |
| `on-dark-100` | `#FDFAF6` | 1.png · núcleo de "Lembre". Outras: 5.png `#F9F9F7` · botões `#FFFFFF` | Texto principal sobre verde escuro |
| `on-dark-200` | `#CCD8D0` | 1.png · subtítulo | Texto secundário sobre escuro |
| `on-dark-300` | `#B1C3B8` | 1.png · descrição das features | Terciário sobre escuro |
| `on-dark-400` | `#A7B9B0` | 1.png · "Seus lembretes, sua privacidade." | Rodapé sobre escuro |

### 2.2 Semânticas (o que cada token *significa*)

| Papel | Token |
|---|---|
| Fundo da página | `cream-200` |
| Superfície de card / tab bar | `cream-100` |
| Superfície elevada (input, card ativo) | `white` |
| Ação principal | `orange-500` |
| Ação secundária (escura) | `forest-800` |
| Seleção / estado ligado | `forest-700` (borda, check) · `forest-600` (toggle, slider) |
| Texto principal / secundário / placeholder | `ink-900` / `ink-600` / `ink-400` |
| Texto sobre verde escuro | `on-dark-100` → `on-dark-400` |
| Ícone em círculo | círculo `mint-100`, glifo `ink-900` |
| Halo do raio no mapa | `rgba(45,170,120,.21)` preenchimento · `rgba(45,170,120,.32)` aro |

> O halo do raio foi **resolvido matematicamente**: sobre o mapa `#EEEAE5` o resultado medido é `#C3DDCE`; a cor-base `rgb(45,170,120)` com alfa ≈ 0,21 reproduz R, G e B simultaneamente.

### 2.3 Cores de categoria (5 pares) — versões A e B

Cada lembrete tem uma cor de categoria aplicada em **4 lugares**: barra lateral do card, círculo do ícone, fundo da tag e texto da tag.

| Categoria | Barra A (3.png) | Barra B (5.png) | Círculo A | Círculo B | Tag bg A | Tag bg B | Tag texto A | Tag texto B |
|---|---|---|---|---|---|---|---|---|
| Verde | `#279469` | `#39C391` | `#DBF1E5` | `#DBF1E4` | `#DEF2E7` | `#DAF4E6` | `#025C3F` | `#18714E` |
| Laranja | `#FD6A3D` | `#FD6C34` | `#FDE7D4` | `#FDE6D6` | `#FDE9D9` | `#FDE5D7` | `#F86327` | ⚠ escuro `#183029` |
| Azul | `#45ACEA` | `#51A6F6` | `#D8EDFC` | `#D5E8F9` | `#D7ECFC` | `#D6E9F9` | `#016EBC` | `#2C91EA` |
| Roxo | `#BD78EB` | `#B287E8` | `#EEE1F9` | `#EADFFB` | `#EEE1FB` | `#ECE4FB` | `#7438B6` | `#9265D8` |
| Rosa | `#EF64A1` | `#F980B3` | `#FCE1E9` | `#FCE3E9` | `#FBE1E8` | `#FCE6EC` | `#86143D` | `#ED6E9E` |

O glifo do ícone usa um tom **escuro da própria matiz** (A: azul `#015C8C`, roxo `#260049`, rosa `#3E071B`; verde e laranja quase pretos).
Largura da barra: **6 du** (A) / **8 du** (B) ≈ 3–4 dp, altura total do card, acompanhando o raio do canto esquerdo.

### 2.4 Fundos, gradientes e vidro

| Elemento | Especificação [MEDIDO] |
|---|---|
| **Header das listas** (altura 296 du = 137 dp) | Gradiente vertical sobre foto desfocada de montanhas. **B:** `#728971` (topo) → `#617B63` → `#506C55` → `#42614B` → `#365541` → `#294B38` → `#264736` (base). **A:** `#485F52` → `#394F45` → `#30473C` → `#21372F`. |
| **Sheet de conteúdo** | Sobe sobre o header com **raio superior de 38 du (≈ 18 dp)**, fundo de página. |
| **Onboarding (1.png)** | Foto de folhagem desfocada + véu verde escuro. Faixa medida: `#0D2A1B` (base) a `#1A3828` (topo); realce de luz `#788465` no meio-esquerdo. |
| **Formulário (2.png)** | Topo com folhagem desfocada: `#607662` (topo-centro) → creme por volta de y = 230 du. |
| **Sucesso (4.png)** | Creme com sombras de folhagem (`#EFEDE7` centro; `#3F5643` no canto superior direito). Brilho mint `#D7F2E1` atrás do ícone. |
| **Vidro sobre escuro** (Pular, busca, mais, fechar) | Fundo `rgba(255,255,255,.05)` + borda **≈ 1 dp (2 du) `rgba(255,255,255,.20)`** (alfa medido entre 0,15 e 0,24) + `backdrop-filter: blur`. |
| **Caixa de feature (1.png)** | Fundo +4 % branco sobre o verde; borda `#5C9272` (mint translúcido). |

### 2.5 Contraste (WCAG) — risco de acessibilidade

| Par | Razão | Situação |
|---|---|---|
| `ink-900` sobre `cream-100` | 18,8 : 1 | ✅ |
| Branco sobre `forest-800` | 11,0 : 1 | ✅ |
| `on-dark-200` sobre `forest-950` | 10,5 : 1 | ✅ |
| `ink-600` sobre `cream-100` | 4,2 : 1 | ⚠ abaixo de 4,5 |
| `ink-400` (placeholder) sobre `white` | 3,6 : 1 | ⚠ |
| **Branco sobre `orange-500`** | **3,2 : 1** | ⚠ **só passa para texto grande** |
| Tag azul B `#2C91EA` | 2,7 : 1 | ❌ |
| Tag rosa B `#ED6E9E` | 2,4 : 1 | ❌ |
| Tag laranja A `#F86327` | 2,6 : 1 | ❌ |
| Tags A: verde 6,9 · roxo 5,6 · rosa 7,8 | — | ✅ |
| Tag azul A `#016EBC` | 4,4 : 1 | ⚠ quase (falta 0,1) |

Priorizo **fidelidade** às referências; estou apenas sinalizando. A versão A das tags tem contraste claramente melhor que a B.

### 2.6 Divergências entre `3.png` (A) e `5.png` (B)

São a mesma tela desenhada duas vezes, com diferenças que não são ruído:

| Item | A · 3.png | B · 5.png |
|---|---|---|
| Fundo da sheet | `#F4F2EE` (creme quente) | `#EFF0EA` (mais verde/frio) |
| Header | Escuro e neutro | Mais claro e verde, névoa visível |
| Título do card | **Sans** bold ("Comprar água no mercado") | **Serif** bold |
| Títulos de seção ("Hoje", "Amanhã") | Serif, menor | Serif, maior |
| Toggle ligado | `#228360` | `#30AB7B` (mais vivo) |
| Cores de categoria | Mais saturadas/escuras | Mais claras e vibrantes |
| Ícone "Raio de X metros" | Glifo estranho em "V" | Ícone de radar limpo |
| Miniatura de mapa | Mapa detalhado colorido | Mapa pálido simplificado |
| Tag laranja | Texto laranja | Texto **escuro** (inconsistente com as outras tags) |
| Título "Esta semana" | Alinhado | Recuado ~8 du em relação aos outros títulos |

**Recomendação:** seguir a **B (5.png)** como base do layout e tipografia, por ser a mais recente e usar título serif de card, como no 4.png. **Mas preciso da sua decisão** (§11, pergunta 1).

---

## 3. Tipografia

### 3.1 Famílias

| Papel | Família | Confiança | Evidência |
|---|---|---|---|
| **Sans (UI e corpo)** | **Nunito Sans** (400/500/600/700) | [INFERIDO] alta | Renderização comparativa bate em "Supermercado Frangolândia", "Raio de 150 metros". |
| **Serif display — telas 1, 3, 5** | **Source Serif 4** (700) | [INFERIDO] média | "Lembre de viver.", "Meus lembretes", "Hoje". |
| **Serif display — telas 2, 4** | **Lora** (700) | [INFERIDO] alta | "Novo lembrete" coincide com Lora Bold (bojo redondo, terminais em gota). |
| **Manuscrita** | Fina, inclinada (candidatas: Homemade Apple, Caveat) | [INFERIDO] baixa | Só em "Mais Liberdade para o seu dia" (1.png). Provavelmente parte da arte. |

> As telas usam **duas serifs diferentes**. Ver §11, pergunta 2.

### 3.2 Escala (font-size resolvido pela largura real do texto)

| Estilo | Família | du | dp | Peso | Line-height | Onde |
|---|---|---|---|---|---|---|
| `display` | Serif | 125–129 | **58–60** | 700 | 0,88 | "Lembre de viver." |
| `title-xl` | Serif | 59 | **27** | 700 | 1,08 | "Lembrete criado com sucesso!" |
| `title-lg` | Serif | 55 | **25,5** | 700 | 1,1 | "Meus lembretes" |
| `title-md` | Serif | 35 | **16** | 700 | 1,2 | "Novo lembrete", seções "Hoje/Amanhã" |
| `card-title-lg` | Serif | 33,5 | **15,5** | 700 | 1,25 | Título do card de resumo (4.png) |
| `card-title` | Serif/Sans | 22–24 | **10,5–11** | 700 | 1,25 | Título do card da lista |
| `wordmark` | Sans | 37 | **17** | 700 | 1,2 | "Lembrete Geo" (1.png) |
| `body-lg` | Sans | 27–31 | **12,5–14,5** | 400 / 700 | 1,33–1,45 | Subtítulos; rótulo dos CTAs (700) |
| `body` | Sans | 24–26 | **11–12** | 400 / 500 | 1,4 | Placeholder, valores de select, "5 lembretes ativos" |
| `label` | Sans | 22–24 | **10–11** | 700 | 1,25 | "Descrição", "Repetir", "Raio de notificação", hora |
| `caption` | Sans | 19–21 | **9–9,7** | 400 / 700 | 1,4–1,5 | Título de opção, descrição de feature, dica |
| `micro` | Sans | 15–17,5 | **7–8** | 400–700 | 1,3 | Tags, tab labels, chips, helper, "Editar" |

- **Pesos usados:** 400 (corpo), 500 (valores e ênfase leve), 600 (Pular, pílulas de status), 700 (rótulos, botões, chips, títulos).
- **Tracking:** nenhum estilo com espaçamento entre letras ou caixa alta foi detectado; usar `letter-spacing: 0`.
- **Alinhamento:** títulos de tela (1, 4) e subtítulos **centralizados**; conteúdo de card à esquerda; horários e toggles à direita.
- **Rótulo dos CTAs varia:** sans bold (1.png e 4.png), **serif bold** (2.png, "Criar lembrete").

> ⚠ **Texto pequeno.** Em 393 dp, os textos `micro` ficam em ~7–8 px e o corpo em ~11–12 px, menores que o padrão iOS. Isso é uma característica das imagens (ver §9 e §11, pergunta 3).

---

## 4. Espaçamento e grid

**Base:** múltiplos de 4 dp. Os valores medidos caem em: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40.

| Medida | du | dp | Onde |
|---|---|---|---|
| Margem lateral da tela | 29–37 | **14–17 → 16** | 2.png: 29 du · 3/5.png: 36–37 · 4.png: 33–35 |
| Margem lateral do CTA no onboarding | 49 | **23 → 24** | 1.png |
| Espaço entre cards (formulário) | 20–21 | **≈ 9–10** | 2.png |
| Espaço entre cards (lista) | 18 | **≈ 8** | 5.png |
| Espaço card → botões de ação → dica → CTA | 30 · 35 · 41 | **14 · 16 · 19** | 4.png |
| Padding interno do card do formulário | ≈ 33 | **≈ 15** | 2.png |
| Gutter entre os 4 botões de ação | 39 | **18** | 4.png |
| Altura da tab bar | 180 | **83** | 3/5.png (49 + 34 iOS) |
| Zona segura inferior | — | **34** | home indicator |

**Grid:** coluna única. Os itens horizontais são distribuídos em partes iguais:
- Tab bar: 4 colunas (centros em 106 · 319 · 532 · 745 du).
- Features do onboarding: 3 colunas (centros em 152 · 426 · 702 du).
- Ações do sucesso: 4 botões de 71 dp.

---

## 5. Raios, bordas, sombras e elevação

### Raios [MEDIDO, ±2 dp]

| Token | du | dp | Aplicação |
|---|---|---|---|
| `r-full` | pílula | 999 | CTAs, Pular, chips, tags, toggle, pílula "Ativo", botões circulares |
| `r-sheet` | 38 | **18** | Topo da sheet |
| `r-card-lg` | 34–38 | **16–17** | Cards do formulário e do resumo (2.png, 4.png) |
| `r-card` | 24–27 | **11–12** | Card da lista, card de dica |
| `r-field` | 24–31 | **11–14** | Input, select, linha "Repetir", card-opção |
| `r-thumb` | 24 | **11** | Miniatura de mapa nos cards |
| `r-map` | 20 | **9–10** | Mapa grande, campo de busca |
| `r-tile` | 27 | **12–13** | Tile do app |
| `r-feature` | 41 | **19** | Caixa de ícone das features (quase círculo) |
| `r-action` | 31–34 | **14–16** | Botões Editar/Duplicar/… |

### Bordas [MEDIDO]
- **Card selecionado:** ≈ 1 dp (2 du) `forest-700` sobre `white`.
- **Radio não selecionado:** anel ≈ 1 dp (2 du) `border-strong`.
- **Input/select:** 1 dp `border-subtle`.
- **Cards:** filete claro quase invisível (`#E3E3E0 → #F6F4F2` na aresta).
- **Chip inativo:** anel de 1 dp ~`#DFE1DB`.

### Sombras [MEDIDO / INFERIDO]
Todas são **muito suaves**; o design é quase plano.

| Nível | Uso | Valor |
|---|---|---|
| `e0` | Página | nenhuma |
| `e1` | Cards | `0 1px 3px rgba(20,40,30,.05), 0 4px 12px rgba(20,40,30,.04)` [INFERIDO: escurecimento de ~4 % sob o card] |
| `e2` | Controles flutuantes no mapa, botão voltar, thumb do toggle | `0 1px 4px rgba(0,0,0,.16)` [INFERIDO] |
| `glow-orange` | CTAs laranja | `0 8px 24px rgba(254,83,42,.30)` [MEDIDO: alfa 0,23–0,30, alcance ≈ 50–70 du] |
| — | Botão escuro (4.png) | sem sombra visível (Δ ≈ 2 %) |

---

## 6. Iconografia

**Estilo [MEDIDO]:** contorno (*outline*), traço uniforme de ~2 % do lado (≈ 1,5–2 px em grade de 24), pontas e junções arredondadas, monocromático. Preto (`ink-900`) sobre claro, branco sobre escuro; só o pino do mapa e o pino das tags são preenchidos/coloridos.
Corresponde ao estilo da biblioteca **Lucide** [INFERIDO] — recomendo `lucide-react`.

| Onde | Ícone (Lucide) | Tamanho |
|---|---|---|
| Logo do app (tile) | mira/crosshair custom em tile mint | 33–34 dp |
| Features onboarding | `clock` · `map-pin` · `zap` | 19 dp |
| Chips flutuantes 1.png | `bell` · `map-pin` | ~14 dp |
| Formulário | `file-text` · `calendar-days` · `clock` · `refresh-cw` · `search` · `locate-fixed` · `navigation` · `plus` · `minus` · `map-pin` · `chevron-down` · `chevron-right` · `chevron-left` · `check` · `arrow-right` | 14–19 dp |
| Lista | `shopping-cart` · `dumbbell` · `pill` · `users` · `plane` · `lightbulb` · `map-pin` · `calendar-days` · `ellipsis` · `search` · `plus` | 14–20 dp |
| Raio ("Raio de 150 metros") | ícone de radar/anéis (**custom**, ver §11) | ~8 dp |
| Tab bar | `house` · `list` · `map-pin` · `settings` | 16 dp (34 × 37 du) |
| Sucesso | `x` · `pencil` · `copy` · `trash-2` · `share` (seta para cima sobre caixa) · `repeat` · `lock` | 14–20 dp |

**Cor:** ativo `ink-brand` (`#134B36` no glifo da tab, medido) · inativo `#777C8A` (medido).

---

## 7. Componentes

Medidas em **dp** (du entre parênteses onde útil). Todas [MEDIDO] salvo indicação.

### 7.1 Botões

| Botão | Dimensão | Fundo | Texto | Raio | Extras |
|---|---|---|---|---|---|
| **CTA hero** (1.png) | 347 × 55 dp | `orange-500` | branco, sans 700, 14,3 dp | pílula | Seta `→` à direita do texto; `glow-orange` |
| **CTA formulário** (2.png) | 365 × 54 dp | `orange-500` | branco, **serif** 700, 13 dp, centralizado | pílula | Círculo de 37 dp à direita com `rgba(255,255,255,.13)` e seta `→` |
| **CTA compacto** "+ Novo lembrete" | 116 × 33 dp | `orange-500` | branco, sans 700 | pílula | Ícone `+` à esquerda |
| **Escuro** "Ver todos os lembretes →" | 357 × 50 dp | `forest-800` | branco, sans 700, 12,7 dp | pílula | Sem sombra |
| **Link** "Criar outro lembrete" | texto | transparente | `ink-600`, sans 500, 11,4 dp | — | Centralizado |
| **Vidro** "Pular ›" | 71 × 35 dp | vidro (§2.4) | branco, sans 600, 10 dp | pílula | Chevron à direita |
| **Ícone vidro** (busca, mais, fechar) | 35–39 dp círculo | vidro | ícone branco | círculo | — |
| **Voltar** (2.png) | 33 dp círculo | `white` | `chevron-left` preto | círculo | `e2` |
| **Ação** (Editar, Duplicar, Excluir, Compartilhar) | 71 × 57 dp | `frost` | ícone 20 dp + rótulo sans 500, 8 dp | 14–16 | Ícone `#0E402D`/preto |

### 7.2 Chips

| Chip | Dimensão | Ativo | Inativo |
|---|---|---|---|
| **Filtro** ("Todos 5", "Hoje 2", "Esta semana 3", "Locais 2") | altura 31–32 dp; padding-x ≈ 17 dp; gap ≈ 9 dp; pílula | fundo `forest-900`, texto e número brancos, sans 700, 8 dp | fundo `chip-off`, anel 1 dp, texto `ink-900`, número `#395D56` (B) / `#85878D` (A) |
| **Tag de categoria** ("Por local", "Por horário") | 61 × 17 dp; pílula | fundo/texto da categoria (§2.3) + ícone `map-pin` de 8 × 11 dp | — |
| **Pílula de status** ("Ativo") | 57 × 24 dp | `mint-50`, ponto `status-green` 5 dp, texto sans 600, 9 dp `ink-900` | — |

### 7.3 Cards

| Card | Dimensão | Fundo | Raio | Estrutura |
|---|---|---|---|---|
| **Seção do formulário** | 365 dp de largura; alturas 102 · 133 · 301 dp | `cream-100` | 16 | Padding ≈ 15 dp; borda-filete + `e1` |
| **Item da lista** | 358 × 85 dp (com tag; 71 dp sem miniatura) | `cream-100` | 11 | Barra de categoria à esquerda · círculo de ícone **42 dp** · bloco de texto · miniatura de mapa **63 × 64 dp** (r 11) · hora + toggle 32 × 19 dp · `ellipsis` no canto superior direito |
| **Resumo** (4.png) | 362 × 251 dp | `cream-100` | 17 | Cabeçalho (círculo 40 dp + título serif + pílula "Ativo") · linhas com ícone em círculo branco de 32 dp + rótulo `ink-400` + valor 500 · divisórias `divider` · miniatura 76 × 55 dp |
| **Dica — lista** | 358 × 66 dp | `mint-tint` | 12 | Círculo `mint-200` · título 700 · texto `ink-600` · `chevron-right` |
| **Dica — sucesso** | 361 × 73 dp | `cream-100` (medido `#F8F6F4`) | 17 | Mesma estrutura da dica da lista, porém com fundo claro em vez de mint |
| **Card-opção** (Por data e horário / Por local) | 193 × 55 e 163 × 55 dp | selecionado `white` + borda 1,5 dp `forest-700` · não selecionado `cream-100` | 14–16 | Círculo mint 34 dp + título 700 + descrição `ink-600`. Selecionado: **badge de check** 17 dp `forest-700` no canto superior direito. Não selecionado: **anel de radio** `border-strong`. |

### 7.4 Campos de formulário

| Campo | Dimensão | Fundo / borda | Conteúdo |
|---|---|---|---|
| **Input** ("Descrição") | 282 × 36 dp | `white` · 1 dp `border-subtle` · r 11 | Placeholder `ink-400`, sans 400, 11,5 dp. Helper `ink-600`, 8 dp. |
| **Select** (Data, Horário) | 198 × 36 e 128 × 36 dp | idem · r 13–14 | Ícone à esquerda · valor sans 500 · `chevron-down` |
| **Linha "Repetir"** | 337 × 44 dp | idem · r 14 | `refresh-cw` · título 700 + valor `ink-600` · `chevron-right` |
| **Busca de endereço** | 336 × 34 dp | idem · r ≈ 10–16 | `search` + placeholder |
| **Toggle** | formulário 39 × 24 dp · lista 32 × 19 dp | ON: `forest-600` (A na lista `#228360`, B `#30AB7B`) · thumb branco com sombra | Estado **OFF não aparece** em nenhuma imagem |
| **Slider** ("Raio de notificação") | trilho 5 dp de altura | preenchido `forest-600` · resto `track-off` | Thumb branco ~20 dp com `e2`; valor "150 m" à direita em `text-accent`, sans 700 |

### 7.5 Mapa

| Parte | Especificação |
|---|---|
| Mapa grande (2.png) | 336 × 127 dp, r 9–10; tiles de mapa claro (ruas brancas, quarteirões `#E6E1DD`, parque verde `#DEEADF`, água `#B0C8CB`) |
| Halo do raio | Círculo mint translúcido (§2.2) + aro; centro com pino `forest-pin` + ponto branco |
| Botões flutuantes | Brancos, ~27 dp, r ≈ 8 dp, `e2`: `navigation` (superior direito) e par `+` / `−` empilhado com filete |
| Chip "Usar minha localização" | Pílula branca ~137 × 22 dp, `locate-fixed` + texto sans 500 |
| Miniatura | 63 × 64 dp (lista) / 76 × 55 dp (sucesso): mapa pálido + halo + pino |

### 7.6 Navegação

| Componente | Especificação |
|---|---|
| **Tab bar** | 83 dp de altura; fundo `cream-100`; filete superior `#EFEEEB`; 4 itens: Início · **Lembretes (ativo)** · Mapa · Configurações; ícone 16 dp + rótulo sans 8 dp. Ativo: `ink-brand`, rótulo 700. Inativo: `#777C8A`, rótulo 400. |
| **App bar — lista** | Tile 34 dp + "Lembrete Geo" (serif 600 nas listas / sans 700 no onboarding) + tagline `on-dark-200`; à direita, 2 botões vidro (busca, mais) |
| **App bar — formulário** | Voltar (esq.) · título centralizado serif `title-md` + subtítulo `ink-600` |
| **App bar — sucesso** | Só `fechar` vidro no canto superior direito |
| **Pager** | 3 pílulas de 11,5 × 3,2 dp, gap 6 dp. Ativa branca `#F8F9F9`; inativas `rgba(255,255,255,.25)` |
| **Home indicator** | 134 × 5 dp, `home-indicator`, centralizado |

### 7.7 Blocos do onboarding e do sucesso

| Bloco | Especificação |
|---|---|
| **Feature** (×3) | Caixa vidro **43 dp**, r 19, ícone branco 19 dp; título sans 700 10,4 dp `#FFFFFF`; descrição sans 400 9,3 dp `on-dark-300`; centralizados; título pode quebrar em 2 linhas |
| **Chip flutuante** ("Na hora certa" / "No lugar certo") | Pílula de vidro escuro (`#173925` / `#11311F`) girada ≈ −8° / +8°, ícone + texto sans 600 branco |
| **Ícone de sucesso** | Quadrado 3D de **68 dp**, gradiente `#488063 → #0A1B11`, check branco `#F4F4F4`; halos concêntricos mint; 2 pontos luminosos `#F8FCFB`. **Asset raster** (§10) |
| **Rodapé de privacidade** | `lock` + "Seus lembretes, sua privacidade." sans 400 8 dp `on-dark-400` |

---

## 8. Estados dos botões e controles

Legenda: **● visível na imagem** · **○ não visível → proposta**.
As propostas derivam **matematicamente** das cores medidas (escurecer a base em 6 % / 12 %), para não introduzir estilo novo.

| Componente | Normal | Hover | Active / pressionado | Focus | Disabled |
|---|---|---|---|---|---|
| **CTA laranja** | ● `#FE532A` + glow | ○ `#EF4E28` (−6 %) | ○ `#DF4925` (−12 %), escala .98, glow reduzido | ○ anel 2 dp `forest-700`, offset 2 dp | ○ opacidade .45, sem glow |
| **Botão escuro** | ● `#254233` | ○ `#1F382B` (−15 %) | ○ `#1B3025` (−28 %), escala .98 | ○ anel 2 dp `mint-400` | ○ opacidade .45 |
| **Vidro** (Pular, busca…) | ● | ○ fundo `rgba(255,255,255,.10)` | ○ `rgba(255,255,255,.16)` | ○ anel 2 dp `mint-400` | ○ opacidade .4 |
| **Ação** (Editar…) | ● `#E3E7DC` | ○ `#D9DECF` | ○ `#CFD5C4`, escala .98 | ○ anel 2 dp `forest-700` | ○ opacidade .45 |
| **Chip de filtro** | ● ativo `#12432F` · inativo `#F3F4EF` | ○ inativo `#ECEDE7` | ○ escala .97 | ○ anel 2 dp `forest-700` | n/a |
| **Card-opção** | ● selecionado e não selecionado | ○ não selecionado: fundo `white` | ○ escala .99 | ○ anel 2 dp `forest-700` | ○ opacidade .5 |
| **Toggle** | ● **só ON** | — | — | ○ anel 2 dp `forest-700` | ○ opacidade .5 |
| **Toggle OFF** | ○ trilho `track-off` `#D6D5D5` (já existe no slider), thumb branco à esquerda | | | | |
| **Tab item** | ● ativo / inativo | — (mobile) | ○ opacidade .6 | ○ anel | n/a |
| **Input** | ● vazio (placeholder) | ○ borda `#D6D5D5` | — | ○ borda 1,5 dp `forest-700` + halo `rgba(24,92,75,.15)` | ○ fundo `cream-100`, texto `ink-400` |
| **Input — erro** | ○ **não visível** | | | | ○ proposta abaixo |

**Erro (não existe nas imagens):** [PROPOSTO] borda `#D43A2A` e mensagem em `#D43A2A`, sans 400 8 dp. Antes de implementar, vou **parar e perguntar**, como você pediu.

**Não aparecem em nenhuma imagem:** hover, pressed, focus, disabled, loading, toggle OFF, erro, estado vazio da lista, estado "Por local" selecionado.

---

## 9. Responsividade e breakpoints

**Nada disso é identificável** nas imagens: existe **um único viewport** (≈ 393 × 852 dp). Não há tablet, desktop nem paisagem.

[PROPOSTO]:

| Faixa | Comportamento |
|---|---|
| ≤ 359 px | Layout proporcional (encolhe junto com a largura) |
| 360–430 px | **Referência**: layout fiel ao frame de 393 |
| ≥ 431 px | Coluna de celular de largura máxima **430 px**, centralizada, sobre fundo neutro; topo/rodapé do app dentro da coluna |

**Como preservar as proporções:** definir uma unidade `--u = largura-do-frame ÷ 851` e escrever as medidas em `du`. Assim tudo escala 1:1 com a imagem, em qualquer largura.
**Contrapartida:** o texto fica pequeno (§3.2). A alternativa é usar dp/px fixos com um piso de legibilidade (≥ 11 px), o que **altera** a proporção em relação às imagens. Decisão sua (§11, pergunta 3).

---

## 10. Assets raster (não reproduzíveis só com CSS)

Estes elementos são **arte fotográfica/3D** nas imagens. Não posso extrair "as cores" e recriá-los fielmente em CSS:

| Asset | Tela | Descrição |
|---|---|---|
| Fundo fotográfico de folhagem desfocada | 1, 2, 4 | Foto com véu verde |
| **Pino 3D** com relógio sobre placa de mapa + anel luminoso | 1 | Ilustração principal (≈ 260 × 230 dp) |
| **Ícone de sucesso 3D** + halos | 4 | Quadrado verde com check |
| Fundo de montanhas desfocadas | 3, 5 | Atrás do header |
| Miniaturas de mapa e mapa grande | 2, 3, 4, 5 | Tiles de mapa |
| Frase manuscrita "Mais Liberdade para o seu dia" | 1 | Provável arte |

Você pediu para **não usar o PNG como tela** (nem "print"). Isto continua valendo: layout, texto, botões e cards serão código. Para os itens acima preciso da sua decisão (§11, pergunta 4).

---

## 11. Decisões pendentes (preciso de você antes da Fase 2)

Nenhuma delas impede aprovar o Design System, mas todas afetam a fidelidade.

1. **Qual versão da lista seguir: `3.png` (A) ou `5.png` (B)?**
   Recomendo **B** (mais recente, título serif de card coerente com o 4.png, ícone de raio limpo), mas as tags de B têm contraste ruim (§2.5). Posso usar a estrutura da B com as cores de tag da A. Diga o que prefere.

2. **Duas serifs (Source Serif 4 nas telas 1/3/5 e Lora nas 2/4) ou uma só?**
   Duas = fidelidade máxima a cada tela, porém menos coerente. Uma (recomendo **Source Serif 4**, presente em 3 de 5 telas) = mais consistente, com pequena diferença visual nos títulos de 2 e 4.
   Também: o "Lembrete Geo" é **sans** no 1.png e **serif** no 3/5.png; e o rótulo do CTA é **serif** só no 2.png.

3. **Tamanho do texto: proporcional às imagens ou com piso de legibilidade?**
   Proporcional = idêntico à imagem, texto `micro` ~7–8 px em celular. Com piso ≥ 11 px = mais legível, mas o layout se desvia da imagem.

4. **Assets raster (pino 3D, ícone 3D, fundos, mapas):** (a) recorto das próprias imagens de `./ref/` o que for possível, (b) recrio aproximado em SVG/CSS, ou (c) você fornece os arquivos? Recomendo **(a) para o pino e o ícone 3D** + **(b) para fundos e mapas**.

5. **Tag "Por horário" usa o ícone `map-pin`** (3.png e 5.png), o que parece incoerente para um lembrete por horário (deveria ser relógio/calendário). Reproduzo fielmente ou uso `clock`?

6. **Ícone "Raio de X metros":** o 3.png mostra um glifo ilegível; o 5.png um radar. Uso o do 5.png?

7. **Datas de exemplo:** as imagens mostram "Ter, 16 de set de 2026", mas 16/09/2026 é **quarta-feira** (os dias da semana correspondem a 2025). Uso os textos **exatos das imagens** ou calculo o dia da semana real?

8. **Telas e comportamentos que não existem nas imagens** (vou perguntar item a item na Fase 2, se você quiser): slides 2 e 3 do onboarding; abas Início, Mapa e Configurações; filtro "Locais"; menu `⋯` e busca; seletores de data/hora/repetição; o modo "Por local"; ações Editar/Duplicar/Excluir/Compartilhar.

---

## 12. Tokens CSS — rascunho (primitivo → semântico → componente)

Pronto para servir de base à Fase 2. **Não é código de interface.**

```css
:root {
  /* ── Unidade proporcional (1 du = 1 px da imagem de 851 px) ── */
  --u: calc(100cqw / 851);

  /* ── PRIMITIVAS ─────────────────────────────── */
  /* forest */
  --forest-950:#0D2A1B; --forest-900:#12432F; --forest-800:#254233;
  --forest-700:#185C4B; --forest-600:#216955; --forest-pin:#054C39;
  /* mint */
  --mint-50:#E7F4EB;  --mint-100:#DBF1E5; --mint-200:#C6E4D5; --mint-tint:#E2EAE2;
  --mint-300:#94F9CD; --mint-400:#7FEAC6; --status-green:#029554;
  /* orange */
  --orange-500:#FE532A;
  /* neutros */
  --white:#FFFFFF; --cream-100:#FAF9F6; --cream-200:#F5F2ED; --chip-off:#F3F2F0;
  --border-subtle:#E7E8EA; --divider:#E8E7E6; --border-strong:#B9B8BB;
  --track-off:#D6D5D5; --frost:#E3E7DC; --home-indicator:#B7B3AE;
  /* tinta */
  --ink-900:#0A0A0A; --ink-brand:#0A3924; --ink-600:#767880; --ink-400:#85858F;
  --text-accent:#086952; --tab-inactive:#777C8A;
  --on-dark-100:#FDFAF6; --on-dark-200:#CCD8D0; --on-dark-300:#B1C3B8; --on-dark-400:#A7B9B0;

  /* ── SEMÂNTICAS ─────────────────────────────── */
  --bg-page:var(--cream-200);      --bg-card:var(--cream-100);   --bg-field:var(--white);
  --action-primary:var(--orange-500);   --action-secondary:var(--forest-800);
  --selected-border:var(--forest-700);  --control-on:var(--forest-600);
  --text-primary:var(--ink-900); --text-secondary:var(--ink-600); --text-placeholder:var(--ink-400);
  --glass-bg:rgba(255,255,255,.05); --glass-border:rgba(255,255,255,.20);
  --radius-halo-fill:rgba(45,170,120,.21); --radius-halo-line:rgba(45,170,120,.32);

  /* categorias (variante B; A comentada em §2.3) */
  --cat-green-bar:#39C391;  --cat-green-bg:#DBF1E4;  --cat-green-tag:#DAF4E6;  --cat-green-fg:#18714E;
  --cat-orange-bar:#FD6C34; --cat-orange-bg:#FDE6D6; --cat-orange-tag:#FDE5D7; --cat-orange-fg:#F86327;
  --cat-blue-bar:#51A6F6;   --cat-blue-bg:#D5E8F9;   --cat-blue-tag:#D6E9F9;   --cat-blue-fg:#2C91EA;
  --cat-purple-bar:#B287E8; --cat-purple-bg:#EADFFB; --cat-purple-tag:#ECE4FB; --cat-purple-fg:#9265D8;
  --cat-pink-bar:#F980B3;   --cat-pink-bg:#FCE3E9;   --cat-pink-tag:#FCE6EC;   --cat-pink-fg:#ED6E9E;

  /* tipografia */
  --font-sans:'Nunito Sans',system-ui,sans-serif;
  --font-serif:'Source Serif 4',Georgia,serif;
  --font-serif-alt:'Lora',Georgia,serif;
  --fs-display:127; --fs-title-xl:59; --fs-title-lg:55; --fs-title-md:35;      /* em du */
  --fs-body-lg:29;  --fs-body:25;    --fs-label:23;    --fs-caption:20; --fs-micro:17;

  /* raios (du) */
  --r-sheet:38; --r-card-lg:34; --r-card:24; --r-field:28; --r-thumb:24; --r-map:20; --r-feature:41;

  /* sombras */
  --shadow-card:0 1px 3px rgba(20,40,30,.05), 0 4px 12px rgba(20,40,30,.04);
  --shadow-float:0 1px 4px rgba(0,0,0,.16);
  --shadow-cta:0 8px 24px rgba(254,83,42,.30);

  /* ── COMPONENTE (exemplo) ───────────────────── */
  --btn-primary-bg:var(--action-primary);
  --btn-primary-bg-hover:#EF4E28;
  --btn-primary-bg-active:#DF4925;
  --chip-active-bg:var(--forest-900);
  --chip-inactive-bg:var(--chip-off);
}
```

---

## Resumo do que preciso que você valide

1. **Paleta** (§2) — os hex medidos e a escolha de canônicos onde as telas divergem.
2. **Tipografia** (§3) — Nunito Sans + serif(s).
3. **Propostas de estados** (§8) — hover/pressed/focus/disabled/toggle OFF/erro.
4. **As 8 decisões pendentes** (§11), principalmente **1 a 4**.
