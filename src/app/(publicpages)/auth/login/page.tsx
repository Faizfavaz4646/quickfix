"use client";

import { toast } from "sonner";
import { useFormik } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "../../../../lib/constants";
import { FaTools } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

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

        const { user, token } = res.data;

        setUser({
          _id: user._id,
          name: user.name,
          email: user.emailId,
          role: user.role,
          token,
          status: user.status,
          profile: user.profile || {}, 
        });

        toast.success("Login successful");

        // Redirect by role
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "worker") {
          router.push("/worker/edit");
        } else {
          router.push("/");
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setErrors({ password: "Invalid email or password" });
        } else if (err.response?.status === 403) {
          toast.error("Your account is blocked. Contact admin.");
        } else {
          console.error(err);
          
          toast.error("Login failed. Try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h1 className="flex gap-2 justify-center text-2xl font-bold mb-4">
          <FaTools className="text-blue-600 mt-1" /> QuickFix
        </h1>

        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={formik.handleChange}
          value={formik.values.email}
          className="w-full p-2 mb-3 border rounded"
        />
        {formik.errors.email && (
          <p className="text-red-500 text-sm">{formik.errors.email}</p>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={formik.handleChange}
          value={formik.values.password}
          className="w-full p-2 mb-3 border rounded"
        />
        {formik.errors.password && (
          <p className="text-red-500 text-sm">{formik.errors.password}</p>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600"
        >
          {formik.isSubmitting ? "Logging in..." : "Login"}
        </button>

        <Link href="/auth/signup" className="text-blue-600 flex justify-end mt-3">
          Signup
        </Link>
      </form>
    </div>
  );
}
