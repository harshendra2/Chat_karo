'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';
import { FaBullhorn, FaTimes } from 'react-icons/fa';
import { PageContext } from "../../context/PageContext";
import io from 'socket.io-client';
import Cookies from "js-cookie";
import SocketUrl from '../../Service/SocketUrl';
import "./accept.css"

export default function AcceptedList({ showChat, setShowChat }) {
  const { UserId, SetUserId, ChatPage, SetChatPage,Meta,SetMeta } = useContext(PageContext);
  const [User, SetUser] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const userId = Cookies.get("UserId");
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(SocketUrl, { 
      transports: ['websocket'],
      query: { userId }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('getallUser', userId);
      socket.emit('online', userId);
    });

    socket.on('user', receivedUser => {
      SetUser(receivedUser);
    });

    socket.on('disconnect', () => {
      socket.emit('offline', userId);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('offline', userId);
        socketRef.current.disconnect();
      }
    };
  }, []);

  function ChatContinue(ID) {
    SetUserId(ID);
    SetChatPage(true);
    SetMeta(false)
    if (window.innerWidth < 768) setShowChat(true);
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

 const handleSubmitReminder = async () => {
  if (selectedUsers.length === 0) {
    alert("Select at least one user!");
    return;
  }

  if (!aiPrompt.trim()) {
    alert("Please enter a reminder message!");
    return;
  }

  const currentUserId = Cookies.get('UserId');
  if (!currentUserId) return;

  try {
    if (socketRef.current && socketRef.current.connected) {
      // Show loading state
      setShowReminderModal(false);
      
      // Emit the reminder event
      socketRef.current.emit(
        'addnewReminder',
        {
          message: aiPrompt,
          sender: currentUserId,
          recipients: selectedUsers
        },
        (response) => {
          // Handle server response
          if (response.success) {
            alert("Reminder set successfully!");
          } else {
            alert(`Failed to set reminder: ${response.error}`);
          }
          setAiPrompt("");
          setSelectedUsers([]);
        }
      );
    } else {
      alert("Connection error. Please refresh the page.");
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
    setShowReminderModal(true);
  }
};


  return (
    <div className="flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[15%] bg-black/10 mx-auto mt-2 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {User.map((temp, index) => (
          <div 
            key={index} 
            className="relative cursor-pointer flex-shrink-0" 
            onClick={() => ChatContinue(temp?._id)}
          >
            {temp?.Profile ? (
              <Image
                src={temp.Profile}
                alt={`${temp.name}'s profile`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-2 border-white bg-black-600 text-white flex items-center justify-center text-xl font-semibold">
                {temp?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span 
              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                temp?.OnLine ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Reminder Button */}
      <button 
        className="text-xs text-gray-400 hover:text-white cursor-pointer"
        title="Reminder"
        onClick={() => setShowReminderModal(true)}
        aria-label="Send reminder"
      >
        <FaBullhorn size={18} className="text-white" />
      </button>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="border-2 border-white/30 shadow-lg shadow-white/10 rounded-lg p-6 w-full max-w-md backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Send Reminder</h3>
              <button 
                onClick={() => setShowReminderModal(false)} 
                className="text-gray-400 hover:text-white"
                aria-label="Close reminder modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Prompt
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., 'Remind everyone about tomorrow's 10 AM meeting, link:http://localhost:3000/dashboard'"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4 max-h-60 overflow-y-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Users
              </label>
              {User.map((user) => (
                <div key={user._id} className="flex items-center py-2">
                  <input
                    type="checkbox"
                    id={`user-${user._id}`}
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`user-${user._id}`} className="ml-2 text-sm text-white flex items-center">
                    {user.Profile ? (
                      <Image
                        src={user.Profile}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    ) : (
                      <span className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitReminder}
              disabled={selectedUsers.length === 0}
              className={`w-full py-2 px-4 rounded-md ${
                selectedUsers.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-600 cursor-not-allowed'
              } text-white font-medium transition`}
            >
              Send Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}