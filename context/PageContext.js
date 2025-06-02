// context/PageContext.js
'use client'; // required if you're using useState/useContext etc.

import { createContext, useContext, useState } from 'react';

export const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [ChatPage,SetChatPage]=useState(false)
  const [page, setPage] = useState(true);
  const [UserId, SetUserId] = useState("");
  const [inCommingCallId, SetIncommingCallId] = useState("");
  const [callRemoteUserId, SetCallRemoteUserId] = useState("");
  const [isCaller, SetIsCaller] = useState(false);

  return (
    <PageContext.Provider value={{ page, setPage,UserId,SetUserId,ChatPage,SetChatPage,inCommingCallId,SetIncommingCallId,callRemoteUserId, SetCallRemoteUserId,isCaller, SetIsCaller}}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);
