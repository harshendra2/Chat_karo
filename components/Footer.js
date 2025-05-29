import Link from "next/link";

export default function Footer() {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <footer className="text-gray-500 bg-[#f5f5f5] px-4 py-5 mx-auto md:px-8 w-full">
      <div className="max-w-xl sm:mx-auto sm:text-center">
      
        <p className="leading-relaxed mt-2 text-[15px]">
          Experience seamless conversations that bridge distances instantly. Join our growing community 
  of connected users who enjoy crystal-clear messaging, video calls, and real-time collaboration. 
  Whether sharing moments with loved ones or brainstorming with colleagues - communicate effortlessly 
  with end-to-end encryption ensuring every chat stays private.
        </p>
      </div>
      <ul className="items-center justify-center mt-8 space-y-5 sm:flex sm:space-x-4 sm:space-y-0">
        <li className=" hover:text-gray-800">
          <Link href="">About us</Link>
        </li>
        <li className=" hover:text-gray-800">
          <Link href="">Contact</Link>
        </li>
      </ul>
      <div className="mt-8 items-center justify-between sm:flex">
        <div className="mt-4 sm:mt-0">&copy; {year} All rights reserved.</div>
        
      </div>
    </footer>
  );
}
