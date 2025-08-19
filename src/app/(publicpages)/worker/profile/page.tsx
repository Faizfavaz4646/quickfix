'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

interface Profile {
  profession?: string;
  phone: string;
  gender?: string;
  state: string;
  district: string;
  city?: string;
  zip?: string;
  schedule?: string;
  profilePic?: string; // Cloudinary URL
  termsAccepted: boolean;
}

interface Field {
  label: string;
  name: keyof Profile | 'gender';
  type: string;
  options?: { value: string; label: string }[];
  maxLength?: number;
  placeholder?: string;
}

export default function ProfileForm() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();

  const [formData, setFormData] = useState<Profile>({
    profession: '',
    phone: '',
    gender: '',
    state: '',
    district: '',
    city: '',
    zip: '',
    schedule: '',
    profilePic: '',
    termsAccepted: false,
  });

  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Redirect if user not logged in or role mismatch
  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'worker') router.push('/worker/dashboard');

    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get(
          `http://localhost:50001/workers?userId=${user.id}`
        );
        if (data.length > 0) {
          setFormData(data[0]);
          setPicPreview(data[0].profilePic || null);
        }
      } catch (err) {
        console.error('Fetch worker failed:', err);
      }
    };

    fetchProfile();
  }, [user, router]);

  // Handle input changes including image upload via server API
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (name === 'profilePic' && files?.[0]) {
      try {
        setUploading(true);

        const fileData = new FormData();
        fileData.append('file', files[0]);

        const res = await fetch('/api/upload', { method: 'POST', body: fileData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setFormData(prev => ({ ...prev, profilePic: data.url }));
        setPicPreview(data.url);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Image upload failed. Try again.');
      } finally {
        setUploading(false);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return router.push('/auth/login');
    if (!formData.termsAccepted) return alert('Please accept terms & conditions.');

    try {
      const workerData = { userId: user.id, ...formData };

      const { data: existing } = await axios.get(
        `http://localhost:50001/workers?userId=${user.id}`
      );

      if (existing.length > 0) {
        await axios.put(`http://localhost:50001/workers/${existing[0].id}`, workerData);
      } else {
        await axios.post('http://localhost:50001/workers', workerData);
      }

      updateUserProfile(workerData); // Update Zustand store
      alert('Profile saved!');
      router.push('/worker/dashboard');
    } catch (err) {
      console.error('Save profile failed:', err);
      alert('Failed to save profile.');
    }
  };

  const fields: Field[] = [
    { label: 'Profession', name: 'profession', type: 'text' },
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
    {
      label: 'Work Schedule',
      name: 'schedule',
      type: 'text',
      placeholder: 'Mon-Fri, 9am-5pm',
    },
  ];

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-6">
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
          className="mt-3 text-sm"
          disabled={uploading}
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
        <p className="text-xs text-gray-500 mt-1">Upload a clear photo (optional)</p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Worker Profile</h2>

      {/* Form Fields */}
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
                required
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
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
          </div>
        ))}

        {/* Terms & Conditions */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            className="w-4 h-4"
            required
          />
          <label htmlFor="termsAccepted" className="text-sm text-gray-700 cursor-pointer">
            I accept the{' '}
            <span className="text-blue-600 cursor-pointer">Terms & Conditions</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? 'Uploading Image...' : 'Submit Profile'}
        </button>
      </form>
    </div>
  );
}
