/** Registro do Service Worker e convite de instalação (PWA). */

export interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('Service Worker não registrado:', e));
  });
}

/** Já está rodando como app instalado (tela inicial / janela própria)? */
export const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as { standalone?: boolean }).standalone === true;

/**
 * O `beforeinstallprompt` dispara uma única vez, normalmente antes de qualquer tela montar — por isso ele é
 * capturado aqui, no nível do módulo, e guardado para ser usado quando a pessoa tocar em "Instalar".
 */
let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallPrompt; emit(); });
  window.addEventListener('appinstalled', () => { deferred = null; emit(); });
}

export const installStore = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  get: () => deferred,
};

/** Abre o diálogo nativo de instalação. Devolve se a pessoa aceitou. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  deferred = null; emit();
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === 'accepted';
}

/** iOS não dispara `beforeinstallprompt`: lá a instalação é manual, pelo menu Compartilhar do Safari. */
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
