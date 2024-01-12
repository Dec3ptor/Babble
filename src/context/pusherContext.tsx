import axios from "axios";
import PusherJs from "pusher-js";
import { createContext, useEffect, useState } from "react";
// import { fetchPublicKey } from "../components/Chat";
import { useChatType } from '../context/chatTypeContext';
import { debug } from "../../src/utils/debug";



type Props = {
  children: React.ReactNode;
};

type Context = {
  joinChannel: (username: string, chatType: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  setChannelId: React.Dispatch<React.SetStateAction<string>>;
  channelId: string;
  userId: string;
  payload: Payload;
  setStartPusher: React.Dispatch<React.SetStateAction<boolean>>;
  foundUser: boolean;
  setUserQuit: React.Dispatch<React.SetStateAction<boolean>>;
  userCount: number;
  userQuit: boolean;
  setFoundUser: React.Dispatch<React.SetStateAction<boolean>>;
  setStop: React.Dispatch<React.SetStateAction<boolean>>;
  stop: boolean;
};

type PresenceChannel = {
  members: {};
  count: number;
  me: {
    id: string;
    info?: any;
  };
  myID: string;
};

export type Payload = {
  message: string;
  user: string;
};

export let pusher: PusherJs;

export const PusherContext = createContext<Context>({} as any);

export const PusherProvider = ({ children }: Props) => {
  const [channelId, setChannelId] = useState("");
  const [userId, setUserId] = useState("");
  const [payload, setPayload] = useState<Payload>({} as Payload);
  const [startPusher, setStartPusher] = useState(false);
  const [foundUser, setFoundUser] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [userQuit, setUserQuit] = useState(false);
  const [stop, setStop] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  if (stop) {
    pusher.disconnect();
  }
// Add a type for the callback function
type UpdateUserCountCallback = (updatedUserCount: number) => void;

  // Function to update the user count in the database
  const updateRoomUserCount = async (channelId: any, change: any) => {
    try {
      await axios.post('/api/updateRoomUserCount', {
        channelId,
        change
      });
    } catch (error) {
      console.error("Error updating room user count:", error);
    }
  };
  
  const fetchRoomUserCount = async (channelId: any) => {
    try {
      const response = await axios.get(`/api/getRoomUserCount?channelId=${channelId}`);
      return response.data.userCount;
    } catch (error) {
      console.error("Error fetching room user count:", error);
      return null; // or handle the error as per your app's requirements
    }
  };
  
  async function joinChannel(username: string, chatType: string) {
    if (debug) {
      console.error("chatType in Pushercontext.tsx: joinChannel:", chatType);
    }
  
    if (!username && debug) {
      console.log("Username not set");
    }
  
    const availableRoom = await axios.get("/api/searchUser", {
      params: { chatType }
    });
    const { data } = availableRoom;
    const maxUserCount = chatType === 'GROUP' ? 20 : 2;
  
    if (debug) {
      console.error("isGroupChat: ", chatType, "maxUserCount: ", maxUserCount);
    }
  
    setChannelId(data.pusherId);
    const pusherId = data.pusherId;
  
    if (!pusher) {
      if (debug) {
        console.error("Pusher is not initialized");
      }
      return;
    }
  
    const channel = pusher.subscribe(pusherId);
  
    if (channel) {
      channel.bind("pusher:subscription_succeeded", async (data: PresenceChannel) => {
        if (debug) {
          console.log("Subscription succeeded. Member count:", data.count);
        }
        setUserId(data.myID);
  
        if (data.count <= maxUserCount) {
          await axios.post("/api/room", {
            channelId: pusherId,
            userCount: data.count,
            type: chatType,
          });
          if (data.count > 1) {
            setFoundUser(true);
          }
          setUserCount(data.count);
          // if (channelId) {
          //   fetchCount();
          // }
          // console.error("Current userCount: ", fetchRoomUserCount(channelId));
  
        } else {
          alert("This room is full, please try again...");
          pusher.disconnect();
          window.location.reload();
        }
      });
      
      // Function to check the room status and close if necessary
      const checkAndCloseRoom = async (channelId: any) => {
        const currentCount = await fetchRoomUserCount(channelId);
        if (currentCount <= 1) {
          // Close the room logic
          try {
            await axios.post("/api/room", {
              channelId,
              isClosed: true,
            });
            setUserQuit(true);
            setFoundUser(false);
            channelId = '';
          } catch (error) {
            console.error("Error closing room:", error);
          }
        }
      };

      channel.bind("pusher:member_added", async (member: any) => {
        if (debug) {
          console.log("Member added:", member.id);
        }
        await updateRoomUserCount(pusherId, 1);
        setFoundUser(true);
        // if (channelId) {
        //   fetchCount();
        // }
        // console.error("Current userCount: ", fetchRoomUserCount(channelId));

      });
  
      channel.bind("pusher:member_removed", async (member: any) => {
        if (debug) {
          console.log("Member removed:", member.id);
        }
        
      // On other clients
      channel.bind('video-state-change', (data: any) => {
        // Handle the video state change
        // Example: Seek the video player to data.currentTime, play or pause based on data.isPlaying
      });

    
        // if (channelId) {
        //   fetchCount();
        // }
        // console.error("Current userCount: ", fetchRoomUserCount(channelId));

          // if (userCount <= 1) { // NEED TO CHANGE SO IF 0, OR SINGLE CHAT
          //   if (debug) {
          //     console.error("Closing Room");
          //   }

          //   axios.post("/api/room", {
          //     channelId: pusherId,
          //     isClosed: true,
          //   }).then(() => {
          //     if (debug) {
          //       console.error("member.id: ", member.id, ", userId: ", userId);
          //     }
          //     setUserQuit(true);
          //     setFoundUser(false);
          //     // if (member.id === userId) {
          //     //   setUserQuit(true);
          //     //   setFoundUser(false);
          //     // }
          //   }).catch((error) => {
          //     console.error("Error closing room:", error);
          //   });
          // }
          await updateRoomUserCount(pusherId, -1);
          checkAndCloseRoom(pusherId);
        });



          // Check the updated user count and close the room if necessary
          const fetchCount = async () => {
            const count = await fetchRoomUserCount(channelId);
            if (count !== null) {
              setUserCount(count);
            }
          };

      channel.bind("message", (data: any) => {
        setPayload({ message: data.message, user: data.userId });
      });
    } else {
      if (debug) {
        console.error("Failed to subscribe to the channel: ", pusherId);
      }
    }
  }
  
//   channel.bind("pusher:member_removed", async (member: any) => {
//     // console.log("Goodbye from member_removed event", member.id);
//     await axios.post("/api/room", {
//       channelId: pusherId,
//       isClosed: true,
//     });

//     setUserQuit(true);
//     setFoundUser(false);
//     // alert("Developer has disconnected!");
//   });
// }

  async function sendMessage(text: string) {
    await axios.post("/api/pusher", {
      channelId: channelId,
      message: text,
      userId: userId,
    });
  }

  const pusherCtx = {
    joinChannel,
    sendMessage,
    setChannelId,
    channelId,
    userId,
    payload,
    setStartPusher,
    foundUser,
    setUserQuit,
    userCount,
    userQuit,
    setStop,
    stop,
    setFoundUser,
    pusher,
    isOtherUserTyping,
  };

  useEffect(() => {
    if (debug) {
      console.log("Initializing Pusher:", startPusher);
    }

    if (startPusher) {
      if (process.env.NODE_ENV !== "production" || debug == true) {
        // Enable pusher logging - isn't included in production
        PusherJs.logToConsole = true;
      }

    // Initialize Pusher
    pusher = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      forceTLS: true,
      authEndpoint: "/api/pusher/auth",
    });
    if (debug) {
      console.log("Pusher initialized", pusher); // Debugging line
    }
    }

    //     if (!stop && pusher) {
    //   joinChannel('BOB', 'GROUP');
    // }

  }, [startPusher, stop]);

  return (
    <PusherContext.Provider value={{...pusherCtx, joinChannel}}>
      {children}
    </PusherContext.Provider>
  );
};