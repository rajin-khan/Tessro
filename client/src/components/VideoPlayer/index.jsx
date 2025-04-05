import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import useVideoSync from './useVideoSync';
import useWebRTC from '../../hooks/useWebRTC';
import { calculateFileHash } from '../../utils/fileHash.js';

function VideoPlayer({
  socket,
  sessionId,
  sessionMode,
  isHost,
  participants,
  selfId
}) {
  const playerRef = useRef(null);
  const videoElementRef = useRef(null);
  // Debug Ref Removed

  // State
  const [localVideoURL, setLocalVideoURL] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileHash, setFileHash] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isGuestMuted, setIsGuestMuted] = useState(true); // Guest stream starts muted


  // Hooks
  const {
      remoteStream,
      startStreaming,
      stopStreaming,
      isStreamingActive,
      webRTCError
  } = useWebRTC({
      socket,
      sessionId,
      isHost,
      sessionMode,
      participants,
      selfId,
      localStreamSourceElement: videoElementRef.current
  });

  const { syncLock, emitSyncAction } = useVideoSync({
      socket,
      sessionId,
      playerRef,
      sessionMode
  });


  // --- Effects ---

  // Effect for sync mode file status
  useEffect(() => {
    if (sessionMode !== 'sync' || !socket) {
      socket?.off('sync:fileStatus');
      setFileStatus(null);
      return;
    }
    const handleFileStatus = ({ status }) => {
      if (status === 'matched') { setFileStatus('matched'); setErrorMessage(''); }
      else if (status === 'mismatched') { setFileStatus('mismatched'); setErrorMessage("File does not match the one this session started with."); }
    };
    socket.on('sync:fileStatus', handleFileStatus);
    return () => { socket.off('sync:fileStatus', handleFileStatus); };
  }, [socket, sessionMode]);

  // Effect to automatically start/stop streaming for host
  useEffect(() => {
      if (!isHost) return;
      let startStreamTimeoutId = null;
      if (sessionMode === 'stream' && isPlayerReady && localVideoURL && videoElementRef.current && !isStreamingActive) {
          // console.log("[VideoPlayer Host] Dependencies met. Scheduling startStreaming call...");
          startStreamTimeoutId = setTimeout(() => {
              // console.log("[VideoPlayer Host] Timeout finished. Calling startStreaming...");
              startStreaming();
          }, 200);
      } else if (sessionMode === 'sync' && isStreamingActive) {
          // console.log("[VideoPlayer Host] Mode changed to sync. Calling stopStreaming...");
          stopStreaming();
      }
      return () => {
          if (startStreamTimeoutId) { clearTimeout(startStreamTimeoutId); }
      }
  }, [sessionMode, isHost, isPlayerReady, localVideoURL, startStreaming, stopStreaming, isStreamingActive]);

  // Debug Effect Removed

  // --- Event Handlers ---
  const handleFileChange = useCallback(async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLocalVideoURL(null); setIsPlayerReady(false); setFileName(''); setFileHash(null); setFileStatus(null); setErrorMessage('');
      if(isHost) setIsGuestMuted(true);
      setFileName(file.name);
      setTimeout(() => {
          const url = URL.createObjectURL(file);
          setLocalVideoURL(url);
          if (sessionMode === 'sync') {
          setFileStatus('pending');
          calculateFileHash(file).then(hash => {
              setFileHash(hash);
              if (socket?.connected) { socket.emit('sync:fileSelected', { sessionId, hash }); }
          }).catch(err => {
              console.error("Error hashing file:", err);
              setErrorMessage("Error processing file.");
              setFileStatus(null);
          });
          }
      }, 50);
  }, [socket, sessionId, sessionMode, isHost]);

  const handlePlay = useCallback(() => {
      if (syncLock.current) return;
      if (sessionMode === 'sync') { emitSyncAction('play', playerRef.current?.getCurrentTime()); }
      // Implicit control for host stream
  }, [sessionMode, isHost, syncLock, emitSyncAction, socket, sessionId]);

  const handlePause = useCallback(() => {
      if (syncLock.current) return;
      if (sessionMode === 'sync') { emitSyncAction('pause', playerRef.current?.getCurrentTime()); }
       // Implicit control for host stream
  }, [sessionMode, isHost, syncLock, emitSyncAction, socket, sessionId]);

  const handleSeek = useCallback((seconds) => {
      if (syncLock.current) return;
      if (sessionMode === 'sync') { emitSyncAction('seek', seconds); }
      // Host seeking disabled in stream mode via prop
  }, [sessionMode, syncLock, emitSyncAction, socket, sessionId]);

  const handlePlayerReady = useCallback((playerInstance) => {
      setIsPlayerReady(true);
      try {
          if (playerInstance?.getInternalPlayer) {
              const internalPlayer = playerInstance.getInternalPlayer();
              if (internalPlayer && internalPlayer instanceof HTMLMediaElement) {
                  videoElementRef.current = internalPlayer;
                  if (typeof internalPlayer.setAttribute === 'function') { internalPlayer.setAttribute('playsinline', 'true'); }
              } else { videoElementRef.current = null; }
          } else { videoElementRef.current = null; }
      } catch (error) {
          console.error("[VideoPlayer] Error in onReady handler:", error);
          setIsPlayerReady(false); videoElementRef.current = null;
      }
  }, []);

  const handlePlayerError = useCallback((error, data) => {
      console.error("[VideoPlayer] ReactPlayer Error:", error, data);
      let specificError = error?.message || JSON.stringify(error);
      if (typeof error === 'object' && error !== null && 'type' in error) { specificError = `Type: ${error.type}`; }
      setErrorMessage(`Video playback error: ${specificError}`);
      setIsPlayerReady(false);
      if (isHost && isStreamingActive) { stopStreaming(); }
  }, [isHost, isStreamingActive, stopStreaming]);


  const getStatusBadge = () => {
    if (sessionMode !== 'sync') return null;
    switch (fileStatus) {
      case 'matched': return <span className="text-xs text-green-400 ml-2">✅ Matched</span>;
      case 'mismatched': return <span className="text-xs text-red-400 ml-2">❌ Mismatch</span>;
      case 'pending': return <span className="text-xs text-yellow-400 ml-2">⌛ Checking...</span>;
      default: return null;
    }
  };

  // --- Conditional Rendering Logic ---
  const showFileInput = sessionMode === 'sync' || (sessionMode === 'stream' && isHost);
  const videoSource = sessionMode === 'stream' && !isHost ? remoteStream : localVideoURL;
  const showPlayerContainer = (sessionMode === 'sync' && localVideoURL) || (sessionMode === 'stream' && isHost && localVideoURL) || (sessionMode === 'stream' && !isHost);
  const showReactPlayer = videoSource !== null;
  const playerControls = sessionMode === 'sync' || (sessionMode === 'stream' && isHost);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-barlow text-white px-2">
      {/* File Picker & Info Area */}
      {showFileInput && (
        <div className="w-full max-w-md mb-4 bg-brand-dark-purple/40 border border-brand-primary/20 rounded-xl px-4 py-3 shadow-md backdrop-blur-md text-sm space-y-2">
          <div className="flex justify-between items-center">
             <label className="text-gray-400">{sessionMode === 'stream' ? 'Select Video to Stream' : 'Select Video to Sync'}</label>
             <label className="text-brand-primary cursor-pointer hover:underline"><input type="file" accept="video/*" onChange={handleFileChange} className="hidden" key={`${sessionMode}-${fileName}`}/>Browse</label>
          </div>
          {fileName && (
            <div className="text-xs text-gray-300 mt-1 leading-snug space-y-1">
              <div className="truncate flex items-center">🎞️ <span className="font-medium ml-1">{fileName}</span>{sessionMode === 'sync' && getStatusBadge()}</div>
              {sessionMode === 'sync' && fileHash && (<div className="text-[10px] text-gray-500 break-all">🔐 <span className="font-mono">Hash: {fileHash?.slice(0, 16)}...</span></div>)}
            </div>
          )}
          {sessionMode === 'sync' && fileStatus === 'mismatched' && (<div className="mt-2 text-red-400 text-xs font-medium">{errorMessage}</div>)}
        </div>
      )}

      {/* Placeholder/Instructions for Guests */}
      {sessionMode === 'stream' && !isHost && !remoteStream && !webRTCError && (<div className="w-full max-w-4xl aspect-video rounded-2xl border border-brand-primary/30 bg-brand-dark-purple/50 flex items-center justify-center"><p className="text-gray-400 text-lg">Waiting for host to start stream...</p></div>)}
       {/* Error Message Display */}
       {(errorMessage || webRTCError) && (<div className="w-full max-w-md my-2 text-center text-red-400 text-xs font-medium bg-red-900/30 border border-red-500/50 rounded p-2"><p>Error: {webRTCError || errorMessage}</p></div>)}

      {/* Video Player Area */}
      <div className={`w-full max-w-4xl ${showPlayerContainer ? 'aspect-video' : ''} rounded-2xl overflow-hidden border border-brand-primary/20 shadow-[0_0_20px_#6435AC33] bg-black flex items-center justify-center`}>
          {showPlayerContainer ? (
                showReactPlayer ? (
                    <ReactPlayer
                    ref={playerRef} url={videoSource} controls={playerControls}
                    playing={sessionMode === 'stream' && !isHost ? true : undefined}
                    muted={sessionMode === 'stream' && !isHost ? isGuestMuted : false}
                    width="100%" height="100%"
                    onReady={handlePlayerReady} onError={handlePlayerError}
                    onPlay={playerControls ? handlePlay : undefined}
                    onPause={playerControls ? handlePause : undefined}
                    onSeek={sessionMode === 'sync' ? handleSeek : undefined} // Seek disabled for host in stream
                    playsInline={true} config={{ file: { attributes: { playsInline: true } } }}
                    style={{ borderRadius: '1rem' }} />
                ) : ( !webRTCError && sessionMode === 'stream' && !isHost ? (<p className="text-gray-400 text-lg p-4 text-center">Connecting stream...</p>) : (<div className="p-4 text-gray-500">Loading player...</div>) )
          ) : ( <> {sessionMode === 'sync' && !localVideoURL && (<p className="text-gray-400 text-lg p-4 text-center">Please select a video file...</p>)} {sessionMode === 'stream' && isHost && !localVideoURL && (<p className="text-gray-400 text-lg p-4 text-center">Select a video file to start streaming.</p>)} </> )}
      </div>

       {/* Unmute button for Guest */}
        {sessionMode === 'stream' && !isHost && remoteStream && isGuestMuted && ( <button onClick={() => setIsGuestMuted(false)} className="mt-3 px-4 py-1.5 bg-brand-accent text-white rounded-full text-sm hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-rich-black"> Click to Unmute Stream </button> )}

       {/* Debug Video Element Removed */}
    </div>
  );
}

export default VideoPlayer;