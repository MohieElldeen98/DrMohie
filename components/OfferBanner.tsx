import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Megaphone, X } from 'lucide-react';

interface Offer {
  id: string;
  text: string;
  active: boolean;
  type?: 'banner' | 'popup';
}

const OfferBanner: React.FC = () => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Query for active offers
    const q = query(collection(db, "offers"), where("active", "==", true));
    
    // Added error callback to onSnapshot to prevent "Uncaught Error" when permissions are denied
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        if (!snapshot.empty) {
          // Take the first active offer
          const data = snapshot.docs[0].data() as Omit<Offer, 'id'>;
          setOffer({ id: snapshot.docs[0].id, ...data });
          setIsVisible(true);
        } else {
          setOffer(null);
        }
      },
      (error) => {
        // Silently fail if permission denied (e.g. user not logged in and rules are strict)
        // This prevents the app from crashing or spamming the console
        console.log("Offer banner inactive (requires Firestore public read rules)");
        setOffer(null);
      }
    );

    return () => unsubscribe();
  }, []);

  if (!offer || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-2xl z-[100] animate-in slide-in-from-bottom duration-500 fade-in">
      <div className="bg-slate-900/95 backdrop-blur-md text-white py-3 px-4 md:px-5 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center justify-between gap-4 ring-1 ring-white/10">
        <div className="flex items-center gap-3 flex-grow">
          <div className="p-2 bg-primary-600 rounded-xl shrink-0 animate-pulse">
             <Megaphone size={18} className="text-white" />
          </div>
          <p className="font-medium text-sm md:text-base leading-snug">
            {offer.text}
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0 text-slate-400 hover:text-white"
          aria-label="Close offer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default OfferBanner;