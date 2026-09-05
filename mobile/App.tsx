import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { WEB_APP_URL } from './src/config';

SplashScreen.preventAutoHideAsync().catch(() => {});

const PINK = '#FF6FAE';

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const handleNavStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleLoadEnd = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />

        {hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>🥺</Text>
            <Text style={styles.errorTitle}>Couldn't reach Pookie Dashboard</Text>
            <Text style={styles.errorSubtitle}>Check your connection and try again.</Text>
            <Text style={styles.retryButton} onPress={handleRetry}>
              Retry ✨
            </Text>
          </View>
        ) : (
          <WebView
            key={reloadKey}
            ref={webviewRef}
            source={{ uri: WEB_APP_URL }}
            style={styles.webview}
            onNavigationStateChange={handleNavStateChange}
            onLoadEnd={handleLoadEnd}
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
            pullToRefreshEnabled
            allowsBackForwardNavigationGestures
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={PINK} />
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINK,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFF7FB',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7FB',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7FB',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4A3040',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#927A87',
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    color: '#fff',
    backgroundColor: PINK,
    fontWeight: '800',
    fontSize: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
