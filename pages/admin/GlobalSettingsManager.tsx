import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GlobalSettings } from '../../types/cms';
import { Save, Loader2, CheckCircle } from 'lucide-react';

const GlobalSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    siteName: '',
    contactPhone: '',
    contactEmail: '',
    themeMode: 'light',
    heroEnabled: true,
    copyrightText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "cms", "global");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().siteConfig) {
          setSettings(docSnap.data().siteConfig as GlobalSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await setDoc(doc(db, "cms", "global"), {
        siteConfig: settings
      }, { merge: true });
      
      setMessage({ type: 'success', text: 'Global settings updated successfully!' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Global Configuration</h2>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Site Name</label>
            <input 
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. My Website"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Contact Phone</label>
              <input 
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Contact Email</label>
              <input 
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Copyright Text</label>
            <input 
              name="copyrightText"
              value={settings.copyrightText || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="© 2024 All Rights Reserved"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="heroEnabled"
                  name="heroEnabled"
                  checked={settings.heroEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="heroEnabled" className="text-slate-700 font-medium">Enable Hero Section</label>
             </div>
          </div>
          
           <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Theme Mode</label>
            <select 
              name="themeMode"
              value={settings.themeMode}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default GlobalSettingsManager;