'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { X, Plus, Camera, User, Briefcase, MapPin, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { Profile } from '@/types/user';
import { uploadToCloudinary } from 'utils/uploadToCloudinary'; 
import { getMyWorkerProfile, updateMyWorkerProfile } from '@/services/workerService';

const WorkerEditForm = () => {
  const router = useRouter();
  
  // Get store values
  const { user, hasHydrated, updateUserProfile } = useAuthStore(); 

  const [form, setForm] = useState<Profile & { name: string }>({
    name: '', 
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

  // --- HELPER: Get Token Robustly ---
  // This checks the Store first, then falls back to LocalStorage to prevent false logouts
  const getSafeToken = () => {
    if (user?.token) return user.token;
    if (typeof window !== 'undefined') {
       // Check raw storage in case Zustand is lagging
       const storage = localStorage.getItem('quickfix-user');
       if (storage) {
         try { return JSON.parse(storage).state.token; } catch (e) {}
       }
    }
    return null;
  };

  // --- EFFECT: Handle Data Loading ---
  useEffect(() => {
    // 1. Wait for hydration to finish
    if (!hasHydrated) return; 

    const token = getSafeToken();

    // 2. REAL AUTH CHECK: If absolutely no token found anywhere, THEN redirect
    if (!token) {
      toast.error("Please log in to edit your profile");
      router.push('/auth/login');
      return;
    }

    // 3. OPTIMISTIC FILL: If user data exists in store, show it while loading
    if (user?.profile) {
      setForm(prev => ({
        ...prev,
        ...user.profile,
        name: user.name || prev.name,
      }));
    }

    // 4. Fetch Fresh Data
    setLoading(true);
    getMyWorkerProfile(token)
      .then((profile) => {
        if (profile) {
          setForm((prev) => ({ 
            ...prev, 
            ...profile, 
            name: profile.name || user?.name || '',
            previousWorkImages: profile.previousWorkImages || []
          }));
        }
      })
      .catch((err) => console.error("Background fetch failed", err))
      .finally(() => setLoading(false));

  }, [hasHydrated, user?.token]); // Rerun when hydration finishes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isProfilePic: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (isProfilePic) {
        const url = await uploadToCloudinary(files[0]);
        if (url) setForm(prev => ({ ...prev, profilePic: url }));
      } else {
        const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => !!url);
        
        setForm(prev => ({
          ...prev,
          previousWorkImages: [...(prev.previousWorkImages || []), ...validUrls]
        }));
      }
      toast.success("Images uploaded successfully");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePortfolioImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      previousWorkImages: prev.previousWorkImages?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getSafeToken();

    if (!token) {
      toast.error("Session expired. Please login again.");
      router.push('/auth/login');
      return;
    }

    try {
      setUploading(true);

      // 1. Update Backend
      const response = await updateMyWorkerProfile(form, token);
      
      // 2. Extract Data safely
      const profileData = response.data || response; 

      // 3. Update Global Store (Instant UI Update)
      updateUserProfile(profileData, form.name);

      toast.success('Profile updated successfully!');
      router.push('/worker/dashboard');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.details?.[0]?.message || "Please check your inputs";
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  // Show loading state until hydration is complete AND we have attempted to load data
  if (!hasHydrated || loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="mt-2 text-slate-600">Update your personal details and professional portfolio.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Photo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile Picture
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-100">
                  {form.profilePic ? (
                    <img src={form.profilePic} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-transform active:scale-95 border-2 border-white">
                  <Camera size={16} />
                  <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-slate-900">Upload a photo</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  JPG, GIF or PNG. Best size is 400x400. This will be displayed on your public profile.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profession</label>
                <div className="relative">
                  <select 
                    name="profession" 
                    value={form.profession} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer" 
                    required
                  >
                    <option value="">Select Profession</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Painter">Painter</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                  <Briefcase className="absolute right-4 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer" 
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Availability Schedule</label>
                <input 
                  name="schedule" 
                  value={form.schedule} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Service Location
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['state', 'district', 'city', 'zip'].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{key}</label>
                  <input 
                    name={key} 
                    value={(form as any)[key]} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Portfolio
            </h2>
            <p className="text-sm text-slate-500 mb-6">Upload photos of your previous work.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Plus className="text-slate-400 group-hover:text-blue-600" size={20} />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-blue-600 font-bold mt-2">Add Photo</span>
                <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFileChange(e, false)} />
              </label>

              {form.previousWorkImages?.map((url, index) => (
                <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={url} alt={`work-${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(index)}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-transform hover:scale-110"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 pb-12">
            <button 
              disabled={uploading} 
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default WorkerEditForm;