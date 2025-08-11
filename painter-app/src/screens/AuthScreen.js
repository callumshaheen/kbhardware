import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApi } from '../lib/useApi';
import Button from '../components/Button';
import Input from '../components/Input';

export default function AuthScreen({ navigation }) {
  const { request, loading, error } = useApi();
  const [phone, setPhone] = useState('');
  const [inputError, setInputError] = useState('');
  const [toast, setToast] = useState('');

  const validate = () => {
    if (!phone) return 'Phone required';
    if (!/^\+?\d{10,15}$/.test(phone)) return 'Invalid phone format';
    return '';
  };

  const requestOtp = async () => {
    const err = validate();
    setInputError(err);
    if (err) return;
    try {
      await request('/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      navigation.navigate('OTP', { phone });
    } catch (e) {
      setToast(error || 'Failed to request OTP');
      setTimeout(() => setToast(''), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="+91..."
        error={inputError}
        keyboardType="phone-pad"
      />
      <Button title="Send OTP" onPress={requestOtp} loading={loading} disabled={loading} />
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


