import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useUser } from '../store/useUser';
import { useApi } from '../lib/useApi';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export default function OffersScreen() {
  const { token } = useUser();
  const { request, loading, error } = useApi();
  const [offers, setOffers] = useState([]);
  const [productName, setProductName] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [extraFlat, setExtraFlat] = useState('0');
  const [inputError, setInputError] = useState({});
  const [toast, setToast] = useState('');

  const validate = () => {
    const err = {};
    if (!productName) err.productName = 'Product required';
    if (!commissionPercent || isNaN(commissionPercent)) err.commissionPercent = 'Valid percent required';
    if (!extraFlat || isNaN(extraFlat)) err.extraFlat = 'Valid flat required';
    setInputError(err);
    return Object.keys(err).length === 0;
  };

  const load = async () => {
    try {
      const res = await request('/painters/offers');
      setOffers(res);
    } catch (e) {
      setToast(error || 'Failed to load offers');
      setTimeout(() => setToast(''), 2000);
    }
  };
  useEffect(() => { load(); }, []);

  const createOffer = async () => {
    if (!validate()) return;
    try {
      await request('/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ productName, commissionPercent: Number(commissionPercent), extraFlat: Number(extraFlat) }),
      });
      setProductName(''); setCommissionPercent(''); setExtraFlat('0');
      load();
    } catch (e) {
      setToast(error || 'Failed to create offer');
      setTimeout(() => setToast(''), 2000);
    }
  };
  const removeOffer = async (id) => {
    try {
      await request(`/admin/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      load();
    } catch (e) {
      setToast(error || 'Failed to remove offer');
      setTimeout(() => setToast(''), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Offer</Text>
      <Input placeholder="Product" label="Product" value={productName} onChangeText={setProductName} error={inputError.productName} />
      <Input placeholder="Percent" label="Percent" value={commissionPercent} onChangeText={setCommissionPercent} keyboardType="numeric" error={inputError.commissionPercent} />
      <Input placeholder="Extra Flat" label="Extra Flat" value={extraFlat} onChangeText={setExtraFlat} keyboardType="numeric" error={inputError.extraFlat} />
      <Button title="Create" onPress={createOffer} loading={loading} disabled={loading} />
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}

      <Text style={styles.subtitle}>Offers</Text>
      <FlatList
        data={offers}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.offerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerText}>{item.productName} — {item.commissionPercent}% + {item.extraFlat}</Text>
              </View>
              <Button title="Deactivate" onPress={() => removeOffer(item._id)} style={styles.deactivateBtn} />
            </View>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  subtitle: { marginTop: 16, fontWeight: 'bold', fontSize: 16 },
  toast: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    textAlign: 'center',
  },
  offerRow: { flexDirection: 'row', alignItems: 'center' },
  offerText: { fontSize: 15 },
  deactivateBtn: { marginLeft: 8 },
});


