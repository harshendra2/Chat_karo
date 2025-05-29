"use client";
import { useEffect, useState, useContext, useRef } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaDesktop,
  FaStop,
} from "react-icons/fa";
import AIAvathar from "./AIAvathar";
import { PageContext } from "../../context/PageContext";

export default function CallScreen() {
  const { setPage } = useContext(PageContext);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenHeight, setScreenHeight] = useState("100vh");
  const [isCalling, setIsCalling] = useState(false);
  const ringtoneRef = useRef(null);
  const callTimeoutRef = useRef(null);

  const toggleAudio = () => setIsMuted((prev) => !prev);
  const toggleVideo = () => setVideoOn((prev) => !prev);
  const toggleScreenShare = () => setScreenSharing((prev) => !prev);


  useEffect(() => {
    const updateHeight = () => {
      setScreenHeight(window.innerHeight + "px");
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);


  const playRingtone = () => {
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/ringtone-126505.mp3");
      ringtoneRef.current.loop = true;
    }
    ringtoneRef.current.play().catch((e) => console.error("Ringtone error:", e));
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const disconnect = () => {
      stopRingtone();
      setIsCalling(false);
    setPage((prev) => !prev);
  };

  const handleVideoCall = () => {
    setIsCalling(true);
    playRingtone();

    callTimeoutRef.current = setTimeout(() => {
      stopRingtone();
      setIsCalling(false);
      disconnect();
    }, 10000); 
  };

  useEffect(() => {
    handleVideoCall();
    return () => clearTimeout(callTimeoutRef.current);
  }, []);

  return (
    <div
      className="w-full bg-black text-white flex flex-col relative"
      style={{ height: screenHeight }}
    >
      {/* Calling Animation */}
      {isCalling && (
        <div className="absolute top-4 right-4 text-white bg-black/50 px-4 py-2 rounded shadow flex items-center gap-2">
          <FaPhoneSlash className="text-green-400 animate-ping" />
          <span className="text-sm font-semibold animate-pulse">Calling...</span>
        </div>
      )}

      <AIAvathar />

      {/* Main video section */}
      <div className="flex-1 relative">
        <video
          className="w-full h-full max-w-[90%] object-cover"
          autoPlay
          muted
        />
        <p className="absolute top-2 left-2 md:top-4 md:left-4 text-sm md:text-lg font-semibold bg-black/50 px-2 md:px-4 py-1 rounded">
          Receiver (Harshendra Raj PN)
        </p>

        {/* Caller preview */}
        <div className="absolute bottom-28 right-4 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden shadow-lg border-2 border-white">
          <video className="w-full h-full object-cover" autoPlay muted />
        </div>

        {/* Screen sharing preview */}
        {screenSharing && (
          <div className="absolute top-2 right-2 w-[90%] sm:w-[400px] h-[200px] sm:h-[250px] border-2 border-green-500 bg-black">
            <p className="text-xs sm:text-sm text-white text-center mt-1 sm:mt-2">
              Screen Sharing
            </p>
            <video className="w-full h-full object-cover" autoPlay muted />
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="bg-black/30 p-2 sm:p-4 flex flex-wrap justify-center gap-4 sm:gap-6 items-center border-t border-white/10">
        <button
          onClick={toggleAudio}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
        >
          {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
        >
          {videoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
        >
          {screenSharing ? <FaStop size={20} /> : <FaDesktop size={20} />}
        </button>

        <button
          onClick={disconnect}
          className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition"
        >
          <FaPhoneSlash size={20} />
        </button>
      </div>
    </div>
  );
}
