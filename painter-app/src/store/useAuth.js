import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuth = create((set) => ({
  token: null,
  status: null,
  setToken: async (token) => {
    if (token) await SecureStore.setItemAsync('token', token);
    set({ token });
  },
  setStatus: (status) => set({ status }),
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, status: null });
  },
}));

export default useAuth;


