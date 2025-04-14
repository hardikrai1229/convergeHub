import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import ProfileManagement from './ProfileManagement';
import '../index.css';

const routes = [
  { name: "Home", href: "/", isActive: true },
  { name: "Features", href: "#", isActive: false },
];

const NavMenu = ({ routes }) => (
  <>
    {routes.map((route, i) => (
      <li key={i}>
        <a
          className={`px-4 ${route.isActive ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
          href={route.href}
        >
          {route.name}
        </a>
      </li>
    ))}
  </>
);

const AuthNavMenu = () => (
  <>
    <li>
      <Link to="/signup">
        <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-1.5 px-4 rounded">
          Sign Up
        </button>
      </Link>
    </li>
    <li>
      <Link to="/login">
        <button className="border border-blue-600 bg-blue-600 text-white hover:bg-opacity-90 py-1.5 px-4 rounded">
          Log In
        </button>
      </Link>
    </li>
  </>
);

function Navbar({ user, onToggleSidebar, isSidebarOpen }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleProfileManagement = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="ezy__nav2 py-6 bg-gray-100 text-gray-900 relative shadow-md">
      <nav>
        <div className="container px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Hamburger */}
              <button
                className="flex flex-col justify-between w-6 h-5 group"
                onClick={onToggleSidebar}
              >
                <span
                  className={`h-0.5 w-full bg-black rounded transition-transform duration-300 ${
                    isSidebarOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                ></span>
                <span
                  className={`h-0.5 w-full bg-black rounded transition-opacity duration-300 ${
                    isSidebarOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`h-0.5 w-full bg-black rounded transition-transform duration-300 ${
                    isSidebarOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                ></span>
              </button>

              {/* Logo */}
              <a className="font-black text-3xl text-gray-800" href="#!">
                ConvergeHub
              </a>
            </div>

            <ul
              className="flex flex-col lg:flex-row justify-center items-center text-3xl gap-6 lg:text-base lg:gap-2 absolute h-screen w-screen top-0 left-full lg:left-0 lg:relative lg:h-auto lg:w-auto bg-white lg:bg-transparent"
              id="navbar"
            >
              <NavMenu routes={routes} />
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-2 bg-transparent border-none cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <img
                      src={user.photoURL || "https://www.citypng.com/public/uploads/preview/white-user-member-guest-icon-png-image-701751695037005zdurfaim0y.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.displayName}</span>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 z-20 bg-white text-black divide-y divide-gray-100 rounded-lg shadow-sm w-44">
                      <ul className="py-2 text-sm text-gray-700">
                        <li>
                          <button
                            onClick={handleProfileManagement}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Manage Profile
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <AuthNavMenu />
              )}
            </ul>
          </div>
        </div>
      </nav>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center">
          <ProfileManagement user={user} onClose={() => setShowProfileModal(false)} />
        </div>
      )}
    </div>
  );
}

export default Navbar;
