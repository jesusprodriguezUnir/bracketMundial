import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jesusprodriguez.bracketmundial',
  appName: 'Bracket Mundial 2026',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
