import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.testtube.app',
  appName: 'TestTube',
  webDir: 'build',
  server: {
    // Production: use the live site (faster, no bundling needed)
    // Comment out for fully offline/bundled native build
    url: 'https://testtube-rho.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',       // respect safe areas (notch, home bar)
    scrollEnabled: true,
    backgroundColor: '#0a0a0e',
  },
  android: {
    backgroundColor: '#0a0a0e',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0a0a0e',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Splash',
    },
    StatusBar: {
      style: 'dark',              // light icons on dark background
      backgroundColor: '#0a0a0e',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
