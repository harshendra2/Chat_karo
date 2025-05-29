"use client";
import "./globals.css";
import Image from "next/image";
import foodMain from "../../assets/portfolio1.jpg";
import Link from "next/link";
import Section from "../../components/Section";
import NewsLetter from "../../components/NewsLetter";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { SectionProvider } from "../../context/SectionContext";
import { Suspense } from "react";
import Loading from "./loading";

function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <div className="relative">
          <SectionProvider>
            <Navbar />
            <section className="Landingpage">
              <div className="max-w-screen-lg mx-auto px-4 md:py-20 gap-12 text-gray-600 overflow-hidden md:px-4 md:flex">
                <div className="flex-none space-y-5 max-w-xl">
                  <h1 className="text-4xl text-white-500 font-extrabold sm:text-5xl md:pt-10">
                     Face-to-Face, Heart-to-Heart: Connect in Real-Time
                  </h1>
                  <p>
                    Experience seamless video conversations that feel like you're in the same room, 
    even when miles apart. Chat Karo revolutionizes communication with crystal-clear 
    video calls, instant messaging, and screen sharing - all in one intuitive platform. 
    Whether connecting with loved ones, collaborating with colleagues, or meeting new 
    people, our secure platform ensures your conversations stay private and lag-free. 
    Join thousands already bridging distances with just one click.
                  </p>
                 
                </div>
                <div className="flex-1 hidden md:block">
                  <Image
                    src={foodMain}
                    className="md:rounded-tl-[108px] md:rounded-br-[108px] w-[45] h-auto"
                    alt="Food main"
                    priority={true}
                  />
                </div>
              </div>
              <Section />
              <NewsLetter />
              <Footer />
            </section>
          </SectionProvider>
        </div>
      </div>
    </Suspense>
  );
}

export default Home;
