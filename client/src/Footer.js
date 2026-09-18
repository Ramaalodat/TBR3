import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/footer2.png';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/Privacy-Policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          <Link to="/contact" className="hover:underline">Contact Us</Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center md:justify-end">
          <img
            src={logo}
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
        </div>
        
      </div>
    </footer>
  );
}
