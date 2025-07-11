import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  mobileMenuOpen: boolean;
  activeDropdown: string | null;
  isLoggedIn: boolean;
}

interface AppContextType extends AppState {
  setMobileMenuOpen: (open: boolean) => void;
  setActiveDropdown: (dropdown: string | null) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  toggleMobileMenu: () => void;
  closeAllDropdowns: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setActiveDropdown(null);
    }
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  const value: AppContextType = {
    mobileMenuOpen,
    activeDropdown,
    isLoggedIn,
    setMobileMenuOpen,
    setActiveDropdown,
    setIsLoggedIn,
    toggleMobileMenu,
    closeAllDropdowns,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 