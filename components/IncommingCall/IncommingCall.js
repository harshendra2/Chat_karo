import { useEffect, useRef, useContext, useState, useCallback } from "react";
import Image from 'next/image';
import { Phone, PhoneOff } from "lucide-react";
import { PageContext } from "../../context/PageContext";
import Axios from 'axios';
import BaseUrl from '../../Service/BaseUrl';
import Cookies from 'js-cookie';

export default function IncommingCall({ handleRejectCall, handleAcceptCall, caller }) {
  const [state,setState]=useState(null)
  const { setPage } = useContext(PageContext);
  const ringtoneRef = useRef(null);
  const timeoutRef = useRef(null);
  const [interactionDone, setInteractionDone] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = useCallback(() => {
    clearAutoReject();
    stopRingtone();
    handleAcceptCall();
    setInteractionDone(true);
    setError(null);
  }, [handleAcceptCall]);

  const handleReject = useCallback(() => {
    clearAutoReject();
    stopRingtone();
    handleRejectCall();
    setPage(true);
    setError(null);
  }, [handleRejectCall, setPage]);

  const handleRejectRef = useRef(handleReject);

  useEffect(() => {
    handleRejectRef.current = handleReject;
    timeoutRef.current = setTimeout(() => {
      console.log("Auto-rejecting call due to timeout");
      handleRejectRef.current();
    }, 60000);

    return () => clearTimeout(timeoutRef.current);
  }, [handleReject]);

  const startRingtone = useCallback(() => {
    if (!interactionDone || ringtoneRef.current) return;
    
    try {
      ringtoneRef.current = new Audio("/ringtone-126505.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch((e) => {
        console.error("Ringtone error:", e);
        setError('Failed to play ringtone');
      });
    } catch (error) {
      console.error("Error creating ringtone:", error);
      setError('Failed to play ringtone');
    }
  }, [interactionDone]);

  const handleInteraction = () => {
    if (!interactionDone) {
      setInteractionDone(true);
      setError(null);
    }
  };

  useEffect(() => {
    if (interactionDone) {
      startRingtone();
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current = null;
      }
    };
  }, [interactionDone, startRingtone]);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
  }, []);

  const clearAutoReject = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!caller) return;

    const GetDetails = async () => {
      try {
        const response = await Axios.get(
          `${BaseUrl}Sender/details/${caller}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Cookies.get('currentUser')}`,
            },
          }
        );
        if (response.status === 200 || response.status === 201) {
          setState(response.data);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        setError('Failed to load caller details');
      }
    };

    GetDetails();
  }, [caller]);

  return (
    <div 
      className="w-full h-screen bg-black text-white flex flex-col items-center justify-center relative"
      onClick={handleInteraction}
    >
      <div className="z-10 flex flex-col items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-green-500 shadow-lg bg-gray-200">
          {state?.Profile ? (
            <Image
              src={state?.Profile}
              alt={`logo`}
              width={100}
              height={100}
              className="h-32 w-32 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <div className="h-32 w-32 rounded-full border-2 border-white bg-gray-600 text-white flex items-center justify-center text-xl font-semibold">
              {state?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold">{state?.name || 'Unknown'}</h2>
          <p className="text-gray-300 mt-1">Incoming Video Call...</p>
          {!interactionDone && (
            <p className="text-yellow-400 text-sm mt-2 animate-pulse">
              Tap anywhere to enable sound
            </p>
          )}
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="flex gap-10 mt-6">
          <button 
            className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all"
            onClick={handleReject}
          >
            <PhoneOff size={28} />
          </button>

          <button 
            className="bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all animate-pulse"
            onClick={handleAccept}
          >
            <Phone size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}