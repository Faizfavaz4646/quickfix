interface RequestDialogProps {
  onClose: () => void; // function with no args, returns nothing
}
export default function RequestDialog({ onClose }:RequestDialogProps) {
  return (
    <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-72 z-20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Request Service</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✖</button>
      </div>
      <form className="flex flex-col gap-2">
        <input type="text" placeholder="Your Name" className="border rounded-md px-2 py-1 text-sm" />
        <input type="text" placeholder="Phone Number" className="border rounded-md px-2 py-1 text-sm" />
        <textarea placeholder="Describe your request..." rows={2} className="border rounded-md px-2 py-1 text-sm" />
        <button type="submit" className="bg-yellow-400 text-white py-1.5 rounded-md text-sm">Submit</button>
      </form>
    </div>
  );
}
