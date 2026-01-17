
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, ArrowUpRight, Loader2, LayoutGrid, 
  Stethoscope, Activity, Brain, Code2, Smartphone, Globe, Database, LineChart, Zap, ExternalLink
} from 'lucide-react';
import Reveal from '../components/Reveal';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface ProjectData {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  features: string[];
  link?: string;
  icon?: string;
  order?: number;
}

const DEMO_PROJECTS: ProjectData[] = [
  {
    id: 'bosla',
    name: 'Bosla | بوصلة',
    tagline: 'نظام إدارة العيادات الذكي',
    desc: 'بوصلة رقمية ذكية لتنظيم سير العمل والقرارات الطبية. يساعد الأطباء على إدارة ملفات المرضى والحجوزات بكفاءة عالية.',
    features: ["دعم القرار السريري", "تحسين سير العمل", "إدارة الموارد"],
    link: '#',
    icon: 'medical',
    order: 1
  },
  {
    id: 'finance',
    name: 'My Finance',
    tagline: 'مساعد مالي للأطباء',
    desc: 'تطبيق مخصص لمتخصصي الرعاية الصحية لتتبع الدخل من العيادات المختلفة والمصروفات الشخصية والمهنية.',
    features: ["تتبع دخل العيادة", "تحليل المصروفات", "تحديد الأهداف المالية"],
    icon: 'finance',
    order: 2
  },
  {
    id: 'tracker',
    name: 'Delay Tracker',
    tagline: 'نظام الحضور والانصراف',
    desc: 'نظام لتتبع التأخير والحضور في المستشفيات، يساعد الإدارة على تحسين الانضباط وتوزيع الورديات.',
    features: ["تتبع فوري", "إدارة المناوبات", "تقارير إدارية"],
    icon: 'data',
    order: 3
  }
];

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Query ordered by 'order' field ascending
        const q = query(collection(db, "projects"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData)));
        } else {
           // Fallback attempt without ordering if index is missing, or just check standard fetch
           const fallbackSnapshot = await getDocs(collection(db, "projects"));
           if(!fallbackSnapshot.empty) {
              // Client side sort if server index fails
              const docs = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
              docs.sort((a, b) => (a.order || 99) - (b.order || 99));
              setProjects(docs);
           } else {
              if (projects.length === 0) setProjects(DEMO_PROJECTS);
           }
        }
      } catch (err) {
        console.warn("Using demo projects due to DB error:", err);
        setProjects(DEMO_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getIcon = (iconName?: string) => {
    switch(iconName) {
        case 'medical': return <Stethoscope size={28} />;
        case 'health': return <Activity size={28} />;
        case 'brain': return <Brain size={28} />;
        case 'code': return <Code2 size={28} />;
        case 'app': return <Smartphone size={28} />;
        case 'web': return <Globe size={28} />;
        case 'data': return <Database size={28} />;
        case 'finance': return <LineChart size={28} />;
        case 'tool': return <Zap size={28} />;
        default: return <LayoutGrid size={28} />;
    }
  };

  const getColors = (idx: number) => {
    const styles = [
      'text-primary-700 bg-primary-50 border-primary-600',
      'text-emerald-700 bg-emerald-50 border-emerald-500',
      'text-slate-700 bg-slate-100 border-slate-500'
    ];
    return styles[idx % styles.length];
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl space-y-10">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t('projects.title')}</h1>
          <p className="text-slate-500 text-lg">
            {t('projects.subtitle')}
          </p>
        </div>
      </Reveal>

      {projects.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => {
            const colors = getColors(idx);
            return (
              <Reveal key={p.id} delay={idx * 100} className="h-full">
                <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative z-10">
                   {/* Color Bar */}
                   <div className={`h-1.5 w-full transition-all duration-300 group-hover:h-2 ${idx % 3 === 0 ? 'bg-primary-600' : idx % 3 === 1 ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                   
                   <div className="p-6 flex-grow flex flex-col">
                     <div className="flex justify-between items-start mb-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors}`}>
                          {getIcon(p.icon)}
                        </div>
                        {/* Top Icon Link */}
                        {p.link && (
                          <a 
                            href={p.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-primary-600 transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1"
                            title="Visit Project"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                     </div>

                     <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">{p.name}</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{p.tagline}</p>
                     
                     <p className="text-slate-600 mb-6 leading-relaxed text-sm flex-grow">
                       {p.desc}
                     </p>
                     
                     <div className="space-y-2 pt-4 border-t border-slate-50 mb-6">
                       {p.features && p.features.map((feature: string, i: number) => (
                         <div key={i} className="flex items-start gap-2 text-sm text-slate-500">
                           <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary-500" />
                           <span>{feature}</span>
                         </div>
                       ))}
                     </div>

                     {/* Explicit Button */}
                     {p.link ? (
                       <a 
                         href={p.link}
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="mt-auto w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group/btn shadow-sm hover:shadow-md text-sm"
                       >
                         <span>زيارة المشروع</span>
                         <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                       </a>
                     ) : (
                       <div className="mt-auto w-full py-3 bg-slate-50 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-70 text-sm">
                         <span>قريباً</span>
                       </div>
                     )}
                   </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
           <LayoutGrid size={48} className="mx-auto text-slate-300 mb-4" />
           <p className="text-slate-500">لم يتم إضافة مشاريع بعد من لوحة التحكم</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
