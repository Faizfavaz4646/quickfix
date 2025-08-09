import Image from "next/image";

export default function FindWorker() {


  



  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/cleaning.jpg"
        alt="Worker background"
        layout="fill"
        objectFit="cover"
        className="opacity-70"
        priority
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        {/* Headings */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg">
           <span className="text-blue-400">Find</span> Trusted Service <span  className="text-blue-400">Professionals</span>
          </h1>
          <p className="text-white text-sm sm:text-base mt-2 drop-shadow-md">
            Connect with verified experts in your area
          </p>
        </div>

        {/* Input Box */}
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-4xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-3">
          <input
            type="text"
            placeholder="🔍 What service do you need?"
            className="flex-1 px-4 py-3 text-sm sm:text-base rounded-md border border-gray-300 focus:outline-none text-black"
          />
          <input
            type="text"
            placeholder="📍 Enter your location"
            className="flex-1 px-4 py-3 text-sm sm:text-base rounded-md border border-gray-300 focus:outline-none text-black"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm sm:text-base rounded-md font-semibold transition">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
