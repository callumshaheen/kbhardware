import React, { useState } from 'react';
import * as Notifications from 'expo-notifications';
import { View, Text, TextInput, Button } from 'react-native';
import { api } from '../lib/api';
import useAuth from '../store/useAuth';

export default function OTPScreen({ route, navigation }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const { setToken, setStatus } = useAuth();

  const verify = async () => {
    try {
      const res = await api('/auth/verify-otp', { method: 'POST', body: { phone, otp } });
      if (res.token) {
        await setToken(res.token);
        // Register for push notifications
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          const expoPushToken = tokenData.data;
          // Register device token with backend
          await api('/device/register', {
            method: 'POST',
            body: { token: expoPushToken, painterId: res.user?.id || res.user?._id || res.painterId },
            token: res.token,
          });
        }
      } else if (res.status) {
        setStatus(res.status);
        navigation.replace('Pending');
      }
    } catch (e) {
      alert('Verify failed');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Enter OTP sent to {phone}</Text>
      <TextInput value={otp} onChangeText={setOtp} placeholder="123456" style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Verify" onPress={verify} />
    </View>
  );
}


