import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from '../components/Reveal';
import { ArrowUpRight, Calendar, User, Tag, Loader2, X } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
}

// Fallback data in case DB access is denied (Demo Mode)
const DEMO_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'مستقبل العلاج الطبيعي والذكاء الاصطناعي',
    category: 'تكنولوجيا صحية',
    date: 'Jan 15, 2024',
    image: 'https://images.unsplash.com/photo-1576091160550-21878bf01ad3?q=80&w=800&auto=format&fit=crop',
    excerpt: 'كيف يمكن لخوارزميات الذكاء الاصطناعي تحسين خطط العلاج وتقليل وقت التعافي للمرضى؟',
    content: `
# مستقبل العلاج الطبيعي

الذكاء الاصطناعي **يغير قواعد اللعبة** في مجال الرعاية الصحية.

## كيف يعمل؟
1. تحليل البيانات
2. خطط علاج مخصصة
3. متابعة دقيقة

> "التكنولوجيا هي المستقبل."
    `
  },
  {
    id: '2',
    title: 'أهمية السجلات الطبية الإلكترونية',
    category: 'إدارة العيادات',
    date: 'Jan 10, 2024',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0674f66?q=80&w=800&auto=format&fit=crop',
    excerpt: 'لماذا يجب على كل عيادة علاج طبيعي التحول للنظام الرقمي في عام 2024؟',
    content: 'المحتوى هنا...'
  },
  {
    id: '3',
    title: 'تأهيل إصابات الملاعب الحديثة',
    category: 'علاج طبيعي',
    date: 'Jan 05, 2024',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
    excerpt: 'أحدث البروتوكولات العالمية في التعامل مع إصابات الرباط الصليبي والغضروف.',
    content: 'المحتوى هنا...'
  }
];

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
        setPosts(postsData);
      } catch (err) {
        console.warn("Could not fetch posts (using demo data):", err);
        // Fallback to demo data if permission is denied or other error
        setPosts(DEMO_POSTS);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [selectedPost]);

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      <Reveal>
        <div className="mb-12 border-b border-slate-200 pb-8">
           <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{t('nav.blog')}</h1>
           <p className="text-xl text-slate-500 max-w-2xl">
             استكشف أحدث المقالات والأخبار في مجال العلاج الطبيعي والتكنولوجيا الصحية.
           </p>
        </div>
      </Reveal>

      {/* Grid Posts */}
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <Reveal key={post.id} delay={idx * 150}>
              <div 
                onClick={() => setSelectedPost(post)}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={post.image || "https://via.placeholder.com/400x300?text=No+Image"} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                    <Tag size={12} className="text-primary-600" />
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-primary-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                    {t('common.readMore')} <ArrowUpRight size={16} className="ml-1 rtl:mr-1 rtl:ml-0" />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          لا توجد مقالات منشورة حالياً.
        </div>
      )}

      {/* Full Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setSelectedPost(null)}
          ></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in duration-300">
             {/* Header Image */}
             <div className="h-64 sm:h-80 w-full relative shrink-0">
               <img 
                 src={selectedPost.image} 
                 className="w-full h-full object-cover"
                 alt={selectedPost.title}
               />
               <button 
                 onClick={() => setSelectedPost(null)}
                 className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-white/90 p-2 rounded-full hover:bg-white text-slate-900 transition-colors shadow-lg"
               >
                 <X size={24} />
               </button>
               <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-8">
                  <div className="flex gap-4 text-white/90 text-sm mb-2">
                    <span className="bg-primary-600 px-2 py-0.5 rounded text-white">{selectedPost.category}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {selectedPost.date}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {selectedPost.title}
                  </h2>
               </div>
             </div>
             
             {/* Content */}
             <div className="p-8 md:p-12 overflow-y-auto">
               <MarkdownRenderer content={selectedPost.content} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;