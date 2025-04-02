import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import useVideoSync from './useVideoSync';
import { calculateFileHash } from '../../utils/fileHash.js';

function VideoPlayer({ socket, sessionId }) {
  const playerRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileHash, setFileHash] = useState(null);
  const [fileStatus, setFileStatus] = useState(null); // matched, mismatched, pending
  const [errorMessage, setErrorMessage] = useState('');

  const { syncLock, emitSyncAction } = useVideoSync({ socket, sessionId, playerRef });

  useEffect(() => {
    const handleFileStatus = ({ status }) => {
      if (status === 'matched') {
        setFileStatus('matched');
        setErrorMessage('');
      } else if (status === 'mismatched') {
        setFileStatus('mismatched');
        setErrorMessage("Current video does not match the original file the session started with.");
      }
    };

    socket.on('sync:fileStatus', handleFileStatus);

    return () => {
      socket.off('sync:fileStatus', handleFileStatus);
    };
  }, [socket]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileStatus('pending');
    setErrorMessage('');

    const url = URL.createObjectURL(file);
    setVideoURL(url);
    setFileName(file.name);

    const hash = await calculateFileHash(file);
    setFileHash(hash);

    socket.emit('sync:fileSelected', { sessionId, hash });
  };

  const handlePlay = () => {
    if (!syncLock.current) emitSyncAction('play', playerRef.current.getCurrentTime());
  };

  const handlePause = () => {
    if (!syncLock.current) emitSyncAction('pause', playerRef.current.getCurrentTime());
  };

  const handleSeek = (seconds) => {
    if (!syncLock.current) emitSyncAction('seek', seconds);
  };

  const getStatusBadge = () => {
    switch (fileStatus) {
      case 'matched':
        return <span className="text-xs text-green-400 ml-2">✅ Matched</span>;
      case 'mismatched':
        return <span className="text-xs text-red-400 ml-2">❌ Mismatch</span>;
      case 'pending':
        return <span className="text-xs text-yellow-400 ml-2">⌛ Checking...</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-barlow text-white">
      {/* File Picker */}
      <div className="w-full max-w-md mb-3 bg-brand-dark-purple/40 border border-brand-primary/20 rounded-xl px-4 py-3 shadow-md backdrop-blur-md text-sm space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-gray-400">Select Video</label>
          <label className="text-brand-primary cursor-pointer hover:underline">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            Browse
          </label>
        </div>

        {fileName && (
          <div className="text-xs text-gray-300 mt-1 leading-snug space-y-1">
            <div className="truncate flex items-center">
              🎞️ <span className="font-medium ml-1">{fileName}</span>
              {getStatusBadge()}
            </div>
            <div className="text-[10px] text-gray-500 break-all">
              🔐 <span className="font-mono">Hash: {fileHash?.slice(0, 16)}...</span>
            </div>
          </div>
        )}

        {fileStatus === 'mismatched' && (
          <div className="mt-2 text-red-400 text-xs font-medium">{errorMessage}</div>
        )}
      </div>

      {/* Video Player */}
      {videoURL && (
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-brand-primary/20 shadow-[0_0_20px_#6435AC33] bg-black">
          <ReactPlayer
            ref={playerRef}
            url={videoURL}
            controls
            width="100%"
            height="auto"
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            style={{ borderRadius: '1rem' }}
          />
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;