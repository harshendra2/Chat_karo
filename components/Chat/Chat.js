'use client';
import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { BsClockHistory, BsReply, BsCheck2All } from "react-icons/bs";
import { RiArrowDropDownLine, RiSendPlaneFill,RiChatAiFill } from "react-icons/ri";
import { FcVideoCall } from "react-icons/fc";
import "./Chat.css"
import { IoSend } from "react-icons/io5";
import { FaRegSmile, FaEllipsisV } from "react-icons/fa";
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';
import { PageContext } from '../../context/PageContext';
import AcceptedList from '../AcceptedUser/AccepterUserList';
import RightBar from '../RightBar/rightbar';
import Axios from 'axios';
import BaseUrl from '../../Service/BaseUrl';
import Cookies from 'js-cookie';
import io from 'socket.io-client';
import SocketUrl from '../../Service/SocketUrl';
import { IoArrowBack } from 'react-icons/io5';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import MetaChat from '../MetaAi/Metaai';
import Metas from '../MetaIcons/meta';


export default function Chat({ handleCallInitiate, showChat, setShowChat }) {
  const { setPage, UserId, ChatPage,Meta,SetMeta} = useContext(PageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const socketRef = useRef(null);
  const scrollEndRef = useRef(null);
  const scheduleRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionTimerRef = useRef(null);
  const router = useRouter();

  const isCurrentUser = (senderId) => {
    return senderId === Cookies.get('UserId');
  };

  // Format message time
  const formatMessageTime = (date) => {
    return format(new Date(date), 'h:mm a');
  };

  // Format message date
  const formatMessageDate = (date) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  // Fetch AI suggestions based on reply context
  const fetchSuggestions = async (previousMessage, currentInput) => {
    if (!previousMessage || !currentInput || currentInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setSuggestionLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/get-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previousMessage,
          currentInput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  // Handle input changes with debounce for suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);
    handleTyping();

    // Clear previous timer if exists
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }

    // Only show suggestions when replying and user is typing
    if (replyingTo) {
      // Set a new timer to fetch suggestions after user stops typing for 500ms
      suggestionTimerRef.current = setTimeout(() => {
        fetchSuggestions(replyingTo.Message, value);
      }, 500);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setMessageInput(prev => {
      // If the input already has text, append the suggestion
      if (prev.trim().length > 0) {
        return `${prev} ${suggestion}`;
      }
      return suggestion;
    });
    setShowSuggestions(false);
    inputRef.current.focus();
  };

  // Clear suggestions when not replying
  useEffect(() => {
    if (!replyingTo) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [replyingTo]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch user details
  useEffect(() => {
    if (!UserId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await Axios.get(`${BaseUrl}Sender/details/${UserId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('currentUser')}`,
          },
        });
        if (response.status === 200 || response.status === 201) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [UserId]);

  // Clear chat states when UserId changes
  useEffect(() => {
    setMessages([]);
    setThreads([]);
    setActiveThread(null);
    setReplyingTo(null);
    setUnreadCounts({});
    setNewMessageCount(0);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [UserId]);

  // Initialize socket connection
  useEffect(() => {
    const currentUserId = Cookies.get('UserId');
    if (!currentUserId || !UserId) return;

    socketRef.current = io(SocketUrl, {
      transports: ['websocket'],
      query: { userId: currentUserId },
    });

    // Socket event handlers
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('getAllMessage', currentUserId, UserId);
    });

    socket.on('Message', (receivedThreads) => {
      setThreads(receivedThreads);
      
      // Calculate unread counts
      const counts = {};
      receivedThreads.forEach(thread => {
        counts[thread._id] = thread.lastMessage.status !== 'read' && 
                            !isCurrentUser(thread.lastMessage.Sender._id) ? 
                            thread.count : 0;
      });
      setUnreadCounts(counts);

      // Set the most recent thread as active if none is selected
      if (!activeThread && receivedThreads.length > 0) {
        setActiveThread(receivedThreads[0]._id);
      }
    });

    socket.on('threadMessages', ({ threadId, messages }) => {
      if (threadId === activeThread) {
        setMessages(messages);
      }
    });

    socket.on('added', (newMessage) => {
      // Don't redirect, just update the state
      setThreads(prevThreads => {
        const existingThreadIndex = prevThreads.findIndex(
          t => t._id === newMessage.threadId
        );
        
        if (existingThreadIndex >= 0) {
          const updatedThreads = [...prevThreads];
          updatedThreads[existingThreadIndex] = {
            ...updatedThreads[existingThreadIndex],
            lastMessage: newMessage,
            count: updatedThreads[existingThreadIndex].count + 1
          };
          const [movedThread] = updatedThreads.splice(existingThreadIndex, 1);
          return [movedThread, ...updatedThreads];
        } else {
          return [{
            _id: newMessage.threadId,
            lastMessage: newMessage,
            count: 1
          }, ...prevThreads];
        }
      });
      
      if (activeThread === newMessage.threadId) {
        setMessages(prev => [...prev, newMessage]);
        // Mark as read if it's the active thread
        if (!isCurrentUser(newMessage.Sender._id)) {
          socket.emit('markAsRead', { 
            threadId: newMessage.threadId, 
            userId: currentUserId 
          });
        }
      } else if (!isCurrentUser(newMessage.Sender._id)) {
        // Increment unread count for this thread
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.threadId]: (prev[newMessage.threadId] || 0) + 1
        }));
        // Update new message count
        setNewMessageCount(prev => prev + 1);
      }
    });

    socket.on('replayadded', (replyMessage) => {
      setThreads(prevThreads => {
        const threadId = replyMessage.threadId;
        const threadIndex = prevThreads.findIndex(t => t._id === threadId);
        
        if (threadIndex >= 0) {
          const updatedThreads = [...prevThreads];
          updatedThreads[threadIndex] = {
            ...updatedThreads[threadIndex],
            lastMessage: replyMessage,
            count: updatedThreads[threadIndex].count + 1
          };
          const [movedThread] = updatedThreads.splice(threadIndex, 1);
          return [movedThread, ...updatedThreads];
        }
        return prevThreads;
      });
      
      if (activeThread === replyMessage.threadId) {
        setMessages(prev => [...prev, replyMessage]);
        if (!isCurrentUser(replyMessage.Sender._id)) {
          socket.emit('markAsRead', { 
            threadId: replyMessage.threadId, 
            userId: currentUserId 
          });
        }
      } else if (!isCurrentUser(replyMessage.Sender._id)) {
        // Increment unread count for this thread
        setUnreadCounts(prev => ({
          ...prev,
          [replyMessage.threadId]: (prev[replyMessage.threadId] || 0) + 1
        }));
        // Update new message count
        setNewMessageCount(prev => prev + 1);
      }
    });

    socket.on('messagesRead', ({ threadId }) => {
      // Update message status in the UI
      if (threadId === activeThread) {
        setMessages(prev => prev.map(msg => 
          msg.status !== 'read' && !isCurrentUser(msg.Sender._id) ? 
          { ...msg, status: 'read' } : msg
        ));
      }
    });

    socket.on('userOnline', (userId) => {
      if (userId === UserId) {
        setUserData(prev => ({ ...prev, OnLine: true, lastSeen: null }));
      }
    });

    socket.on('userOffline', (userId) => {
      if (userId === UserId) {
        setUserData(prev => ({ ...prev, OnLine: false }));
      }
    });

    socket.on('typing', ({ threadId, isTyping: typingStatus }) => {
      if (threadId === activeThread) {
        setIsTyping(typingStatus);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, [UserId, activeThread]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (activeThread && UserId && socketRef.current) {
      const currentUserId = Cookies.get('UserId');
      socketRef.current.emit('getThreadMessages', activeThread, currentUserId);
      socketRef.current.emit('markAsRead', { 
        threadId: activeThread, 
        userId: currentUserId 
      });
      
      // Clear unread count for this thread
      setUnreadCounts(prev => ({
        ...prev,
        [activeThread]: 0
      }));
      // Reset new message count when opening thread
      setNewMessageCount(0);
    }
  }, [activeThread, UserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle click outside schedule picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scheduleRef.current && !scheduleRef.current.contains(event.target)) {
        setShowSchedulePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Notify other user that we're typing
    if (socketRef.current && activeThread) {
      socketRef.current.emit('typing', { 
        threadId: activeThread, 
        isTyping: true 
      });
      
      // Set timeout to stop typing indicator after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        socketRef.current.emit('typing', { 
          threadId: activeThread, 
          isTyping: false 
        });
        setIsTyping(false);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  }, [activeThread, typingTimeout]);

  // Send message handler
  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    const currentUserId = Cookies.get('UserId');
    
    const data = {
      Sender: currentUserId,
      Receiver: UserId,
      Message: messageInput,
      threadId: activeThread,
      createdAt: isScheduled && scheduledTime ? new Date(scheduledTime) : new Date(),
      isScheduled: isScheduled && !!scheduledTime,
      scheduledTime: isScheduled ? scheduledTime : null,
      ...(replyingTo && { 
        parentMessageId: replyingTo._id,
        threadId: replyingTo.threadId
      })
    };

    if (socketRef.current && socketRef.current.connected) {
      if (replyingTo) {
        socketRef.current.emit('replayMsg', data);
      } else {
        socketRef.current.emit('addnewMsg', data);
      }
      setMessageInput('');
      setIsScheduled(false);
      setScheduledTime('');
      setReplyingTo(null);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Emoji picker handler
  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    inputRef.current.focus();
  };

  // Schedule message handlers
  const handleScheduleSend = () => {
    setShowSchedulePicker(!showSchedulePicker);
  };

  const handleScheduleTimeChange = (e) => {
    setScheduledTime(e.target.value);
    setIsScheduled(true);
  };

  // Reply handler
  const handleReply = (message) => {
    setReplyingTo(message);
     setMessageInput(``);
    inputRef.current.focus();
    setShowSuggestions(true);
  };

  // Thread selection handler
  const handleThreadSelect = (threadId) => {
    setActiveThread(threadId);
    setReplyingTo(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Video call handler
  const handleVideoCall = () => {
    setPage(prev => !prev);
    handleCallInitiate();
  };

  // Message status indicator
  const renderMessageStatus = (message) => {
    if (!isCurrentUser(message.Sender._id)) return null;
    
    return (
      <span className="ml-1 text-xs">
        {message.status === 'read' ? (
          <BsCheck2All className="text-blue-400" />
        ) : message.status === 'delivered' ? (
          <BsCheck2All />
        ) : (
          <BsCheck2All className="opacity-50" />
        )}
      </span>
    );
  };

  return (
    <div className={`h-screen flex ml-0 w-full flex-col bg-transparent shadow-[inset_0_0_20px_2px_rgba(255,255,255,0.3)]`}>
      {isMobile && (
        <button 
          onClick={() => setShowChat(false)}
          className="md:hidden flex items-center gap-2 p-2 text-white"
        >
          <IoArrowBack /> Back
        </button>
      )}
      <AcceptedList showChat={showChat} setShowChat={setShowChat}/>
     {ChatPage&&!Meta ? (
        <>
          <div className="flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[15%] bg-black/10 mx-auto mt-2">
            <div className="flex items-center gap-4">
              {userData?.Profile ? (
                <Image
                  src={userData.Profile}
                  alt={`${userData.name}'s profile`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full border-2 border-white bg-black-600 text-white flex items-center justify-center text-xl font-semibold">
                  {userData?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex flex-col justify-center p-0">
                <h2 className="text-white text-md font-semibold">
                  {userData?.name || 'Loading...'}
                </h2>
                <h3 className={`text-sm ${
                  userData?.OnLine ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {userData?.OnLine ? 'Online' : 
                   userData?.lastSeen ? `Last seen ${formatDistanceToNow(new Date(userData.lastSeen))} ago` : 'Offline'}
                </h3>
                {isTyping && (
                  <span className="text-xs text-gray-400">typing...</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="border border-white/30 cursor-pointer transition-all duration-200 hover:border-black/30 hover:bg-white/10 hover:scale-105 rounded">
               
            <FcVideoCall className="w-12 h-auto cursor-pointer" onClick={handleVideoCall} />
              </div>
              {newMessageCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newMessageCount}
                </span>
              )}
            </div>
          </div>

          {/* Thread selector */}
          <div className="flex border-b border-white/20 bg-black/10 py-2 px-4 gap-2 h-[40px] items-center no-scrollbar">
            {threads.map(thread => (
              <button
                key={thread._id}
                onClick={() => handleThreadSelect(thread._id)}
                className={`px-3 py-1 min-h-[30px] rounded-full text-sm whitespace-nowrap relative flex items-center ${
                  activeThread === thread._id 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {thread.count > 1 ? `Thread (${thread.count})` : 'New Message'}
                {unreadCounts[thread._id] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCounts[thread._id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col overflow-y-auto justify-between h-full w-[98%] mx-auto mt-2 mb-2 border border-white/20 rounded bg-white/5">
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
              style={{ maxHeight: 'calc(100% - 80px)' }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p>No messages yet</p>
                  <p>Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrent = isCurrentUser(msg.Sender._id);
                  const isLive = new Date(msg.createdAt) <= new Date();
                  const showDate = index === 0 || 
                    formatMessageDate(messages[index-1].createdAt) !== formatMessageDate(msg.createdAt);

                  if (!isLive && !isCurrent) return null;

                  return (
                    <div key={msg._id || index} className="space-y-2">
                      {showDate && (
                        <div className="text-center text-xs text-gray-400 my-2">
                          {formatMessageDate(msg.createdAt)}
                        </div>
                      )}
                      <div className={`flex ${isCurrent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col items-${isCurrent ? 'end' : 'start'} max-w-[70%]`}>
                          {msg.parentMessage && (
                            <div className={`text-xs mb-1 p-1 rounded ${
                              isCurrent ? 'bg-green-700/50 text-gray-200' : 'bg-gray-700 text-gray-300'
                            }`}>
                              Replying to: {msg.parentMessage.Message}
                            </div>
                          )}
                          <div
                            className={`${
                              isCurrent ? 'bg-green-600' : 'bg-gray-700'
                            } text-white px-4 py-2 rounded-lg flex items-center gap-1`}
                          >
                            {msg.Message}
                            {isCurrent && !isLive && <BsClockHistory className="ml-1 cursor-pointer" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                            {renderMessageStatus(msg)}
                            {!isCurrent && (
                              <button 
                                onClick={() => handleReply(msg)}
                                className="text-xs text-gray-400 hover:text-white cursor-pointer"
                                title="Reply"
                              >
                                <BsReply />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollEndRef} />
            </div>
                        <div className="relative -mt-50 ml-[87%] item-end corsor-pointer" onClick={()=>{SetMeta(true)}}>
                          <Metas/>
                          </div>

            {/* Reply preview */}
            {replyingTo && (
              <div className="bg-gray-800 p-2 border-t border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-300">
                  Replying to: <span className="text-white">{replyingTo.Message}</span>
                </div>
                <button 
                  onClick={() => {
                    setReplyingTo(null);
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}

            {/* AI Suggestions */}
            {showSuggestions && replyingTo && suggestions.length > 0 && (
              <div className="bg-gray-800 p-2 border-t border-gray-700">
                <div className="text-xs text-gray-300 mb-1">AI Suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative border-t border-white/10 p-3 flex items-center gap-2 bg-black/10">
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
                onFocus={() => {
                  if (replyingTo && messageInput.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow click events to register
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white placeholder-gray-300 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />

              <div className="relative flex" ref={scheduleRef}>
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition flex items-center"
                  title="Send message"
                  disabled={!messageInput.trim()}
                >
                  {isScheduled ? <BsClockHistory /> : <IoSend />}
                </button>
                <button
                  onClick={handleScheduleSend}
                  className="px-2 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition flex items-center"
                  title="Schedule message"
                >
                  <RiArrowDropDownLine />
                </button>
                
                {showSchedulePicker && (
                  <div className="absolute bottom-12 right-0 z-10 bg-gray-800 p-3 rounded-lg shadow-lg w-64">
                    <div className="text-white text-sm mb-2">Schedule Message</div>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={handleScheduleTimeChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => {
                          setIsScheduled(false);
                          setScheduledTime('');
                          setShowSchedulePicker(false);
                        }}
                        className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleSendMessage();
                          setShowSchedulePicker(false);
                        }}
                        className="px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-500"
                        disabled={!scheduledTime}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : Meta==true?(
        <MetaChat/>
      ): (
        <RightBar />
      )}
      
    </div>
  );
}