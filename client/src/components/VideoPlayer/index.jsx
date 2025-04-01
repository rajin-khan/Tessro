import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import useVideoSync from './useVideoSync';

function VideoPlayer({ socket, sessionId }) {
  const playerRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);

  const { syncLock, emitSyncAction } = useVideoSync({ socket, sessionId, playerRef });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
    }
  };

  const handlePlay = () => {
    if (!syncLock.current) {
      emitSyncAction('play', playerRef.current.getCurrentTime());
    }
  };

  const handlePause = () => {
    if (!syncLock.current) {
      emitSyncAction('pause', playerRef.current.getCurrentTime());
    }
  };

  const handleSeek = (seconds) => {
    if (!syncLock.current) {
      emitSyncAction('seek', seconds);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-4">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="mb-4 text-sm text-gray-300"
      />

      {videoURL && (
        <ReactPlayer
          ref={playerRef}
          url={videoURL}
          controls
          width="100%"
          height="auto"
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
        />
      )}
    </div>
  );
}

export default VideoPlayer;