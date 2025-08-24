'use client';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "../../../../lib/constants";
import { FaTools } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Fetch user by email
        const res = await axios.get(`${API_URL}/users?email=${values.email}`);
        if (res.data.length === 0) {
          setErrors({ email: 'Email not found' });
          return;
        }

        const user = res.data[0];

        // Password check
        if (user.password !== values.password) {
          setErrors({ password: 'Incorrect password' });
          return;
        }

        // ✅ Fetch full user with profile (to avoid empty fields later)
        const fullUserRes = await axios.get(`${API_URL}/users/${user.id}`);
        const fullUser = fullUserRes.data;

        // Save user in store (includes profile)
        setUser(fullUser);

        toast.success('Login successful');

        // Redirect based on role
        if (fullUser.role === 'worker') {
          const isProfileComplete =
            fullUser.profile &&
            fullUser.profile.profession &&
            fullUser.profile.phone;

          if (isProfileComplete) {
            router.push('/worker/dashboard');
          } else {
            router.push('/worker/profile');
          }
        } else {
          router.push('/'); // client homepage
        }

      } catch (error) {
        console.error(error);
        alert('Something went wrong');
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
        <h1 className='flex gap-2 justify-center text-2xl font-bold mb-4'>
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
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          {formik.isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <Link className='text-blue-600 flex justify-end mt-3' href="/auth/signup">
          Signup
        </Link>
      </form>
    </div>
  );
}
