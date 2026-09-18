import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function MessagesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.userId);
    }

    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/messages/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setContacts(res.data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusIcon = (contact) => {
    if (contact.last_sender_id !== currentUserId) return null;

    const style = {
      fontSize: '15px',
      marginLeft: '6px'
    };

    if (contact.last_status === 'read') {
      return <span style={{ ...style, color: '#10b981' }}>✔✔</span>;
    } else {
      return <span style={{ ...style, color: '#bbb' }}>✔</span>;
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '30px' }}>Loading conversations...</p>;
  if (contacts.length === 0) return <p style={{ textAlign: 'center', marginTop: '30px' }}>No conversations yet.</p>;

  return (
    <div style={{
      maxWidth: '650px',
      margin: 'auto',
      padding: '20px',
      fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '26px',
        fontWeight: '700',
        color: '#b91c1c'
      }}>
        Messages
      </h2>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {contacts.map(contact => (
          <li
            key={contact.id}
            onClick={() => navigate(`/dm/${contact.id}`)}
            style={{
              cursor: 'pointer',
              padding: '16px 20px',
              marginBottom: '14px',
              borderRadius: '12px',
              backgroundColor: '#fefefe',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fefefe')}
          >
            {/* Avatar */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#16a34a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              {contact.username?.charAt(0)?.toUpperCase() || '?'}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{
                  fontWeight: contact.unread_count > 0 ? '700' : '500',
                  fontSize: '17px',
                  color: '#111'
                }}>
                  {contact.username}
                </span>
                {contact.unread_count > 0 && (
                  <span style={{
                    backgroundColor: '#10b981',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    marginLeft: '12px',
                    lineHeight: '1'
                  }}>
                    {contact.unread_count}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '15px',
                color: '#444',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center'
              }}>
                {contact.last_message || 'No messages yet'} {getStatusIcon(contact)}
              </div>
            </div>

            {/* Timestamp */}
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginLeft: '10px',
              whiteSpace: 'nowrap'
            }}>
              {formatTime(contact.last_timestamp)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
