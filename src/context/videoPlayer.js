function VideoPlayer({ currentVideo, isPlaying, currentTime, onStateChange, presenceChannel }) {
  const [url, setUrl] = useState(currentVideo);
  const [playing, setPlaying] = useState(isPlaying);
  const [playedSeconds, setPlayedSeconds] = useState(currentTime);

  useEffect(() => {
    setUrl(currentVideo);
    setPlaying(isPlaying);
    setPlayedSeconds(currentTime);
  }, [currentVideo, isPlaying, currentTime]);

  useEffect(() => {
    const handleVideoStateChange = (data) => {
      console.log("VIDEO STATE RECEIVED", data);
      setPlaying(data.isPlaying);
      setPlayedSeconds(data.currentTime);
      // Seek the video player to the new currentTime
    };

    // Bind to the 'client-video-state-change' event
    presenceChannel.bind('client-video-state-change', handleVideoStateChange);

    // Cleanup function
    return () => {
      presenceChannel.unbind('client-video-state-change', handleVideoStateChange);
    };
  }, [presenceChannel]);

  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds);
    onStateChange(state.playedSeconds);
  };

  const handlePlay = () => {
    console.log("Play button pressed");
    setPlaying(true);
    pusher.trigger('my-channel', 'video-action', { action: 'play', time: playedSeconds });
  };
  
  const handlePause = () => {
    console.log("Pause button pressed");
    setPlaying(false);
    pusher.trigger('my-channel', 'video-action', { action: 'pause', time: playedSeconds });
  };
  
  return (
    <ReactPlayer
      url={url}
      playing={playing}
      onProgress={handleProgress}
      onPlay={handlePlay}
      onPause={handlePause}
      controls={true}
      width="100%"
      height="auto"
      // Add the `playedSeconds` property to seek to the current time
      played={playedSeconds / 100} // Convert seconds to fraction if needed
    />
  );
}

export default VideoPlayer;