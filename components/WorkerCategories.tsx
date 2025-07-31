"use client";
import { Wrench, Zap, ShowerHead, Car, Hammer, Paintbrush } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const workerCategories = [
  {
    title: "HVAC Technician",
    subtitle: "AC & Fridge Mechanic",
    icon: <Wrench className="w-10 h-10 text-blue-500" />,
  },
  {
    title: "Electrical Expert",
    subtitle: "Wiring, Installations",
    icon: <Zap className="w-10 h-10 text-yellow-500" />,
  },
  {
    title: "Plumbing Specialist",
    subtitle: "Leak Fix, Installations",
    icon: <ShowerHead className="w-10 h-10 text-cyan-500" />,
  },
  {
    title: "Auto Service Technician",
    subtitle: "Vehicle Mechanic",
    icon: <Car className="w-10 h-10 text-red-500" />,
  },
  {
    title: "Woodwork Expert",
    subtitle: "Furniture & Repairs",
    icon: <Hammer className="w-10 h-10 text-amber-700" />,
  },
  {
    title: "Interior Painter",
    subtitle: "Home & Office Painting",
    icon: <Paintbrush className="w-10 h-10 text-purple-500" />,
  },
];

export default function WorkerCategories() {
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
        }
      );
    });
  }, []);

  return (
    <section className="px-6 py-10 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        What Service Are You Looking For?
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Choose from our most requested categories
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {workerCategories.map((item, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) cardsRef.current[index] = el;
            }}
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-all"
          >
            {item.icon}
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
