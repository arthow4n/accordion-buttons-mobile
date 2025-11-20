import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAssets } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from 'react';

import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  const [assets, error] = useAssets([require('./assets/index.html')]);

  useEffect(() => {
    async function configureImmersiveMode() {
      await NavigationBar.setVisibilityAsync('hidden');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    configureImmersiveMode();
  }, []);

  if (error) {
    console.error("Error loading assets:", error);
  }

  if (!assets) {
    console.log("Assets loading...");
    return <View style={styles.container} />;
  }

  const indexHtmlUri = assets[0].localUri;
  console.log("Asset loaded:", indexHtmlUri);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <WebView
        originWhitelist={['*']}
        source={{ uri: indexHtmlUri }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        overScrollMode="never"
        bounces={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
