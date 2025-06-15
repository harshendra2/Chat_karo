'use client';
import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { BsClockHistory, BsReply, BsCheck2All } from "react-icons/bs";
import "../Chat/Chat.css"
import { IoSend } from "react-icons/io5";
import { FaRegSmile, FaEllipsisV } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import { PageContext } from '../../context/PageContext';
import Axios from 'axios';
import BaseUrl from '../../Service/BaseUrl';
import Cookies from 'js-cookie';
import Meta from '../MetaIcons/meta';

export default function MetaChat({showChat, setShowChat }) {
  const { setPage, UserId, ChatPage } = useContext(PageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const isCurrentUser = (senderId) => {
    return senderId === Cookies.get('UserId');
  };

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() === '') return;
    
    setIsTyping(true);
    const currentUserId = Cookies.get('UserId');
    const newUserMessage = { Message: messageInput, Sender: currentUserId };
    
    setMessages(prev => [...prev, newUserMessage]);
    setMessageInput('');
    
    try {
      const response = await Axios.put(
        `${BaseUrl}get/meta/ai`,
        {
          prompt: messageInput,
          userId: currentUserId
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("currentUser")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const aiMessage = { Message: response?.data?.response, Sender: 1 };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);
  };

  return (
    <div className="flex flex-col h-[100vh] max-h-[100vh] w-full bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[80px] bg-black/10 mx-auto mt-2">
        <div className="flex items-center gap-4">
          <Meta className="h-16 w-16"/>
            
          <div className="flex flex-col justify-center p-0">
            <h2 className="text-white text-md font-semibold">
              Synthia
            </h2>
            <h3 className="text-sm text-green-500">
              Online
            </h3>
            {isTyping && (
              <span className="text-xs text-gray-400">typing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Thread selector - empty for now */}
      <div className="flex-shrink-0 flex border-b border-white/20 bg-black/10 py-2 px-4 gap-2 h-[40px] items-center no-scrollbar">
      </div>

      {/* Chat area - this will scroll */}
      <div 
        ref={chatContainerRef}
        className="flex-1 flex flex-col overflow-hidden w-[98%] mx-auto my-2 border border-white/20 rounded bg-white/5"
      >
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
          style={{ 
            minHeight: 0 // Important for flex children to scroll properly
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet</p>
              <p>Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrent = isCurrentUser(msg?.Sender);
              return (
                <div key={index} className="space-y-2">
                  <div className={`flex ${isCurrent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col items-${isCurrent ? 'end' : 'start'} max-w-[70%]`}>
                      <div
                        className={`${
                          isCurrent ? 'bg-green-600' : 'bg-gray-700'
                        } text-white px-4 py-2 rounded-lg break-words whitespace-pre-wrap`}
                      >
                        {msg?.Message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area - fixed at bottom */}
        <div className="flex-shrink-0 relative border-t border-white/10 p-3 flex items-center gap-2 bg-black/10">
          <button
            className="text-white text-xl hover:scale-110 transition"
            onClick={() => setShowEmojiPicker(prev => !prev)}
          >
            <FaRegSmile />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-10">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick} 
                theme="dark" 
                width={isMobile ? '100%' : 350}
                height={400}
              />
            </div>
          )}

          <input
            ref={inputRef}
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white placeholder-gray-300 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <div className="relative flex">
            <button
              onClick={handleSendMessage}
              className="px-3 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition flex items-center"
              title="Send message"
              disabled={!messageInput.trim()}
            >
              {isScheduled ? <BsClockHistory /> : <IoSend />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}