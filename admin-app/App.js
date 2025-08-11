import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './src/screens/LoginScreen';
import PendingPaintersScreen from './src/screens/PendingPaintersScreen';
import OffersScreen from './src/screens/OffersScreen';
import CommissionsScreen from './src/screens/CommissionsScreen';
import useAuth from './src/store/useAuth';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();


export default function App() {
  const { token } = useAuth();
  const { token, login, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  if (!isLoggedIn) {
    return <LoginScreen login={login} />;
  }

  return (
    <NavigationContainer>
      <Tabs.Navigator>
        <Tabs.Screen name="Pending Painters" component={PendingPaintersScreen} />
        <Tabs.Screen name="Offers" component={OffersScreen} />
        <Tabs.Screen name="Commissions" component={CommissionsScreen} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}


