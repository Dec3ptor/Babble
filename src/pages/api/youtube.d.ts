// youtube.d.ts
export {};

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}
