"use client";
import { useState } from "react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

export default function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Rate Job</h2>
        <div className="flex space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`cursor-pointer text-2xl ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => setRating(s)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your feedback..."
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button
            onClick={() => { onSubmit(rating, review); onClose(); }}
            className="px-3 py-1 rounded bg-blue-500 text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
