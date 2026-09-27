import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jss.kalirejo',
  appName: 'JSS Kalirejo',
  webDir: 'out',
  server: {
    // Remote URL: loads live Vercel site inside Android WebView
    url: 'https://web-jssv2-qjjh.vercel.app/m',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#FFFF00',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
