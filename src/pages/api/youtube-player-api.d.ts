// youtube-player-api.d.ts

declare namespace YT {
  enum PlayerState {
    UNSTARTED,
    ENDED,
    PLAYING,
    PAUSED,
    BUFFERING,
    CUED
  }

  class Player {
    constructor(id: string, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    // Add other methods you need
  }

  interface PlayerOptions {
    height: string;
    width: string;
    videoId: string;
    events?: {
      onReady?: (event: any) => void;
      onStateChange?: (event: any) => void;
      // Add other events you need
    };
  }
}
