// components/Wrench.tsx
"use client";
import { useEffect, useRef } from "react";
import { FaTools } from "react-icons/fa";
import gsap from "gsap";

export default function Wrench() {
  const wrenchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrenchRef.current) {
      const tl = gsap.timeline();

      tl.to(wrenchRef.current, {
        delay:2,
        rotateZ: 40,
        duration: 0.5,
        repeat:1,
        ease: "power1.inOut",
      }).to(wrenchRef.current, {
        rotateZ: 0,
        duration: 0.5,
        ease: "power1.inOut",
      });
    }
  }, []);

  return (
    <div ref={wrenchRef} style={{ fontSize: "150px", display: "inline-block" }}>
      <FaTools />
    </div>
  );
}
