'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { X, Plus, Camera, UserCircle, Briefcase, MapPin, User as UserIcon, Image as ImageIcon } from 'lucide-react';
import { Profile } from '@/types/user';
import { uploadToCloudinary } from 'utils/uploadToCloudinary'; 
import { getMyWorkerProfile, updateMyWorkerProfile } from '@/services/workerService';

const WorkerEditForm = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const [form, setForm] = useState<Profile & { name: string }>({
    name: user?.name || '', 
    profilePic: '',
    profession: '',
    phone: '',
    gender: 'male', 
    state: '',
    district: '',
    city: '',
    zip: '',
    schedule: '',
    previousWorkImages: [], // This array holds your portfolio URLs
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    getMyWorkerProfile(user.token)
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
      .finally(() => setLoading(false));
  }, [user?.token, user?.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- Image Upload Logic ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isProfilePic: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (isProfilePic) {
        // Single upload for Profile Picture
        const url = await uploadToCloudinary(files[0]);
        if (url) setForm(prev => ({ ...prev, profilePic: url }));
      } else {
        // Multiple upload for Portfolio
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
    try {
      setUploading(true);
      await updateMyWorkerProfile(form, user!.token);
      toast.success('Profile updated successfully!');
      router.push('/worker/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.details?.[0]?.message || "Check fields: Phone(10), Zip(6), Gender";
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-blue-600">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-xl mt-12 mb-12 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- Header & Profile Pic --- */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-8">
          <div className="relative group">
            {form.profilePic ? (
              <img src={form.profilePic} className="w-32 h-32 rounded-2xl object-cover ring-4 ring-green-50 ring-offset-2" alt="Profile" />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                <UserCircle size={64} />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-lg cursor-pointer hover:bg-green-700 shadow-lg transition-transform active:scale-90">
              <Camera size={20} />
              <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, true)} />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-800">Edit Profile</h2>
            <p className="text-gray-500">Manage your identity and professional details.</p>
          </div>
        </div>

        {/* --- Name Input --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <UserIcon size={14} /> Identity
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              required 
            />
          </div>
        </section>

        {/* --- Basic Info --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <Briefcase size={14} /> Professional Details
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="profession" value={form.profession} onChange={handleChange} className="border-gray-200 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="">Profession</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Painter">Painter</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Cleaner">Cleaner</option>
            </select>
            <select name="gender" value={form.gender} onChange={handleChange} className="border-gray-200 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (10 digits)" className="border-gray-200 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" required />
            <input name="schedule" value={form.schedule} onChange={handleChange} placeholder="Schedule (e.g. 9am-6pm)" className="border-gray-200 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </section>

        {/* --- PORTFOLIO SECTION (Previous Work Images) --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <ImageIcon size={14} /> Portfolio (Previous Work)
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Upload Button */}
            <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-32 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors group">
              <Plus className="text-gray-400 group-hover:text-green-600" size={32} />
              <span className="text-xs text-gray-500 group-hover:text-green-600 font-medium">Add Work</span>
              <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFileChange(e, false)} />
            </label>

            {/* Image Preview Grid */}
            {form.previousWorkImages?.map((url, index) => (
              <div key={index} className="relative h-32 group">
                <img 
                  src={url} 
                  alt={`work-${index}`} 
                  className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform active:scale-90"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          {form.previousWorkImages?.length === 0 && !uploading && (
            <p className="text-sm text-gray-400 italic">No portfolio images added yet.</p>
          )}
        </section>

        {/* --- Location Section --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <MapPin size={14} /> Service Location
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['state', 'district', 'city', 'zip'].map((key) => (
              <input 
                key={key}
                name={key} 
                value={(form as any)[key]} 
                onChange={handleChange} 
                className="border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder={key.toUpperCase()}
              />
            ))}
          </div>
        </section>

        <button 
          disabled={uploading} 
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-[0.98] disabled:bg-gray-300"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               Processing...
            </span>
          ) : 'Save Profile Details'}
        </button>
      </form>
    </div>
  );
};

export default WorkerEditForm;