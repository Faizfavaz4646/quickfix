'use client';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "../../../../lib/constants"
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
        const res = await axios.get(
          `${API_URL}/users?email=${values.email}&password=${values.password}`
        );

        if (res.data.length > 0) {
          const user = res.data[0];

          // Save user in Zustand store (it will persist if configured)
          setUser({
            id:user.id?? user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          });

          // Redirect based on role
          if (user.role === 'worker') {
            toast.success("login successfull. please fill the form")
            router.push('/publicpages/worker/profile');
          } else {
            toast.success("login successfull")
            router.push('/');
          }
        } else {
          setErrors({ email: 'Invalid email or password' });
        }
      } catch (error) {
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
        <h1 className='flex gap-2 justify-center text-2xl font-bold mb-4'> <FaTools className="text-blue-600 mt-1" />
                QuickFix</h1>
       
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

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          {formik.isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <Link className='text-blue-600 flex justify-end mt-3' href="/publicpages/auth/signup">signup</Link>
      </form>
      
    </div>
  );
}
