// src/components/Navbar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  LineChart, 
  Target, 
  Apple, 
  FileText 
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

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
            <Activity className="h-6 w-6" />
            <span className="ml-2 text-xl font-semibold">HabitiQ</span>
          </div>

          {/* Navigation Links */}
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
                      ? 'bg-black text-white' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center">
            <select 
              className="text-sm border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black p-2"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Mobile Menu - Hidden by default, shown on small screens */}
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
                      ? 'bg-black text-white' 
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
