'use client';

import { useAuthStore } from "@/store/authStore";
import { Profile, Field } from "@/types/user"; 
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { uploadToCloudinary } from "../../../../../utils/uploadToCloudinary"

export default function ProfileForm() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();

  const [formData, setFormData] = useState<Profile>({
    phone: "",
    gender: "",
    state: "",
    district: "",
    city: "",
    zip: "",
    profilePic: "",
    requests: [],
    completedJobs: [],
    activeJobs: [],
    notifications: [],
    ratings: [],
    reviews: [],
  });

  const [name, setName] = useState(user?.name || "");
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      phone: user.profile?.phone || "",
      gender: user.profile?.gender || "",
      state: user.profile?.state || "",
      district: user.profile?.district || "",
      city: user.profile?.city || "",
      zip: user.profile?.zip || "",
      profilePic: user.profile?.profilePic || "",
      requests: user.profile?.requests || [],
      completedJobs: user.profile?.completedJobs || [],
      activeJobs: user.profile?.activeJobs || [],
      notifications: user.profile?.notifications || [],
      ratings: user.profile?.ratings || [],
      reviews: user.profile?.reviews || [],
    });

    setName(user.name);
    if (user.profile?.profilePic) {
      setPicPreview(user.profile.profilePic);
    }
  }, [user]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push("/auth/login");

    try {
      const payload = { 
        ...user,
        name,
        profile: { ...formData }
      };

      await axios.patch(`http://localhost:50001/users/${user.id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      updateUserProfile(payload.profile, payload.name);
      useAuthStore.setState({ user: payload });
      alert("Profile updated!");
      router.push("/client/clientdashboard");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const fields: Field<Profile>[] = [
    { label: "Mobile", name: "phone", type: "number" },
    {
      label: "Gender", name: "gender", type: "select",
      options: [
        { value: "", label: "--Select--" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ]
    },
    { label: "State", name: "state", type: "text" },
    { label: "District", name: "district", type: "text" },
    { label: "City", name: "city", type: "text" },
    { label: "Pincode", name: "zip", type: "text", maxLength: 6 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 mt-10">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/40">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white">
            {picPreview
              ? <img src={picPreview} alt="Profile" className="w-full h-full object-cover" />
              : <FaUserCircle className="text-gray-400" size={110} />}
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

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Other fields */}
          {fields.map((field) => (
            <div key={String(field.name)}>
              <label className="block text-gray-700 font-medium mb-2">{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={String(field.name)}
                  value={String(formData[field.name] ?? "")}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={String(field.name)}
                  value={String(formData[field.name] ?? "")}
                  onChange={handleChange}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              )}
            </div>
          ))}

          <div className="col-span-1 md:col-span-2">
            <button 
              type="submit" 
              disabled={uploading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:opacity-90 transition disabled:bg-gray-400"
            >
              {uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
