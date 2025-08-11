import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import useAuth from '../store/useAuth';
import { api } from '../lib/api';

export default function OffersScreen() {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);
  const [productName, setProductName] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [extraFlat, setExtraFlat] = useState('0');

  const load = async () => {
    const res = await api('/painters/offers');
    setOffers(res);
  };
  useEffect(() => { load(); }, []);

  const createOffer = async () => {
    await api('/admin/offers', { method: 'POST', token, body: { productName, commissionPercent: Number(commissionPercent), extraFlat: Number(extraFlat) } });
    setProductName(''); setCommissionPercent(''); setExtraFlat('0');
    load();
  };
  const removeOffer = async (id) => {
    await api(`/admin/offers/${id}`, { method: 'DELETE', token });
    load();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Create Offer</Text>
      <TextInput placeholder="Product" value={productName} onChangeText={setProductName} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Percent" value={commissionPercent} onChangeText={setCommissionPercent} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <TextInput placeholder="Extra Flat" value={extraFlat} onChangeText={setExtraFlat} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginTop: 8 }} />
      <Button title="Create" onPress={createOffer} />

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Offers</Text>
      <FlatList data={offers} keyExtractor={(i) => i._id} renderItem={({ item }) => (
        <View style={{ marginBottom: 12 }}>
          <Text>{item.productName} — {item.commissionPercent}% + {item.extraFlat}</Text>
          <Button title="Deactivate" onPress={() => removeOffer(item._id)} />
        </View>
      )} />
    </View>
  );
}


