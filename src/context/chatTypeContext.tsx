// ChatTypeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatType = 'SINGLE' | 'GROUP';

interface ChatTypeContextProps {
  chatType: ChatType;
  setChatType: (chatType: ChatType) => void;
}

const ChatTypeContext = createContext<ChatTypeContextProps | undefined>(undefined);

export const useChatType = () => {
  const context = useContext(ChatTypeContext);
  if (!context) {
    throw new Error('useChatType must be used within a ChatTypeProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const ChatTypeProvider: React.FC<Props> = ({ children }) => {
  const [chatType, setChatType] = useState<ChatType>('SINGLE');

  return (
    <ChatTypeContext.Provider value={{ chatType, setChatType }}>
      {children}
    </ChatTypeContext.Provider>
  );
};
