import axios from "axios";
import PusherJs from "pusher-js";
import { createContext, useEffect, useState } from "react";
// import { fetchPublicKey } from "../components/Chat";

type Props = {
  children: React.ReactNode;
};

type Context = {
  joinChannel: () => Promise<void>;
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
  const [isGroupChat, setIsGroupChat] = useState(false); // You can set the default based on your needs

  if (stop) {
    pusher.disconnect();
  }



  async function joinChannel() {
    const availableRoom = await axios.get("/api/searchUser");
    const { data } = availableRoom;

    setChannelId(data.pusherId);
    const pusherId = data.pusherId;

    const channel = pusher?.subscribe(pusherId);



  // // Generate key pair
  // const { publicKey, privateKey } = await fetchPublicKey();

    // CHANNEL JOIN CODE
    channel.bind(
      "pusher:subscription_succeeded",
      async (data: PresenceChannel) => {
        setUserId(data.myID);
        // Update userCount in the database
        if (data.count <= 20) {
          await axios.post("/api/room", {
            channelId: pusherId,
            userCount: data.count,
          });
          setFoundUser(true);
          // if (data.count === 3) {
          //   // Unlock and start chat
          //   setFoundUser(true);
          // }
          setUserCount(data.count);
        } else {
          alert("This room is full, Please try again...");
          pusher.disconnect();
          window.location.reload();
        }
      }
    );

    channel.bind("message", (data: any) => {
      // console.log("DATA FROM JOIN CHANNEL", data.message);
      setPayload({ message: data.message, user: data.userId });
    });

    channel.bind("pusher:member_added", (member: any) => {
      // console.log("Hello from member_added event", member.id);
      setFoundUser(true);
    });


    channel.bind("pusher:member_removed", async (member: any) => {
      // Decrement the user count or fetch the new count
      const newCount = data.count; 
      
      // FOR GROUP CHAT ITS 0, FOR 1v1 ITS 1
      if (newCount === 0) {
        // No more members in the channel, close the room
        await axios.post("/api/room", {
          channelId: pusherId,
          isClosed: [true],
        });
      }
    
      if (member.id === userId) {
        // The current user is the one who left
        setUserQuit(true);
        setFoundUser(false);
      }
    });
  }

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
    if (startPusher) {
      if (process.env.NODE_ENV !== "production") {
        // Enable pusher logging - isn't included in production
        PusherJs.logToConsole = true;
      }

      pusher = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
        forceTLS: true,
        authEndpoint: "api/pusher/auth",
      });
    }
  }, [startPusher]);

  return (
    <PusherContext.Provider value={pusherCtx}>
      {children}
    </PusherContext.Provider>
  );
};
