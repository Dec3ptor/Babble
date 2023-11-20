// import {handler} from "../pages/api/generateKeys";
import PusherJs from "pusher-js";
import { pusher } from "../context/pusherContext";
// let pusher: PusherJs;


import {
  Box,
  Button,
  Code,
  Flex,
  Grid,
  Input,
  Spinner,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FormEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Payload, PusherContext } from "../context/pusherContext";


// Import module into your application
const crypto = require('crypto');
var webcrypto = require("webcrypto")
// // 256-bit key for AES-256
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16); // Initial Vector for AES

// Hardcoded 256-bit key (32 bytes) for AES-256
// Make sure to use a secure, random key in production
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');

// Hardcoded IV (16 bytes)
// The IV should be unique for each encryption but does not need to be secret
const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');




function encryptMessage(message: string, key: Buffer, iv: Buffer): string {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(message);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

function decryptMessage(message: string, key: Buffer, iv: Buffer): string {
  if (!message) return ''; // Return an empty string or handle as appropriate

  let encryptedText = Buffer.from(message, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// export async function fetchPublicKey() {
//   const response = await fetch('/api/generateKeys');
//   console.log('response:', response);
//   const keys = await response.json();
//   console.log('keys:', keys);
//   // Use keys.publicKey and store keys.privateKey securely
// }

function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [message, setMessage] = useState([{} as Payload]);
  const [stopCount, setStopCount] = useState(1);

  const buttonRef = useRef<any>(null);
  const messageRef = useRef<null | HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  // const [isOtherUserTyping, setisOtherUserTyping] = useState(false);
  const [lastTypingStatusSent, setLastTypingStatusSent] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // A random delay to *ATTEMPT* to prevent multiple connections beyond room the limits
  const delay = Math.floor(Math.random() * 10000 + 1);

  const {
    sendMessage,
    joinChannel,
    channelId,
    userId,
    payload,
    foundUser,
    userQuit,
    setUserQuit,
    setStop,
    stop,
    setFoundUser,
  } = useContext(PusherContext);

  let typingTimeout;

  useMemo(() => {
    if (payload.message && payload.user !== userId) {
      console.log('Payload Message:', payload.message);
  
      setMessage((prev: any) => [
        ...prev,
        {
          message: decryptMessage(payload.message, key, iv),
          user: payload.user
        },
      ]);
    }
  }, [payload.message, payload.user, userId]);
  

  const chatBoxBackground = useColorModeValue("white", "whiteAlpha.200");
  const borderColor = useColorModeValue("gray.400", "gray.900");

  const isOtherUserTyping = useMemo(() => {
    return Array.from(typingUsers).some((id) => id !== userId);
  }, [typingUsers, userId]);

  function handleStopButton() {
    setStopCount((prev) => prev + 1);
    setStop(true);
    setFoundUser(false);

    if (stopCount > 1) {
      window.location.reload();
    } else if (userQuit) {
      window.location.reload();
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!newMessage.trim()) {
      return;
    }
    const encryptedMessage = encryptMessage(newMessage, key, iv);
    console.log("newMessage: ", newMessage, "encryptedMessage: ", encryptedMessage);
    
    // Add the unencrypted message to the chat for the sender
    setMessage(prev => [...prev, { message: newMessage, user: userId }]);
  
    setNewMessage(""); 
    await sendMessage(encryptedMessage); // Send encrypted message
  }
  
  


  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape") { // maybe disable the escape to stop chat thing, maybe not
        e.preventDefault();
        handleStopButton();
        return;
      }
    });
  }

  // SCROLL TO END CODE
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [payload.message, userQuit, stop, isOtherUserTyping]); // remove the isothertyping to stop if going down derp

  useEffect(() => {
    setTimeout(() => joinChannel(), delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTyping = async (isCurrentlyTyping: boolean) => {
    // Check if the typing status has changed
    if (isCurrentlyTyping !== lastTypingStatusSent) {
      setIsTyping(isCurrentlyTyping);
      setLastTypingStatusSent(isCurrentlyTyping);
  
      try {
        await fetch('/api/notifyTyping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelId,
            userId,
            isTyping: isCurrentlyTyping,
          }),
        });
      } catch (error) {
        console.error('Error sending typing notification', error);
      }
    }
    // Update the set of typing users
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyTyping) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };
  
  
  useEffect(() => {
    if (!channelId || !pusher) return;
  
    const channel = pusher.subscribe(channelId);
    console.log(`Subscribed to channel: ${channelId}`);
    
    channel.bind('typing', (data: any) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });
  
    // return () => {
    //   channel.unbind_all();
    //   channel.unsubscribe();
    // };
  }, [channelId, userId]);
  
  useEffect(() => {
    const isCurrentlyTyping = newMessage.trim() !== '';
    handleTyping(isCurrentlyTyping);
  }, [newMessage]);
  
  
  const handleInputChange = (e: any) => {
    setNewMessage(e.target.value);
  };
  

  // if (typeof window !== "undefined") {
  //   window.addEventListener("beforeunload", (e) => {
  //     e.returnValue = "Are you sure you want to leave? You will lose your chat";
  //   });
  // }

  return (
    <Grid
      width="100%"
      templateRows="1fr 90px"
      minHeight="100%"
      maxWidth="1440px"
      margin="0 auto"
      gap={"2"}
      p={{ md: "4", base: "0" }}
    >
      <Box
        borderTopRadius={{ md: 10, base: "unset" }}
        backgroundColor={chatBoxBackground}
        border="1px solid"
        borderColor={borderColor}
        height="100%"
        position={"relative"}
        overflow="hidden"
      >
        <Box
          overflowY="auto"
          position="absolute"
          inset={0}
          px={3}
          py={2}
          lineHeight={1.6}
        >
          {/* <Box mb={4}>
            <Text fontWeight="bold">** DEBUG **</Text>
            <Text>
              My ID: <Code as="span">{userId}</Code>{" "}
            </Text>
            <Text>
              Room ID: <Code as="span">{channelId}</Code>
            </Text>
          </Box> */}

          {foundUser ? (
            <Text fontSize="sm" fontWeight="bold">
              You&apos;re now chatting with a random stranger.
            </Text>
          ) : !userQuit && !stop ? (
            <Flex>
              <Spinner mr={2} />
              <Text fontSize="sm" fontWeight="bold">
                Looking for someone you can chat with...
              </Text>
            </Flex>
          ) : (
            <Text fontSize="sm" fontWeight="bold">
              You&apos;re now chatting with a random stranger.
            </Text>
          )}

            
            {message.map((msg: any, index) => (
              <Box key={index}>
                {msg?.user !== userId && msg?.user?.length > 0 ? (
                  <Text as="strong" color="red.400">
                    Stranger:{" "}
                  </Text>
                ) : (
                  msg?.user?.length > 0 && (
                    <Text as="strong" color="blue.400">
                      You:{" "}
                    </Text>
                  )
                )}
                {msg?.message?.length > 0 && (
                  <Text ref={messageRef} display="inline-block">
                    {msg?.message}
                  </Text>
                )}
              </Box>
            ))}
            
          
            {isOtherUserTyping && (
              <Text color="gray.500" fontSize="sm" mt={2} mb={2}>
                Stranger is typing...
              </Text>
            )}

          {userQuit ? (
            <Text fontSize="sm" fontWeight="bold">
              Stranger has disconnected!
            </Text>
          ) : (
            stop && (
              <Text fontSize="sm" fontWeight="bold">
                You have disconnected!
              </Text>
            )
          )}
        </Box>
      </Box>

      <Flex gap={2} as="form" onSubmit={onSubmit}>
        <Button
          ref={buttonRef}
          width={"150px"}
          borderRadius="none"
          borderBottomLeftRadius={{ md: 10, base: "unset" }}
          flexDir="column"
          blockSize="100%"
          border={"1px solid"}
          borderColor={borderColor}
          color={stop || userQuit ? "white" : "unset"}
          backgroundColor={stop || userQuit ? "blue.500" : chatBoxBackground}
          gap={1}
          onClick={handleStopButton}
          type="button"
        >
          {stop || userQuit ? <Text>New</Text> : <Text>Stop</Text>}
          <Text
            display={{ md: "unset", base: "none" }}
            fontFamily="monospace"
            fontSize="sm"
            color="blue.300"
          >
            Esc
          </Text>
        </Button>
        <Input
            onChange={handleInputChange} // Keep this handler
            value={newMessage}
            variant="unstyled"
            px={2}
            pb={10}
            height="100%"
            resize="none"
            border={"1px solid"}
            borderRadius="none"
            borderColor={borderColor}
            backgroundColor={chatBoxBackground}
            disabled={!foundUser}
          />

        <Button
          display={{ md: "flex", base: "none" }}
          width={"150px"}
          borderRadius="none"
          borderBottomRightRadius={10}
          flexDir="column"
          blockSize="100%"
          border={"1px solid"}
          borderColor={borderColor}
          backgroundColor={chatBoxBackground}
          type="submit"
          disabled={!foundUser}
          gap={1}
        >
          <Text>Send</Text>
          <Text fontFamily="monospace" fontSize="sm" color="blue.300">
            Enter
          </Text>
        </Button>
      </Flex>
    </Grid>
  );
}

export default Chat;
