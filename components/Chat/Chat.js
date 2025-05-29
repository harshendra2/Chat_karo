'use client';
import { useState,useContext } from 'react';
import Image from 'next/image';
import logo from '../../assets/logos-removebg-preview.png';
import Video from '../../assets/Video.png';
import EmojiPicker from 'emoji-picker-react';
import { PageContext } from "../../context/PageContext";
import AcceptedList from '../AcceptedUser/AccepterUserList';

export default function Chat() {
   const {setPage } = useContext(PageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello, how are you?',
      type: 'received',
      timestamp: '12:00 pm',
      image: null,
    },
    {
      id: 2,
      text: "I'm good, thank you!",
      type: 'sent',
      timestamp: '12:01 pm',
      image: null,
    },
  ]);

  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      type: 'sent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
  };

  const handleEmojiClick = (emojiData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  function handleVideoCall() {
  setPage(prev => !prev); 
}

  return (
    <div className="h-screen ml-2 w-[79%] flex flex-col bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)]">
        <AcceptedList/>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[15%] bg-black/10 mx-auto mt-2">
        <div className="flex items-center gap-4">
          <Image src={logo} alt="logo" width={100} height={100} className="h-20 w-auto p-0" />
          <div className="flex flex-col justify-center p-0">
            <h2 className="text-white text-md font-semibold">Harshendra Raj PN</h2>
            <h3 className="text-green-500 text-sm">Online</h3>
          </div>
        </div>
        <div className="flex items-center border border-white/30 cursor-pointer transition-all duration-200 hover:border-black/30 hover:bg-white/10 hover:scale-105 rounded">
          <Image src={Video} alt="Video" width={48} height={48} className="h-12 w-12" onClick={handleVideoCall} />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col justify-between h-full w-[98%] mx-auto mt-2 mb-2 border border-white/20 rounded bg-white/5">
        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-75 overflow-y-auto scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col items-${msg.type === 'sent' ? 'end' : 'start'} max-w-[70%]`}>
                <div className={`${msg.type === 'sent' ? 'bg-green-600' : 'bg-gray-700'} text-white px-4 py-2 rounded-lg`}>
                  {msg.image && <Image src={msg.image} alt="sent" width={200} height={200} className="mb-2 rounded" />}
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400 mt-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative border-t border-white/10 p-3 flex items-center gap-2 bg-black/10">
          <button
            className="text-white text-xl hover:scale-110 transition"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>

          {/* Emoji Picker */}
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
    </div>
  );
}
