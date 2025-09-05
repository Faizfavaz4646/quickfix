import { MdDashboard } from "react-icons/md";
import { FaBriefcase, FaListAlt, FaBell, FaWallet, FaCog, FaHome } from "react-icons/fa";
import Image from "next/image";

const menu = [
  { key: "dashboard", label: "Dashboard", icon: <MdDashboard className="text-xl" /> },
  { key: "jobs", label: "Jobs", icon: <FaBriefcase className="text-lg" /> },
  { key: "requests", label: "Requests", icon: <FaListAlt className="text-lg" /> },
  { key: "notifications", label: "Notifications", icon: <FaBell className="text-lg" /> },
  { key: "payments", label: "Payments", icon: <FaWallet className="text-lg" /> },
  { key: "settings", label: "Settings", icon: <FaCog className="text-lg" /> },
];

export default function Sidebar() {
  return (
<aside className="fixed top-6 left-6 w-20 md:w-64 bg-white rounded-2xl p-6 shadow-lg h-[700px] -ml-3 z-30 mt-15">
      <div className="flex flex-col h-full justify-between">
        {/* Logo */}
        <div>
          <h1 className="hidden md:block text-4xl font-bold text-sky-600 mb-8 mx-20"><FaHome /></h1>
          <nav className="flex flex-col gap-4">
            {menu.map((item) => (
              <button
                key={item.key}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                {item.icon}
                <span className="hidden md:block">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Help Section */}
        <div className="hidden md:flex flex-col items-center text-sm text-gray-500">
          {/* Small Image */}
          <Image
            src="/images/folderimage.jpg"
            alt="Help Icon"
            width={90}
            height={90}
            className="mb-3 w-40"
          />
          <p className="font-medium">Need help?</p>
          <p>Please check our docs.</p>
        </div>
      </div>
    </aside>
  );
}
