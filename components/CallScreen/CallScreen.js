"use client";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import Cookies from "js-cookie";
import { PageContext } from "../../context/PageContext";
import Axios from 'axios';
import BaseUrl from '../../Service/BaseUrl';
import { getSocket } from '../../utils/socketManager';

export default function CallScreen() {
  const { 
    setPage, 
    inCommingCallId, 
    callRemoteUserId,
    isCaller
  } = useContext(PageContext);
  const [state, setState] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting');
  const [interactionDone, setInteractionDone] = useState(false);
  const [ringtonePlaying, setRingtonePlaying] = useState(false);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const ringtoneRef = useRef(null);
  const localStreamRef = useRef(null);
  const isMountedRef = useRef(true); 
  const callTimeoutRef = useRef(null);
  const playPromisesRef = useRef([]);

  const currentUserId = Cookies.get("UserId");

  const safePlay = useCallback(async (element) => {
    if (!element) return;
    
    try {
      playPromisesRef.current = playPromisesRef.current.filter(p => !p.settled);
      const playPromise = element.play();
      playPromisesRef.current.push({
        promise: playPromise,
        settled: false
      });
      await playPromise;
      playPromisesRef.current = playPromisesRef.current.map(p => 
        p.promise === playPromise ? {...p, settled: true} : p
      );
    } catch (error) {
      if (error.name === 'AbortError' || 
          error.message.includes('interrupted by a new load request') ||
          error.message.includes('request was interrupted')) {
        return;
      }
      console.error('Error playing video:', error);
    }
  }, []);

  const startRingtone = useCallback(() => {
    if (!ringtoneRef.current && interactionDone) {
      try {
        ringtoneRef.current = new Audio("/ringtone-126505.mp3");
        ringtoneRef.current.loop = true;
        const playPromise = ringtoneRef.current.play();
        playPromisesRef.current.push({
          promise: playPromise,
          settled: false
        });
        playPromise.catch(e => {
          console.error("Ringtone error:", e);
          setError('Failed to play ringtone');
        });
        setRingtonePlaying(true);
      } catch (error) {
        console.error("Error creating ringtone:", error);
        setError('Failed to play ringtone');
      }
    }
  }, [interactionDone]);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      Promise.allSettled(playPromisesRef.current.map(p => p.promise))
        .then(() => {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
          ringtoneRef.current = null;
          setRingtonePlaying(false);
        })
        .catch(console.error);
    }
  }, []);

  const handleCallAccepted = useCallback(() => {
    setCallStatus('accepted');
    stopRingtone();
    setError(null);
  }, [stopRingtone]);

  const endCall = useCallback(() => {
    const socketInstance = getSocket();
    
    if (inCommingCallId) {
      socketInstance.emit('end-call', { 
        callId: inCommingCallId,
        targetId: callRemoteUserId 
      });
    }

    stopRingtone();
    stopMediaTracks();
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    setPage(true);
    setError(null);
  }, [inCommingCallId, callRemoteUserId, setPage]);

  const stopMediaTracks = useCallback(() => {
    Promise.allSettled(playPromisesRef.current.map(p => p.promise))
      .then(() => {
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
      })
      .catch(console.error);
  }, []);

  const createPeerConnection = useCallback(async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          const socketInstance = getSocket();
          socketInstance.emit('webrtc-signal', {
            callId: inCommingCallId,
            signal: { type: 'candidate', candidate },
            targetId: callRemoteUserId
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          console.log('ICE connection state:', pc.iceConnectionState);
          if (isMountedRef.current) {
            setError('Connection lost. Please try again.');
            setCallStatus('failed');
          }
        }
      };

      pc.ontrack = async (event) => {
        if (remoteVideoRef.current && isMountedRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          await safePlay(remoteVideoRef.current);
          setCallStatus('connected');
          stopRingtone();
          clearTimeout(callTimeoutRef.current); 
          setError(null);
        }
      };

      return pc;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      throw error;
    }
  }, [inCommingCallId, callRemoteUserId, safePlay, stopRingtone]);

  const handleSignal = useCallback(async ({ signal }) => {
    if (!pcRef.current || !isMountedRef.current) return;
    
    try {
      if (signal.type === 'offer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        const socketInstance = getSocket();
        socketInstance.emit('webrtc-signal', {
          callId: inCommingCallId,
          signal: { type: 'answer', sdp: answer.sdp },
          targetId: callRemoteUserId
        });
      } 
      else if (signal.type === 'answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      } 
      else if (signal.candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (err) {
      console.error("Signal handling error:", err);
      setError('Failed to establish connection. Please try again.');
      setCallStatus('failed');
    }
  }, [inCommingCallId, callRemoteUserId]);

  useEffect(() => {
    isMountedRef.current = true;
    const socketInstance = getSocket();

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
          await safePlay(localVideoRef.current);
        }

        const pc = await createPeerConnection();
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        socketInstance.on('webrtc-signal', handleSignal);

        socketInstance.on('call-ended', () => {
          endCall();
        });

        socketInstance.on('call-error', (data) => {
          console.error('Call error:', data.message);
          setError(data.message);
          setCallStatus('failed');
        });

        if (isCaller) {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);
          
          socketInstance.emit('webrtc-signal', {
            callId: inCommingCallId,
            signal: { type: 'offer', sdp: offer.sdp },
            targetId: callRemoteUserId
          });
          
          if (interactionDone) startRingtone();
        }

      } catch (error) {
        console.error("Call initialization error:", error);
        if (isMountedRef.current) {
          setCallStatus('failed');
          if (error.name === 'NotAllowedError') {
            setError('Camera/microphone access denied. Please check permissions.');
          } else if (error.name === 'NotFoundError') {
            setError('Camera/microphone not found. Please check your device.');
          } else {
            setError('Failed to access camera/microphone. Please try again.');
          }
        }
        stopRingtone();
        stopMediaTracks();
      }
    };

    initCall();

    socketInstance.on('call-accepted', handleCallAccepted);
    socketInstance.on('call-rejected', () => endCall());

    callTimeoutRef.current = setTimeout(() => {
      if (callStatus !== 'connected') {
        console.log("Call timeout - ending call");
        setError('Call timeout. Please try again.');
        endCall(); 
      }
    }, 60000);

    return () => {
      isMountedRef.current = false;
      socketInstance.off('call-accepted', handleCallAccepted);
      socketInstance.off('call-rejected');
      socketInstance.off('webrtc-signal');
      socketInstance.off('call-ended');
      socketInstance.off('call-error');

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      
      stopRingtone();
      stopMediaTracks();
      clearTimeout(callTimeoutRef.current);
      playPromisesRef.current = [];
    };
  }, [
    inCommingCallId, 
    callRemoteUserId, 
    isCaller, 
    interactionDone, 
    safePlay, 
    startRingtone, 
    stopRingtone, 
    stopMediaTracks, 
    handleCallAccepted, 
    endCall,
    createPeerConnection,
    handleSignal,
    callStatus
  ]);

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
        setError('Failed to load user details');
      }
    };

    GetDetails();
  }, [callRemoteUserId]);

  return (
    <div 
      className="w-full h-screen bg-black text-white flex flex-col relative"
      onClick={handleInteraction}
    >
      <video
        ref={remoteVideoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted={false}
      />
      
      {callStatus !== 'connected' && (
        <div className="absolute top-4 right-4 text-white bg-black/50 px-4 py-2 rounded shadow flex items-center gap-2">
          <span className="text-sm font-semibold animate-pulse">
            {callStatus === 'connecting' ? 'Connecting...' : 'Call Failed'}
          </span>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 text-white bg-red-600/80 px-4 py-2 rounded shadow flex items-center gap-2">
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {!interactionDone && isCaller && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="text-center p-6 bg-black/50 rounded-lg">
            <p className="text-xl mb-4">Tap anywhere to enable sound</p>
            <p className="text-yellow-400 animate-pulse">Calling to {state?.name || 'User'}...</p>
          </div>
        </div>
      )}

      {ringtonePlaying && (
        <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded shadow flex items-center gap-2">
          <span className="text-sm font-semibold animate-pulse">Ringing...</span>
        </div>
      )}

      <div className="absolute bottom-28 right-4 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden shadow-lg border-2 border-white bg-black">
        <video 
          ref={localVideoRef}
          className="w-full h-full object-cover" 
          autoPlay 
          muted
          playsInline
        />
      </div>

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