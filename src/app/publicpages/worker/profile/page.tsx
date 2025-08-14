'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

interface WorkerProfile {
  profession: string;
  phone: string;
  gender?: string; // added gender because you have it in form
  state: string;
  district: string;
  city: string;
  zip: string;
  schedule: string;
  profilePic: string; // Base64 image string
  termsAccepted: boolean;
}

interface Field {
  label: string;
  name: keyof WorkerProfile | 'gender';
  type: string;
  options?: { value: string; label: string }[];
  maxLength?: number;
  placeholder?: string;
}

export default function WorkerProfileForm() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();

  const [formData, setFormData] = useState<WorkerProfile>({
    profession: '',
    phone: '',
    gender: '', // initialize gender as empty string
    state: '',
    district: '',
    city: '',
    zip: '',
    schedule: '',
    profilePic: '',
    termsAccepted: false,
  });

  const [picPreview, setPicPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'worker') {
      alert('Only workers can access this page.');
      router.push('/dashboard');
      return; // Important to return here to prevent further execution
    }
    if (user.workerProfile) {
      setFormData({ ...formData, ...user.workerProfile });
      if (user.workerProfile.profilePic) {
        setPicPreview(user.workerProfile.profilePic);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  // Convert image file to Base64
  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, files, type, checked } = e.target as HTMLInputElement;

    if (name === 'profilePic' && files && files[0]) {
      const base64String = await convertToBase64(files[0]);
      setFormData((prev) => ({ ...prev, profilePic: base64String }));
      setPicPreview(base64String);
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert('No user ID found. Please log in again.');
      router.push('/auth/login');
      return;
    }

    if (!formData.termsAccepted) {
      alert('You must accept the terms & conditions to proceed.');
      return;
    }

    try {
      await axios.patch(
        `http://localhost:50001/users/${user.id}`,
        { workerProfile: formData },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      updateUserProfile(formData);
      alert('Profile updated successfully!');
      router.push('/worker/dashboard');
    } catch (error: any) {
      console.error('Error submitting profile:', error);
      alert(
        error?.response?.status === 404
          ? 'User not found on the server.'
          : 'Failed to update profile. Please try again.'
      );
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
      placeholder: 'e.g. Mon-Fri, 9am-5pm',
    },
  ];

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-6">
      {/* Profile Pic */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md border bg-blue-100 flex items-center justify-center">
          {picPreview ? (
            <img
              src={picPreview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
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
        />
        <p className="text-xs text-gray-500 mt-1">Upload a clear photo (optional)</p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Worker Profile</h2>

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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Submit Profile
        </button>
      </form>
    </div>
  );
}
