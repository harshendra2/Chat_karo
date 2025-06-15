"use client"
import "./dashboard.css"
import { useContext, useState, useEffect } from "react";
import CallScreen from "../../../components/CallScreen/CallScreen";
import Chat from "../../../components/Chat/Chat";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar/sidebar";
import { PageContext } from "../../../context/PageContext";
import IncommingCall from "../../../components/IncommingCall/IncommingCall";
import io from 'socket.io-client';
import ProtectedRoute from "../../../components/ProtectedRoute";
import SocketUrl from '../../../Service/SocketUrl';
import Background from "../../../assets/Background.jpg";

const socket = io(SocketUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function DashBoard() {
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { 
    UserId, 
    SetUserId, 
    page, 
    setPage, 
    inCommingCallId, 
    SetIncommingCallId,
    SetCallRemoteUserId,
    SetIsCaller
  } = useContext(PageContext);
  const router = useRouter();
  
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowChat(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const currentUserId = Cookies.get("UserId");
    
    socket.emit('register', currentUserId);

    socket.on('incoming-call', (data) => {
      setIncomingCall(data);
      setPage(false);
      SetCallRemoteUserId(data?.callerId);
      SetIsCaller(false);
    });

    socket.on('call-rejected', () => {
      setPage(true);
      SetIncommingCallId(null);
    });

    socket.on('call-ended', () => {
      setPage(true);
      SetIncommingCallId(null);
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, []);

  const handleCallInitiate = () => {
    const currentUserId = Cookies.get("UserId");
    const callId = `${currentUserId}-${UserId}-${Date.now()}`; 
    
    SetIncommingCallId(callId);
    SetCallRemoteUserId(UserId);
    SetIsCaller(true);
    
    socket.emit('initiate-call', {
      callerId: currentUserId,
      receiverId: UserId,
      callId: callId
    });
    
    setPage(false);
  };

  const handleAcceptCall = () => {
    socket.emit('accept-call', { 
      callId: incomingCall?.callId,
      receiverId: incomingCall?.callerId
    });
    SetIncommingCallId(incomingCall?.callId);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    socket.emit('reject-call', { 
      callId: incomingCall?.callId,
      receiverId: incomingCall?.callerId
    });
    setIncomingCall(null);
    setPage(true);
  };

  return (
    <ProtectedRoute>
      <div>
        {page ? (
          <div 
          
           className="h-screen flex flex-row"
  style={{
    backgroundImage: `url(${Background.src})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }}
         > 
            {(!isMobile || !showChat) && (
              <div className={`${isMobile ? 'w-full' : 'w-[20%]'}`}>
                <Sidebar showChat={showChat} setShowChat={setShowChat} />
              </div>
            )}
            
            {(!isMobile || showChat) && (
              <div className={`${isMobile ? 'w-full' : 'w-[80%]'}`}>
                <Chat 
                  handleCallInitiate={handleCallInitiate} 
                  showChat={showChat} 
                  setShowChat={setShowChat} 
                />
              </div>
            )}
          </div>
        ) : incomingCall ? (
          <IncommingCall 
            handleAcceptCall={handleAcceptCall} 
            handleRejectCall={handleRejectCall} 
            caller={incomingCall?.callerId}
          />
        ) : (
          <CallScreen />
        )}
      </div>
    </ProtectedRoute>
  );
}