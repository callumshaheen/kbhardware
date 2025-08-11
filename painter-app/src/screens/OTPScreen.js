import React, { useState } from 'react';
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


