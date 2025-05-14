import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../infrastructure/store/store";
import { logout as authLogout } from "../../infrastructure/store/authSlice";
import { clearTokens } from "../../Services/utils/tokenUtils";
import {
  FaHome,
  FaUserEdit,
  FaBook,
  FaUserGraduate,
  FaList,
  FaHandHolding,
  FaSync,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get auth state from Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    { name: "Author", path: "/author", icon: <FaUserEdit /> },
    { name: "Book", path: "/book", icon: <FaBook /> },
    { name: "Student", path: "/student", icon: <FaUserGraduate /> },
    { name: "Transaction List", path: "/transaction", icon: <FaList /> },
    { name: "Issuing", path: "/issuing", icon: <FaHandHolding /> },
  ];

  const logout = () => {
    clearTokens();
    dispatch(authLogout()); // Dispatch the logout action
    navigate("/login");
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button - moved to right side */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="text-white bg-[#255D81] p-2 rounded-md"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 w-[222px] h-screen bg-[#255D81] text-white transform transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          HSMSS LIBRARY
        </div>
        
        <div className="flex flex-col mt-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-6 py-3 flex items-center space-x-3 transition-colors duration-200
                ${
                  activeLink === item.path
                    ? "bg-white text-blue-600"
                    : "hover:bg-white hover:text-blue-600"
                }`}
              onClick={() => {
                setActiveLink(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm md:text-base">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 w-full">
          <button
            onClick={refreshPage}
            className="w-full text-left hover:bg-white hover:text-blue-600 px-6 py-3 flex items-center space-x-3 transition-colors duration-200"
          >
            <span className="text-lg">
              <FaSync />
            </span>
            <span className="text-sm md:text-base">Refresh</span>
          </button>
          
          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full text-left hover:bg-white hover:text-blue-600 px-6 py-3 flex items-center space-x-3 transition-colors duration-200"
            >
              <span className="text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="text-sm md:text-base">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
};

export default Navbar;