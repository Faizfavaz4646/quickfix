"use client";

import { toast } from "sonner";
import { useFormik } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/lib/constants"; 
import { FaTools } from "react-icons/fa";
import Link from "next/link";
import { getMyWorkerProfile } from "@/services/workerService";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  // ✅ HELPER: Extract data directly from the token
  // This bypasses the broken 'user' object from the backend response
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const res = await axios.post(`${API_URL}/auth/login`, {
          emailId: values.email.toLowerCase(),
          password: values.password,
        });

        const { token } = res.data; // We only really need the token!
        
        // 1. DECODE THE TOKEN
        const decodedUser = parseJwt(token);
        
        if (!decodedUser) {
            toast.error("Invalid token received");
            return;
        }

        console.log("Decoded Token Data:", decodedUser);

        // 2. Set user in Global Store using TOKEN DATA
        // The token has: _id, emailId, name, role
        setUser({
          _id: decodedUser._id,           // Guaranteed to exist
          name: decodedUser.name,
          email: decodedUser.emailId,     // Guaranteed to exist
          role: decodedUser.role,
          token: token,
          status: "active",               // Default to active
          profile: {},                    // Profile will be fetched separately
        });

        toast.success(`Welcome back, ${decodedUser.name}!`);

        // 3. Handle Redirections
        if (decodedUser.role === "admin") {
          router.push("/admin");
        } 
        else if (decodedUser.role === "worker") {
          try {
            const workerProfile = await getMyWorkerProfile(token);
            if (workerProfile && workerProfile.profession) {
              router.push("/worker/dashboard");
            } else {
              router.push("/worker/profile");
            }
          } catch (profileErr) {
            router.push("/worker/profile");
          }
        } 
        else {
          router.push("/");
        }
      } catch (err: any) {
        console.error("Login Error:", err);
        if (err.response?.status === 401) {
          setErrors({ password: "Invalid email or password" });
        } else if (err.response?.status === 403) {
          toast.error("Your account is blocked. Contact admin.");
        } else {
          toast.error(err.response?.data?.message || "Login failed. Try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-3 shadow-lg shadow-blue-100">
            <FaTools className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">QuickFix</h1>
          <p className="text-slate-500 text-sm font-medium">Log in to manage your services</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="worker@quickfix.com"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-blue-600 text-white w-full p-4 rounded-xl font-bold mt-8 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
        >
          {formik.isSubmitting ? "Verifying..." : "Sign In"}
        </button>

        <div className="flex items-center justify-between mt-6 text-sm">
          <span className="text-slate-500">Don't have an account?</span>
          <Link href="/auth/signup" className="text-blue-600 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}