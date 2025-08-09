'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import  Link from 'next/link'; 

export default function Hero() {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.1 } });

      tl.fromTo(headingRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1 })
        .fromTo(subheadingRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.6")
        .fromTo(searchWrapperRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1 }, "-=0.6")
        .fromTo(buttonRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.6");
    }
  }, [pathname]); // <- triggers animation again when URL changes

  return (
    <section className="bg-gradient-to-br from-blue-300 to-white text-center py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <h1
          ref={headingRef}
          className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900"
        >
          Your Trusted <span className="text-blue-600">Local Service Professionals</span>
        </h1>
        <p
          ref={subheadingRef}
          className="text-lg text-gray-700 mb-10"
        >
          Connect with verified experts in your area for all your home service needs.
        </p>

       <div
  ref={searchWrapperRef}
  className="bg-white shadow-lg rounded-2xl sm:rounded-full flex flex-col sm:flex-row gap-3 sm:gap-0 overflow-hidden w-full max-w-3xl mx-auto mb-6 p-3"
>
  <input
    type="text"
    placeholder="🔍 What service do you need?"
    className="flex-1 px-4 py-3 text-sm sm:text-base rounded-md sm:rounded-full border border-gray-200 focus:outline-none text-black"
  />
  <input
    type="text"
    placeholder="📍 Enter your location"
    className="flex-1 px-4 py-3 text-sm sm:text-base rounded-md sm:rounded-full border border-gray-200 focus:outline-none text-black"
  />
  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm sm:text-base rounded-md sm:rounded-full font-semibold transition">
    Search
  </button>
</div>


        <div className="flex flex-col sm:flex-row justify-center gap-4" ref={buttonRef}>
       <Link href='/client/find-worker' className="bg-white text-blue-600 hover:bg-gray-100 px-5 py-2 rounded-md font-medium">  Find a Professional</Link>  
          
          <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-md font-medium">
            Join as a Professional
          </button>
        </div>
      </div>
    </section>
  );
}
