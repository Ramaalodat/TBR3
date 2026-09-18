import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../../assets/T.png";
import profile from "../../assets/profilepic.png";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({ setAuth, isAuthenticated }) {
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [claimNotifications, setClaimNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
const [unreadMessages, setUnreadMessages] = useState(0);
const [totalNotifications, setTotalNotifications] = useState(0);
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
    toast.success("Logged out");
    navigate("authentication/login");
  };

  const toggleLanguage = () => {
    const path = location.pathname;
    const newPath = path.startsWith("/ar") ? path.replace("/ar", "") || "/" : "/ar" + path;
    navigate(newPath);
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "My Feed", href: "/feed" },
    { name: "Events", href: "/events" },
    { name: "Create Post", href: "/create_post" },
    ...(isAuthenticated ? [{ name: "My Posts", href: "/myposts" }] : []),
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="w-full bg-green-700 relative shadow-md z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <div className="flex h-20 items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <button
                className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsMenuOpen(true)}
              >
                <Bars3Icon className="h-7 w-7" />
              </button>
            </div>

            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src={logo}
                alt="Logo"
                className="h-16 md:h-24 w-auto transition-all duration-300 cursor-pointer mr-10 "
              />
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 justify-start space-x-8">
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

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="rounded-full bg-white text-green-700 px-3 py-1.5 font-semibold hover:bg-green-100 transition"
            >
              العربية
            </button>

            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-sm focus:outline-none relative">
                  <img
                    className="h-8 w-8 rounded-full border border-white"
                    src={profile}
                    alt="User"
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-green-600/90 text-white backdrop-blur-md rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          👤 {username} Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/myposts"
                          className={classNames(
                            active ? "bg-green-500" : "",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          📝 My Posts
                        </Link>
                      )}
                    </Menu.Item>
<Menu.Item>
  {({ active }) => (
    <Link
      to="/myclaims"
      className={classNames(
        active ? "bg-green-500" : "",
        "block px-5 py-2 text-sm"
      )}
    >
      <div >
        <span>📥 Claim Requests</span>
        {claimNotifications > 0 && (
          <span className="bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {claimNotifications}
          </span>
        )}
      </div>
    </Link>
  )}
</Menu.Item>


<Menu.Item>
  {({ active }) => (
    <Link
      to="/messages"
      className={classNames(
        active ? "bg-green-500" : "",
        "block px-5 py-2 text-sm"
      )}
    >
      <div>
        <span>🗪 My Messages</span>
        {unreadMessages > 0 && (
          <span className="bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {unreadMessages}
          </span>
        )}
      </div>
    </Link>
  )}
</Menu.Item>

                    {isAdmin && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={classNames(
                              active ? "bg-green-500" : "",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            🛠️ Admin Panel
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
                            "w-full text-left px-4 py-2 text-sm"
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link
                  to="/authentication/login"
                  className="rounded-full text-white border border-white px-4 py-1.5 font-semibold hover:bg-white hover:text-green-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/authentication/registration"
                  className="rounded-full bg-green-600 text-white px-4 py-1.5 font-semibold hover:bg-green-700 transition"
                >
                  Register
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
              <span className="text-lg font-semibold">Menu</span>
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
