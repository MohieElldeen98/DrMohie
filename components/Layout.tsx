
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Lock } from 'lucide-react';
import OfferBanner from './OfferBanner';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copyright, setCopyright] = useState('');
  
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Listen for global settings changes for copyright text
    const unsub = onSnapshot(doc(db, 'cms', 'global'), (snap) => {
      if (snap.exists() && snap.data().siteConfig?.copyrightText) {
        setCopyright(snap.data().siteConfig.copyrightText);
      }
    });
    return () => unsub();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar />
      
      <main className={`flex-grow w-full ${isHome ? '' : 'pt-28 md:pt-36'}`}>
        {children}
      </main>
      
      <OfferBanner />

      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-8 z-40 p-3 rounded-full bg-primary-600 text-white shadow-xl transition-all duration-300 hover:bg-primary-700 hover:-translate-y-1 focus:outline-none ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>

      <footer className="bg-white border-t border-slate-200 mt-auto pb-20 md:pb-0">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <div className="flex items-center gap-4">
              <p>{copyright || t('common.copyright')}</p>
              <span className="text-slate-300">|</span>
              <Link to="/admin" className="flex items-center gap-1 hover:text-primary-600 transition-colors opacity-70 hover:opacity-100">
                <Lock size={12} />
                <span>{t('nav.admin')}</span>
              </Link>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0 rtl:space-x-reverse">
              {/* Social placeholders - could also be dynamic later */}
              <div className="w-5 h-5 bg-slate-200 rounded-full hover:bg-primary-500 transition-colors cursor-pointer" />
              <div className="w-5 h-5 bg-slate-200 rounded-full hover:bg-primary-500 transition-colors cursor-pointer" />
              <div className="w-5 h-5 bg-slate-200 rounded-full hover:bg-primary-500 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
