'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash, FaTools } from 'react-icons/fa';
import { API_URL } from '../../../../lib/constants';

const SignupPage = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const [role, setRole] = useState<'client' | 'worker'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    // inside onSubmit
onSubmit: async (values, { setSubmitting }) => {
  try {
    const email = values.email.toLowerCase();

    // Check if email exists
    const existing = await axios.get(`${API_URL}/users?email=${email}`);
    if (existing.data.length > 0) {
      toast.info('Email already registered');
      return;
    }

    // Build payload
    const payload: any = {
      name: values.name,
      email,
      password: values.password,
      role
    };

    // Only add Profile for clients
    if (role === "client") {
      payload.Profile = {
        phone: "",
        gender: "",
        state: "",
        district: "",
        city: "",
        zip: "",
        profilePic: ""
      };
    }

    // Create user
    const response = await axios.post(`${API_URL}/users`, payload);
    const newUser = response.data;

    // Auto-login after signup
    setUser({
      id: newUser.id ?? newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: newUser.token
    });

    toast.success('Account created and logged in');

    // Redirect based on role
    if (role === 'worker') {
      router.push('/publicpages/worker/profile');
    } else {
      router.push('/publicpages/auth/login');
    }

  } catch (err) {
    toast.error('Signup failed');
  } finally {
    setSubmitting(false);
  }
}

  });

 




  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg">
         <h1 className='flex gap-2 justify-center text-3xl font-bold mb-4'> <FaTools className="text-blue-600 mt-1" />
                        QuickFix</h1>
               
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        {/* Role Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {['client', 'worker'].map((r) => (
            <button
              key={r}
              type="button"
              className={`px-4 py-2 rounded-lg border ${
                role === r ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
              onClick={() => setRole(r as 'client' | 'worker')}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Signup Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border rounded px-3 py-2"
              onChange={formik.handleChange}
              value={formik.values.name}
              disabled={formik.isSubmitting}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded px-3 py-2"
              onChange={formik.handleChange}
              value={formik.values.email}
              disabled={formik.isSubmitting}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="w-full border rounded px-3 py-2 pr-10"
              onChange={formik.handleChange}
              value={formik.values.password}
              disabled={formik.isSubmitting}
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className="w-full border rounded px-3 py-2 pr-10"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              disabled={formik.isSubmitting}
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-red-500 text-sm">{formik.errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {formik.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Signing up...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
