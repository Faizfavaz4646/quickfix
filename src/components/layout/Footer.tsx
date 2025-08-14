// components/Footer.tsx

import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
 
} from "lucide-react";
import { FaTools} from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo + About */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaTools className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-yellow-400">QuickFix</h2>
          </div>
          <p className="text-sm text-gray-300">
            Your go-to platform to find reliable local workers like electricians, plumbers, and more.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/professionals" className="hover:underline">Find a Professional</a></li>
            <li><a href="/join" className="hover:underline">Join as Worker</a></li>
            <li><a href="/about" className="hover:underline">About Us</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p className="text-sm text-gray-300">📧 support@quickfix.com</p>
          <p className="text-sm text-gray-300">📞 +91 7034514646</p>
          <p className="text-sm text-gray-300">📍 Calicut, India</p>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" target="_blank" className="hover:text-blue-500">
              <Facebook size={24} />
            </a>
            <a href="#" target="_blank" className="hover:text-blue-400">
              <Twitter size={24} />
            </a>
            <a href="#" target="_blank" className="hover:text-pink-500">
              <Instagram size={24} />
            </a>
            <a href="#" target="_blank" className="hover:text-blue-600">
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-sm text-gray-500 border-t border-gray-700 py-4">
        &copy; {new Date().getFullYear()} QuickFix. All rights reserved.
      </div>
    </footer>
  );
}
