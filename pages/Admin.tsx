
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, LogOut, Trash2, Calendar, Phone, MapPin, FileText, Loader2, AlertCircle, Plus, Edit, Megaphone, LayoutGrid, LayoutList, Home as HomeIcon, Save, CheckCircle, Award, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, updateDoc, 
  setDoc, getDoc, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import MarkdownEditor from '../components/MarkdownEditor';
import ImageUploader from '../components/ImageUploader';
import { HomeConfig, CertificateItem } from '../types/cms';
import MediaManager from './admin/MediaManager';
import GlobalSettingsManager from './admin/GlobalSettingsManager';

// --- Types ---
interface BookingData {
  id: string;
  fullName: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  diagnosis: string;
  createdAt: Timestamp;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  content: string; 
  date: string;
  createdAt: Timestamp;
}

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

interface OfferData {
  id: string;
  text: string;
  active: boolean;
}

// --- Main Admin Component ---
const Admin: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'blog' | 'projects' | 'offers' | 'media'>('home');

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="container mx-auto px-4 min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">دخول الإدارة</h1>
          </div>
          {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="البريد الإلكتروني" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="كلمة المرور" />
            <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Admin Navbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center mb-8 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg font-bold">CMS</div>
          <h1 className="text-xl font-bold text-slate-800 hidden sm:block">لوحة التحكم</h1>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-bold">
          <LogOut size={16} /> خروج
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon size={18} />} label="الرئيسية" />
          <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<Calendar size={18} />} label="الحجوزات" />
          <TabButton active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} icon={<FileText size={18} />} label="المدونة" />
          <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<LayoutGrid size={18} />} label="المشاريع" />
          <TabButton active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} icon={<Megaphone size={18} />} label="العروض" />
          <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<LayoutList size={18} />} label="الوسائط" />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {activeTab === 'home' && <HomeEditor />}
          {activeTab === 'bookings' && <BookingsManager />}
          {activeTab === 'blog' && <BlogManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'offers' && <OffersManager />}
          {activeTab === 'media' && <MediaManager />}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
      active ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon} {label}
  </button>
);

// --- Sub-Components ---

