import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './src/screens/LoginScreen';
import PendingPaintersScreen from './src/screens/PendingPaintersScreen';
import OffersScreen from './src/screens/OffersScreen';
import CommissionsScreen from './src/screens/CommissionsScreen';
import useAuth from './src/store/useAuth';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Pending" component={PendingPaintersScreen} />
      <Tabs.Screen name="Offers" component={OffersScreen} />
      <Tabs.Screen name="Commissions" component={CommissionsScreen} />
    </Tabs.Navigator>
  );
}

export default function App() {
  const { token } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


