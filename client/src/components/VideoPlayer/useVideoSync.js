// client/src/components/VideoPlayer/useVideoSync.js
import { useEffect, useRef } from 'react';

function useVideoSync({ socket, sessionId, playerRef }) {
  const syncLock = useRef(false);

  const emitSyncAction = (action, value) => {
    if (!sessionId) return;

    socket.emit('sync:action', {
      sessionId,
      action,
      timestamp: Date.now(),
      seekTime: value
    });
  };

  useEffect(() => {
    const handleSyncEvent = ({ action, seekTime }) => {
      const player = playerRef.current;
      if (!player) return;

      syncLock.current = true;

      switch (action) {
        case 'play':
          player.seekTo(seekTime, 'seconds');
          player.getInternalPlayer()?.play?.();
          break;
        case 'pause':
          player.getInternalPlayer()?.pause?.();
          break;
        case 'seek':
          player.seekTo(seekTime, 'seconds');
          break;
        default:
          break;
      }

      setTimeout(() => {
        syncLock.current = false;
      }, 200);
    };

    socket.on('sync:action', handleSyncEvent);

    return () => {
      socket.off('sync:action', handleSyncEvent);
    };
  }, [socket, sessionId]);

  return { emitSyncAction, syncLock };
}

export default useVideoSync;