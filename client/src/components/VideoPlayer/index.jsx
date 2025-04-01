import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import useVideoSync from './useVideoSync';
import { calculateFileHash } from '../../utils/fileHash.js'; // ✅ Import file hash utility

function VideoPlayer({ socket, sessionId }) {
  const playerRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileHash, setFileHash] = useState(null);

  const { syncLock, emitSyncAction } = useVideoSync({ socket, sessionId, playerRef });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoURL(url);
    setFileName(file.name);

    // ✅ Calculate and send hash
    const hash = await calculateFileHash(file);
    setFileHash(hash);
    console.log('Computed file hash:', hash);

    socket.emit('sync:fileSelected', {
      sessionId,
      hash,
    });
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
      <label className="text-sm text-gray-400">Choose your local video file:</label>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="mb-2 text-sm text-gray-300"
      />
      {fileName && (
        <p className="text-xs text-gray-500">Selected: {fileName}</p>
      )}

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