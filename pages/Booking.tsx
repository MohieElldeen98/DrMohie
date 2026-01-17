import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Calendar, Send, MessageCircle, Loader2 } from 'lucide-react';
import Reveal from '../components/Reveal';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingFormData {
  fullName: string;
  phone: string;
  age: string;
  gender: string;
  address: string;
  diagnosis: string;
}

export default function Booking() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    diagnosis: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Add a new document with a generated id.
      await addDoc(collection(db, "bookings"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    // Construct the WhatsApp message with user details
    const whatsappMessage = encodeURIComponent(
      `مرحباً د. محي، 👋\nلقد قمت بتسجيل حجز جلسة عبر الموقع وأريد تأكيد الموعد.\n\n📋 *بيانات الحجز:*\n👤 الاسم: ${formData.fullName}\n📱 الهاتف: ${formData.phone}\n📍 العنوان: ${formData.address}\n📝 الشكوى: ${formData.diagnosis}\n\nشكراً لك!`
    );
    // Link to Doctor's number (from contact info)
    const whatsappLink = `https://wa.me/201158227491?text=${whatsappMessage}`;

    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        <Reveal>
          <div className="max-w-xl mx-auto mt-10 p-8 md:p-10 bg-white rounded-3xl border border-primary-100 shadow-xl text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-in zoom-in duration-300">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('booking.success')}</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              تم تسجيل طلبك في النظام بنجاح. لضمان سرعة الاستجابة وتحديد الموعد فوراً، يرجى الضغط على الزر أدناه لإرسال التفاصيل للدكتور عبر واتساب.
            </p>

            <div className="flex flex-col gap-3">
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-1"
              >
                <MessageCircle size={24} />
                <span>إرسال التفاصيل وتأكيد الحجز</span>
              </a>
              
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: '',
                    phone: '',
                    age: '',
                    gender: '',
                    address: '',
                    diagnosis: ''
                  });
                }}
                className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 font-medium transition-colors mt-2"
              >
                عودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('booking.title')}</h1>
            <p className="text-slate-500 max-w-lg mx-auto">{t('booking.desc')}</p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-primary-50 px-8 py-4 border-b border-primary-100 flex items-center gap-3">
              <Calendar size={20} className="text-primary-600" />
              <span className="text-sm text-primary-800 font-bold uppercase tracking-wide">
                 {t('booking.title')}
              </span>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('booking.labels.name')}
                  </label>
                  <input
                    required
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('booking.labels.phone')}
                  </label>
                  <input
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Age */}
                <div className="col-span-1 md:col-span-1">
                  <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('booking.labels.age')}
                  </label>
                  <input
                    required
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                  />
                </div>

                {/* Gender */}
                <div className="col-span-1 md:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('booking.labels.gender')}
                  </label>
                  <select
                    required
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                  >
                    <option value="">{t('booking.genderOptions.select')}</option>
                    <option value="male">{t('booking.genderOptions.male')}</option>
                    <option value="female">{t('booking.genderOptions.female')}</option>
                  </select>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('booking.labels.address')}
                </label>
                <input
                  required
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('booking.labels.diagnosis')}
                </label>
                <textarea
                  required
                  id="diagnosis"
                  name="diagnosis"
                  rows={4}
                  value={formData.diagnosis}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-slate-50 focus:bg-white resize-none disabled:opacity-50"
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl group disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('booking.labels.submit')}</span>
                      <Send size={18} className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
