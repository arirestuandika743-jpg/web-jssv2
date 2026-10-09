import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jss.kalirejo',
  appName: 'JSS Kalirejo',
  webDir: 'out',
  server: {
    // Remote URL: loads live Vercel/production site inside native WebView
    url: 'https://web-jssv2-qjjh.vercel.app/m',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    webContentsDebuggingEnabled: false,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#000000',
      // Android-specific splash settings
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      // iOS-specific splash settings
      iosSpinnerStyle: 'large',
      spinnerColor: '#FFFF00',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;
