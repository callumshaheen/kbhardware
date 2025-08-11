import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import useAuth from '../store/useAuth';
import { api } from '../lib/api';

export default function LoginScreen() {
  const { setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = async () => {
    setLoading(true);
    try {
      const res = await api('/admin/login', { method: 'POST', body: { email, password } });
      setToken(res.token);
    } catch (e) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ padding: 16 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 8 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
      <Button title={loading ? '...' : 'Login'} onPress={login} />
    </View>
  );
}


