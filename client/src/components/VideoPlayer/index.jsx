import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import useVideoSync from './useVideoSync';
import useWebRTC from '../../hooks/useWebRTC';
import { calculateFileHash } from '../../utils/fileHash.js';
import PlayerControls from './PlayerControls'; // Make sure PlayerControls.jsx is in the same folder

function VideoPlayer({
  socket,
  sessionId,
  sessionMode,
  isHost,
  participants,
  selfId
}) {
  const playerRef = useRef(null);
  const playerWrapperRef = useRef(null);
  const videoElementRef = useRef(null);
  const seekingRef = useRef(false);

  // State for the player's UI and functionality
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    playedSeconds: 0,
    loadedSeconds: 0,
    duration: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State for file handling
  const [localVideoURL, setLocalVideoURL] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileHash, setFileHash] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // State specifically for guests to handle browser autoplay policies
  const [isGuestMuted, setIsGuestMuted] = useState(true);

  // Custom Hooks
  const { remoteStream, startStreaming, stopStreaming, isStreamingActive, webRTCError } = useWebRTC({
      socket, sessionId, isHost, sessionMode, participants, selfId,
      localStreamSourceElement: videoElementRef.current
  });

  const { syncLock, emitSyncAction } = useVideoSync({
      socket, sessionId, playerRef, sessionMode
  });

  // --- Player Control Handlers ---

  const handlePlayPause = useCallback(() => {
    if (syncLock.current) return;
    const newIsPlaying = !playerState.isPlaying;
    setPlayerState(prev => ({ ...prev, isPlaying: newIsPlaying }));
    if (sessionMode === 'sync') {
      emitSyncAction(newIsPlaying ? 'play' : 'pause', playerRef.current?.getCurrentTime());
    }
  }, [playerState.isPlaying, sessionMode, syncLock, emitSyncAction]);

  const handleVolumeChange = (newVolume) => {
    setPlayerState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  };

  const handleMuteToggle = () => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };
  
  const handleSeek = (seconds) => {
    if (sessionMode === 'sync' || isHost) {
      setPlayerState(prev => ({ ...prev, playedSeconds: seconds }));
      playerRef.current.seekTo(seconds, 'seconds');
    }
  };

  const handleSeekMouseDown = () => {
    if (sessionMode === 'sync' || isHost) {
      seekingRef.current = true;
    }
  };

  const handleSeekMouseUp = () => {
    if (sessionMode === 'sync' || isHost) {
      seekingRef.current = false;
      if (sessionMode === 'sync') {
        emitSyncAction('seek', playerState.playedSeconds);
      }
    }
  };

  const handleProgress = (state) => {
    if (!seekingRef.current) {
      setPlayerState(prev => ({ ...prev, playedSeconds: state.playedSeconds, loadedSeconds: state.loadedSeconds }));
    }
  };
  
  const handleDuration = (duration) => {
    setPlayerState(prev => ({ ...prev, duration }));
  };
  
  const handleToggleFullscreen = () => {
    if (!playerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      playerWrapperRef.current.requestFullscreen().catch(err => {
        console.error(`Failed to enter fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // --- Effects ---

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);
  
  useEffect(() => {
    if (sessionMode !== 'sync' || !socket) return;
    const handleFileStatus = ({ status }) => {
      if (status === 'matched') { setFileStatus('matched'); setErrorMessage(''); }
      else if (status === 'mismatched') { setFileStatus('mismatched'); setErrorMessage("File does not match the host's file."); }
    };
    socket.on('sync:fileStatus', handleFileStatus);
    return () => { socket.off('sync:fileStatus', handleFileStatus); };
  }, [socket, sessionMode]);

  useEffect(() => {
      if (!isHost) return;
      let startStreamTimeoutId = null;
      if (sessionMode === 'stream' && isPlayerReady && localVideoURL && videoElementRef.current && !isStreamingActive) {
          startStreamTimeoutId = setTimeout(() => { startStreaming(); }, 200);
      } else if (sessionMode === 'sync' && isStreamingActive) {
          stopStreaming();
      }
      return () => { if (startStreamTimeoutId) { clearTimeout(startStreamTimeoutId); } }
  }, [sessionMode, isHost, isPlayerReady, localVideoURL, startStreaming, stopStreaming, isStreamingActive]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset all relevant states
    setLocalVideoURL(null);
    setIsPlayerReady(false);
    setFileName('');
    setFileHash(null);
    setFileStatus(null);
    setErrorMessage('');
    setPlayerState(prev => ({ ...prev, isPlaying: false, playedSeconds: 0, loadedSeconds: 0, duration: 0 }));
    
    // ** FIX: Auto-play for host in stream mode to enable captureStream **
    if (isHost && sessionMode === 'stream') {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }

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
  
  const handlePlayerReady = useCallback((playerInstance) => {
    setIsPlayerReady(true);
    try {
      if (playerInstance?.getInternalPlayer) {
        const internalPlayer = playerInstance.getInternalPlayer();
        if (internalPlayer && internalPlayer instanceof HTMLMediaElement) {
          videoElementRef.current = internalPlayer;
          if (typeof internalPlayer.setAttribute === 'function') {
            internalPlayer.setAttribute('playsinline', 'true');
          }
        } else { videoElementRef.current = null; }
      } else { videoElementRef.current = null; }
    } catch (error) {
      console.error("[VideoPlayer] Error in onReady handler:", error);
      setIsPlayerReady(false);
      videoElementRef.current = null;
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

  // --- Render Logic ---
  const showFileInput = sessionMode === 'sync' || (sessionMode === 'stream' && isHost);
  const videoSource = sessionMode === 'stream' && !isHost ? remoteStream : localVideoURL;
  const showPlayerContainer = (sessionMode === 'sync' && localVideoURL) || (sessionMode === 'stream' && isHost && localVideoURL) || (sessionMode === 'stream' && !isHost);
  const showReactPlayer = videoSource !== null;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-barlow text-white px-2">
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
      {(errorMessage || webRTCError) && (<div className="w-full max-w-md my-2 text-center text-red-400 text-xs font-medium bg-red-900/30 border border-red-500/50 rounded p-2"><p>Error: {webRTCError || errorMessage}</p></div>)}

      <div ref={playerWrapperRef} className={`relative w-full max-w-4xl ${showPlayerContainer ? 'aspect-video' : ''} rounded-2xl overflow-hidden border border-brand-primary/20 shadow-[0_0_20px_#6435AC33] bg-black flex items-center justify-center group`}>
        {showPlayerContainer ? (
          showReactPlayer ? (
            <>
              <ReactPlayer
                ref={playerRef}
                url={videoSource}
                width="100%"
                height="100%"
                // ** FIX: Force guest to play, but let host be controlled by state **
                playing={sessionMode === 'stream' && !isHost ? true : playerState.isPlaying}
                volume={playerState.volume}
                // ** FIX: Use separate state for guest mute to allow unmuting **
                muted={sessionMode === 'stream' && !isHost ? isGuestMuted : playerState.isMuted}
                onReady={handlePlayerReady}
                onError={handlePlayerError}
                onPlay={() => setPlayerState(p => ({...p, isPlaying: true}))}
                onPause={() => setPlayerState(p => ({...p, isPlaying: false}))}
                onProgress={handleProgress}
                onDuration={handleDuration}
                playsInline={true}
                config={{ file: { attributes: { playsInline: true } } }}
                style={{ borderRadius: '1rem' }}
                controls={false}
              />
              <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <PlayerControls
                  isPlaying={playerState.isPlaying}
                  onPlayPause={handlePlayPause}
                  volume={playerState.volume}
                  onVolumeChange={handleVolumeChange}
                  isMuted={playerState.isMuted}
                  onMuteToggle={handleMuteToggle}
                  playedSeconds={playerState.playedSeconds}
                  loadedSeconds={playerState.loadedSeconds}
                  duration={playerState.duration}
                  onSeek={handleSeek}
                  onSeekMouseDown={handleSeekMouseDown}
                  onSeekMouseUp={handleSeekMouseUp}
                  isHost={isHost}
                  sessionMode={sessionMode}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                />
              </div>
            </>
          ) : ( !webRTCError && sessionMode === 'stream' && !isHost ? (<p className="text-gray-400 text-lg p-4 text-center">Connecting stream...</p>) : (<div className="p-4 text-gray-500">Loading player...</div>) )
        ) : ( <> {sessionMode === 'sync' && !localVideoURL && (<p className="text-gray-400 text-lg p-4 text-center">Please select a video file...</p>)} {sessionMode === 'stream' && isHost && !localVideoURL && (<p className="text-gray-400 text-lg p-4 text-center">Select a video file to start streaming.</p>)} </> )}
      </div>

      {sessionMode === 'stream' && !isHost && remoteStream && isGuestMuted && (
        <button
          onClick={() => setIsGuestMuted(false)}
          className="mt-3 px-4 py-1.5 bg-brand-accent text-white rounded-full text-sm hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-rich-black"
        >
          Click to Unmute Stream
        </button>
      )}
    </div>
  );
}

export default VideoPlayer;