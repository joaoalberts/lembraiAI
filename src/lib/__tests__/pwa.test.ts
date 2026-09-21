import { isIOS, isInstalled } from '../pwa';

describe('PWA', () => {
  beforeEach(() => {
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    }
  });

  describe('isInstalled', () => {
    it('retorna true se em display-mode: standalone', () => {
      jest.mocked(window.matchMedia).mockReturnValue({ matches: true } as never);
      expect(isInstalled()).toBe(true);
    });

    it('retorna true se navigator.standalone é true (iOS)', () => {
      (navigator as { standalone?: boolean }).standalone = true;
      jest.mocked(window.matchMedia).mockReturnValue({ matches: false } as never);
      expect(isInstalled()).toBe(true);
      delete (navigator as { standalone?: boolean }).standalone;
    });

    it('retorna false se não está instalado', () => {
      jest.mocked(window.matchMedia).mockReturnValue({ matches: false } as never);
      (navigator as { standalone?: boolean }).standalone = false;
      expect(isInstalled()).toBe(false);
    });
  });

  describe('isIOS', () => {
    const originalUserAgent = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
    const originalPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform');

    afterEach(() => {
      if (originalUserAgent) Object.defineProperty(navigator, 'userAgent', originalUserAgent);
      if (originalPlatform) Object.defineProperty(navigator, 'platform', originalPlatform);
    });

    it('retorna true para iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'iPhone', writable: true });
      expect(isIOS()).toBe(true);
    });

    it('retorna true para iPad', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'iPad', writable: true });
      expect(isIOS()).toBe(true);
    });

    it('retorna true para iPod', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'iPod', writable: true });
      expect(isIOS()).toBe(true);
    });

    it('retorna false para Android', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Android', writable: true });
      expect(isIOS()).toBe(false);
    });
  });
});
