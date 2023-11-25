import { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "../../../utils/server.pusher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id, channel_name, username, type} = req.body;
  // console.log("FROM AUTH: ", req.body);

  // const authResponse = pusher.authorizeChannel(socket_id, channel_name);
  // res.send(authResponse);
  // const username = localStorage.getItem('username') || Math.random().toString(36).slice(2);

  // PRESENCE CHANNEL AUTH
  const randomString = Math.random().toString(36).slice(2);
  const presenceData = {
    user_id: "User-" + randomString,
    type: type // Include the chat type here
    // user_info: { username: username || 'user_id' } // Include the username in user_info
  };
  try {
    const authResponse = pusher.authorizeChannel(
      socket_id,
      channel_name,
      presenceData
    );
    res.send(authResponse);
  } catch (error) {
    console.error("/API/PUSHER/AUTH ERROR: ", error);
  }
}
