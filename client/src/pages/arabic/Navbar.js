import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../../assets/logoo.png";
import profile from "../../assets/profilepic.png";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ArabicNavbar({ setAuth, isAuthenticated }) {
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [claimNotifications, setClaimNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setIsAdmin(Boolean(decoded.isAdmin));
      if (decoded.username) setUsername(decoded.username);

      const fetchCounts = async () => {
        try {
          const [claimsRes, messagesRes] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/api/donations/claims/count/${decoded.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${process.env.REACT_APP_API_URL}/messages/unread/count`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const pendingClaims = claimsRes.data.pendingClaims || 0;
          const unreadMessages = messagesRes.data.unreadCount || 0;

          setClaimNotifications(pendingClaims);
          setUnreadMessages(unreadMessages);
          setTotalNotifications(pendingClaims + unreadMessages);
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }
      };

      fetchCounts();

    } catch (err) {
      console.error("Failed to decode token:", err);
      setIsAdmin(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
    setAuth(false);
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/ar/authentication/login");
  };

  const toggleLanguage = () => {
    const path = location.pathname;
    const newPath = path.startsWith("/ar") ? path.replace("/ar", "") || "/" : "/ar" + path;
    navigate(newPath);
  };

  const navigation = [
    { name: "الرئيسية", href: "/ar/home" },
    { name: "المنشورات", href: "/ar/feed" },
    { name: "الفعاليات", href: "/ar/events" },
    { name: "إنشاء منشور", href: "/ar/create_post" },
    ...(isAuthenticated ? [{ name: "منشوراتي", href: "/ar/myposts" }] : []),
    { name: "من نحن", href: "/ar/about" },
  ];

  return (
    <nav className="w-full bg-green-700 relative shadow-md z-50" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <div className="flex h-20 items-center justify-between w-full">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="md:hidden">
              <button
                className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsMenuOpen(true)}
              >
                <Bars3Icon className="h-7 w-7" />
              </button>
            </div>

            <Link to="/ar/home" onClick={() => setIsMenuOpen(false)}>
              <img
                src={logo}
                alt="الشعار"
                className="h-16 md:h-24 w-auto transition-all duration-300 cursor-pointer ml-10"
              />
            </Link>
          </div>

                <div className="hidden sm:flex sm:mr-10 space-x-8 space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white text-base font-medium hover:text-green-400 hover:underline underline-offset-4 transition duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={toggleLanguage}
              className="rounded-full bg-white text-green-700 px-3 py-1.5 font-semibold hover:bg-green-100 transition"
            >
              English
            </button>

            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-sm focus:outline-none relative">
                  <img
                    className="h-8 w-8 rounded-full border border-white"
                    src={profile}
                    alt="المستخدم"
                  />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {totalNotifications}
                    </span>
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-10 mt-2 w-48 origin-top-left bg-green-600/90 text-white backdrop-blur-md rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/ar/profile"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          👤 {username} الملف الشخصي
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/ar/myposts"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          📝 منشوراتي
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/ar/myclaims"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-5 py-2 text-sm"
                          )}
                        >
                          <span>📥 طلبات الاستلام</span>
                          {claimNotifications > 0 && (
                            <span className="bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 ml-1">
                              {claimNotifications}
                            </span>
                          )}
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/ar/messages"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-5 py-2 text-sm"
                          )}
                        >
                          <span>🗪 رسائلي</span>
                          {unreadMessages > 0 && (
                            <span className="bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 ml-1">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      )}
                    </Menu.Item>

                    {isAdmin && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/ar/admin"
                            className={classNames(
                              active ? "bg-green-500" : "",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            🛠️ لوحة التحكم
                          </Link>
                        )}
                      </Menu.Item>
                    )}

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "w-full text-right px-4 py-2 text-sm"
                          )}
                        >
                          تسجيل الخروج
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link
                  to="/ar/authentication/login"
                  className="rounded-full text-white border border-white px-4 py-1.5 font-semibold hover:bg-white hover:text-green-600 transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/ar/authentication/registration"
                  className="rounded-full bg-green-600 text-white px-4 py-1.5 font-semibold hover:bg-green-700 transition"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div
            ref={menuRef}
            className="relative bg-green-700 text-white w-64 h-full p-6 space-y-4 shadow-xl z-50 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">القائمة</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-green-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 px-4 rounded hover:bg-green-600 transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
