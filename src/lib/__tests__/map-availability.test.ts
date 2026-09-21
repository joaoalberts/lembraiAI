import { nativeMapUnavailable } from '../map-availability';

describe('nativeMapUnavailable', () => {
  it.each([
    ['android', 'standalone', false, true],   // build próprio sem a chave: o SDK derrubaria o app
    ['android', 'bare', false, true],
    ['android', 'standalone', true, false],   // com a chave, tudo certo
    ['android', 'storeClient', false, false], // Expo Go usa a chave do próprio Expo
    ['ios', 'standalone', false, false],      // Apple Maps não precisa de chave
    ['ios', 'storeClient', false, false],
  ])('%s / %s / chave=%s -> indisponível=%s', (os, env, configured, esperado) => {
    expect(nativeMapUnavailable(os, env, configured)).toBe(esperado);
  });
});
