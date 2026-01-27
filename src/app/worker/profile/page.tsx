'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { X, Plus, Camera, UserCircle, RotateCcw, Briefcase, MapPin, Clock } from 'lucide-react';
import { Profile } from '@/types/user';
import { uploadToCloudinary } from 'utils/uploadToCloudinary'; 
import { getMyWorkerProfile, updateMyWorkerProfile } from '@/services/workerService';

const WorkerProfileForm = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const [form, setForm] = useState<Profile>({
    profilePic: '',
    profession: '',
    phone: '',
    gender: 'male', 
    state: '',
    district: '',
    city: '',
    zip: '',
    schedule: '',
    previousWorkImages: [],
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Helper to get token safely ---
  const getAuthToken = () => {
    // 1. Try Zustand Store
    if (user?.token) return user.token;
    
    // 2. Try LocalStorage (Fallback)
    if (typeof window !== "undefined") {
      // Check directly stored token
      const directToken = localStorage.getItem('token');
      if (directToken) return directToken;

      // Check persisted Zustand store
      const storage = localStorage.getItem('quickfix-user'); 
      if (storage) {
        try {
           const parsed = JSON.parse(storage);
           return parsed.state?.token || parsed.state?.user?.token;
        } catch (e) { console.error("Token parse error", e); }
      }
    }
    return null;
  };

  useEffect(() => {
    const token = getAuthToken();

    // 1. If no token, stop loading & warn
    if (!token) {
      setLoading(false); 
      // Optional: router.push('/auth/login');
      return;
    }

    // 2. Fetch profile
    getMyWorkerProfile(token)
      .then((profile) => {
        if (profile) setForm((prev) => ({ ...prev, ...profile }));
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]); // Depend on user object update

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, key: 'profilePic' | 'previousWorkImages') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (key === 'profilePic') {
        const url = await uploadToCloudinary(files[0]);
        if (url) setForm(prev => ({ ...prev, profilePic: url }));
      } else {
        const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
        const filteredUrls = urls.filter((u): u is string => !!u);
        setForm(prev => ({ ...prev, previousWorkImages: [...(prev.previousWorkImages || []), ...filteredUrls] }));
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Fix: Use the helper to get token robustly
    const token = getAuthToken();

    if (!token) {
      toast.error("Authentication error: No token found. Please login again.");
      router.push('/auth/login'); // Redirect to login if token is genuinely gone
      return;
    }

    try {
      setUploading(true);
      await updateMyWorkerProfile(form, token); 
      toast.success('Profile updated successfully!');
      router.push('/worker/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.details?.[0]?.message || "Check your input formats";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-medium">Loading your profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-xl mt-12 mb-12 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- Header & Profile Pic --- */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-8">
          <div className="relative group">
            {form.profilePic ? (
              <img src={form.profilePic} alt="Profile" className="w-32 h-32 rounded-2xl object-cover ring-4 ring-green-50 ring-offset-2" />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                <UserCircle size={64} />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-lg cursor-pointer hover:bg-green-700 shadow-lg">
              <Camera size={20} />
              <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e, 'profilePic')} />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-800">Worker Profile</h2>
            <p className="text-gray-500">Update your details so clients can find you easily.</p>
          </div>
        </div>

        {/* --- Basic Info Section --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <Briefcase size={14} /> Basic Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Profession</label>
              <select name="profession" value={form.profession} onChange={handleChange} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required>
                <option value="">Select Category</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Painter">Painter</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Cleaner">Cleaner</option>
                <option value="HVAC Technician">HVAC Technician</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Contact Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="10 Digit Number" className="w-full border-gray-200 border rounded-xl p-3" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Schedule</label>
              <input name="schedule" value={form.schedule} onChange={handleChange} placeholder="e.g. Mon-Fri, 9AM-5PM" className="w-full border-gray-200 border rounded-xl p-3" />
            </div>
          </div>
        </section>

        {/* --- Location Section --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <MapPin size={14} /> Service Location
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['state', 'district', 'city', 'zip'].map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1 capitalize">{key}</label>
                <input 
                  name={key} 
                  value={(form as any)[key]} 
                  onChange={handleChange} 
                  className="w-full border-gray-200 border rounded-xl p-3 text-sm" 
                  placeholder={key === 'zip' ? '6 digits' : ''}
                />
              </div>
            ))}
          </div>
        </section>

        {/* --- Portfolio Section --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <Plus size={14} /> Portfolio (Previous Work)
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">
              <Plus size={24} />
              <span className="text-[10px] font-bold">ADD WORK</span>
              <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFile(e, 'previousWorkImages')} />
            </label>
            {form.previousWorkImages?.map((url, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img src={url} className="w-full h-full object-cover rounded-2xl shadow-sm" />
                <button 
                  type="button" 
                  onClick={() => setForm(f => ({ ...f, previousWorkImages: f.previousWorkImages?.filter((_, idx) => idx !== i) }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Action --- */}
        <button 
          disabled={uploading} 
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-100 transition disabled:bg-gray-300"
        >
          {uploading ? 'Processing Assets...' : 'Save Profile Details'}
        </button>
      </form>
    </div>
  );
};

export default WorkerProfileForm;