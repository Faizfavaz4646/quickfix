'use client';

import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { 
  Camera, Save, MapPin, User, Phone, Loader2, ArrowLeft, Briefcase 
} from "lucide-react";
import { uploadToCloudinary } from "../../../../../utils/uploadToCloudinary";
import { API_URL } from "@/lib/constants";

type ClientProfileForm = {
  name: string;
  phone: string;
  gender: string;
  state: string;
  district: string;
  city: string;
  zip: string;
  profilePic: string;
};

export default function ProfileForm() {
  const router = useRouter();
  const { user, token, updateUserProfile, hasHydrated } = useAuthStore(); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFetched = useRef(false);

  const [formData, setFormData] = useState<ClientProfileForm>({
    name: "",
    phone: "",
    gender: "",
    state: "",
    district: "",
    city: "",
    zip: "",
    profilePic: "",
  });

  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!hasHydrated) return;

    const authToken = token || (user as any)?.token;
    if (!authToken) {
      setFetching(false);
      return; 
    }

    if (hasFetched.current) {
        setFetching(false);
        return;
    }

    const fetchProfileData = async () => {
      try {
        setFetching(true);
        const { data } = await axios.get(`${API_URL}/client/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // ✅ FIX IS HERE: Check for nested 'profile' object
        // The backend returns { profile: { ...data } }
        const profileSource = data.profile || data; 

        if (profileSource) {
          // Update Form State with the correct source
          setFormData({
            name: profileSource.name || user?.name || "",
            phone: profileSource.phone || "",
            gender: profileSource.gender || "male",
            state: profileSource.state || "",
            district: profileSource.district || "",
            city: profileSource.city || "",
            zip: profileSource.zip || "",
            profilePic: profileSource.profilePic || "",
          });

          if (profileSource.profilePic) setPicPreview(profileSource.profilePic);
          
          // Update Store
          updateUserProfile(profileSource, profileSource.name);
          
          hasFetched.current = true;
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to existing user data from store
        if (user) {
           setFormData({
            name: user.name || "",
            phone: user.profile?.phone || "",
            gender: user.profile?.gender || "male",
            state: user.profile?.state || "",
            district: user.profile?.district || "",
            city: user.profile?.city || "",
            zip: user.profile?.zip || "",
            profilePic: user.profile?.profilePic || "",
          });
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProfileData();

  }, [hasHydrated, token]); 

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.[0]) return;
    const file = files[0];
    setPicPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, profilePic: url }));
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      setPicPreview(formData.profilePic || null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = token || (user as any)?.token;
    if (!authToken) return;

    setSaving(true);
    try {
      const { data } = await axios.patch(
        `${API_URL}/client/profile`,
        formData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Handle response structure (it returns { profile: ... })
      const updatedProfile = data.profile || data;
      
      updateUserProfile(updatedProfile, formData.name);
      
      toast.success("Profile updated successfully");
      router.back(); // Or router.push("/client/clientdashboard") based on preference
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!hasHydrated || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your identity and location details.</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          {/* Avatar */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200">
                  {picPreview ? (
                    <img src={picPreview} alt="Profile" className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? 'opacity-50' : 'opacity-100'}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={40} /></div>
                  )}
                </div>
                {uploading && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="animate-spin text-slate-600" size={20} /></div>}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 bg-white border border-slate-200 text-slate-700 p-2 rounded-full shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors">
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900">Profile Photo</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">Upload a clear image to help workers recognize you. <br/>JPG, PNG or GIF (Max 5MB).</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Personal Info */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2 mb-4">
                <Briefcase size={18} className="text-blue-600" />
                <h2>Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <div className="relative">
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2 mb-4">
                <MapPin size={18} className="text-blue-600" />
                <h2>Current Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                  <input name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Kerala" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">District</label>
                  <input name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Ernakulam" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kochi" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode</label>
                  <input name="zip" value={formData.zip} onChange={handleChange} placeholder="e.g. 682001" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">Discard</button>
            <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 active:scale-95">
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}