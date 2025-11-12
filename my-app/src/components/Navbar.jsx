import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onHeightChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  
  const navLinks = [
    { path: '/', name: 'Home'},
    { path: '/about', name: 'Upload'},
    { path: '/services', name: 'Recent Games'},
    { path: '/contact', name: 'search'}
  ];
  
  // current page
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // get navbar height, return to app.jsx
  useEffect(() => {
    if (navRef.current) {
      onHeightChange(navRef.current.offsetHeight);
    }
  }, [onHeightChange]);
  
  return (
    // bind navRef to navbar, trigger useEffect
    <nav ref={navRef} className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-md shadow-lg z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-1 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                ahJong
              </span>
            </Link>
          </div>
          
          {/* navbar middle parts */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`
                    relative px-4 py-2 rounded-lg text-lg transition-all duration-300
                    ${isActive(link.path) 
                      ? 'text-white hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                    }
                  `}
                >
                  {/* active bg style*/}
                  {isActive(link.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
                  )}
                  
                  {/* hover bg style */}
                  {!isActive(link.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 hover:opacity-100 transition-all duration-300" />
                  )}
                  
                  {/* content name */}
                  <span className="relative flex items-center space-x-2">
                    <span>{link.name}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* login + Sign Up */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/Login" className="px-4 py-2 text-gray-700 hover:text-gray-900 text-lg transition-colors duration-300 whitespace-nowrap">
              Log in
            </Link>
            <Link to="/Register" className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg rounded-lg hover:from-blue-600 hover:to-purple-500 transition-all duration-300 shadow-lg whitespace-nowrap">
              Sign Up
            </Link>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                <span className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
        
        {/* 移动端导航菜单 */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)} // 点击后关闭菜单
                  className={`
                    block w-full text-left px-4 py-3 rounded-lg text-lg
                    ${isActive(link.path) 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="flex items-center space-x-3">
                    <span>{link.name}</span>
                  </span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/Login" className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 text-lg rounded-lg text-left">
                  Log in
                </Link>
                <Link to="/Register" className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 text-lg rounded-lg text-left">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;