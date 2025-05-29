import { useEffect, useRef,useState,useContext } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { PageContext } from "../../context/PageContext";


export default function IncommingCall() {
  const { setPage } = useContext(PageContext);
     const [isCalling, setIsCalling] = useState(false);
     const ringtoneRef = useRef(null);
  const callTimeoutRef = useRef(null);

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
       setIsCalling(false);
       setPage(true)
    }
  };

    const handleVideoCall = () => {
    setIsCalling(true);
    playRingtone();

    callTimeoutRef.current = setTimeout(() => {
      stopRingtone();
      setIsCalling(false);
       setPage(true)
    }, 10000); 
  };

  useEffect(() => {
    handleVideoCall();
    return () => clearTimeout(callTimeoutRef.current);
  }, []);


  return (
    <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/caller-bg.jpg')] bg-cover bg-center opacity-30 blur-sm" />

      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="z-10 flex flex-col items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-green-500 shadow-lg">
          <img
            src="/caller-profile.jpg"
            alt="Caller"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold">Harshedra Raj pn</h2>
          <p className="text-gray-300 mt-1">Incoming Video Call...</p>
        </div>

        <div className="flex gap-10 mt-6">
          <button className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200" onClick={stopRingtone}>
            <PhoneOff size={28} />
          </button>

          <button className="bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 animate-pulse">
            <Phone size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
