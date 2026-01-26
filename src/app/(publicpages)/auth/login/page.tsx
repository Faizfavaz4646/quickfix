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
  const login = useAuthStore((state) => state.login);

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

        const { token } = res.data; 
        const decodedUser = parseJwt(token);
        
        if (!decodedUser) {
            toast.error("Invalid token received");
            return;
        }

        // --- STEP 1: INITIALIZE DATA ---
        let finalProfileData = {};

        // --- STEP 2: FETCH PROFILE DATA IMMEDIATELY ---
        // We do this before calling 'login' so the store gets the ProfilePic right away
        if (decodedUser.role === "worker") {
          try {
            const workerProfile = await getMyWorkerProfile(token);
            if (workerProfile) {
              finalProfileData = workerProfile;
            }
          } catch (profileErr) {
            console.error("Could not fetch worker profile during login", profileErr);
          }
        }

        // --- STEP 3: UPDATE GLOBAL STATE ---
        const userPayload = {
          _id: decodedUser._id,
          name: decodedUser.name,
          email: decodedUser.emailId, 
          role: decodedUser.role,
          status: "active",
          profile: finalProfileData, // ✅ Now includes profilePic and profession
        };

        login(userPayload as any, token);

        toast.success(`Welcome back, ${decodedUser.name}!`);

        // --- STEP 4: HANDLE REDIRECTION ---
        if (decodedUser.role === "admin") {
          router.push("/admin");
        } 
        else if (decodedUser.role === "worker") {
          // Use the data we just fetched to decide where to go
          if ((finalProfileData as any)?.profession) {
            router.push("/worker/dashboard");
          } else {
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
        className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-3 shadow-lg shadow-blue-200">
            <FaTools className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">QuickFix</h1>
          <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Worker Portal</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="worker@quickfix.com"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-slate-900 text-white w-full p-4 rounded-2xl font-black mt-10 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:bg-slate-200 disabled:text-slate-400"
        >
          {formik.isSubmitting ? "Authenticating..." : "Sign In"}
        </button>

        <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-slate-50 text-sm">
          <p className="text-slate-400 font-medium">
            Don't have an account? {" "}
            <Link href="/auth/signup" className="text-blue-600 font-black hover:underline underline-offset-4">
              Join the Crew
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}