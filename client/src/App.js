import './App.css';
import React, { useState, useEffect } from "react";
import Layout from './Layout';
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer, cssTransition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages & Components
import HomePage from './pages/myFeed';
import AboutPage from './pages/AboutPage';
import CreatePostPage from './pages/PostsPages/CreatePostPage';
import SignInPage from './components/LoginStuff/SignInPage';
import RegistrationPage from './components/LoginStuff/RegistrationPage';
import PageNotFound from './pages/PageNotFound';
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './components/LoginStuff/ForgotPassword';
import ResetPassword from './components/LoginStuff/ResetPassword';
import AdminPanel from './pages/AdminStuff/AdminPanel';
import AdminPosts from './pages/AdminStuff/AdminPosts';
import AdminUsers from './pages/AdminStuff/AdminUsers';
import AdminEvents from './pages/AdminStuff/AdminEvents';
import AdminBanner from './pages/AdminStuff/AdminBanner';
import AdminFlaggedPosts from './pages/AdminStuff/AdminFlaggedPosts';
import NewHome from './pages/Home';
import SinglePost from './pages/PostsPages/SinglePostPage';
import EditPostPage from './pages/PostsPages/EditPostPage';
import MyPostsPage from "./pages/PostsPages/MyPostsPage";
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import UserProfilePage from './pages/UserProfilePage';
import EventForm from './components/events/EventForm';
import ShowEvent from './components/events/showEvent';
import Events from './pages/Events';
import ArabicFeed from './pages/arabic/myFeed';
import ArabicHome from './pages/arabic/Home';
import ArabicAboutPage from './pages/arabic/Aboutpage';
import ArabicCreatePostPage from './pages/arabic/CreatePostPage';
import ArabicProfilePage from './pages/ProfilePage';
import ArabicMyPostsPage from './pages/arabic/MyPostsPage';
import ArabicSinglePost from './pages/arabic/SinglePostPage';
import ArabicEditPostPage from './pages/arabic/EditPostPage';
import ArabicPrivacyPolicy from './pages/arabic/PrivacyPolicy';
import ArabicTermsOfService from './pages/arabic/TermsOfService';
import ArabicContactUs from './pages/arabic/ContactUs';
import ArabicEvents from './pages/arabic/Events';
import ArabicShowEvent from './pages/arabic/showEvent';
import ArabicSignIn from './pages/arabic/SignInPage';
import ArabicRegistration from './pages/arabic/RegistrationPage';
import DirectMessageChat from './components/chat/DirectMessageChat';
import MessagesPage from './components/chat/MessagesPage';
import DonationClaimsPage from './pages/PostsPages/DonationClaimsPage';
import DonatorClaimsPage from './pages/PostsPages/DonationClaimsPage';
import ArabicMessagesPage from './pages/arabic/MessagesPage';
import ArabicDonatorClaimsPage from './pages/arabic/DonationClaimsPage';

const SlowFade = cssTransition({
  enter: 'fadeIn',
  exit: 'fadeOut',
  duration: [300, 100],
});

function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.userId || null;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}



// 🧩 DM wrapper to extract :userId param
function DirectMessageChatWrapper() {
  const { userId: otherUserId } = useParams();
  const currentUserId = getCurrentUserId();

  console.log("dmm Route1 - currentuserid:", currentUserId);
  console.log("dmm Route2 - othersideuserid:", otherUserId);

  if (!currentUserId) return <Navigate to="/authentication/login" />;
  return <DirectMessageChat currentUserId={currentUserId} otherUserId={otherUserId} />;
}


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthenticated = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/authentication/verify`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const parseRes = await res.json();
      setIsAuthenticated(parseRes === true);
      setLoading(false);
    } catch (err) {
      console.error("checkAuthenticated error:", err.message);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthenticated();
  }, []);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        transition={SlowFade}
      />
      <BrowserRouter>
      
        <Layout setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated}>
          <Routes>
                        <Route path="/dm/:userId" element={<DirectMessageChatWrapper />} />
                                                <Route path="/ar/dm/:userId" element={<DirectMessageChatWrapper />} />

            <Route path="/" element={<NewHome />} />
            <Route path="/feed" element={isAuthenticated ? <HomePage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/ar/feed" element={isAuthenticated ? <ArabicFeed /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/ar/home" element={<ArabicHome />} />
            <Route path="/ar" element={<ArabicHome />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/create_post" element={isAuthenticated ? <CreatePostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/authentication/login" element={isAuthenticated ? <Navigate to="/" /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/authentication/registration" element={isAuthenticated ? <Navigate to="/" /> : <RegistrationPage setAuth={setAuth} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/edit_post/:id" element={isAuthenticated ? <EditPostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/ar/admin" element={<AdminPanel />} />

            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/posts/:id" element={<SinglePost />} />
            <Route path="/myposts" element={<MyPostsPage />} />
            <Route path="/*" element={<PageNotFound />} />
            <Route path="/home" element={<NewHome />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin/create-event" element={<EventForm />} />
            <Route path="/events/:id" element={<ShowEvent />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/events" element={<AdminEvents />} />
                        <Route path="/admin/banner" element={<AdminBanner />} />

            <Route path="/ar/about" element={<ArabicAboutPage />} />
            <Route path="/ar/create_post" element={isAuthenticated ? <ArabicCreatePostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/ar/profile" element={isAuthenticated ? <ArabicProfilePage isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/ar/myposts" element={<ArabicMyPostsPage />} />
            <Route path="/ar/posts/:id" element={<ArabicSinglePost />} />
            <Route path="/ar/edit_post/:id" element={isAuthenticated ? <ArabicEditPostPage /> : <SignInPage setAuth={setAuth} />} />
            <Route path="/ar/privacy-policy" element={<ArabicPrivacyPolicy />} />
            <Route path="/ar/terms" element={<ArabicTermsOfService />} />
            <Route path="/ar/contact" element={<ArabicContactUs />} />
            <Route path="/ar/events" element={<ArabicEvents />} />
                        <Route path="/ar/messages" element={<ArabicMessagesPage />} />

            <Route path="/ar/events/:id" element={<ArabicShowEvent />} />
            <Route path="/ar/authentication/login" element={isAuthenticated ? <Navigate to="/ar/home" /> : <ArabicSignIn setAuth={setAuth} />} />
            <Route path="/ar/authentication/registration" element={isAuthenticated ? <Navigate to="/ar/home" /> : <ArabicRegistration setAuth={setAuth} />} />
            <Route path="/admin/flagged" element={<AdminFlaggedPosts />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/myclaims" element={<DonatorClaimsPage />} />
                        <Route path="/ar/myclaims" element={<ArabicDonatorClaimsPage />} />

          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
