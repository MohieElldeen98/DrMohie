
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Activity, 
  CheckCircle2,
  Stethoscope,
  Code2,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { HomeConfig } from '../types/cms';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  
  // State for dynamic content
  const [cms, setCms] = useState<HomeConfig | null>(null);

  useEffect(() => {
    // Listen to Home Config changes in real-time
    const unsubscribe = onSnapshot(doc(db, 'cms', 'home'), (doc) => {
      if (doc.exists()) {
        setCms(doc.data() as HomeConfig);
      }
    }, (error) => {
      console.log("Using default i18n content due to:", error);
    });

    return () => unsubscribe();
  }, []);

  // Helpers to fallback to i18n if CMS is empty or loading
  const getText = (section: keyof HomeConfig, key: string, fallbackI18n: string) => {
    // @ts-ignore
    return cms?.[section]?.[key] || t(fallbackI18n);
  };

  // Section Renderers
  const renderHero = () => (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 w-full overflow-hidden min-h-[85vh] flex items-center">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
           <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
           <div className="absolute top-0 -right-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-10">
          
          <div className="flex-1 text-center lg:text-start space-y-8 order-2 lg:order-1 flex flex-col items-center lg:items-start">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-sm text-primary-700 text-sm md:text-base font-bold tracking-wide border border-primary-100 shadow-sm mb-2 hover:scale-105 transition-transform duration-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-600"></span>
                </span>
                {getText('hero', 'role', 'hero.role')}
              </div>
            </Reveal>
            
            <Reveal delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight drop-shadow-sm">
                {getText('hero', 'title', 'hero.title')}
              </h1>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-lg md:text-2xl font-medium text-slate-600 leading-relaxed max-w-2xl">
                {getText('hero', 'subtitle', 'hero.subtitle')}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6 w-full md:w-auto">
                <Link 
                  to="/booking"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 hover:-translate-y-1"
                >
                  {getText('hero', 'ctaPrimary', 'hero.cta_primary')}
                </Link>
                <Link 
                  to="/projects" 
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-200 text-lg font-bold rounded-2xl text-slate-700 bg-white/50 hover:bg-white transition-all hover:shadow-md backdrop-blur-sm hover:-translate-y-1 hover:border-slate-300"
                >
                  {getText('hero', 'ctaSecondary', 'hero.cta_secondary')}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="w-full lg:w-[480px] flex justify-center relative order-1 lg:order-2">
             <Reveal delay={400} className="relative">
               <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[28rem] lg:h-[28rem] rounded-full border-[6px] border-white/60 shadow-2xl overflow-hidden flex items-center justify-center bg-slate-100 z-10">
                  <img 
                    src={cms?.hero.image || "https://firebasestorage.googleapis.com/v0/b/drmohie-538d8.firebasestorage.app/o/home%2Fhero%2F1768633589016_12.jpg?alt=media&token=3f178e06-c281-4e8f-9376-e1f4eef69525"} 
                    alt="Dr. Mohey" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
               </div>
               
               {/* Floating Badges */}
               <div className="absolute top-8 md:top-12 -right-4 md:-right-8 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl animate-float z-20 flex items-center justify-center border border-slate-100 hover:scale-110 transition-transform">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Activity size={32} className="md:w-8 md:h-8" />
                  </div>
               </div>
               
               <div className="absolute bottom-8 md:bottom-12 -left-4 md:-left-8 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl animate-float-delayed z-20 flex items-center justify-center border border-slate-100 hover:scale-110 transition-transform">
                  <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                    <Code2 size={32} className="md:w-8 md:h-8" />
                  </div>
               </div>
             </Reveal>
          </div>
        </div>
    </section>
  );

  const renderAbout = () => (
    <Reveal>
      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        {(cms?.about?.showIcon ?? true) && (
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
              <Stethoscope size={200} />
          </div>
        )}
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">{getText('about', 'title', 'about.title')}</h2>
          <p className="text-lg md:text-2xl font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
            {getText('about', 'bio', 'about.bio')}
          </p>
        </div>
      </section>
    </Reveal>
  );

  const renderServices = () => (
    <Reveal>
      <section className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100">
        <div className="space-y-6 flex flex-col justify-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">{getText('services', 'title', 'services.title')}</h2>
          <p className="text-lg md:text-xl font-medium text-slate-600">
            {getText('services', 'subtitle', 'services.subtitle')}
          </p>
          <ul className="space-y-4 pt-2">
            {/* Fallback to i18n array if CMS list is empty or undefined */}
            {(cms?.services?.list?.length ? cms.services.list : (t('services.cases', { returnObjects: true }) as string[]).slice(0, 3)).map((c, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 text-lg font-medium">
                <CheckCircle2 size={24} className="text-primary-500 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <Link to="/services" className="text-primary-700 font-bold text-lg hover:underline flex items-center gap-2">
                {t('common.viewDetails')} {isRtl ? <ArrowRight className="rotate-180" size={20} /> : <ArrowRight size={20} />}
            </Link>
          </div>
        </div>
        <div className="relative h-72 md:h-auto bg-white rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center group shadow-md">
              <img 
                src={cms?.services.image || "https://firebasestorage.googleapis.com/v0/b/drmohie-538d8.firebasestorage.app/o/home%2Fservices%2F1768633791384_unnamed.jpg?alt=media&token=bfc54188-83d7-43f5-98b9-8efc101ee59d"}
                alt="Physiotherapy Session"
                className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
        </div>
      </section>
    </Reveal>
  );

  const renderWhy = () => (
    <section>
      <Reveal>
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">{getText('why', 'title', 'why.title')}</h2>
        </div>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(cms?.why?.items?.length ? cms.why.items : (t('why.items', { returnObjects: true }) as any[])).map((item, idx) => (
          <Reveal key={idx} delay={idx * 100}>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center h-full group cursor-default">
              <div className="w-16 h-16 mx-auto bg-primary-50 text-primary-600 rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-xl">{item.title}</h3>
              <p className="text-base text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );

  const renderCertificates = () => {
    if (!cms?.certificates?.items || cms.certificates.items.length === 0) return null;
    return (
      <section>
        <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">{getText('certificates', 'title', 'certificates.title')}</h2>
              <p className="text-xl text-slate-500">{getText('certificates', 'subtitle', 'certificates.subtitle')}</p>
            </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cms.certificates.items.map((cert, idx) => (
              <Reveal key={idx} delay={idx * 50}>
                <div className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
                      <img src={cert.image} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors"></div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-slate-900 text-base mb-1 line-clamp-2" title={cert.title}>{cert.title}</h4>
                    <p className="text-sm text-slate-500 font-bold">{cert.issuer}</p>
                    {cert.date && <p className="text-xs text-slate-400 mt-1 font-medium">{cert.date}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
        </div>
      </section>
    );
  };

  const renderContact = () => (
    <Reveal>
      <section className="text-center py-16 px-6 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute right-0 top-0 w-80 h-80 bg-primary-500 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute left-0 bottom-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 max-w-4xl mx-auto whitespace-pre-wrap leading-tight">
            {getText('contact', 'desc', 'contact.desc')}
          </h2>
          <Link 
            to="/contact" 
            className="inline-flex items-center justify-center px-10 py-5 bg-primary-600 text-white font-bold text-xl rounded-2xl hover:bg-primary-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {getText('contact', 'buttonText', 'contact.title')}
            {isRtl ? <ArrowRight className="mr-2 rotate-180" size={24} /> : <ArrowRight className="ml-2" size={24} />}
          </Link>
        </div>
      </section>
    </Reveal>
  );

  // Default Order
  const defaultOrder = ['hero', 'about', 'services', 'why', 'certificates', 'contact'];
  const order = cms?.sectionOrder || defaultOrder;

  const sectionMap: Record<string, () => React.ReactNode> = {
    'hero': renderHero,
    'about': renderAbout,
    'services': renderServices,
    'why': renderWhy,
    'certificates': renderCertificates,
    'contact': renderContact
  };

  return (
    <div className="pb-10">
       {/* Always render Hero first if it's in the order, otherwise just render loop */}
       {/* Actually, loop handles everything */}
       <div className="flex flex-col gap-20">
         {order.map((sectionKey, index) => {
           const Renderer = sectionMap[sectionKey];
           if (Renderer) {
             return (
              <div key={sectionKey} className={sectionKey !== 'hero' ? 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl' : ''}>
                <Renderer />
              </div>
             );
           }
           return null;
         })}
       </div>
    </div>
  );
};

export default Home;
