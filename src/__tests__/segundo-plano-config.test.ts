import fs from 'fs';
import path from 'path';

const RAIZ = path.join(__dirname, '../..');
const app = JSON.parse(fs.readFileSync(path.join(RAIZ, 'app.json'), 'utf8')).expo as { plugins: unknown[]; android: { permissions: string[]; blockedPermissions: string[] } };
const pacote = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
const plugin = (nome: string) => (app.plugins.find((p) => Array.isArray(p) && p[0] === nome) as [string, Record<string, unknown>])[1];

describe('configuração nativa do aviso com o app fechado', () => {
  it('a localização em segundo plano está ligada nas duas plataformas (sem isto o geofence do sistema é recusado)', () => {
    expect(plugin('expo-location')).toMatchObject({ isIosBackgroundLocationEnabled: true, isAndroidBackgroundLocationEnabled: true });
  });

  it('sem serviço em primeiro plano: o geofence do Android não precisa dele e ele traria declarações extras nas lojas', () => {
    expect(plugin('expo-location').isAndroidForegroundServiceEnabled).toBe(false);
  });

  it('o texto de permissão de "sempre" existe e fala do uso real', () => {
    expect(String(plugin('expo-location').locationAlwaysAndWhenInUsePermission)).toContain('avisar quando você chega');
    expect(String(plugin('expo-location').locationAlwaysPermission)).toContain('avisar quando você chega');
  });

  it('os alarmes exatos dos avisos por horário continuam declarados', () => {
    expect(app.android.permissions).toEqual(expect.arrayContaining(['android.permission.SCHEDULE_EXACT_ALARM', 'android.permission.USE_EXACT_ALARM']));
  });

  it('o gerenciador de tarefas está instalado (a tarefa em segundo plano depende dele)', () => {
    expect(pacote.dependencies['expo-task-manager']).toBeDefined();
    expect(pacote.dependencies['expo-location']).toBeDefined();
  });
});
