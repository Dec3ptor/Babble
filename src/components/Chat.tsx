// import {handler} from "../pages/api/generateKeys";
import PusherJs from "pusher-js";
import { pusher } from "../context/pusherContext";
// let pusher: PusherJs;
import Pusher, { Channel } from 'pusher-js';
import { useRouter } from 'next/router';
import { debug } from "../../src/utils/debug";


import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
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
import { PusherContext } from "../context/pusherContext";

interface Payload {
  message: string;
  user?: string; // Make username optional
  color: string;
  type?: string; // Optional type property to distinguish system messages
}

type ChatProps = {
  chatType: string; // Add this line to define the chatType prop
  onReset: () => void; // Add this line
};

// Import module into your application
const crypto = require('crypto');
var webcrypto = require("webcrypto")
// // 256-bit key for AES-256ß
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16); // Initial Vector for AES

// Hardcoded 256-bit key (32 bytes) for AES-256
// Make sure to use a secure, random key in production
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');

// Hardcoded IV (16 bytes)
// The IV should be unique for each encryption but does not need to be secret
const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');


// Define a set of bright primary colors
const colorOptions = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF']; // Added white color

// function encryptMessage(message: string, key: Buffer, iv: Buffer): string {
//   let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
//   let encrypted = cipher.update(message);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return encrypted.toString('hex');
// }

// function decryptMessage(message: string, key: Buffer, iv: Buffer): string {
//   if (!message) return ''; // Return an empty string or handle as appropriate

//   let encryptedText = Buffer.from(message, 'hex');
//   let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// }






// export async function fetchPublicKey() {
//   const response = await fetch('/api/generateKeys');
//   console.log('response:', response);
//   const keys = await response.json();
//   console.log('keys:', keys);
//   // Use keys.publicKey and store keys.privateKey securely
// }


