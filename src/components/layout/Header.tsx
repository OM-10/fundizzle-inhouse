import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/Button';
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiGrid, FiBookOpen, FiLock } from 'react-icons/fi';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  {
    label: 'Solutions',
    id: 'solutions',
    items: [
      { label: 'For Businesses', href: '/solutions/businesses' },
      { label: 'For Nonprofits', href: '/solutions/nonprofits' },
      { label: 'Our Platform', href: '/solutions/platform' },
      { label: 'Pricing', href: '/solutions/pricing' },
    ],
  },
  {
    label: 'Our Expertise',
    id: 'expertise',
    items: [
      { label: 'Grant Strategy & Consulting', href: '/expertise/strategy-consulting' },
      { label: 'Application Support', href: '/expertise/application-support' },
    ],
  },
  {
    label: 'Learn',
    id: 'learn',
    items: [
      { label: 'Blog', href: '/learn/blog' },
      { label: 'Guides & Toolkits', href: '/learn/guides' },
      { label: 'FAQs', href: '/learn/faqs' },
    ],
  },
  {
    label: 'About Us',
    id: 'about',
    items: [
      { label: 'Our Team', href: '/about/team' },
      { label: 'Contact Us', href: '/about/contact' },
      { label: 'Careers', href: '/about/careers' },
      { label: 'Success Stories', href: '/success-stories' },
    ],
  },
];

export const Header: React.FC = () => {
  const {
    mobileMenuOpen,
    activeDropdown,
    toggleMobileMenu,
    handleDropdownToggle,
    handleDropdownHover,
    handleDropdownLeave,
  } = useNavigation();
  const { user, signOut } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-4xl font-bold text-primary-600">
            Fundizzle <span className="text-gray-500 text-sm">by SaaSy Grants</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className="relative dropdown-container"
                onMouseEnter={() => handleDropdownHover(item.id)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={clsx(
                    'flex items-center gap-1 text-gray-700 hover:text-primary-600 transition-colors duration-200 py-2',
                    activeDropdown === item.id && 'text-primary-600'
                  )}
                  onClick={() => handleDropdownToggle(item.id)}
                >
                  {item.label}
                  <FiChevronDown
                    className={clsx(
                      'w-4 h-4 transition-transform duration-200',
                      activeDropdown === item.id && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={clsx(
                    'dropdown-menu',
                    activeDropdown === item.id && 'active'
                  )}
                >
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors duration-200"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* CTA Button or Profile Dropdown */}
          <div className="hidden lg:flex items-center gap-4">
            {!user ? (
              <Link href="/auth/login">
                <Button>Get Started</Button>
              </Link>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold border border-primary-200 focus:outline-none"
                  onClick={() => setProfileDropdownOpen((open) => !open)}
                >
                  <FiUser className="w-5 h-5" />
                  {user.email?.split('@')[0] || 'Profile'}
                  <FiChevronDown className={clsx('w-4 h-4 transition-transform', profileDropdownOpen && 'rotate-180')} />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                      <FiUser className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/dashboard/my-grants" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                      <FiGrid className="w-4 h-4" /> My Grants
                    </Link>
                    <Link href="/playground/play-query" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                      <FiBookOpen className="w-4 h-4" /> Playground
                    </Link>
                    <Link href="/auth/change-password" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                      <FiLock className="w-4 h-4" /> Change Password
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to log out?')) {
                          signOut();
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-50 hover:text-red-600 border-t border-gray-100 mt-2"
                    >
                      <FiLogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <nav className="py-4">
              {navigationItems.map((item) => (
                <div key={item.id} className="px-4">
                  <button
                    className="flex items-center justify-between w-full py-3 text-left text-gray-700 hover:text-primary-600"
                    onClick={() => handleDropdownToggle(item.id)}
                  >
                    {item.label}
                    <FiChevronDown
                      className={clsx(
                        'w-4 h-4 transition-transform duration-200',
                        activeDropdown === item.id && 'rotate-180'
                      )}
                    />
                  </button>
                  {activeDropdown === item.id && (
                    <div className="pl-4 pb-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block py-2 text-sm text-gray-600 hover:text-primary-600"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {user ? (
                <div className="px-4 pt-4 border-t border-gray-200">
                  <div className="py-2 text-sm font-medium text-gray-900">Account</div>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                    <FiUser className="w-4 h-4" /> Profile
                  </Link>
                  <Link href="/dashboard/my-grants" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                    <FiGrid className="w-4 h-4" /> My Grants
                  </Link>
                  <Link href="/playground/play-query" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                    <FiBookOpen className="w-4 h-4" /> Playground
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to log out?')) {
                        signOut();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  >
                    <FiLogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              ) : (
                <div className="px-4 pt-4">
                  <Link href="/auth/login">
                    <Button className="w-full justify-center">Get Started</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}; 