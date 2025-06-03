"use client";
import { useEffect, useState, useContext, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import Cookies from "js-cookie";
import { PageContext } from "../../context/PageContext";
import Axios from 'axios';
import BaseUrl from '../../Service/BaseUrl';
import io from 'socket.io-client';
import SocketUrl from '../../Service/SocketUrl';

const socket = io(SocketUrl);



export default function CallScreen() {
  const { 
    setPage, 
    inCommingCallId, 
    callRemoteUserId,
    isCaller
  } = useContext(PageContext);
  const [state,setState]=useState(null)
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting');
  const [interactionDone, setInteractionDone] = useState(false);
  const [ringtonePlaying, setRingtonePlaying] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const ringtoneRef = useRef(null);
  const localStreamRef = useRef(null);
  const isMountedRef = useRef(true); 
  const callTimeoutRef = useRef(null);
  
  const currentUserId = Cookies.get("UserId");
  const safePlay = (element) => {
    if (!element) return;
    element.play().catch(error => {
      if (error.name === 'AbortError' || 
          error.message.includes('interrupted by a new load request') ||
          error.message.includes('request was interrupted')) {
        return;
      }
      console.error('Error playing video:', error);
    });
  };

  const startRingtone = () => {
    if (!ringtoneRef.current && interactionDone) {
      ringtoneRef.current = new Audio("/ringtone-126505.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => console.error("Ringtone error:", e));
      setRingtonePlaying(true);
    }
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
      setRingtonePlaying(false);
    }
  };

 const stopMediaTracks = () => {
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => {
      track.stop();
    });
    localStreamRef.current = null;
  }

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null;
  }

  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }
};


  useEffect(() => {
    isMountedRef.current = true;

    if (!inCommingCallId) return;

    const initCall = async () => {
      try {

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current && isMountedRef.current) {
          localVideoRef.current.srcObject = stream;
          safePlay(localVideoRef.current);
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        pcRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit('webrtc-signal', {
              callId: inCommingCallId,
              signal: { type: 'candidate', candidate },
              targetId: callRemoteUserId
            });
          }
        };

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && isMountedRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            safePlay(remoteVideoRef.current);
            setCallStatus('connected');
            stopRingtone();
            clearTimeout(callTimeoutRef.current); 
          }

        };

        const handleSignal = async ({ signal }) => {
          if (!pcRef.current || !isMountedRef.current) return;
          
          try {
            if (signal.type === 'offer') {
              await pcRef.current.setRemoteDescription(signal);
              const answer = await pcRef.current.createAnswer();
              await pcRef.current.setLocalDescription(answer);
              
              socket.emit('webrtc-signal', {
                callId: inCommingCallId,
                signal: { type: 'answer', answer },
                targetId: callRemoteUserId
              });
            } 
            else if (signal.type === 'answer') {
              await pcRef.current.setRemoteDescription(signal);
            } 
            else if (signal.candidate) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          } catch (err) {
            console.error("Signal handling error:", err);
          }
        };

        socket.on('webrtc-signal', handleSignal);

        const handleCallEnd = () => {
          endCall();
        };
        socket.on('end-call', handleCallEnd);

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          socket.emit('webrtc-signal', {
            callId: inCommingCallId,
            signal: { type: 'offer', offer },
            targetId: callRemoteUserId
          });
          
          if (interactionDone) startRingtone();
        }

      } catch (error) {
        console.error('Call setup failed:', error);
        if (isMountedRef.current) setCallStatus('failed');
        stopRingtone();
        stopMediaTracks();
      }
    };

    initCall();

callTimeoutRef.current = setTimeout(() => {
  if (callStatus !== 'connected') {
    endCall(); 
  }
}, 60000);


    return () => {
      isMountedRef.current = false;

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      socket.off('webrtc-signal');
      socket.off('end-call');

      stopRingtone();
      stopMediaTracks();
      clearTimeout(callTimeoutRef.current);
    };
  }, [inCommingCallId, callRemoteUserId, isCaller, interactionDone]);

  const handleInteraction = () => {
    if (!interactionDone) {
      setInteractionDone(true);
      if (isCaller) startRingtone();
    }
  };

  const toggleAudio = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => track.enabled = !isMuted);
    }
  };

  const toggleVideo = () => {
    setVideoOn(!videoOn);
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !videoOn);
    }
  };



  const endCall = () => {
  if (!isMountedRef.current) return;

  clearTimeout(callTimeoutRef.current); 

  socket.emit('end-call', { 
    callId: inCommingCallId,
    targetId: callRemoteUserId 
  });


  stopRingtone();
  stopMediaTracks();

  if (pcRef.current) {
    pcRef.current.close();
    pcRef.current = null;
  }
  setPage(true); 
};


  useEffect(() => {
    if (!callRemoteUserId) return;

    const GetDetails = async () => {
      try {
        const response = await Axios.get(
          `${BaseUrl}Sender/details/${callRemoteUserId}`,
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
      }
    };

    GetDetails();
  }, [callRemoteUserId]);

  return (
    <div 
      className="w-full h-screen bg-black text-white flex flex-col relative"
       onClick={handleInteraction}
    >
      {/* Main video */}
      <video
        ref={remoteVideoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
      />
      
      {/* Status indicator */}
      {callStatus !== 'connected' && (
        <div className="absolute top-4 right-4 text-white bg-black/50 px-4 py-2 rounded shadow flex items-center gap-2">
          <span className="text-sm font-semibold animate-pulse">
            {callStatus === 'connecting' ? 'Connecting...' : 'Call Failed'}
          </span>
        </div>
      )}

      {/* Interaction prompt */}
      {!interactionDone && isCaller && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="text-center p-6 bg-black/50 rounded-lg">
            <p className="text-xl mb-4">Tap anywhere to enable sound</p>
            <p className="text-yellow-400 animate-pulse">Calling to {state?.name}...</p>
          </div>
        </div>
      )}

      {/* Ringtone indicator */}
      {ringtonePlaying && (
        <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded shadow flex items-center gap-2">
          <span className="text-sm font-semibold animate-pulse">Ringing...</span>
        </div>
      )}

      {/* Local preview */}
      <div className="absolute bottom-28 right-4 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden shadow-lg border-2 border-white bg-black">
        <video 
          ref={localVideoRef}
          className="w-full h-full object-cover" 
          autoPlay 
          muted
          playsInline
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'}`}
        >
          {isMuted ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${!videoOn ? 'bg-red-600' : 'bg-gray-700'}`}
        >
          {videoOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
        </button>
        
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600"
        >
          <FaPhoneSlash size={24} />
        </button>
      </div>
    </div>
  );
}