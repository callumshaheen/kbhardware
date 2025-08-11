import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../store/useUser';
import { useApi } from '../lib/useApi';
import Button from '../components/Button';
import Input from '../components/Input';

export default function LoginScreen() {
  const { setToken } = useUser();
  const { request, loading, error } = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputError, setInputError] = useState({});
  const [toast, setToast] = useState('');

  const validate = () => {
    const err = {};
    if (!email) err.email = 'Email required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err.email = 'Invalid email';
    if (!password) err.password = 'Password required';
    setInputError(err);
    return Object.keys(err).length === 0;
  };

  const login = async () => {
    if (!validate()) return;
    try {
      const res = await request('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
    } catch (e) {
      setToast(error || 'Login failed');
      setTimeout(() => setToast(''), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        error={inputError.email}
        keyboardType="email-address"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={inputError.password}
      />
      <Button title="Login" onPress={login} loading={loading} disabled={loading} />
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  toast: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    textAlign: 'center',
  },
});


