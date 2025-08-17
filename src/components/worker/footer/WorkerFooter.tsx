"use client";

import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaTools } from "react-icons/fa";

export default function WorkerFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Section */}
        <div>
        
        <h3 className="text-lg font-semibold text-white mb-3 flex gap-2"> <span><FaTools className="text-yellow-400 text-xl mt-1" /></span>QuickFix Workers</h3>
         
          <p className="text-sm">
            A dedicated platform for workers to manage profiles, showcase skills, 
            and connect with customers directly.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/publicpages/worker/dashboard" className="hover:text-white">Dashboard</a></li>
            <li><a href="/publicpages/worker/edit" className="hover:text-white">Edit Profile</a></li>
            <li><a href="/worker/orders" className="hover:text-white">My Jobs</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-500"><FaFacebook size={20} /></a>
            <a href="#" className="text-blue-400"><FaTwitter size={20} /></a>
            <a href="#" className="text-pink-500"><FaInstagram size={20} /></a>
            <a href="#" className="text-blue-600"><FaLinkedin size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-500 text-sm mt-6 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} QuickFix Workers. All rights reserved.
      </div>
    </footer>
  );
}
