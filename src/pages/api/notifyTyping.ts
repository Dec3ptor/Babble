// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { pusher } from "../../utils/server.pusher";

export default async function handler(req: any, res: any) {
  const { channelId, userId, isTyping } = req.body; // Add isTyping to the destructured variables

  try {
    await pusher.trigger(channelId, "typing", { userId, isTyping }); // Include isTyping in the data sent to Pusher
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error triggering typing event", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}