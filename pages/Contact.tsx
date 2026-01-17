import React from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, MessageCircle, ExternalLink } from 'lucide-react';
import Reveal from '../components/Reveal';

// Custom icons for TikTok and Threads since they might not be in the Lucide version used
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="24" height="24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="24" height="24">
    <path d="M12.67 19.57c-1.6 0-2.8-.84-3.23-2.18h5.3c-.23 1.4-1.22 2.18-2.07 2.18zM12.12 10a4.57 4.57 0 0 0-4.43 4.54c0 2.57 1.87 4.9 5.3 4.9 3.03 0 4.6-2.16 4.6-2.16l1.24 1.76s-2.03 2.9-6.14 2.9C7.43 22 4 18.06 4 13.9 4 8.28 8.04 4 13.12 4c4.63 0 7.74 3.2 7.74 7.6 0 4.07-2.05 7.03-5.2 7.03-1.6 0-2.92-1.04-2.92-2.9 0-2.2 1.72-3.88 4.2-3.88.58 0 1.04.05 1.34.13.06-2.86-1.9-5.18-5.16-5.18zm4.72 4.14c.05-.38.07-.76.07-1.06 0-1.15-.72-2.1-1.94-2.1-1.4 0-2.4 1.13-2.4 2.68 0 .17.02.34.05.5h4.22z"/>
  </svg>
);

const Contact: React.FC = () => {
  const { t } = useTranslation();

  const socials = [
    {
      name: "Facebook",
      link: "https://www.facebook.com/boslaa",
      icon: <Facebook className="w-8 h-8" />,
      color: "bg-blue-600 text-white",
      hover: "hover:bg-blue-700",
      description: "Follow Bosla Page"
    },
    {
      name: "Instagram",
      link: "https://www.instagram.com/boslaa26/",
      icon: <Instagram className="w-8 h-8" />,
      color: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white",
      hover: "hover:opacity-90",
      description: "Daily Updates & Stories"
    },
    {
      name: "WhatsApp",
      link: "https://wa.me/201158227491",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "bg-green-500 text-white",
      hover: "hover:bg-green-600",
      description: "Direct Chat"
    },
    {
      name: "TikTok",
      link: "https://www.tiktok.com/@techmo783",
      icon: <TikTokIcon className="w-8 h-8" />,
      color: "bg-black text-white",
      hover: "hover:bg-gray-800",
      description: "Short Medical Content"
    },
    {
      name: "Threads",
      link: "https://www.threads.com/@boslaa26",
      icon: <ThreadsIcon className="w-8 h-8" />,
      color: "bg-slate-900 text-white",
      hover: "hover:bg-slate-700",
      description: "Discussions & Thoughts"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      <Reveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('contact.desc')}
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {socials.map((social, idx) => (
          <Reveal key={social.name} delay={idx * 100}>
            <a 
              href={social.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`p-4 rounded-xl ${social.color} ${social.hover} transition-colors shadow-lg mr-4 rtl:mr-0 rtl:ml-4`}>
                {social.icon}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                  {social.name}
                </h3>
                <p className="text-slate-500 text-sm">{social.description}</p>
              </div>
              <ExternalLink className="text-slate-300 group-hover:text-primary-600 transition-colors" size={20} />
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={600}>
        <div className="mt-20 bg-slate-50 rounded-3xl p-10 text-center border border-slate-200">
           <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.formTitle')}</h3>
           <a 
             href="mailto:pt.mohie@gmail.com"
             className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
           >
             <span>Send Email</span>
           </a>
        </div>
      </Reveal>
    </div>
  );
};

export default Contact;
