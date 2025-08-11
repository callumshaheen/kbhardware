import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { api } from '../lib/api';

export default function AuthScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    setLoading(true);
    try {
      await api('/auth/request-otp', { method: 'POST', body: { phone } });
      navigation.navigate('OTP', { phone });
    } catch (e) {
      alert('Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Enter phone</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="+91..." style={{ borderWidth: 1, padding: 8 }} />
      <Button title={loading ? 'Sending...' : 'Send OTP'} onPress={requestOtp} />
    </View>
  );
}


