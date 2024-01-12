import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../utils/server.prismadb";
import { debug } from "../../../src/utils/debug";

enum RoomType {
  SINGLE = "SINGLE",
  GROUP = "GROUP"
}


export default async function searchUser(req: NextApiRequest, res: NextApiResponse) {
  let availableRoom = undefined;
  const chatType = req.query.chatType as string; // Access chatType from query parameters
  const userCount = 1;
  const randomString = Math.random().toString(36).slice(2);
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1); // Tomorrow
  // Define the room type (you may want to get this from the request or other logic)
  // const roomType = req.query.roomType || req.body.roomType || "SINGLE"; // Use query or body, depending on your preference

  // Determine the maximum number of users based on chat type
  const maxUserCount = chatType === 'GROUP' ? 20 : 2;
  if (debug) {
    console.log("SearchUser.ts: maxUserCount ", maxUserCount);
    console.error("SearchUser.ts: roomType: ", chatType);
  }

  availableRoom = await db.rooms.findFirst({
    where: { 
      isFull: false, 
      type: chatType as RoomType // 'SINGLE' or 'GROUP'
    },
  });

  if (!availableRoom) {
    availableRoom = await db.rooms.create({
      data: {
        pusherId: `presence-${randomString}`,
        expireAt: expireDate,
        type: chatType as RoomType, // Ensure this matches the enum values: 'SINGLE' or 'GROUP'
        count: userCount,
      },
    });
  }

  res.status(200).json(availableRoom);
}


