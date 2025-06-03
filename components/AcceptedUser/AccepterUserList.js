'use client';
import './accept.css';
import Image from 'next/image';
import images from "../../assets/Images.png";
import { useEffect, useState ,useContext} from 'react';
import Axios from "axios";
import BaseUrl from '../../Service/BaseUrl';
import Cookies from "js-cookie";
import io from 'socket.io-client';
import { PageContext } from "../../context/PageContext";
import SocketUrl from '../../Service/SocketUrl';

let socket;

export default function AcceptedList() {
  const {UserId,SetUserId,ChatPage,SetChatPage} = useContext(PageContext);
  const [User, SetUser] = useState([]);

  useEffect(() => {
    const userId = Cookies.get("UserId");

    socket = io(SocketUrl, {
      transports: ['websocket'], // Force websocket connection
    });

    socket.on('connect', () => {
      socket.emit('getallUser', userId);
      socket.emit('online', userId); 
    });

    socket.on('user', receivedUser => {
      SetUser(receivedUser);
    });

  
    return () => {
      socket.emit('offline', userId);
      socket.disconnect();
    };
  }, []);

  function ChatContinue(ID){
    SetUserId(ID)
    SetChatPage(true)
  }

  return (
    <div className="flex items-center justify-between gap-4 border border-white/20 rounded px-6 py-4 w-[98%] h-[15%] bg-black/10 mx-auto mt-2">
  <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
    {User && User.map((temp, index) => (
      <div
    key={index}
    className="relative cursor-pointer"
    onClick={() => ChatContinue(temp?._id)}
  >
    {temp?.Profile ? (
      <Image
        src={temp?.Profile}
        alt={`logo`}
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
    ></span>
  </div>
    ))}
  </div>
</div>

  );
}
