import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import useAuth from '../store/useAuth';
import { api } from '../lib/api';

export default function CommissionsScreen() {
  const { token } = useAuth();
  const [painterId, setPainterId] = useState('');
  const [amount, setAmount] = useState('');
  const [offerId, setOfferId] = useState('');

  const submit = async () => {
    await api('/admin/commissions', { method: 'POST', token, body: { painterId, amount: Number(amount), offerId: offerId || undefined } });
    setPainterId(''); setAmount(''); setOfferId('');
    alert('Commission added');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Painter ID</Text>
      <TextInput value={painterId} onChangeText={setPainterId} style={{ borderWidth: 1, padding: 8 }} />
      <Text>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, padding: 8 }} />
      <Text>Offer ID (optional)</Text>
      <TextInput value={offerId} onChangeText={setOfferId} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Submit" onPress={submit} />
    </View>
  );
}


