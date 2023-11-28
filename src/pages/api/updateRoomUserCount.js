// /api/updateRoomUserCount.js

import { db } from '../../utils/server.prismadb';

export default async function updateRoomUserCount(req, res) {
  const { channelId, change } = req.body;

  try {
    const room = await db.rooms.findUnique({
      where: { pusherId: channelId }
    });

    if (room) {
      await db.rooms.update({
        where: { pusherId: channelId },
        data: { count: { increment: change } }
      });
    }

    res.status(200).json({ message: "User count updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user count", error });
  }
}
