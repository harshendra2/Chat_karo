"use client";
import Image from "next/image";
import snapFood from "../assets/ambitious-studio-rick-barrett-N2i51XCS-3g-unsplash.jpg";
import Link from "next/link";
import { SectionContext } from "../context/SectionContext";
import { useContext } from "react";

export default function Section() {
  const { section1 } = useContext(SectionContext);
  return (
    <div
      ref={section1}
      className="max-w-screen-lg mx-auto px-4 md:flex py-24 md:space-x-20 md:justify-center md:items-center md:px-4 overflow-hidden"
    >
      <div className="max-w-sm p-5 md:p-0">
        <Image
          src={snapFood}
          alt="Snap food"
          className="rounded-tr-[108px] rounded-bl-[108px] md:w-auto md:h-1/2"
          priority
        />
      </div>
      <div className="flex-none space-y-5 max-w-xl">
        <h1 className="text-4xl text-gray-500 font-extrabold sm:text-5xl md:pt-10 pt-5">
           See Every Message, <span className="block text-primary">Feel Every Connection</span>
        </h1>
        <p className="text-gray-500">
          Like you see in these vibrant conversations, Chat Karo brings people closer 
    with instant messaging, video calls, and file sharing. Whether it's quick texts, 
    heartfelt voice notes, or lively group chats - communicate your way with 
    military-grade encryption and zero compromises on quality.
        </p>
      </div>
    </div>
  );
}
