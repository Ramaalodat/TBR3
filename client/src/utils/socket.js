import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket'],
  autoConnect: true, // <-- force auto connection
});

socket.on('connect', () => {
  console.log('connected to socket server:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('socket connection error:', err);
});

export default socket;
