import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import useAuth from '../store/useAuth';
import { api } from '../lib/api';

export default function PendingPaintersScreen() {
  const { token } = useAuth();
  const [painters, setPainters] = useState([]);
  const load = async () => {
    const res = await api('/admin/painters?status=pending', { token });
    setPainters(res);
  };
  useEffect(() => { load(); }, [token]);

  const approve = async (id) => {
    await api(`/admin/painters/${id}/approve`, { method: 'PATCH', token });
    load();
  };
  const reject = async (id) => {
    await api(`/admin/painters/${id}/reject`, { method: 'PATCH', token });
    load();
  };
  return (
    <View style={{ padding: 16 }}>
      <FlatList data={painters} keyExtractor={(i) => i._id} renderItem={({ item }) => (
        <View style={{ marginBottom: 12 }}>
          <Text>{item.phone}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Approve" onPress={() => approve(item._id)} />
            <Button title="Reject" onPress={() => reject(item._id)} />
          </View>
        </View>
      )} />
    </View>
  );
}


