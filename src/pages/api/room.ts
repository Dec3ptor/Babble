import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../utils/server.prismadb";
import { useChatType } from '../../context/chatTypeContext';

export default async function room(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { channelId, userCount, isClosed, type} = req.body;
    // const { chatType } = useChatType();

    // Determine the maximum number of users based on chat type
    const maxUserCount = type === 'GROUP' ? 20 : 2;
    console.log("ROOM.TS: maxUserCount ", maxUserCount);

    // Update isFull to close the room if it reaches maximum capacity
    if (userCount === maxUserCount) {
      await db.rooms.update({
        data: { isFull: true },
        where: { pusherId: channelId },
      });
    } 
    
    // DONT KNOW IF EVEN WORKING
    else
    {
      await db.rooms.update({
        data: { isFull: false },
        where: { pusherId: channelId },
      });
    }

    // Delete the room when someone disconnects
    if (isClosed) {
      try {
        const { channelId } = req.body;
    
        await db.rooms.delete({
          where: { pusherId: channelId },
        });
    
        res.json({ message: "Room deleted successfully" });
      } catch (error) {
        console.error("Delete room error", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }

    res.json({ everything: "OK" });
  } catch (error) {
    console.error("api/room error", error);
    res.status(500);
  }
}

