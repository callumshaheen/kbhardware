import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from '../store/useUser';
import { useApi } from '../lib/useApi';
import Card from '../components/Card';
import { initSocket } from '../lib/socket';

export default function HomeScreen() {
  const { token } = useUser();
  const { request, loading, error } = useApi();
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let socket;
    (async () => {
      try {
        const me = await request('/painters/me', {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setProfile(me);
        const of = await request('/painters/offers');
        setOffers(of);
        const lb = await request('/painters/leaderboard');
        setLeaderboard(lb);
        socket = initSocket(token);
        socket.emit('join_leaderboard');
        socket.on('balance_update', (payload) => {
          setProfile((p) => (p ? { ...p, totalCommission: payload.totalCommission } : p));
        });
        socket.on('leaderboard_update', (data) => setLeaderboard(data));
      } catch (e) {
        setToast(error || 'Failed to load data');
        setTimeout(() => setToast(''), 2000);
      }
    })();
    return () => socket && socket.disconnect();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Commission: {profile?.totalCommission ?? 0}</Text>
      <Text style={styles.subtitle}>Offers</Text>
      {loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
      <FlatList
        data={offers}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.offerText}>{item.productName} — {item.commissionPercent}% + {item.extraFlat}</Text>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
      <Text style={styles.subtitle}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(i) => i._id}
        renderItem={({ item, index }) => (
          <Card>
            <Text style={styles.leaderText}>#{index + 1} {item.phone} — {item.totalCommission}</Text>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
      {toast ? <Text style={styles.toast}>{toast}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  subtitle: { marginTop: 16, fontWeight: 'bold', fontSize: 16 },
  offerText: { fontSize: 15 },
  leaderText: { fontSize: 15 },
  toast: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    textAlign: 'center',
  },
});


