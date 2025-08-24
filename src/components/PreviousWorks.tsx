interface PreviousWorksProps {
  images: string[];                        // array of image URLs
  selected: string | null;                 // currently selected image
  setSelected: (img: string | null) => void;
  showAll: boolean;
  setShowAll: (value: boolean) => void;
}

export default function PreviousWorks({
  images,
  selected,
  setSelected,
  showAll,
  setShowAll,
}: PreviousWorksProps) {
  const display = showAll ? images : images.slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold text-blue-600 underline mb-4">Previous Works</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {display.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={() => setSelected(img)}
            className="w-full h-32 object-cover shadow-xl border rounded"
          />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <img src={selected} className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg" />
        </div>
      )}

      {images.length > 4 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-blue-400 text-white rounded-md px-3 py-1 font-medium"
          >
            {showAll ? "Show Less" : "View More"}
          </button>
        </div>
      )}
    </div>
  );
}
