'use client';
import { useState, useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import logo from '../../assets/logos-removebg-preview.png';
import Video from '../../assets/Video.png';
import EmojiPicker from 'emoji-picker-react';
import { PageContext } from '../../context/PageContext';
import AcceptedList from '../AcceptedUser/AccepterUserList';
import RightBar from '../RightBar/rightbar';
import Axios from 'axios';
import BaseUrl from '../../Service/BaseUrl';
import Cookies from 'js-cookie';
import io from 'socket.io-client';
import SocketUrl from '../../Service/SocketUrl';

export default function Chat({handleCallInitiate}) {
  const { setPage, UserId, ChatPage } = useContext(PageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [State, setState] = useState(null);

  const socketRef = useRef(null);
  const scrollEndRef = useRef(null);

  useEffect(() => {
    if (!UserId) return;

    const GetDetails = async () => {
      try {
        const response = await Axios.get(
          `${BaseUrl}Sender/details/${UserId}`,
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
  }, [UserId]);

  useEffect(() => {
    const currentUserId = Cookies.get('UserId');
    if (!currentUserId || !UserId) return;

    socketRef.current = io(SocketUrl, {
      transports: ['websocket'],
      query: { userId: currentUserId },
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('getAllMessage', currentUserId, UserId);
    });

    socketRef.current.on('Message', (receivedMessages) => {
      setMessages(receivedMessages);
    });

    socketRef.current.on('added', (newMessage) => {
      setMessages((prev) => {
        if (prev.some(msg => msg._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('Message');
        socketRef.current.off('added');
        socketRef.current.disconnect();
      }
    };
  }, [UserId]);

  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    const currentUserId = Cookies.get('UserId');
    const data = {
      Sender: currentUserId,
      Reciever: UserId,
      Message: messageInput,
      createdAt: new Date(),
    };
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('addnewMsg', data);
      setMessageInput('');
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleVideoCall = () => {
    setPage((prev) => !prev);
    handleCallInitiate()
  };

  return (
    <div className="h-screen ml-2 w-[79%] flex flex-col bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)]">
      <AcceptedList />

      {ChatPage ? (
        <>
         
          <div className="flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[15%] bg-black/10 mx-auto mt-2">
            <div className="flex items-center gap-4">

              {State?.Profile ? (
                    <Image
                      src={State?.Profile}
                      alt={`logo`}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full border-2 border-white bg-black-600 text-white flex items-center justify-center text-xl font-semibold">
                      {State?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
              <div className="flex flex-col justify-center p-0">
                <h2 className="text-white text-md font-semibold">
                  {State?.name || 'Loading...'}
                </h2>
                <h3 className="text-green-500 text-sm">
                  {State?.OnLine ? 'Online' : 'Offline'}
                </h3>
              </div>
            </div>
            <div className="flex items-center border border-white/30 cursor-pointer transition-all duration-200 hover:border-black/30 hover:bg-white/10 hover:scale-105 rounded">
              <Image
                src={Video}
                alt="Video"
                width={48}
                height={48}
                className="h-12 w-12"
                onClick={handleVideoCall}
              />
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto justify-between h-full w-[98%] mx-auto mt-2 mb-2 border border-white/20 rounded bg-white/5">
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
              style={{ maxHeight: 'calc(100% - 80px)' }} 
            >
              {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex ${
                    msg.Sender === Cookies.get('UserId') ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex flex-col items-${
                      msg.Sender === Cookies.get('UserId') ? 'end' : 'start'
                    } max-w-[70%]`}
                  >
                    <div
                      className={`${
                        msg.Sender === Cookies.get('UserId') ? 'bg-green-600' : 'bg-gray-700'
                      } text-white px-4 py-2 rounded-lg`}
                    >
                      {msg?.Message}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              <div ref={scrollEndRef} />
            </div>

            <div className="relative border-t border-white/10 p-3 flex items-center gap-2 bg-black/10">
              <button
                className="text-white text-xl hover:scale-110 transition"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                😊
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                </div>
              )}

              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white placeholder-gray-300 focus:outline-none"
              />

              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        </>
      ) : (
        <RightBar />
      )}
    </div>
  );
}
