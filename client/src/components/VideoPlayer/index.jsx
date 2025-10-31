import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import useVideoSync from './useVideoSync';
import useWebRTC from '../../hooks/useWebRTC';
import { calculateFileHash } from '../../utils/fileHash.js';
import PlayerControls from './PlayerControls';
import logo from '../../assets/logo.png';

function VideoPlayer({
  socket,
  sessionId,
  sessionMode,
  isHost,
  participants,
  selfId
}) {
  // Get host nickname for display
  const hostParticipant = participants.find(p => participants.indexOf(p) === 0);
  const hostName = hostParticipant?.nickname || 'Host';
  const playerRef = useRef(null);
  const playerWrapperRef = useRef(null);
  const videoElementRef = useRef(null);
  const seekingRef = useRef(false);
  const isUserControllingRef = useRef(false);

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
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

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
    isUserControllingRef.current = true;
    setPlayerState(prev => {
      const newIsPlaying = !prev.isPlaying;
      if (sessionMode === 'sync') {
        emitSyncAction(newIsPlaying ? 'play' : 'pause', playerRef.current?.getCurrentTime());
      }
      return { ...prev, isPlaying: newIsPlaying };
    });
    // Reset flag after a short delay to allow ReactPlayer to process the change
    setTimeout(() => {
      isUserControllingRef.current = false;
    }, 100);
  }, [sessionMode, syncLock, emitSyncAction]);

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

  const handleSkipForward = useCallback(() => {
    if (syncLock.current) return;
    setPlayerState(prev => {
      const newTime = Math.min(prev.playedSeconds + 10, prev.duration || 0);
      if (playerRef.current) {
        playerRef.current.seekTo(newTime, 'seconds');
      }
      if (sessionMode === 'sync') {
        emitSyncAction('seek', newTime);
      }
      return { ...prev, playedSeconds: newTime };
    });
  }, [sessionMode, syncLock, emitSyncAction]);

  const handleSkipBackward = useCallback(() => {
    if (syncLock.current) return;
    setPlayerState(prev => {
      const newTime = Math.max(prev.playedSeconds - 10, 0);
      if (playerRef.current) {
        playerRef.current.seekTo(newTime, 'seconds');
      }
      if (sessionMode === 'sync') {
        emitSyncAction('seek', newTime);
      }
      return { ...prev, playedSeconds: newTime };
    });
  }, [sessionMode, syncLock, emitSyncAction]);

  const handleProgress = (state) => {
    if (!seekingRef.current) {
      setPlayerState(prev => ({ ...prev, playedSeconds: state.playedSeconds, loadedSeconds: state.loadedSeconds }));
    }
  };

  // Auto-hide controls after 5 seconds of inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  }, []);

  useEffect(() => {
    // Auto-hide controls after 5 seconds in all modes
    resetControlsTimer();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimer]);

  // Reset timer on mouse movement or interaction
  const handlePlayerInteraction = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);
  
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

      <div ref={playerWrapperRef} className={`relative w-full max-w-5xl ${showPlayerContainer ? 'aspect-video' : ''} rounded-3xl overflow-hidden border-2 border-brand-primary/30 shadow-[0_0_40px_#6435AC44] bg-black flex items-center justify-center group`}>
        {showPlayerContainer ? (
          showReactPlayer ? (
            <>
              <ReactPlayer
                ref={playerRef}
                url={videoSource}
                width="100%"
                height="100%"
                playing={sessionMode === 'stream' && !isHost ? true : playerState.isPlaying}
                volume={playerState.volume}
                muted={sessionMode === 'stream' && !isHost ? isGuestMuted : playerState.isMuted}
                onReady={handlePlayerReady}
                onError={handlePlayerError}
                onPlay={() => {
                  // Only update state if not user-controlled to prevent conflicts
                  if (!isUserControllingRef.current && !syncLock.current) {
                    setPlayerState(p => ({...p, isPlaying: true}));
                  }
                }}
                onPause={() => {
                  // Only update state if not user-controlled to prevent conflicts
                  if (!isUserControllingRef.current && !syncLock.current) {
                    setPlayerState(p => ({...p, isPlaying: false}));
                  }
                }}
                onProgress={handleProgress}
                onDuration={handleDuration}
                playsInline={true}
                config={{ file: { attributes: { playsInline: true } } }}
                style={{ borderRadius: '1.5rem' }}
                controls={false}
              />
              
              {/* Stream mode guest overlay - fades with controls */}
              {sessionMode === 'stream' && !isHost && (
                <div className={`absolute top-4 left-4 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="px-4 py-2.5 rounded-xl bg-black/70 border border-brand-primary/40 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-brand-primary rounded-full blur-md opacity-50 animate-pulse"></div>
                        <div className="relative w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-white">
                        Streaming from <span className="text-brand-primary font-semibold">{hostName}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tessro branding overlay - fades with controls */}
              <div className={`absolute top-4 right-4 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center px-3 py-2 rounded-lg bg-black/70 border border-brand-primary/40 shadow-xl">
                  <img 
                    src={logo} 
                    alt="Tessro" 
                    className="h-5 w-auto"
                  />
                </div>
              </div>
              
              {/* Controls overlay - auto-hide after 5 seconds, show on mouse movement */}
              <div 
                className={`absolute inset-0 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                onMouseMove={handlePlayerInteraction}
                onMouseEnter={handlePlayerInteraction}
                onClick={handlePlayerInteraction}
              >
                <PlayerControls
                  isPlaying={playerState.isPlaying}
                  onPlayPause={handlePlayPause}
                  volume={playerState.volume}
                  onVolumeChange={handleVolumeChange}
                  isMuted={sessionMode === 'stream' && !isHost ? isGuestMuted : playerState.isMuted}
                  onMuteToggle={sessionMode === 'stream' && !isHost ? () => setIsGuestMuted(!isGuestMuted) : handleMuteToggle}
                  playedSeconds={playerState.playedSeconds}
                  loadedSeconds={playerState.loadedSeconds}
                  duration={playerState.duration}
                  onSeek={handleSeek}
                  onSeekMouseDown={(e) => {
                    handleSeekMouseDown();
                    handlePlayerInteraction();
                  }}
                  onSeekMouseUp={handleSeekMouseUp}
                  onSkipForward={handleSkipForward}
                  onSkipBackward={handleSkipBackward}
                  isHost={isHost}
                  sessionMode={sessionMode}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                />
              </div>
            </>
          ) : ( 
            !webRTCError && sessionMode === 'stream' && !isHost ? (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-300 text-lg font-medium">Connecting to stream...</p>
              </div>
            ) : (
              <div className="p-4 text-gray-400">Loading player...</div>
            )
          )
        ) : ( 
          <>
            {sessionMode === 'sync' && !localVideoURL && (
              <div className="flex flex-col items-center gap-3 p-8">
                <div className="text-4xl">🎬</div>
                <p className="text-gray-300 text-lg font-medium">Please select a video file to sync</p>
              </div>
            )}
            {sessionMode === 'stream' && isHost && !localVideoURL && (
              <div className="flex flex-col items-center gap-3 p-8">
                <div className="text-4xl">📡</div>
                <p className="text-gray-300 text-lg font-medium">Select a video file to start streaming</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;