import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, FileText, Search, HelpCircle, Mail, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'File Grievance', path: '/file-grievance', icon: FileText },
    { name: 'Track Grievance', path: '/track-grievance', icon: Search },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determine if a link should get special styling - now includes Home
  const isSpecialLink = (name: string) => {
    return ['Home', 'File Grievance', 'Track Grievance', 'How It Works', 'Contact'].includes(name);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-blue-900/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-white font-bold text-xl md:text-2xl">GNDEC</span>
              <span className="ml-1 text-blue-300 font-semibold md:text-xl">Portal</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-3 lg:space-x-5">
            {navLinks.map((link) => (
              isSpecialLink(link.name) ? (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm lg:text-base font-medium flex items-center transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-blue-600/80 to-blue-800/80 text-white shadow-lg backdrop-blur-md border border-blue-500/30'
                      : 'bg-black/30 backdrop-blur-md text-gray-200 hover:bg-blue-900/50 hover:text-white border border-white/10 hover:border-blue-500/30'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                  {link.name}
                </Link>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 text-sm lg:text-base font-medium relative group ${
                    isActive(link.path)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform origin-left transition-transform duration-300 ${
                    isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              )
            ))}

            {user ? (
              <div className="relative ml-4 group">
                <button 
                  className="flex items-center space-x-1 text-sm lg:text-base text-white bg-blue-600/40 hover:bg-blue-600/60 px-3 py-2 rounded-full transition-colors backdrop-blur-md border border-blue-500/30 shadow-md"
                >
                  <User className="w-4 h-4 mr-1" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 text-sm lg:text-base bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] border border-blue-500/30 backdrop-blur-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-2 bg-blue-900/90 backdrop-blur-lg shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'bg-gradient-to-r from-blue-600/80 to-blue-800/80 text-white border border-blue-500/30 shadow-lg'
                  : 'bg-black/20 backdrop-blur-sm text-gray-300 hover:bg-blue-800/50 hover:text-white border border-white/10'
              }`}
            >
              {link.icon && <link.icon className="w-5 h-5 mr-2" />}
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                    <span className="text-white font-medium">{user.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.name}</div>
                  <div className="text-sm font-medium text-gray-300">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600/60 to-blue-800/60 hover:from-blue-600/80 hover:to-blue-800/80 border border-blue-500/30 backdrop-blur-sm"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full text-center mt-4 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg border border-blue-500/30"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;