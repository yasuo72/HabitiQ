// src/components/Navbar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Activity, 
  LineChart, 
  Target, 
  Apple, 
  FileText,
  LogOut,
  User
} from 'lucide-react';
import { isAuthenticated, getUser, logout } from '@/utils/auth';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check authentication status on client side
    setAuthenticated(isAuthenticated());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { 
      title: 'Dashboard', 
      icon: Activity, 
      path: '/dashboard',
      description: 'Daily journaling and entries'
    },
    { 
      title: 'Analytics', 
      icon: LineChart, 
      path: '/analytics',
      description: 'Health insights and trends'
    },
    { 
      title: 'Goals & Habits', 
      icon: Target, 
      path: '/goals',
      description: 'Track your health goals'
    },
    { 
      title: 'Nutrition', 
      icon: Apple, 
      path: '/nutrition',
      description: 'Diet and nutrition tracking'
    },
    { 
      title: 'Reports', 
      icon: FileText, 
      path: '/reports',
      description: 'Health summary reports'
    }
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Activity className="h-6 w-6 text-violet-600" />
              <span className="ml-2 text-xl font-semibold">HabitiQ</span>
            </Link>
          </div>

          {/* Navigation Links - Only show if authenticated */}
          {authenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm
                      transition-colors duration-150 ease-in-out
                      ${isActive 
                        ? 'bg-violet-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.title}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth Links or User Menu */}
          <div className="flex items-center">
            {authenticated ? (
              <div className="relative">
                {/* Time Range Selector - Only show if authenticated */}
                <select 
                  className="mr-4 text-sm border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 p-2"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                
                {/* User Menu */}
                <button 
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-violet-600 focus:outline-none"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="ml-2">{user?.name || 'User'}</span>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-violet-600"
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup"
                  className="text-sm font-medium bg-violet-600 text-white px-3 py-2 rounded-md hover:bg-violet-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Hidden by default, shown on small screens */}
        {authenticated && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-1 py-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm
                      ${isActive 
                        ? 'bg-violet-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{link.title}</span>
                      <span className="text-xs text-gray-500">{link.description}</span>
                    </div>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
