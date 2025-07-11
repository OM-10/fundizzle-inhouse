import { useCallback, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export const useNavigation = () => {
  const {
    mobileMenuOpen,
    activeDropdown,
    setMobileMenuOpen,
    setActiveDropdown,
    toggleMobileMenu,
    closeAllDropdowns,
  } = useAppContext();

  const handleDropdownToggle = useCallback((dropdownId: string) => {
    if (activeDropdown === dropdownId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownId);
    }
  }, [activeDropdown, setActiveDropdown]);

  const handleDropdownHover = useCallback((dropdownId: string) => {
    if (!mobileMenuOpen) {
      setActiveDropdown(dropdownId);
    }
  }, [mobileMenuOpen, setActiveDropdown]);

  const handleDropdownLeave = useCallback(() => {
    if (!mobileMenuOpen) {
      setActiveDropdown(null);
    }
  }, [mobileMenuOpen, setActiveDropdown]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        closeAllDropdowns();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setMobileMenuOpen, closeAllDropdowns]);

  return {
    mobileMenuOpen,
    activeDropdown,
    toggleMobileMenu,
    handleDropdownToggle,
    handleDropdownHover,
    handleDropdownLeave,
    closeAllDropdowns,
  };
}; 