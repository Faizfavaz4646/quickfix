'use client'

import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

interface Profile {
  phone?: string;
  gender?: string;
  state?: string;
  district?: string;
  city?: string;
  zip?: string;
  profilePic?: string; // will store Cloudinary URL
}

interface ClientData extends Profile {
  name: string;
  email: string;
}

interface Field {
  label: string;
  name: keyof ClientData;
  type: string;
  options?: { value: string; label: string }[];
  maxLength?: number;
  placeholder?: string;
}

export default function ProfileForm() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();

  const [formData, setFormData] = useState<ClientData>({
    name: "",
    email: "",
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

  // Prefill form with current user
  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.profile?.phone || "",
      gender: user.profile?.gender || "",
      state: user.profile?.state || "",
      district: user.profile?.district || "",
      city: user.profile?.city || "",
      zip: user.profile?.zip || "",
      profilePic: user.profile?.profilePic || "",
    });
    if (user.profile?.profilePic) {
      setPicPreview(user.profile.profilePic);
    }
  }, [user]);

  // Upload to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "quickfix_uploads"); // ✅ set this in Cloudinary settings

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    return data.secure_url as string; // Cloudinary image URL
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "profilePic" && files?.[0]) {
      setPicPreview(URL.createObjectURL(files[0])); // temporary preview
      setUploading(true);
      try {
        const url = await uploadToCloudinary(files[0]);
        setFormData((prev) => ({ ...prev, profilePic: url }));
      } catch (err) {
        console.error(err);
        alert("Image upload failed");
      } finally {
        setUploading(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) return router.push("/auth/login");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        profile: { ...formData },
      };

      await axios.patch(
        `http://localhost:50001/users/${user.id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      updateUserProfile(payload.profile);
      alert("Profile updated!");
      router.push("/client/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  const fields: Field[] = [
    { label: "Full Name", name: "name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Mobile", name: "phone", type: "tel" },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      options: [
        { value: "", label: "--Select--" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    { label: "State", name: "state", type: "text" },
    { label: "District", name: "district", type: "text" },
    { label: "City", name: "city", type: "text" },
    { label: "Pincode", name: "zip", type: "text", maxLength: 6 },
  ];

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow mt-15">
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
          className="mt-3 text-sm cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">
          {uploading ? "Uploading..." : "Upload a clear photo (optional)"}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Client Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block font-medium mb-1">{field.label}</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
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
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
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
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition cursor-pointer disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
