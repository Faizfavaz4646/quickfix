import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-700 mb-6">
        Have a question, suggestion, or need support? Fill out the form below or
        reach us directly. Our team will get back to you soon.
      </p>

      {/* Contact Form */}
      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            placeholder="Your full name"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Message</label>
          <textarea
            placeholder="Write your message..."
            rows={5}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-400"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>

      {/* Extra Contact Info */}
      <div className="mt-10 space-y-2">
        <h2 className="text-xl font-semibold">Other Ways to Reach Us</h2>
        <p>📍 Location: Calicut, Kerala, India</p>
        <p>📞 Phone: +91 7034514646</p>
        <p>✉️ Email: support@quickfix.com</p>
      </div>

      {/* Social Media Icons */}
      <div className="mt-6 flex space-x-5 text-2xl text-gray-600">
        <a
          href="https://instagram.com"
          target="_blank"
          className="text-pink-500"
        >
          <FaInstagram />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          className="text-blue-600"
        >
          <FaFacebook />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          className="text-sky-500"
        >
          <FaTwitter />
        </a>
        <a
          href="https://wa.me/917034514646"
          target="_blank"
          className="text-green-500"
        >
          <FaWhatsapp />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          className="text-blue-700"
        >
          <FaLinkedin />
        </a>
      </div>
    </div>
  );
}