const HomeEditor = () => {
  const [config, setConfig] = useState<HomeConfig>({
    sectionOrder: ['hero', 'about', 'services', 'why', 'certificates', 'contact'],
    hero: { role: '', title: '', subtitle: '', image: '', ctaPrimary: '', ctaSecondary: '' },
    about: { title: '', bio: '', showIcon: true },
    services: { title: '', subtitle: '', image: '', list: [] },
    why: { title: '', items: [] },
    certificates: { title: 'الشهادات', subtitle: '', items: [] },
    contact: { desc: '', buttonText: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCert, setNewCert] = useState<Partial<CertificateItem>>({});
  const [showCertForm, setShowCertForm] = useState(false);

  useEffect(() => {
    const fetchHomeConfig = async () => {
      try {
        const docRef = doc(db, 'cms', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as HomeConfig;
          
          // Ensure structure integrity
          if (!data.certificates) data.certificates = { title: 'الشهادات والاعتمادات', subtitle: '', items: [] };
          if (!data.sectionOrder) data.sectionOrder = ['hero', 'about', 'services', 'why', 'certificates', 'contact'];
          
          setConfig(data);
        } else {
           setConfig({
             sectionOrder: ['hero', 'about', 'services', 'why', 'certificates', 'contact'],
             hero: { role: 'أخصائي علاج طبيعي', title: 'دكتور محي', subtitle: 'أهلا بك في موقعي', image: '', ctaPrimary: 'حجز', ctaSecondary: 'مشاريع' },
             about: { title: 'عني', bio: 'أنا دكتور...', showIcon: true },
             services: { title: 'خدماتي', subtitle: 'أقدم...', image: '', list: ['تأهيل', 'علاج'] },
             why: { title: 'لماذا نحن؟', items: [{title: 'خبرة', desc: 'سنوات من العمل'}] },
             certificates: { title: 'الشهادات والاعتمادات', subtitle: 'رحلة التعلم المستمر', items: [] },
             contact: { desc: 'تواصل معي الآن', buttonText: 'اتصل' }
           });
        }
      } catch (error) {
        console.error("Error loading home config", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms', 'home'), config, { merge: true });
      alert('تم حفظ التغييرات بنجاح!');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: keyof HomeConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        // @ts-ignore
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateWhyItem = (index: number, field: 'title' | 'desc', value: string) => {
    const newItems = [...config.why.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setConfig(prev => ({ ...prev, why: { ...prev.why, items: newItems } }));
  };

  const addWhyItem = () => {
    setConfig(prev => ({
      ...prev,
      why: { ...prev.why, items: [...prev.why.items, { title: 'عنوان جديد', desc: 'وصف جديد' }] }
    }));
  };

  const removeWhyItem = (index: number) => {
    const newItems = [...config.why.items];
    newItems.splice(index, 1);
    setConfig(prev => ({ ...prev, why: { ...prev.why, items: newItems } }));
  };
  
  const updateServiceItem = (index: number, value: string) => {
    const newList = [...config.services.list];
    newList[index] = value;
    setConfig(prev => ({ ...prev, services: { ...prev.services, list: newList } }));
  };
  
  const addServiceItem = () => {
    setConfig(prev => ({
      ...prev,
      services: { ...prev.services, list: [...prev.services.list, 'خدمة جديدة'] }
    }));
  };
  
  const removeServiceItem = (index: number) => {
    const newList = [...config.services.list];
    newList.splice(index, 1);
    setConfig(prev => ({ ...prev, services: { ...prev.services, list: newList } }));
  };

  // --- Certificate Logic ---
  const handleAddCert = () => {
    if (!newCert.title) {
      alert("يرجى إدخال عنوان الشهادة");
      return;
    }
    const imageToUse = newCert.image || "https://placehold.co/600x400/e2e8f0/64748b?text=Certificate";
    setConfig(prev => ({
      ...prev,
      certificates: {
        ...prev.certificates,
        items: [...(prev.certificates?.items || []), {
          title: newCert.title!,
          issuer: newCert.issuer || 'Unknown Issuer',
          date: newCert.date || '',
          image: imageToUse
        } as CertificateItem]
      }
    }));
    setNewCert({});
    setShowCertForm(false);
  };

  const generateRandomImage = () => {
    const randomId = Math.floor(Math.random() * 50) + 1;
    const randomUrl = `https://picsum.photos/id/${randomId}/400/300`;
    setNewCert(prev => ({ ...prev, image: randomUrl }));
  };

  const removeCert = (index: number) => {
    const newItems = [...config.certificates.items];
    newItems.splice(index, 1);
    setConfig(prev => ({
      ...prev,
      certificates: { ...prev.certificates, items: newItems }
    }));
  };

  // --- Section Ordering Logic ---
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...(config.sectionOrder || [])];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setConfig(prev => ({ ...prev, sectionOrder: newOrder }));
  };

  const sectionLabels: Record<string, string> = {
    'hero': 'القسم الأول (Hero)',
    'about': 'نبذة عني',
    'services': 'الخدمات',
    'why': 'لماذا نحن؟',
    'certificates': 'الشهادات',
    'contact': 'زر التواصل السفلي'
  };

  if (loading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center sticky top-20 z-40 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">تعديل الصفحة الرئيسية</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} حفظ التغييرات
        </button>
      </div>

      {/* Section Ordering Widget */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
           <LayoutList size={20} /> ترتيب أقسام الصفحة
        </h3>
        <p className="text-sm text-slate-500 mb-4">استخدم الأسهم لإعادة ترتيب ظهور الأقسام في الصفحة الرئيسية.</p>
        <div className="space-y-2">
           {config.sectionOrder?.map((sectionKey, idx) => (
             <div key={sectionKey} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="font-medium text-slate-700">{sectionLabels[sectionKey] || sectionKey}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveSection(idx, 'up')} 
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button 
                    onClick={() => moveSection(idx, 'down')} 
                    disabled={idx === (config.sectionOrder?.length || 0) - 1}
                    className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden" open>
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-lg bg-white group-open:border-b">
          <span>القسم الأول (Hero Section)</span>
          <Edit size={16} className="text-slate-400" />
        </summary>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="الوظيفة (Badge)" value={config.hero.role} onChange={v => updateSection('hero', 'role', v)} />
            <InputField label="العنوان الرئيسي" value={config.hero.title} onChange={v => updateSection('hero', 'title', v)} />
          </div>
          <TextAreaField label="الوصف الفرعي" value={config.hero.subtitle} onChange={v => updateSection('hero', 'subtitle', v)} />
          <div className="grid md:grid-cols-2 gap-4">
             <InputField label="نص الزر الأساسي" value={config.hero.ctaPrimary} onChange={v => updateSection('hero', 'ctaPrimary', v)} />
             <InputField label="نص الزر الثانوي" value={config.hero.ctaSecondary} onChange={v => updateSection('hero', 'ctaSecondary', v)} />
          </div>
          <ImageUploader label="صورة الدكتور الشخصية" value={config.hero.image} onChange={v => updateSection('hero', 'image', v)} folder="home/hero" />
        </div>
      </details>
      
      {/* Rest of the details sections remain the same... just collapsed for brevity in the diff, but fully included in output */}
       <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-lg bg-white group-open:border-b">
          <span>نبذة عني (About)</span>
          <Edit size={16} className="text-slate-400" />
        </summary>
        <div className="p-6 space-y-4">
          <InputField label="العنوان" value={config.about.title} onChange={v => updateSection('about', 'title', v)} />
          <TextAreaField label="النص التعريفي" value={config.about.bio} onChange={v => updateSection('about', 'bio', v)} />
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="showIcon" 
              checked={config.about.showIcon} 
              onChange={e => updateSection('about', 'showIcon', e.target.checked)} 
              className="w-5 h-5"
            />
            <label htmlFor="showIcon" className="font-bold text-slate-700">إظهار أيقونة السماعة في الخلفية</label>
          </div>
        </div>
      </details>

      <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-lg bg-white group-open:border-b">
          <span>خدمات العلاج المنزلي</span>
          <Edit size={16} className="text-slate-400" />
        </summary>
        <div className="p-6 space-y-4">
          <InputField label="العنوان" value={config.services.title} onChange={v => updateSection('services', 'title', v)} />
          <TextAreaField label="الوصف" value={config.services.subtitle} onChange={v => updateSection('services', 'subtitle', v)} />
          
          <div className="space-y-2">
            <label className="font-bold text-sm text-slate-700">قائمة الحالات (Cases)</label>
            {config.services.list.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input value={item} onChange={e => updateServiceItem(idx, e.target.value)} className="flex-grow p-2 border rounded" />
                <button onClick={() => removeServiceItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={addServiceItem} className="text-sm text-primary-600 font-bold flex items-center gap-1">+ إضافة حالة</button>
          </div>

          <ImageUploader label="صورة القسم" value={config.services.image} onChange={v => updateSection('services', 'image', v)} folder="home/services" />
        </div>
      </details>

      <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-lg bg-white group-open:border-b">
          <span>لماذا حلولي؟ (Why Section)</span>
          <Edit size={16} className="text-slate-400" />
        </summary>
        <div className="p-6 space-y-4">
          <InputField label="العنوان الرئيسي" value={config.why.title} onChange={v => updateSection('why', 'title', v)} />
          
          <div className="grid md:grid-cols-2 gap-4">
            {config.why.items.map((item, idx) => (
              <div key={idx} className="p-4 border rounded-xl bg-white relative">
                <button onClick={() => removeWhyItem(idx)} className="absolute top-2 left-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                <div className="space-y-2">
                  <input placeholder="العنوان" value={item.title} onChange={e => updateWhyItem(idx, 'title', e.target.value)} className="w-full p-2 border rounded font-bold" />
                  <textarea placeholder="الوصف" value={item.desc} onChange={e => updateWhyItem(idx, 'desc', e.target.value)} className="w-full p-2 border rounded text-sm h-20 resize-none" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={addWhyItem} className="w-full py-2 bg-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-300">+ إضافة عنصر جديد</button>
        </div>
      </details>

      <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-lg bg-white group-open:border-b">
          <span>الشهادات (Certificates)</span>
          <Edit size={16} className="text-slate-400" />
        </summary>
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="العنوان" value={config.certificates?.title || ''} onChange={v => updateSection('certificates', 'title', v)} />
            <InputField label="الوصف" value={config.certificates?.subtitle || ''} onChange={v => updateSection('certificates', 'subtitle', v)} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {config.certificates?.items?.map((item, idx) => (
              <div key={idx} className="relative group border rounded-lg overflow-hidden">
                <div className="aspect-square bg-slate-100">
                  <img src={item.image} className="w-full h-full object-cover" alt="cert" />
                </div>
                <div className="p-2">
                  <p className="font-bold text-sm truncate">{item.title}</p>
                </div>
                <button 
                  onClick={() => removeCert(idx)} 
                  className="absolute top-1 right-1 bg-white text-red-600 p-1 rounded-full shadow-sm hover:bg-red-50"
                >
                   <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => setShowCertForm(true)}
              className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600 transition-all"
            >
              <Plus size={24} />
              <span className="text-sm font-medium mt-1">Add Certificate</span>
            </button>
          </div>

          {showCertForm && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 relative animate-in zoom-in-95">
                <h3 className="font-bold text-lg mb-2">إضافة شهادة جديدة</h3>
                
                <InputField label="عنوان الشهادة *" value={newCert.title || ''} onChange={v => setNewCert({...newCert, title: v})} />
                <InputField label="الجهة المانحة" value={newCert.issuer || ''} onChange={v => setNewCert({...newCert, issuer: v})} />
                <InputField label="التاريخ (اختياري)" value={newCert.date || ''} onChange={v => setNewCert({...newCert, date: v})} />
                
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <label className="text-sm font-bold text-slate-700">صورة الشهادة (اختياري)</label>
                     <button 
                       onClick={generateRandomImage}
                       className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                       title="استخدام صورة عشوائية"
                     >
                       <RefreshCw size={12} /> صورة عشوائية
                     </button>
                   </div>
                   <ImageUploader 
                     label="" 
                     value={newCert.image || ''} 
                     onChange={v => setNewCert({...newCert, image: v})} 
                     folder="home/certificates" 
                   />
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleAddCert} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold transition-colors">إضافة</button>
                  <button onClick={() => setShowCertForm(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-bold transition-colors">إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </details>

      <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-lg bg-white group-open:border-b">
          <span>زر التواصل (Footer CTA)</span>
          <Edit size={16} className="text-slate-400" />
        </summary>
        <div className="p-6 space-y-4">
          <TextAreaField label="نص الدعوة لاتخاذ إجراء" value={config.contact.desc} onChange={v => updateSection('contact', 'desc', v)} />
          <InputField label="نص الزر" value={config.contact.buttonText} onChange={v => updateSection('contact', 'buttonText', v)} />
        </div>
      </details>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
         <h3 className="font-bold text-slate-700">حقوق الملكية (Footer)</h3>
         <p className="text-sm text-slate-500 mb-2">يمكنك تعديل نص الحقوق من تبويب "Global Settings" (الإعدادات العامة).</p>
         <GlobalSettingsFooterEditor />
      </div>

    </div>
  );
};

const GlobalSettingsFooterEditor = () => {
  const [copyright, setCopyright] = useState('');
  
  useEffect(() => {
     const docRef = doc(db, 'cms', 'global');
     getDoc(docRef).then(snap => {
       if(snap.exists()) setCopyright(snap.data()?.siteConfig?.copyrightText || '');
     });
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, 'cms', 'global');
    await setDoc(docRef, { siteConfig: { copyrightText: copyright } }, { merge: true });
    alert('تم تحديث الفوتر');
  };

  return (
    <div className="flex gap-2">
      <input value={copyright} onChange={e => setCopyright(e.target.value)} placeholder="© 2024 جميع الحقوق محفوظة..." className="flex-grow p-2 border rounded-lg" />
      <button onClick={handleSave} className="bg-slate-800 text-white px-4 rounded-lg">حفظ</button>
    </div>
  );
};

const InputField = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
  </div>
);

const TextAreaField = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
  </div>
);


const BookingsManager = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingData)));
        setLoading(false);
      },
      (error) => { setLoading(false); }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحجز؟")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto" />;
  if (bookings.length === 0) return <p className="text-center text-slate-500 py-10">لا توجد حجوزات</p>;

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-start bg-slate-50 hover:bg-white transition-colors">
          <div>
            <h3 className="font-bold text-lg">{booking.fullName}</h3>
            <div className="text-sm text-slate-500 space-y-1 mt-2">
              <p className="flex items-center gap-2"><Phone size={14} /> {booking.phone}</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</p>
              <p className="flex items-center gap-2"><FileText size={14} /> {booking.diagnosis}</p>
            </div>
          </div>
          <button onClick={() => handleDelete(booking.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      },
      (e) => console.log(e)
    );
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPost.id) {
        await updateDoc(doc(db, "blogs", currentPost.id), { ...currentPost });
      } else {
        await addDoc(collection(db, "blogs"), {
          ...currentPost,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          createdAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentPost({});
    } catch (error) {
      alert("Error saving post");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("حذف المقال؟")) await deleteDoc(doc(db, "blogs", id));
  };

  return (
    <div>
      {!isEditing ? (
        <>
          <button onClick={() => setIsEditing(true)} className="mb-6 px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2">
            <Plus size={18} /> إضافة مقال جديد
          </button>
          <div className="grid gap-4">
            {posts.map(post => (
              <div key={post.id} className="flex justify-between items-center p-4 border rounded-xl">
                <div className="flex items-center gap-4">
                  <img src={post.image} alt="" className="w-16 h-16 rounded object-cover bg-slate-100" />
                  <div>
                    <h4 className="font-bold">{post.title}</h4>
                    <p className="text-sm text-slate-500">{post.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="عنوان المقال" value={currentPost.title || ''} onChange={e => setCurrentPost({...currentPost, title: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input required placeholder="القسم (مثال: تقنيات طبية)" value={currentPost.category || ''} onChange={e => setCurrentPost({...currentPost, category: e.target.value})} className="w-full p-3 border rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">صورة المقال</label>
            <ImageUploader value={currentPost.image || ''} onChange={url => setCurrentPost({...currentPost, image: url})} folder="blog" />
          </div>
          
          <textarea required placeholder="مقتطف قصير (للعرض في القائمة)" value={currentPost.excerpt || ''} onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})} className="w-full p-3 border rounded-xl h-24" />
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">محتوى المقال (Markdown)</label>
            <MarkdownEditor 
              value={currentPost.content || ''} 
              onChange={val => setCurrentPost({...currentPost, content: val})} 
              height="h-[500px]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">حفظ ونشر</button>
            <button type="button" onClick={() => { setIsEditing(false); setCurrentPost({}); }} className="px-6 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">إلغاء</button>
          </div>
        </form>
      )}
    </div>
  );
};

const OffersManager = () => {
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [newOffer, setNewOffer] = useState('');

  useEffect(() => {
    const q = query(collection(db, "offers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OfferData)));
      }, (e) => console.log(e));
    return () => unsubscribe();
  }, []);

  const addOffer = async () => {
    if (!newOffer.trim()) return;
    await addDoc(collection(db, "offers"), { text: newOffer, active: true });
    setNewOffer('');
  };

  const toggleActive = async (offer: OfferData) => {
    if (!offer.active) {
       const activeOffers = offers.filter(o => o.active);
       for (const o of activeOffers) {
         await updateDoc(doc(db, "offers", o.id), { active: false });
       }
    }
    await updateDoc(doc(db, "offers", offer.id), { active: !offer.active });
  };

  const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, "offers", id));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex gap-4 mb-8">
        <input 
          value={newOffer} 
          onChange={e => setNewOffer(e.target.value)} 
          placeholder="اكتب نص العرض هنا..." 
          className="flex-grow p-3 border rounded-xl"
        />
        <button onClick={addOffer} className="px-6 bg-primary-600 text-white rounded-xl font-bold">إضافة</button>
      </div>

      <div className="space-y-4">
        {offers.map(offer => (
          <div key={offer.id} className={`p-4 border rounded-xl flex items-center justify-between ${offer.active ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
             <p className={`font-medium ${offer.active ? 'text-green-800' : 'text-slate-500'}`}>{offer.text}</p>
             <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(offer)} className={`px-3 py-1 rounded-lg text-xs font-bold ${offer.active ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>{offer.active ? 'نشط' : 'غير نشط'}</button>
                <button onClick={() => deleteOffer(offer.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectsManager = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<ProjectData>>({});

  useEffect(() => {
    // FIX: Removed 'orderBy' because if index is missing in Firestore, the query fails silently and returns nothing.
    // Fetch all, then sort client-side to ensure admin always sees data.
    const q = query(collection(db, "projects"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
        // Client-side sort
        docs.sort((a, b) => (a.order || 99) - (b.order || 99));
        setProjects(docs);
      }, (e) => console.log("Projects fetch error:", e));
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = typeof current.features === 'string' 
      ? (current.features as string).split(',').map((s: string) => s.trim()) 
      : current.features || [];

    const payload = { ...current, features: featuresArray };
    // Ensure order is a number
    if (payload.order) payload.order = Number(payload.order);
    else payload.order = 99; // Default order if empty

    if (current.id) {
      await updateDoc(doc(db, "projects", current.id), payload);
    } else {
      await addDoc(collection(db, "projects"), payload);
    }
    setIsEditing(false);
    setCurrent({});
  };

  const handleDelete = async (id: string) => {
    if (confirm("حذف المشروع؟")) await deleteDoc(doc(db, "projects", id));
  };

  return (
    <div>
      {!isEditing ? (
        <>
          <button onClick={() => setIsEditing(true)} className="mb-6 px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2">
            <Plus size={18} /> إضافة مشروع
          </button>
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="p-4 border rounded-xl relative group bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                   <div>
                     <h4 className="font-bold text-lg">{p.name}</h4>
                     <p className="text-xs text-slate-500 mb-2">{p.tagline}</p>
                   </div>
                   <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">#{p.order || 99}</span>
                </div>
                
                <div className="absolute top-4 left-4 hidden group-hover:flex gap-2">
                   <button onClick={() => { setCurrent({...p, features: p.features}); setIsEditing(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Edit size={16} /></button>
                   <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-2 text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                لا توجد مشاريع مضافة. اضغط على "إضافة مشروع" للبدء.
              </div>
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
           <input required placeholder="اسم المشروع" value={current.name || ''} onChange={e => setCurrent({...current, name: e.target.value})} className="w-full p-3 border rounded-xl" />
           <input required placeholder="شعار (Tagline)" value={current.tagline || ''} onChange={e => setCurrent({...current, tagline: e.target.value})} className="w-full p-3 border rounded-xl" />
           
           <div className="grid grid-cols-2 gap-4">
              <input placeholder="رابط المشروع (اختياري)" value={current.link || ''} onChange={e => setCurrent({...current, link: e.target.value})} className="w-full p-3 border rounded-xl text-left" dir="ltr" />
              <input type="number" placeholder="الترتيب (Order)" value={current.order || ''} onChange={e => setCurrent({...current, order: Number(e.target.value)})} className="w-full p-3 border rounded-xl" />
           </div>
           
           <select 
             value={current.icon || ''} 
             onChange={e => setCurrent({...current, icon: e.target.value})}
             className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary-500 outline-none"
           >
             <option value="">اختر أيقونة المشروع (افتراضي: شبكة)</option>
             <option value="medical">طبي / سماعة (Medical)</option>
             <option value="health">صحة / نشاط (Health)</option>
             <option value="brain">ذكاء اصطناعي / مخ (Brain)</option>
             <option value="code">برمجة / كود (Code)</option>
             <option value="app">تطبيق موبايل (App)</option>
             <option value="web">موقع ويب (Web)</option>
             <option value="data">بيانات (Data)</option>
             <option value="finance">مالية (Finance)</option>
             <option value="tool">أداة / سرعة (Tool)</option>
           </select>

           <textarea required placeholder="الوصف" value={current.desc || ''} onChange={e => setCurrent({...current, desc: e.target.value})} className="w-full p-3 border rounded-xl h-24" />
           <textarea placeholder="المميزات (افصل بينها بفاصلة ,)" value={Array.isArray(current.features) ? current.features.join(', ') : current.features || ''} onChange={e => setCurrent({...current, features: e.target.value as any})} className="w-full p-3 border rounded-xl" />
           <div className="flex gap-4">
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg">حفظ</button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-slate-200 rounded-lg">إلغاء</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Admin;
