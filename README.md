# Lembrete Geo

App de lembretes por horário e por local. Implementação fiel às referências em `./ref/` (ver `DESIGN_SYSTEM.md`).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build
```

## Estrutura

```
src/
  styles/        tokens.css (Design System) · global.css
  components/    Frame, Button, Toggle, Slider, Tag, FilterChip, TabBar, MapPanel, ReminderCard, TipCard…
  screens/       Onboarding · NovoLembrete · Lembretes · Sucesso
  state/ data/   estado local em memória e dados de exemplo (idênticos às imagens)
tools/build-assets.py   gera public/assets/ a partir de ./ref/ (fundos sem UI, mapas, miniaturas)
```

## Unidade `du`

Todas as medidas extraídas das imagens estão em `du` (1 du = 1 px do frame de 851 px). Em CSS escreve-se
`24du`; o plugin em `vite.config.ts` converte para `calc(24 * var(--u))`, e `--u` escala com a largura do
frame (máx. 430 px). Assim o layout mantém as proporções das referências em qualquer tela.
Abra qualquer rota com `?ref` para renderizar o frame em 851 px (1 du = 1 px) e comparar com `./ref/`.

## Rotas

`/` onboarding · `/novo` novo lembrete · `/lembretes` lista · `/sucesso` lembrete criado
