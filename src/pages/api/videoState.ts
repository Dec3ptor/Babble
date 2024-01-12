// pages/api/video-state.js
import { pusher } from "../../utils/server.pusher";

export default async function handler(req: any, res: any) {
  const { channelId, videoState } = req.body;

  try {
    await pusher.trigger(channelId, "video-state-change", videoState);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error triggering video state event", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
