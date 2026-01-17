import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

const Services: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      <div className="max-w-4xl mx-auto space-y-12">
        <Reveal>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Stethoscope size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('services.title')}</h1>
            <p className="text-xl text-slate-600">
              {t('services.subtitle')}
            </p>
            <div className="flex justify-center mt-4">
               <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                 <MapPin size={16} />
                 {t('services.coverage')}
               </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                {t('services.cases_title')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {(t('services.cases', { returnObjects: true }) as string[]).map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0"></div>
                    <span className="text-slate-700 font-medium">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={20} />
                <span className="text-sm">{t('services.bookingNote')}</span>
              </div>
              <Link 
                to="/booking"
                className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {t('services.cta')}
                {isRtl ? <ArrowRight className="rotate-180" size={18} /> : <ArrowRight size={18} />}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Services;