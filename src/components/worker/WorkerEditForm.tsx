'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { X, Plus, Camera, UserCircle, Briefcase, MapPin, User as UserIcon } from 'lucide-react';
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
    previousWorkImages: [],
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
            // Priority: profile name -> store user name -> empty
            name: profile.name || user?.name || '' 
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [user?.token, user?.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // We pass the whole form; our service will handle cleaning the payload
      await updateMyWorkerProfile(form, user!.token);
      
      toast.success('Profile updated successfully!');
      router.push('/worker/dashboard');
    } catch (err: any) {
      // Extract specific Joi error message if available
      const detail = err.response?.data?.details?.[0]?.message || "Check fields: Phone(10), Zip(6), Gender";
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-xl mt-12 mb-12 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- Header & Profile Pic --- */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-8">
          <div className="relative group">
            {form.profilePic ? (
              <img src={form.profilePic} className="w-32 h-32 rounded-2xl object-cover ring-4 ring-green-50 ring-offset-2" />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                <UserCircle size={64} />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-lg cursor-pointer hover:bg-green-700 shadow-lg">
              <Camera size={20} />
              <input type="file" hidden accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploading(true);
                  const url = await uploadToCloudinary(file);
                  if (url) setForm(f => ({ ...f, profilePic: url }));
                  setUploading(false);
                }
              }} />
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
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none" 
              required 
            />
          </div>
        </section>

        {/* --- Basic Info: Profession, Gender, Phone, Schedule --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-xs tracking-wider">
            <Briefcase size={14} /> Professional Details
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="profession" value={form.profession} onChange={handleChange} className="border-gray-200 border rounded-xl p-3" required>
              <option value="">Profession</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Painter">Painter</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Cleaner">Cleaner</option>
            </select>
            <select name="gender" value={form.gender} onChange={handleChange} className="border-gray-200 border rounded-xl p-3" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (10 digits)" className="border-gray-200 border rounded-xl p-3" required />
            <input name="schedule" value={form.schedule} onChange={handleChange} placeholder="Schedule (e.g. 9am-6pm)" className="border-gray-200 border rounded-xl p-3" />
          </div>
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
                className="border-gray-200 border rounded-xl p-3 text-sm" 
                placeholder={key.toUpperCase()}
              />
            ))}
          </div>
        </section>

        <button 
          disabled={uploading} 
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-100 transition disabled:bg-gray-300"
        >
          {uploading ? 'Processing...' : 'Save Profile Details'}
        </button>
      </form>
    </div>
  );
};

export default WorkerEditForm;