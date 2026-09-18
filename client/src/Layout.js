import React from 'react';
import { useLocation } from 'react-router-dom';

import Navbar from './components/navbar/Navbar.js';
import Footer from './Footer.js';

import ArabicNavbar from './pages/arabic/Navbar.js';
import ArabicFooter from './pages/arabic/Footer.js';
import BannerBar from './components/navbar/BannerBar.js'; 

export default function Layout({ children, setAuth, isAuthenticated, checkAuthenticated }) {
  const location = useLocation();
  const isArabic = location.pathname.startsWith("/ar");

  return (
    <div className="flex flex-col min-h-screen">
      <BannerBar />
      {/* Navbar based on language */}
      {isArabic ? (
        <ArabicNavbar setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} />
      ) : (
        <Navbar setAuth={setAuth} isAuthenticated={isAuthenticated} checkAuthenticated={checkAuthenticated} />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>

      {/* Footer based on language */}
      {isArabic ? <ArabicFooter /> : <Footer />}
    </div>
  );
}
