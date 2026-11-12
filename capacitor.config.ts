import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bridgeblitz.game',
  appName: 'Bridge Blitz',
  webDir: 'dist',
  backgroundColor: '#111c27',
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
