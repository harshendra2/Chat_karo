"use client";
import Image from "next/image";
import logo from "../assets/logos-removebg-preview.png";

export default function Brand() {
  return (
    <div className="flex items-center justify-between py-5 md:block">
      <Image 
        src={logo} 
        alt="logo"
        width={100}  
        height={100} 
        className="h-40 w-auto" 
      />
    </div>
  );
}