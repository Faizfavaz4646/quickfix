export default function WorkerReview() {
  return (
    <div className="border border-gray-200 w-full shadow-md rounded-md p-4 mt-4 hover:shadow-xl transition">
      <h3 className="font-semibold mb-2">Worker Reviews</h3>

      {/* Example review */}
      <div className="space-y-3">
        <div className="border-b-gray-500 pb-2">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-xs text-gray-500">"Great worker, completed the job on time!"</p>
          <div className="flex mt-1 text-yellow-500 text-sm">
            ⭐⭐⭐⭐☆
          </div>
        </div>

        <div className="border-b pb-2">
          <p className="text-sm font-medium">Ayesha Khan</p>
          <p className="text-xs text-gray-500">"Very professional and polite."</p>
          <div className="flex mt-1 text-yellow-500 text-sm">
            ⭐⭐⭐⭐⭐
          </div>
        </div>
      </div>

      {/* Load more */}
      <button className="mt-3 text-blue-600 text-sm hover:underline">
        View All Reviews
      </button>
    </div>
  );
}
