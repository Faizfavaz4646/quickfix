export default function ServicesPage() {
  return (
    <div className="p-6 mt-25 text-center">
      <h1 className="text-3xl font-bold mb-4">Our Services</h1>

      <p className="text-gray-700 mb-6">
        At QuickFix, we connect clients with reliable service professionals to
        make finding help fast and easy. Here’s what we offer:
      </p>

      <ul className="space-y-4">
        <li>
          <h2 className="text-xl font-semibold">🔧 Home Repairs</h2>
          <p className="text-gray-600">
            Electricians, plumbers, carpenters, and more – available at your
            doorstep.
          </p>
        </li>

        <li>
          <h2 className="text-xl font-semibold">🧹 Cleaning Services</h2>
          <p className="text-gray-600">
            Book trusted cleaners for home, office, and deep cleaning tasks.
          </p>
        </li>

        <li>
          <h2 className="text-xl font-semibold">💻 Tech Support</h2>
          <p className="text-gray-600">
            Get expert help for your devices, internet, and software setup.
          </p>
        </li>

        <li>
          <h2 className="text-xl font-semibold">🚚 Moving & Delivery</h2>
          <p className="text-gray-600">
            Movers, packers, and delivery agents to handle your shifting needs.
          </p>
        </li>
      </ul>
    </div>
  );
}
