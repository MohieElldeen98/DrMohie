import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isRtl = i18n.dir() === 'rtl';
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [window.location.hash]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBrandClick = () => {
    setIsOpen(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/courses', label: t('nav.courses') },
    { path: '/blog', label: t('nav.blog') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const activeClass = "text-primary-600 font-bold bg-primary-50 border-primary-100";
  const inactiveClass = "text-slate-600 hover:text-primary-600 font-medium hover:bg-slate-50 border-transparent";

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled || isOpen
          ? "bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-slate-200/50" 
          : "bg-transparent py-6 border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative z-50">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={handleBrandClick}>
            <div className={`transition-transform duration-500 ease-in-out ${isScrolled || isOpen ? 'scale-90' : 'scale-100'}`}>
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary-600"
              >
                <path d="M12 3c-1.2 0-2.4.6-2.4 1.5S10.8 6 12 6s2.4-.6 2.4-1.5S13.2 3 12 3z" />
                <path d="M12 8c-1.8 0-3.5.7-3.5 1.8S10.2 11.5 12 11.5s3.5-.7 3.5-1.8S13.8 8 12 8z" />
                <path d="M12 13.5c-1.8 0-3.5.7-3.5 1.8s1.7 1.7 3.5 1.7 3.5-.7 3.5-1.8-1.7-1.7-3.5-1.7z" />
                <path d="M12 19c-1.5 0-3 .6-3 1.5S10.5 22 12 22s3-.6 3-1.5S13.5 19 12 19z" />
              </svg>
            </div>
            <span className={`font-bold text-2xl tracking-tight text-slate-800 transition-opacity duration-500 ${isScrolled || isOpen ? 'opacity-100' : 'opacity-90'}`}>
              {t('brand')}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `transition-colors duration-200 ${isActive ? "text-primary-600 font-bold" : "text-slate-600 hover:text-primary-600 font-medium"}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/booking"
              className={`px-5 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-sm font-bold ${
                isScrolled 
                  ? "bg-primary-600 text-white hover:bg-primary-700" 
                  : "bg-white text-primary-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              {t('nav.booking')}
            </NavLink>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-primary-600 focus:outline-none transition-colors p-1"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Fixed Full Screen */}
      <div 
        className={`lg:hidden fixed inset-0 w-full h-screen bg-white z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-8"
        }`}
        style={{ paddingTop: '80px' }} // Push content down below navbar
      >
        <div className="flex flex-col p-6 space-y-2 h-full overflow-y-auto pb-24">
          {navLinks.map((link, idx) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: `${idx * 50}ms` }}
              className={({ isActive }) => 
                `flex items-center justify-between px-5 py-4 rounded-xl text-lg border transition-all transform ${
                  isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                } ${isActive ? activeClass : inactiveClass}`
              }
            >
              <span>{link.label}</span>
              <ChevronRight size={20} className={`text-slate-300 ${isRtl ? 'rotate-180' : ''}`} />
            </NavLink>
          ))}
          
          <div 
            className={`pt-6 transition-all duration-700 delay-300 transform ${isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
             <NavLink
              to="/booking"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 px-5 py-4 rounded-xl bg-primary-600 text-white font-bold text-lg shadow-lg hover:bg-primary-700 active:scale-95 transition-all"
            >
              {t('nav.booking')}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;