import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import useAuth from '../store/useAuth';
import { api } from '../lib/api';
import { initSocket } from '../lib/socket';

export default function HomeScreen() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let socket;
    (async () => {
      const me = await api('/painters/me', { token });
      setProfile(me);
      const of = await api('/painters/offers');
      setOffers(of);
      const lb = await api('/painters/leaderboard');
      setLeaderboard(lb);
      socket = initSocket(token);
      socket.emit('join_leaderboard');
      socket.on('balance_update', (payload) => {
        setProfile((p) => (p ? { ...p, totalCommission: payload.totalCommission } : p));
      });
      socket.on('leaderboard_update', (data) => setLeaderboard(data));
    })();
    return () => socket && socket.disconnect();
  }, [token]);

  return (
    <View style={{ padding: 16 }}>
      <Text>Total Commission: {profile?.totalCommission ?? 0}</Text>
      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Offers</Text>
      <FlatList data={offers} keyExtractor={(i) => i._id} renderItem={({ item }) => (
        <Text>{item.productName} — {item.commissionPercent}% + {item.extraFlat}</Text>
      )} />
      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Leaderboard</Text>
      <FlatList data={leaderboard} keyExtractor={(i) => i._id} renderItem={({ item, index }) => (
        <Text>#{index + 1} {item.phone} — {item.totalCommission}</Text>
      )} />
    </View>
  );
}


