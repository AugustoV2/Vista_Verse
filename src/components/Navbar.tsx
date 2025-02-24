import React, { useState } from 'react';
import { Menu, X, Stethoscope, User, Bell } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">VistaVerse</span>
            </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/community" className="text-gray-700 hover:text-blue-600">Community Forum</a>
            <a href="/diseases" className="text-gray-700 hover:text-blue-600">AI Symptom Checker</a>
            <a href="/diseases" className="text-gray-700 hover:text-blue-600">Disease Awareness</a>
            <a href="/eyesdetection" className="text-gray-700 hover:text-blue-600">Eye Disease Detection</a>
            
            {/* User Profile Section */}
            <div className="relative">
              <div className="flex items-center space-x-4">
                <button className="relative">
                  <Bell className="h-6 w-6 text-gray-600 hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Amarnath C</span>
                </button>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Your Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Health Records</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Settings</a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700">Amarnath C</span>
              </div>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Community Forum
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                AI Symptom Checker
              </a>
              <a href="/diseases" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Disease Awareness
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Your Profile
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Health Records
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Settings
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;