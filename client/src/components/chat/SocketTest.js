// DONT TOUCH THIS!!!!!!!!! MAVIS WAS HERE
// I REPEAT DONT TOUCH IT!
//I REPEAT AGAIN DONT TOUCH
import { useEffect, useState } from 'react';
import socket from '../../utils/socket';

export default function SocketTest() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    console.log('socketTest component mounted');

    socket.on('connect', () => {
      console.log('connected to WebSocket:', socket.id);
    });

    socket.on('message', (data) => {
      console.log('📨 Message received from server:', data);
      setChat((prev) => [...prev, data]);
    });

    socket.on('disconnect', () => {
      console.log('disconnected from WebSocket');
    });

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('disconnect');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('message', { text: message });
      setMessage('');
    }
  };

  return (
    <div>
      <h2>🧪 WebSocket Test Chat</h2>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>

      <div style={{ marginTop: '20px' }}>
        <h4>Chat Log:</h4>
        <ul>
          {chat.map((msg, index) => (
            <li key={index}>{msg.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
