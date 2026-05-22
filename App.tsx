import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  ActivityIndicator,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastProvider } from './src/context/ToastContext';
import { DarkTheme, LightTheme } from './src/constants/apptheme';
import RootNavigator from './src/routes/rootNavigator';
import { store, persistor } from './src/store/store';

function App() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate
          loading={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator />
            </View>
          }
          persistor={persistor}
        >
          <NavigationContainer
            theme={scheme === 'dark' ? DarkTheme : LightTheme}
          >
            <StatusBar
              barStyle={scheme === 'light' ? 'light-content' : 'dark-content'}
            />
            <SafeAreaProvider>
              <ToastProvider>
                <RootNavigator />
              </ToastProvider>
            </SafeAreaProvider>
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
