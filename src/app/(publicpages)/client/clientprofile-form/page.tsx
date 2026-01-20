'use client';

import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { uploadToCloudinary } from "../../../../../utils/uploadToCloudinary";
import { API_URL } from "@/lib/constants";

/* ONLY editable profile fields */
type ClientProfileForm = {
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
  const { user, updateUserProfile } = useAuthStore();

  const [formData, setFormData] = useState<ClientProfileForm>({
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

  /* Populate form from server data */
  useEffect(() => {
    if (!user?.profile) return;

    setFormData({
      phone: user.profile.phone || "",
      gender: user.profile.gender || "",
      state: user.profile.state || "",
      district: user.profile.district || "",
      city: user.profile.city || "",
      zip: user.profile.zip || "",
      profilePic: user.profile.profilePic || "",
    });

    if (user.profile.profilePic) {
      setPicPreview(user.profile.profilePic);
    }
  }, [user]);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "profilePic" && files?.[0]) {
      setPicPreview(URL.createObjectURL(files[0]));
      setUploading(true);
      try {
        const url = await uploadToCloudinary(files[0]);
        setFormData((prev) => ({ ...prev, profilePic: url }));
      } finally {
        setUploading(false);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.token) {
      router.push("/auth/login");
      return;
    }

    try {
      const { data } = await axios.patch(
        `${API_URL}/client/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      /* Server response is source of truth */
      updateUserProfile(data.profile);

      alert("Profile updated successfully");
      router.push("/client/clientdashboard");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 mt-10">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/40">

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white">
            {picPreview ? (
              <img
                src={picPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-gray-400" size={110} />
            )}
          </div>

          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleChange}
            className="mt-3 text-sm cursor-pointer"
          />

          <p className="text-xs text-gray-600 mt-1">
            {uploading ? "Uploading..." : "Upload a profile picture"}
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Edit Profile
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Phone */}
          <div>
            <label className="block mb-2 font-medium">Mobile</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-2 font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg"
            >
              <option value="">-- Select --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Location */}
          {["state", "district", "city", "zip"].map((field) => (
            <div key={field}>
              <label className="block mb-2 font-medium">
                {field.toUpperCase()}
              </label>
              <input
                name={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>
          ))}

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
            >
              {uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
