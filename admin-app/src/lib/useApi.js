import { useUser } from '../store/useUser';
import { useState } from 'react';

export function useApi() {
  const { token, logout } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error(await res.text());
      }
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
}
