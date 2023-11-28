import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { PusherProvider } from "../context/pusherContext";
import theme from "../utils/theme";
import React, { useState, useEffect } from 'react';
import { ChatTypeProvider } from '../context/chatTypeContext';

export default function App({ Component, pageProps }: AppProps) {
  // Placeholder values. Replace these with actual values from your app's state or context.
  const [username, setUsername] = useState("Stranger");
  const [chatType, setChatType] = useState("SINGLE");
  
  return (
    <ChakraProvider theme={theme}>
      <PusherProvider>
        <ChatTypeProvider>
          <Component {...pageProps} />
        </ChatTypeProvider>
      </PusherProvider>
    </ChakraProvider>
  );
}