function Chat({ chatType }: ChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [stopCount, setStopCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(true); // State to control modal visibility
  const [userColor, setUserColor] = useState('#FFFFFF'); // Default to white color
  const [username, setUsername] = useState("");
  const [roomCount, setRoomCount] = useState(0);
  const [message, setMessage] = useState<(Payload | SystemMessage)[]>([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [hasJoinedChannel, setHasJoinedChannel] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);

  const buttonRef = useRef<any>(null);
  const messageRef = useRef<null | HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [chatMode, setChatMode] = useState<'SINGLE' | 'GROUP' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState(new Set());
  const router = useRouter();

  // const { type } = router.query; // Access query parameters
  // console.log('Router query type:', type);
    

  // A random delay to *ATTEMPT* to prevent multiple connections beyond room the limits
  const delay = Math.floor(Math.random() * 10000 + 1);
  // console.log('Chat type prop:', chatType);
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

  const handleColorSelect = (color: any) => {
    setUserColor(color);
  };

    // Set the initial modal state based on the chatType
    useEffect(() => {
      setIsModalOpen(chatType === 'GROUP');
      if (chatType === 'SINGLE') {
        setUsername(''); // Default username for 'SINGLE' chatType
      }
    }, [chatType]);

      // Modified message rendering logic
  // Updated renderMessages function for handling single and group chat
  const renderMessages = () => {
    return message
      .filter((msg) => msg.message && msg.message.trim() !== '')
      .map((msg, index) => {
        if (chatType === 'SINGLE') {
          // Render messages for SINGLE chat type
          const userLabel = msg.user !== userId ? "Stranger: " : "You: ";
          const userColor = msg.user !== userId ? "red.400" : "blue.400";
          return (
            <Box key={index}>
              <Text as="strong" color={userColor}>
                {userLabel}
              </Text>
              <Text ref={messageRef} display="inline-block">{msg.message}</Text>
            </Box>
          );
        } else {
              // Render messages for GROUP chat type
              return (
                <Box key={index}>
                  <Text as="strong" style={{ color: msg.color || '#000000' }}>
                    {msg.user !== username && msg.user !== userId ? `${msg.user}: ` : "You: "}
                  </Text>
                  {
                    msg.message.match(/\.(jpeg|jpg|gif|png|svg)$/) || msg.message.startsWith("data:image/") ?
                      <img src={msg.message} alt="Sent Image" style={{ maxWidth: '100%', height: 'auto' }} /> :
                      <Text ref={messageRef} display="inline-block">{msg.message}</Text>
                  }
                </Box>
              );
            }
          });
      };

  // function encryptPayload(payload: ChatPayload, key: Buffer, iv: Buffer): string {
  //   const payloadString = JSON.stringify(payload);
  //   let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  //   let encrypted = cipher.update(payloadString);
  //   encrypted = Buffer.concat([encrypted, cipher.final()]);
  //   return encrypted.toString('hex');
  // }


  // function decryptPayload(encryptedPayload: string, key: Buffer, iv: Buffer): ChatPayload {
  //   if (!encryptedPayload) return { message: '', username: '', color: '#000000' };

  //   let encryptedText = Buffer.from(encryptedPayload, 'hex');
  //   let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  //   let decrypted = decipher.update(encryptedText);
  //   decrypted = Buffer.concat([decrypted, decipher.final()]);
  //   const payload = JSON.parse(decrypted.toString());

  //   // // Print the decrypted results to the console
  //   // console.log("Decrypted Payload:", payload);
  //   // setUserColor(payload.color);
  //   // console.log("Decrypted usercolor:", userColor);

  //   return payload;
  // }

  const renderColorOptions = () => {
    return colorOptions.map((color, index) => (
      <div
        key={index}
        onClick={() => handleColorSelect(color)}
        style={{
          backgroundColor: color,
          width: userColor === color ? '20px' : '15px',
          height: userColor === color ? '20px' : '15px',
          borderRadius: '50%',
          margin: '5px',
          cursor: 'pointer',
          border: userColor === color ? '2px solid black' : 'none',
        }}
      ></div>
    ));
  };


  const chatBoxBackground = useColorModeValue("white", "whiteAlpha.200");
  const borderColor = useColorModeValue("gray.400", "gray.900");

  const [isButtonCooldown, setIsButtonCooldown] = useState(false);

  function handleStopButton() {
    if (isButtonCooldown) return; // Prevent action if cooldown is active

    setIsButtonCooldown(true); // Activate cooldown

    // Toggle the state based on the current state and userQuit status
    if (stop || userQuit) {
        // If the chat is already stopped or the user has quit, reinitialize for a new chat
        setStop(false);
        setUserQuit(false);
        setMessage([]); // Clear messages
        reinitializeChat(); // Logic to start a new chat
    } else {
        // Otherwise, stop the current chat
        setStop(true);
        setFoundUser(false);
        
        // Reset chat related states
        // setMessage([]); // Clear messages
        // setPayload({}); // Reset payload
        setRoomCount(0);
        setConnectedUsers(new Set());
        setTypingUsers(new Set());
        setUsername("");
        setUserColor("#FFFFFF");
        setUserQuit(false);
    }

    // Set a timeout to reset the cooldown state
    setTimeout(() => setIsButtonCooldown(false), 500); // 3 seconds cooldown
}

const reinitializeChat = () => {
    // Unsubscribe from the current channel if needed
    if (pusher && channelId) {
        pusher.unsubscribe(channelId);
    }
    
    var reinitDelay = Math.floor(Math.random() * 10000 + 1);
    console.log("reinitDelay in seconds: ", reinitDelay / 1000);

    // Re-subscribe to a new channel
    setTimeout(() => joinChannel(username, chatType), reinitDelay);

    // Reset other states as needed
    setHasJoinedChannel(true);
    payload.message = '';
    payload.user = '';

    // IsOtherUserTyping(false); // Reset typing indicator
}


  useMemo(() => {
    if (payload.message && payload.user !== userId) {
      // Parse the payload message from JSON string to an object
      const parsedPayload = JSON.parse(payload.message);

      // Extract message, username, and color from the parsed payload
      const { message, username, color } = parsedPayload;

      setMessage(prev => [
        ...prev,
        {
          message: message,
          user: username, // Extracted username
          color: color // Extracted color
        },
      ]);
    }
  }, [payload, userId]);



  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!newMessage.trim()) {
      return;
    }

    // Use userId as fallback if username is empty
    const effectiveUsername = username.trim() !== '' ? username : userId;

    const payload = {
      message: newMessage,
      username: effectiveUsername, // Use the effective username
      color: userColor
    };

    // Reset typing status after sending a message. FOR IS TYPING CODE
  if (channelRef.current) {
    try {
      channelRef.current.trigger('client-typing', {
        username: username || userId,
        isTyping: false
      });
    } catch (error) {
      console.error('Error triggering client-typing event:', error);
    }
  }

    // Convert the payload to a JSON string before sending
    const payloadString = JSON.stringify(payload);
    setMessage(prev => [...prev, { message: newMessage, user: effectiveUsername, color: userColor }]);
    setNewMessage("");
    await sendMessage(payloadString); // Send payload as a string

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

  interface SystemMessage {
    message: string;
    user?: string; // Make username optional
    type: 'system';
    color: string;
  }
  
  const isOtherUserTyping = useMemo(() => {
    return Array.from(typingUsers).some((id) => id !== userId);
  }, [typingUsers, userId]);


  // SCROLL TO END CODE
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [payload.message, userQuit, stop, isOtherUserTyping]); // remove the isothertyping to stop if going down derp

  // useEffect(() => {
  //   setTimeout(() => joinChannel(username, chatType), delay);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const channelRef = useRef<Channel | null>(null);
  
  
  useEffect(() => {
    if ((!channelId || !pusher) || (!isUsernameSet && chatType == 'GROUP')) return;
    
    if (chatType == "GROUP"){
      setChatMode('GROUP');
      setIsGroupChat(true);
      // console.error("Chat.tsx: GROUP");
    }
    else
    {
      setChatMode('SINGLE');
      setIsGroupChat(false);      
      // console.error("Chat.tsx: SINGLE");
    }
    
    // Construct the presence channel name with 'presence-' prefix
    const presenceChannelName = `${channelId}`;
    const presenceChannel = pusher.subscribe(presenceChannelName);
    
    if (!presenceChannel) {
      console.error("Failed to subscribe to the channel");
      return;
    }

    if (presenceChannel) {
      presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
        console.log('Number of members:', members.count);

        // Directly use the members object if it already contains the data
        const memberCount = members.count;
        const memberIds = members.ids;
      
        setRoomCount(memberCount);
        setConnectedUsers(new Set(memberIds)); // Set the connected users        
      });
      // Other event bindings...
          // Handle member addition
    presenceChannel.bind('pusher:member_added', (member: any) => {
      setConnectedUsers(prev => {
        const updatedSet = new Set(prev);
        updatedSet.delete(member.id);
        return updatedSet;
      });
      setConnectedUsers(prev => new Set(prev).add(member.id));
      const joinMessage: Payload = {
        user: 'System',
        message: `${member.id} joined the chat.`,
        type: 'system',
        color: '#000000'
      };    
      if (chatType == 'GROUP')
      {
        setMessage(prev => [...prev, joinMessage]);
      }
      setRoomCount(prevCount => prevCount + 1);
      
    });

    // Handle member removal
    presenceChannel.bind('pusher:member_removed', (member: any) => {
      const leaveMessage = {
        user: 'System',
        message: `${member.id} left the chat.`,
        type: 'system',
        color: '#000000'
      };
      if (chatType == 'GROUP')
      {
        setMessage(prev => [...prev, leaveMessage]);
      }
      setRoomCount(prevCount => prevCount - 1);
    });

    presenceChannel.bind('client-typing', (data: any) => {
      if (debug == true)
      {
        console.log(`Received typing event in ${chatType} chat: `, data);
      }
  
      // Update the typing users state
      setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
              newSet.add(data.username);
          } else {
              newSet.delete(data.username);
          }
          return newSet;
      });
  });
  
    } else {
      console.error("Channel object is undefined");
    }


  
    channelRef.current = presenceChannel;

    return () => {
      // Unbind events and unsubscribe from the channel
      presenceChannel.unbind('pusher:subscription_succeeded');
      presenceChannel.unbind('pusher:member_added');
      presenceChannel.unbind('pusher:member_removed');
      presenceChannel.unbind('client-typing');
      pusher.unsubscribe(presenceChannelName);
    };
  }, [channelId, pusher, isUsernameSet, chatType]); // Add isUsernameSet as a dependency
  
  // FOR IS TYPING CODE
  const handleInputChange = (e: any) => {
    setNewMessage(e.target.value);
    const isTyping = e.target.value.length > 0;

    console.log(`handleInputChange: isTyping: ${isTyping}, chatType: ${chatType}`);

    if (channelRef.current) {
        try {
            const typingUser = chatType === 'SINGLE' ? userId : (username || userId);
            channelRef.current.trigger('client-typing', {
                username: typingUser,
                isTyping: isTyping
            });
            console.log(`Typing status sent for ${typingUser}: ${isTyping}`);
        } catch (error) {
            console.error('Error triggering client-typing event:', error);
        }
    }
};


  // Handle click on username input to clear the placeholder if it's the userId
  const handleUsernameClick = () => {
    if (username === userId) {
      setUsername('');
    }
  };

  const handleSaveUsername = () => {
    if (username.length <= 10 && !username.includes(' ')) {
      setIsUsernameValid(true);
      // Add logic to save the username
      setIsUsernameSet(true); // Set this to true when the username is valid and saved
      setIsModalOpen(false);      
      setErrorMessage(''); // Clear any existing error messages
    } else {
      // Set error message
      setErrorMessage('Names must be less than 10 characters and have no spaces!');
    }
  };
  
    // Only call joinChannel when the username is valid
    useEffect(() => {
      if ((isUsernameValid && !hasJoinedChannel) || chatType == 'SINGLE' && !hasJoinedChannel) {
        setTimeout(() => joinChannel(username, chatType), delay);
        setHasJoinedChannel(true);
      }
    }, [isUsernameValid, username, joinChannel]);

  const handleDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        // Check if the result is a string before setting the message
        if (typeof reader.result === 'string') {
          setNewMessage(reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleDrop = (event: any) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Append the base64 image string to your message state
            setNewMessage(prevMessage => prevMessage + '\n' + reader.result);
          }
        };

        reader.readAsDataURL(file);
      }
    };

    const chatBox = messagesContainerRef.current;
    if (chatBox) {
      chatBox.addEventListener('dragover', (e) => e.preventDefault());
      chatBox.addEventListener('drop', handleDrop);
    }

    return () => {
      if (chatBox) {
        chatBox.removeEventListener('dragover', (e) => e.preventDefault());
        chatBox.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

//   <div>
//   <h1>Chat Page</h1>
//   <p>Chat type: {type}</p>
//   {/* Render your chat component based on the 'type' */}
// </div>

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
          ref={messagesContainerRef}
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
          chatType === 'SINGLE' ? (
            <Text fontSize="sm" fontWeight="bold">
              You&apos;re now chatting with a random stranger.
            </Text>
          ) : (
            <Text fontSize="sm" fontWeight="bold">
              You&apos;re now chatting in a group. Your username: <span style={{ color: userColor }}>{username ? username : userId}</span>
            </Text>
          )
        ) : !userQuit && !stop ? (
          <Flex> 
            <Spinner mr={2} />
            <Text fontSize="sm" fontWeight="bold">
              Looking for someone you can chat with...
            </Text>
          </Flex>
        ) : (
          <Text fontSize="sm" fontWeight="bold">
            You&apos;ve disconnected from the chat.
          </Text>
        )}

