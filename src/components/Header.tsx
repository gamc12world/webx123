import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms delay before closing
    setDropdownTimeout(timeout);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">
            STYLISH
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/category/men" className="text-slate-700 hover:text-slate-900">
              Men
            </Link>
            <Link to="/category/women" className="text-slate-700 hover:text-slate-900">
              Women
            </Link>
            <Link to="/category/kids" className="text-slate-700 hover:text-slate-900">
              Kids
            </Link>
          </nav>

          {/* Search Form - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center border border-slate-300 rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1 px-3 focus:outline-none text-sm w-48"
            />
            <button type="submit" className="bg-slate-100 p-2">
              <Search size={18} />
            </button>
          </form>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-1">
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div 
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="p-1 rounded-full hover:bg-slate-100">
                  <User size={22} />
                </button>
                <div className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50 transition-opacity duration-200 ${
                  isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-slate-100">
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-slate-100">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-1">
                <User size={22} />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-1" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4 flex items-center border border-slate-300 rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 px-3 w-full focus:outline-none"
              />
              <button type="submit" className="bg-slate-100 p-2">
                <Search size={18} />
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/category/men" 
                className="py-2 text-slate-700 hover:text-slate-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Men
              </Link>
              <Link 
                to="/category/women" 
                className="py-2 text-slate-700 hover:text-slate-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Women
              </Link>
              <Link 
                to="/category/kids" 
                className="py-2 text-slate-700 hover:text-slate-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Kids
              </Link>
              {!user && (
                <>
                  <Link 
                    to="/login" 
                    className="py-2 text-slate-700 hover:text-slate-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="py-2 text-slate-700 hover:text-slate-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link 
                    to="/profile" 
                    className="py-2 text-slate-700 hover:text-slate-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="py-2 text-slate-700 hover:text-slate-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="py-2 text-left text-slate-700 hover:text-slate-900"
                  >
                    Log Out
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;