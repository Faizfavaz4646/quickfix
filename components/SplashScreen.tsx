'use client'
import { FaTools } from 'react-icons/fa';

export default function SplashScreen(){
  
    return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2">
                    <div> <FaTools /></div>
                    <span className="text-xl font-extrabold text-gray-800">QuickFix</span>
                </div>
                 <div className="loader mx-auto"></div>
                {/* <div className="mt-4 w-40 h-1 bg-gray-200 rounded overflow-hidden">
                 <div className="h-full bg-purple-600 animate-pulse w-1/3"></div>
                </div> */}

            </div>

        </div>

    )
}