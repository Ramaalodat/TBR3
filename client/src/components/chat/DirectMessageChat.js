import { useEffect, useRef, useState } from 'react';
import socket from '../../utils/socket';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

export default function DirectMessageChat({ currentUserId, otherUserId }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [otherUserName, setOtherUserName] = useState(`User ${otherUserId}`);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const chatContainerRef = useRef(null);

  const PAGE_SIZE = 20;

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async (initial = false) => {
    try {
      const token = localStorage.getItem('token');
      const before = !initial && chat.length > 0 ? chat[0].timestamp : null;
      const url = `${process.env.REACT_APP_API_URL}/messages/${otherUserId}${before ? `?before=${before}` : ''}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const newMessages = res.data.map((msg) => ({
        id: msg.id,
        from: msg.sender_id === currentUserId ? 'me' : 'them',
        text: msg.content,
        timestamp: msg.timestamp,
        status: msg.status || 'sent',
      }));
      if (initial) {
        setChat(newMessages);
        setTimeout(() => scrollToBottom(), 0);
      } else {
        setChat((prev) => [...newMessages, ...prev]);
      }
      setHasMore(res.data.length === PAGE_SIZE);
      if (initial) {
        const readRes = await axios.patch(
          `${process.env.REACT_APP_API_URL}/messages/${otherUserId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (Array.isArray(readRes.data?.readMessageIds)) {
          readRes.data.readMessageIds.forEach((msgId) => {
            socket.emit('message_read', { readerId: currentUserId, messageId: msgId });
          });
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOtherUserName(res.data?.username || `User ${otherUserId}`);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUserName();
    fetchMessages(true);
    socket.emit('chat_open', { userId: currentUserId, chattingWith: otherUserId });

    return () => {
      socket.emit('chat_close', { userId: currentUserId });
      socket.emit('stop_typing', { fromUserId: currentUserId, toUserId: otherUserId });
    };
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    socket.connect();
    socket.emit('register', currentUserId);

    const handlePrivateMessage = ({ fromUserId, message, timestamp, id, status }) => {
      if (parseInt(fromUserId) === parseInt(otherUserId)) {
        setChat((prev) => {
          const exists = prev.some((msg) => msg.id === id);
          if (exists) return prev;
          return [...prev, { id, from: 'them', text: message, timestamp, status: status || 'delivered' }];
        });
        socket.emit('message_read', { readerId: currentUserId, messageId: id });
      }
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setChat((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)));
    };

    const handleTyping = ({ fromUserId }) => {
      if (parseInt(fromUserId) === parseInt(otherUserId)) setTypingIndicator(true);
    };

    const handleStopTyping = ({ fromUserId }) => {
      if (parseInt(fromUserId) === parseInt(otherUserId)) setTypingIndicator(false);
    };

    socket.on('private_message', handlePrivateMessage);
    socket.on('message_status_update', handleMessageStatusUpdate);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('private_message', handlePrivateMessage);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore) {
        setLoadingMore(true);
        const prevHeight = container.scrollHeight;
        await fetchMessages(false);
        requestAnimationFrame(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight;
        });
        setLoadingMore(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, chat]);

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages`,
        { receiver_id: otherUserId, content: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessage = {
        id: res.data.id,
        from: 'me',
        text: trimmed,
        timestamp: res.data.timestamp || new Date().toISOString(),
        status: 'sent',
      };

      setChat((prev) => [...prev, newMessage]);
      socket.emit('private_message', {
        toUserId: otherUserId,
        fromUserId: currentUserId,
        message: trimmed,
        messageId: res.data.id,
      });
      socket.emit('stop_typing', { fromUserId: currentUserId, toUserId: otherUserId });
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTypingChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { fromUserId: currentUserId, toUserId: otherUserId });
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { fromUserId: currentUserId, toUserId: otherUserId });
    }, 1500);
  };

  const handleEmojiClick = (emojiData) => setMessage((prev) => prev + emojiData.emoji);
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getTick = (msg) => {
    if (msg.from !== 'me') return null;
    const base = 'inline-block text-xs ml-2 align-middle';
    if (msg.status === 'read') return <span className={`${base} text-green-400`}>✔✔</span>;
    if (msg.status === 'delivered') return <span className={`${base} text-gray-400`}>✔✔</span>;
    return <span className={`${base} text-gray-400`}>✔</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-center text-2xl font-semibold mb-6 text-red-700">chatting with {otherUserName}</h2>
      <div
        ref={chatContainerRef}
        className="border border-gray-300 rounded-lg p-4 h-[70vh] overflow-y-auto bg-white shadow-sm"
      >
        {loadingMore && <div className="text-sm text-gray-400 text-center">loading...</div>}
        {chat.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className="text-sm max-w-md">
              <div className={`px-5 py-3 rounded-xl relative ${msg.from === 'me' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {msg.text}
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>{formatTime(msg.timestamp)}</span>
                {msg.from === 'me' && getTick(msg)}
              </div>
            </div>
          </div>
        ))}
        {typingIndicator && (
          <div className="flex items-center gap-1 mt-3 text-sm text-gray-500 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
            <span className="ml-2">{otherUserName} Typing..</span>
          </div>
        )}
      </div>

      {showEmojiPicker && (
        <div className="mt-3 w-full">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width="100%"
            height={350}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
            searchDisabled
            lazyLoadEmojis
            categories={[]}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl">😊</button>
        <input
          value={message}
          onChange={handleTypingChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 p-4 rounded-full border border-gray-300 text-sm outline-none bg-gray-50 w-full"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow"
        >send</button>
      </div>
    </div>
  );
}
