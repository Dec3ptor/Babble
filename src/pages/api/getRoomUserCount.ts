// pages/api/getRoomUserCount.ts

import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../utils/server.prismadb";

export default async function getRoomUserCount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const channelId = req.query.channelId as string;

    const room = await db.rooms.findUnique({
      where: { pusherId: channelId },
      select: { count: true }
    });

    if (room) {
      res.json({ userCount: room.count });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    console.error("Error fetching room user count", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
