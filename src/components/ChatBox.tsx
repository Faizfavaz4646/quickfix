"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaVideo, FaTimes, FaPaperPlane } from "react-icons/fa";

interface ChatBoxProps {
  worker: { name: string; profilePic: string };
  onClose: () => void;
}

export default function ChatBox({ worker, onClose }: ChatBoxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (overlayRef.current && e.target === overlayRef.current) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 z-40 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Chat Window */}
        <motion.div
          drag
          dragMomentum={false} // prevent it from sliding after release
          dragElastic={0.1} // little resistance
          dragConstraints={overlayRef} // stays inside overlay
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white w-[350px] h-[500px] rounded-2xl shadow-lg flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <img
                src={worker.profilePic}
                alt={worker.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-black">{worker.name}</span>
            </div>
            <div className="flex items-center gap-4 text-black">
              <FaPhone className="cursor-pointer" />
              <FaVideo className="cursor-pointer" />
              <FaTimes
                onClick={onClose}
                className="cursor-pointer text-red-500"
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-gray-50 p-3 overflow-y-auto text-sm">
            <div className="bg-gray-200 p-2 rounded-lg w-fit mb-2">Hello 👋</div>
            <div className="bg-yellow-200 p-2 rounded-lg w-fit ml-auto mb-2">
              Hi, I need your service!
            </div>
          </div>

          {/* Input Area */}
          <div className="flex items-center p-3 border-t border-gray-200 bg-white">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-full text-sm outline-none"
            />
            <button type="submit" className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600 mx-1">
  <FaPaperPlane size={18} />
</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
