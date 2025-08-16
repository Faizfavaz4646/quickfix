'use client'
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

// Profile interface
interface Profile {
  phone?: string;
  gender?: string;
  state?: string;
  district?: string;
  city?: string;
  zip?: string;
  profilePic?: string;
}

// Client form data (extends profile + auth fields)
interface ClientData extends Profile {
  name: string;
  email: string;
 
}

// Field definition for form builder
interface Field {
  label: string;
  name: keyof ClientData | "gender";
  type: string;
  options?: { value: string; label: string }[];
  maxLength?: number;
  placeholder?: string;
}

export default function ProfileForm() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  
  // Local form state
  const [formData, setFormData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    state: '',
    district: '',
    city: '',
    zip: '',
    profilePic: '',
  });

  const [picPreview, setPicPreview] = useState<string | null>(null);

  // Load data into form
  useEffect(() => {
    if (user?.role !== 'client') {
      alert('Only clients can access this page');
      router.push('/publicpages/client/dashboard');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        gender: user.profile?.gender || '',
        state: user.profile?.state || '',
        district: user.profile?.district || '',
        city: user.profile?.city || '',
        zip: user.profile?.zip || '',
        profilePic: user.profile?.profilePic || '',
      });

      if (user.profile?.profilePic) {
        setPicPreview(user.profile.profilePic);
      }
    }
  }, [user, router]);

  // Convert image to Base64
  const convertToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Handle input changes
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'profilePic' && files && files[0]) {
      const base64String = await convertToBase64(files[0]);
      setFormData((prev) => ({ ...prev, profilePic: base64String }));
      setPicPreview(base64String);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert('No user ID found. Please log in again.');
      router.push('/publicpages/auth/login');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        
        Profile: {
          phone: formData.phone,
          gender: formData.gender,
          state: formData.state,
          district: formData.district,
          city: formData.city,
          zip: formData.zip,
          profilePic: formData.profilePic,
        },
      };

      // Update JSON server
      await axios.patch(
        `http://localhost:50001/users/${user.id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Update zustand store
      updateUserProfile(payload.Profile);
      alert('Profile updated successfully!');
      router.push('/publicpages/client/dashboard');
    } catch (error: any) {
      console.error('Error submitting profile:', error);
      alert(
        error?.response?.status === 404
          ? 'User not found on the server.'
          : 'Failed to update profile. Please try again.'
      );
    }
  };

  // Fields list
  const fields: Field[] = [
    { label: 'Full Name', name: 'name', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Mobile', name: 'phone', type: 'tel' },
    {
      label: 'Gender',
      name: 'gender',
      type: 'select',
      options: [
        { value: '', label: '--Select Gender--' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ],
    },
    { label: 'State', name: 'state', type: 'text' },
    { label: 'District', name: 'district', type: 'text' },
    { label: 'City', name: 'city', type: 'text' },
    { label: 'Pincode', name: 'zip', type: 'text', maxLength: 6 },
  ];

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow mt-15">
      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md border bg-blue-100 flex items-center justify-center">
          {picPreview ? (
            <img src={picPreview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <FaUserCircle className="text-blue-500" size={120} />
          )}
        </div>
        <input
          type="file"
          name="profilePic"
          accept="image/*"
          onChange={handleChange}
          className="mt-3 text-sm cursor-pointer "
        />
        <p className="text-xs text-gray-500 mt-1">Upload a clear photo (optional)</p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Client Profile</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block font-medium mb-1">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={(formData as any)[field.name] || ''}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={(formData as any)[field.name] || ''}
                onChange={handleChange}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
