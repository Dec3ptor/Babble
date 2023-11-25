import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../utils/server.prismadb";

export default async function searchUser(req: NextApiRequest, res: NextApiResponse) {
  let availableRoom = undefined;

  const randomString = Math.random().toString(36).slice(2);
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1); // Tomorrow

  // Define the room type (you may want to get this from the request or other logic)
  const roomType = "SINGLE"; // Use uppercase, as defined in the enum

  availableRoom = await db.rooms.findFirst({
    where: { 
      isFull: false, 
      type: roomType // 'SINGLE' or 'GROUP'
    },
  });

  if (!availableRoom) {
    availableRoom = await db.rooms.create({
      data: {
        pusherId: `presence-${randomString}`,
        expireAt: expireDate,
        type: roomType, // Ensure this matches the enum values: 'SINGLE' or 'GROUP'
      },
    });
  }

  res.status(200).json(availableRoom);
}


