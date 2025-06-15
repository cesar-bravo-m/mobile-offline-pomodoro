import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import Main from './(main)/index';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('black');
  }, []);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Main />
      <StatusBar
        style="dark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});