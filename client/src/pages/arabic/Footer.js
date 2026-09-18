import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/footer.png'; 

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-8">
      <div className="
        max-w-screen-xl mx-auto px-4 
        flex flex-col items-center space-y-6
        md:flex-row md:justify-between md:items-center md:space-y-0
      ">
        {/* Logo */}
        <div className="order-1 md:order-1">
          <img src={logo} alt="Logo" className="h-16" />
        </div>

        {/* Navigation Links */}
        <div className="order-2 md:order-2 flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end w-full md:w-auto">
          <Link to="/ar/about" className="hover:underline">من نحن</Link>
          <Link to="/ar/Privacy-Policy" className="hover:underline">سياسة الخصوصية</Link>
          <Link to="/ar/terms" className="hover:underline">شروط الخدمة</Link>
          <Link to="/ar/contact" className="hover:underline">تواصل معنا</Link>
        </div>
      </div>
    </footer>
  );
}