{renderMessages()}

{chatType === 'SINGLE' && isOtherUserTyping && (
      <Text color="gray.500" fontSize="sm" mt={2} mb={2}>
        Stranger is typing...
      </Text>
    )}
    {chatType === 'GROUP' && isOtherUserTyping && (
  <Text color="gray.500" fontSize="sm" mt={2} mb={2}>
    {(() => {
      const currentIdentifier = username.trim() !== '' ? username : userId;
      const otherTypingUsers = Array.from(typingUsers).filter(id => id !== currentIdentifier);
      const typingCount = otherTypingUsers.length;
      let typingText = '';

      if (typingCount > 3) {
        typingText = `${otherTypingUsers.slice(0, 3).join(', ')} and ${typingCount - 3} more are typing...`;
      } else if (typingCount > 1) {
        typingText = `${otherTypingUsers.join(', ')} are typing...`;
      } else if (typingCount === 1) {
        typingText = `${otherTypingUsers[0]} is typing...`;
      }

      return typingText;
    })()}
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

      {/* Modal for username input */}
      <Modal isOpen={isModalOpen} onClose={() => {}} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter Your Username</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              // placeholder={userId} // Use userId as placeholder
              placeholder={"Random if none set: User-######"} // Use userId as placeholder
              style={{ color: userColor }}
            />
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <FormLabel>Color</FormLabel>
              <div style={{ display: 'flex' }}>{renderColorOptions()}</div>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSaveUsername}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
{/* <Box>
  <Text>Room count: {roomCount}</Text>
  <Text>Connected users:</Text>
  <ul>
    {[...connectedUsers].map(user => (
      <li key={user}>{user}</li>
    ))}
  </ul>
</Box> */}

      <Flex 
      as="form"
      onSubmit={onSubmit}
      gap={2}
      // position="fixed" // Fix the position to the bottom
      bottom="0" // Align to the bottom of the screen
      left="0" // Span the entire width
      right="0"
      zIndex="10" // Optional: Adjust if needed to bring above other content
      // backgroundColor={chatBoxBackground} // Ensures the background is not transparent
      >
        <Button
          ref={buttonRef}
          flex="0 0 150px" // Use flex property to maintain button width
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
          disabled={isButtonCooldown}
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
          onChange={handleInputChange}
          value={newMessage}
          flex="1" // Flex-grow to take available space
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
          display={{ sm: "flex", base: "none" }}
          flex="0 0 150px" // Use flex property to maintain button width
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
