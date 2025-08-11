import { useState } from 'react';

export default function useAuth() {
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    const res = await fetch('http://localhost:3000/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.token);
  };

  const logout = () => setToken(null);

  return { token, login, logout };
}


