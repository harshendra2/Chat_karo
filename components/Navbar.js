"use client";
import Link from "next/link";
import Brand from "./BrandLogo";
import {
  useState
} from "react";

export default function Navbar() {
  const [state, setState] = useState(false);

  return (
    <>
      <div className={`md:hidden ${state ? "mx-2 pb-5" : "hidden"}`}>
        <Brand state={state} setState={setState} />
      </div>
      <nav
        className={`pb-5 md:text-sm ${
          state
            ? "absolute top-0 inset-x-0 bg-white shadow-lg rounded-xl border mx-2 mt-2 md:shadow-none md:border-none md:mx-0 md:mt-0 md:relative md:bg-transparent"
            : ""
        }`}
      >
        <div className="gap-x-14 items-center max-w-screen-2xl mx-10 px-4 md:flex md:px-8">
          <Brand state={state} setState={setState} />
          <div
            className="flex-1 items-center mt-8 md:mt-0 md:flex justify-end gap-3"
          >
          
                  <div className="items-center justify-end mt-6 space-y-6 space-x-4 md:inline-flex md:mt-0">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-gray-800 hover:bg-gray-700 active:bg-gray-900 rounded-full md:inline-flex"
                    >
                      Log in
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                  <div className="items-center justify-end mt-6 space-y-6 space-x-4 md:inline-flex md:mt-0">
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-gray-800 hover:bg-gray-700 active:bg-gray-900 rounded-full md:inline-flex"
                    >
                      Sign up
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
          </div>
        </div>
      </nav>
    </>
  );
}
