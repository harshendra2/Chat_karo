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
import { getSocket } from '../../../utils/socketManager';
import ProtectedRoute from "../../../components/ProtectedRoute";
import Background from "../../../assets/Background.jpg";

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
    const socketInstance = getSocket();
    
    socketInstance.emit('register', currentUserId);

    socketInstance.on('incoming-call', (data) => {
      console.log('Incoming call received:', data);
      setIncomingCall(data);
      setPage(false);
      SetCallRemoteUserId(data?.callerId);
      SetIsCaller(false);
    });

    socketInstance.on('call-rejected', () => {
      console.log('Call rejected');
      setPage(true);
      SetIncommingCallId(null);
    });

    socketInstance.on('call-ended', () => {
      console.log('Call ended');
      setPage(true);
      SetIncommingCallId(null);
    });

    socketInstance.on('call-error', (data) => {
      console.error('Call error:', data.message);
      setPage(true);
      SetIncommingCallId(null);
    });

    return () => {
      socketInstance.off('incoming-call');
      socketInstance.off('call-rejected');
      socketInstance.off('call-ended');
      socketInstance.off('call-error');
    };
  }, [setPage, SetCallRemoteUserId, SetIsCaller, SetIncommingCallId]);

  const handleCallInitiate = () => {
    const currentUserId = Cookies.get("UserId");
    const callId = `${currentUserId}-${UserId}-${Date.now()}`; 
    
    console.log('Initiating call:', { callId, callerId: currentUserId, receiverId: UserId });
    
    SetIncommingCallId(callId);
    SetCallRemoteUserId(UserId);
    SetIsCaller(true);
    
    const socketInstance = getSocket();
    socketInstance.emit('initiate-call', {
      callerId: currentUserId,
      receiverId: UserId,
      callId: callId
    });
    
    setPage(false);
  };

  const handleAcceptCall = () => {
    console.log('Accepting call:', incomingCall?.callId);
    const socketInstance = getSocket();
    socketInstance.emit('accept-call', { 
      callId: incomingCall?.callId,
      receiverId: incomingCall?.callerId
    });
    SetIncommingCallId(incomingCall?.callId);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    console.log('Rejecting call:', incomingCall?.callId);
    const socketInstance = getSocket();
    socketInstance.emit('reject-call', { 
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