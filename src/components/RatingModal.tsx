"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/lib/constants";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  workerId: string;
  workerName: string;
  workerImage: string;
  token: string;
  onSuccess: () => void; // To refresh the parent list
}

export default function RatingModal({
  isOpen,
  onClose,
  jobId,
  workerId,
  workerName,
  workerImage,
  token,
  onSuccess
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); // For star hover effect
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

 // src/components/RatingModal.tsx

const handleSubmit = async () => {
  // ... check rating > 0 ...

  setLoading(true);
  try {
    await axios.post(`${API_URL}/reviews`, {
      jobId,
      workerId,
      rating,
      comment
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Thanks for your feedback!");
    onSuccess(); 
    onClose();   
  } catch (error: any) {
    console.error("Review Error:", error);
    
    // ✅ READ THE SERVER MESSAGE
    // This will display: "You have already reviewed this job."
    const serverMessage = error.response?.data?.message || "Failed to submit review";
    toast.error(serverMessage);

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header with Worker Info */}
        <div className="bg-slate-50 p-6 flex flex-col items-center border-b border-slate-100 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
          
          <img 
            src={workerImage || "/images/avatar.avif"} 
            alt={workerName} 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mb-3"
          />
          <h2 className="text-xl font-bold text-slate-800">Job Completed!</h2>
          <p className="text-sm text-slate-500">How was your experience with <span className="font-bold text-slate-700">{workerName}</span>?</p>
        </div>

        {/* Star Rating Section */}
        <div className="p-6 flex flex-col items-center space-y-6">
          
          {/* Interactive Stars */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
              >
                <Star 
                  size={32} 
                  className={`${
                    star <= (hover || rating) 
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" 
                      : "text-slate-200"
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
          
          {/* Feedback Text Area */}
          <textarea
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none bg-slate-50"
            rows={3}
            placeholder="Write a review (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Review"}
          </button>
        </div>

      </div>
    </div>
  );
}