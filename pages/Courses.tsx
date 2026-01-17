import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, PlayCircle, Lock } from 'lucide-react';
import Reveal from '../components/Reveal';

const Courses: React.FC = () => {
  const { t } = useTranslation();
  
  // Retrieve courses from i18n
  const courses = t('courses.list', { returnObjects: true }) as any[];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl space-y-10">
      <Reveal>
        <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{t('courses.title')}</h1>
            <p className="text-slate-300">
              {t('courses.subtitle')}
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-900/50 to-slate-900/50 pointer-events-none"></div>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, idx) => (
          <Reveal key={idx} delay={idx * 100}>
            <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between gap-4 ${course.free ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${course.free ? 'bg-primary-50 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                   {course.free ? <PlayCircle size={24} /> : <Lock size={24} />}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800">{course.title}</h3>
                   <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                     <span>{course.type}</span>
                     <span>•</span>
                     <span>{course.duration}</span>
                   </div>
                 </div>
              </div>
              
              {course.free ? (
                 <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                   {t('courses.free_badge')}
                 </span>
              ) : (
                 <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                   {t('courses.coming_soon')}
                 </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default Courses;