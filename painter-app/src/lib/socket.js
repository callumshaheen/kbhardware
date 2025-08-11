import { io } from 'socket.io-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export function initSocket(token) {
  const socket = io(BASE_URL, { transports: ['websocket'], auth: { token } });
  return socket;
}


