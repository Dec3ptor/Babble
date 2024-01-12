import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY // Use an environment variable for the API key
      });

      // Step 1: Search for videos
      const searchResponse = await youtube.search.list({
        part: 'snippet',
        q: req.body.query,
        maxResults: 1 // Adjust the number of results as needed
      });

      // Step 2: Get video details including view count
      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
      const videosResponse = await youtube.videos.list({
        part: 'snippet,contentDetails,statistics',
        id: videoIds
      });

      // Step 3: Sort by view count and return the top video
      const sortedVideos = videosResponse.data.items.sort((a, b) => {
        return parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount);
      });
      const topVideo = sortedVideos[0];

      res.status(200).json(topVideo);
    } catch (error) {
      console.error('Error making YouTube API call: ', error);
      res.status(500).json({ error: 'Error making YouTube API call' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
