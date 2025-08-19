'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { X, Plus, Camera, UserCircle } from 'lucide-react';

interface Worker {
  id: number;
  userId: number;
  profilePic?: string;
  profession?: string;
  phone?: string;
  state?: string;
  district?: string;
  city?: string;
  zip?: string;
  schedule?: string;
  previousWorks?: string[];
}

const WorkerEditForm: React.FC = () => {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  const [worker, setWorker] = useState<Worker | null>(null);

  const [form, setForm] = useState<Omit<Worker, 'id' | 'userId'>>({
    profilePic: '',
    profession: '',
    phone: '',
    state: '',
    district: '',
    city: '',
    zip: '',
    schedule: '',
    previousWorks: [],
  });

  const [uploading, setUploading] = useState(false);

  // Fetch worker profile
  useEffect(() => {
    if (!user?.id) return;

    const fetchWorker = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:50001/workers?userId=${user.id}`
        );
        if (data.length > 0) {
          const existingWorker = data[0];
          setWorker(existingWorker);
          const { id, userId, ...rest } = existingWorker;
          setForm(rest);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch profile');
      }
    };

    fetchWorker();
  }, [user?.id]);

  // Upload file to Cloudinary via API
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');

      return data.url;
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle profile pic change
  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    if (url) setForm(prev => ({ ...prev, profilePic: url }));
  };

  // Handle multiple previous works upload
  const handleMultipleFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const urls = (
      await Promise.all(Array.from(files).map(file => uploadToCloudinary(file)))
    ).filter((url): url is string => !!url);

    setForm(prev => ({
      ...prev,
      previousWorks: [...(prev.previousWorks || []), ...urls],
    }));
  };

  const handleRemoveWork = (index: number) => {
    setForm(prev => ({
      ...prev,
      previousWorks: prev.previousWorks?.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You are not logged in');
      return router.push('/auth/login');
    }

    try {
      let response;
      if (worker) {
        response = await axios.patch(
          `http://localhost:50001/workers/${worker.id}`,
          { ...form, userId: user.id }
        );
      } else {
        response = await axios.post(`http://localhost:50001/workers`, {
          id: user.id,
          userId: user.id,
          ...form,
        });
      }

      setWorker(response.data);
      updateUserProfile(form);
      toast.success('Profile saved successfully!');
      router.push('/worker/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow relative">
      {/* Profile Pic */}
      <div className="absolute -top-12 right-6">
        <div className="relative w-24 h-24 mt-12">
          {form.profilePic ? (
            <img
              src={form.profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <UserCircle className="w-24 h-24 text-gray-400" />
          )}
          <label
            htmlFor="profilePicUpload"
            className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-100"
          >
            <Camera size={16} />
            <input
              id="profilePicUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </label>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Edit Your Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mt-10">
        {/* Profession */}
        <div>
          <label className="block text-sm font-medium">Profession</label>
          <select
            name="profession"
            value={form.profession}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select profession</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Painter">Painter</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Carpenter">Carpenter</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Zip</label>
            <input
              type="text"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">District</label>
            <input
              type="text"
              name="district"
              value={form.district}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium">Schedule</label>
          <input
            type="text"
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Previous Works */}
        <div>
          <label className="block text-sm font-medium mb-2">Previous Works</label>
          <div className="flex items-center gap-2">
            <label
              htmlFor="fileUpload"
              className="flex items-center justify-center w-12 h-12 border rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <Plus size={24} />
              <input
                id="fileUpload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleMultipleFiles}
              />
            </label>
          </div>

          {/* Image Previews */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {form.previousWorks?.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`work-${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveWork(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-green-600 text-white py-2 rounded-lg cursor-pointer disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default WorkerEditForm;
