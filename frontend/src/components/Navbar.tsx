import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Home, Menu, X, Briefcase, List, Building2 } from 'lucide-react';
import { useState } from 'react';
import type { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sidebarItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/active-contracts', label: 'Active Contracts', icon: Briefcase },
    { path: '/job-listings', label: 'Job Listings', icon: List },
    { path: '/employer-portal', label: 'Employer Portal', icon: Building2 },
  ];

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-300">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              {/* Menu Button */}
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <Link to="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KW</span>
                </div>
                <span className="text-xl font-bold text-slate-800">KararAI</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Avatar and Name */}
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'text-red-800 bg-red-50'
                    : 'text-slate-600 hover:text-red-800 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <span className="hidden sm:block">{user?.name || 'User'}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        {user && !user.isVerified && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="px-6">
              <div className="py-2">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Account Verification Pending:</span> 
                  Your digital ID is being verified by our team. You can browse jobs but cannot apply until verification is complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 border-r border-slate-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-slate-800">Navigation</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info in Sidebar */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-slate-400 rounded-full flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800">{user?.name || 'User'}</p>
                <p className="text-sm text-slate-600">
                  {user?.isVerified ? 'Verified Worker' : 'Verification Pending'}
                </p>
              </div>
            </div>
            
            <Link
              to="/profile"
              onClick={toggleSidebar}
              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;