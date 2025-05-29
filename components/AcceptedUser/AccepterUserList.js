'use client';
import './accept.css';
import Image from 'next/image';
import images from "../../assets/Images.png";

export default function AcceptedList() {
  return (
    <div className="flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[15%] bg-black/10 mx-auto mt-2">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 50 }).map((_, i) => (
          <Image
            key={i}
            src={images}
            alt={`logo-${i}`}
            width={100}
            height={100}
            className="h-16 w-16 rounded-full border-2 border-white object-cover cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}
