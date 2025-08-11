import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import AuthScreen from './src/screens/AuthScreen';
import OTPScreen from './src/screens/OTPScreen';
import PendingScreen from './src/screens/PendingScreen';
import HomeScreen from './src/screens/HomeScreen';
import useAuth from './src/store/useAuth';

const Stack = createNativeStackNavigator();

export default function App() {
  const { token, setToken, status, setStatus } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync('token');
      if (saved) setToken(saved);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="Pending" component={PendingScreen} />
          </>
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


