import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EditUserInfo from '../components/ProfileStuff/EditUserInfo';
import ProfileInfo from '../components/ProfileStuff/ProfileInfo';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    phone_number: '',
    location: '',
    rating: null,
    active_posts: 0,
    feedbacks: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login to view your profile");
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile data');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const userData = data[0];

          setUserInfo({
            username: userData.username || '',
            email: userData.email || '',
            phone_number: userData.phone_number || 'Not provided',
            location: userData.location || 'Not specified',
            rating: typeof userData.rating === 'number' ? userData.rating : null,
            active_posts: typeof userData.active_posts === 'number' ? userData.active_posts : 0,
            feedbacks: Array.isArray(userData.feedbacks) ? userData.feedbacks : []
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err.message);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo userInfo={userInfo} />;
      case 'edit':
        return <EditUserInfo userInfo={userInfo} setUserInfo={setUserInfo} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="mb-8 flex justify-center">
          <nav className="inline-flex space-x-4 bg-white rounded-2xl shadow-lg p-2">
            {[
              { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'edit', label: 'Edit Profile', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === id
                    ? 'bg-red-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Render Profile Info or Edit Form */}
        {renderContent()}
      </div>
    </div>
  );
}
