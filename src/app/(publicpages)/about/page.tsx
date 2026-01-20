
export default function AboutPage(){
    return (
        <section className="mt-4 py-16 bg-gray-50" id="about">
  <div className="max-w-5xl mx-auto px-6 text-center">
    {/* Heading */}
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
      About <span className="text-yellow-500">QuickFix</span>
    </h2>
    <p className="text-gray-600 max-w-3xl mx-auto mb-8">
      QuickFix is a modern local service finder platform built to connect 
      clients with reliable service professionals in their area. Whether you 
      need an <span className="font-semibold">electrician, plumber, painter, 
      or AC technician</span>, QuickFix makes it easier to find skilled workers 
      near you — quickly and effortlessly.
    </p>

    {/* Features grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">👥 For Clients</h3>
        <p className="text-gray-600">
          Search and filter workers by service type, location, and availability. 
          A clean and responsive interface ensures you find help when you need it most.
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🛠️ For Workers</h3>
        <p className="text-gray-600">
          Create professional profiles to showcase your skills, experience, and 
          availability. Get discovered by clients in your nearby area instantly.
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💬 Communication</h3>
        <p className="text-gray-600">
          Built-in chat and video call UI designs allow seamless interaction 
          between clients and workers. Future-ready for real-time backend integration.
        </p>
      </div>
    </div>

    {/* Closing line */}
    <p className="text-gray-700 mt-10 font-medium">
      Our goal is simple: <span className="text-yellow-500">make it easier 
      for people to connect with trusted local service professionals</span> through 
      a smooth, scalable, and modern platform.
    </p>
  </div>
</section>

    )
}


