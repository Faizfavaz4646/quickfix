'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { X, Plus, Camera, UserCircle, RotateCcw } from 'lucide-react';
import { Profile } from '@/types/user';
import { createWorker, updateWorker } from '@/services/workerHelperApi';
import { uploadToCloudinary } from '../../../utils/uploadToCloudinary';
import { getWorkerProfile } from '@/services/workerService';

const WorkerEditForm = () => {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();

  const [form, setForm] = useState<Profile>({
    profilePic: '',
    profession: '',
    phone: '',
    state: '',
    district: '',
    city: '',
    zip: '',
    schedule: '',
    previousWorkImages: [],
  });

  const [uploading, setUploading] = useState(false);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✅ Fetch worker profile from backend if exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const workerProfile = await getWorkerProfile(user.id.toString());
        if (workerProfile) {
          setForm({
            ...workerProfile,
            previousWorkImages: workerProfile.previousWorkImages || [],
          });
        }
      } catch (err) {
        console.error('Failed to load worker profile', err);
      }
    };

    loadProfile();
  }, [user]);

  /** ---------- File Upload ---------- */
  const handleFileUpload = async (file: File, key: keyof Profile) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setForm((prev) => ({
          ...prev,
          [key]:
            key === 'previousWorkImages'
              ? [...(prev.previousWorkImages || []), url]
              : url,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Cloudinary upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'profilePic');
  };

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const urls = (
        await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file)))
      ).filter(Boolean) as string[];

      setForm((prev) => ({
        ...prev,
        previousWorkImages: [...(prev.previousWorkImages || []), ...urls],
      }));
    } catch (err) {
      console.error(err);
      toast.error('Cloudinary upload failed');
    } finally {
      setUploading(false);
    }
  };

  /** ---------- Remove with Undo ---------- */
  const handleRemoveWork = (index: number) => {
    setForm((prev) => {
      const removed = prev.previousWorkImages?.[index];
      if (!removed) return prev;
      setRemovedImages((old) => [...old, removed]);
      return {
        ...prev,
        previousWorkImages: prev.previousWorkImages?.filter((_, i) => i !== index),
      };
    });
  };

  const handleUndoRemove = () => {
    if (removedImages.length === 0) return;
    const lastRemoved = removedImages[removedImages.length - 1];
    setForm((prev) => ({
      ...prev,
      previousWorkImages: [...(prev.previousWorkImages || []), lastRemoved],
    }));
    setRemovedImages((prev) => prev.slice(0, -1));
  };

  /** ---------- Input Change ---------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You are not logged in');
      return router.push('/auth/login');
    }

    try {
      const response = form.id
        ? await updateWorker(form, form.id, user.id)
        : await createWorker(form, user.id);

      updateUserProfile(response.data); // update global profile
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
            <option value="Carpenter">HVAC Technician</option>
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
          {['zip', 'state', 'district', 'city'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />
            </div>
          ))}
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

            {removedImages.length > 0 && (
              <button
                type="button"
                onClick={handleUndoRemove}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <RotateCcw size={16} /> Undo Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            {form.previousWorkImages?.map((imgUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imgUrl}
                  alt={`work-${index}`}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedImage(imgUrl)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveWork(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
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

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Full Size"
              className="max-h-[90vh] max-w-[90vw] rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerEditForm;
