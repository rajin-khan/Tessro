import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa';

// Helper function to format time from seconds into MM:SS or HH:MM:SS
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) {
    return '00:00';
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

function PlayerControls({
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  playedSeconds,
  loadedSeconds,
  duration,
  onSeek,
  onSeekMouseUp,
  onSeekMouseDown,
  isHost,
  sessionMode,
  isFullscreen,
  onToggleFullscreen,
}) {
  // Determine if the main playback controls (play/pause, seek) should be interactive
  const showMainControls = sessionMode === 'sync' || isHost;
  
  const playedPercentage = duration > 0 ? (playedSeconds / duration) * 100 : 0;
  const loadedPercentage = duration > 0 ? (loadedSeconds / duration) * 100 : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
      {/* --- Seek Bar --- */}
      <div className="relative h-2 group cursor-pointer mb-2">
        {/* The actual input range is transparent but interactive */}
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={duration > 0 ? playedSeconds / duration : 0}
          onMouseDown={onSeekMouseDown}
          onChange={(e) => onSeek(parseFloat(e.target.value) * duration)}
          onMouseUp={onSeekMouseUp}
          className={`absolute w-full h-full appearance-none bg-transparent m-0 p-0 z-20 ${showMainControls ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!showMainControls}
        />
        {/* Visual representation of the seek bar */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all">
          <div className="absolute h-full bg-white/40 rounded-full" style={{ width: `${loadedPercentage}%` }}></div>
          <div className="absolute h-full bg-brand-primary rounded-full" style={{ width: `${playedPercentage}%` }}></div>
          {showMainControls && (
            <div 
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ left: `${playedPercentage}%` }}
            ></div>
          )}
        </div>
      </div>

      {/* --- Main Controls Row --- */}
      <div className="flex items-center justify-between">
        {/* Left Side: Play/Pause, Volume */}
        <div className="flex items-center gap-4">
          {showMainControls && (
            <button onClick={onPlayPause} className="text-white hover:text-brand-primary transition-colors p-1">
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>
          )}

          <div className="flex items-center gap-2 group">
            <button onClick={onMuteToggle} className="text-white hover:text-brand-primary transition-colors p-1">
              {isMuted || volume === 0 ? <FaVolumeMute size={22} /> : <FaVolumeUp size={22} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-0 group-hover:w-24 transition-all duration-300 accent-brand-primary"
            />
          </div>
        </div>

        {/* Right Side: Time, Fullscreen */}
        <div className="flex items-center gap-4">
          <div className="text-white text-sm font-mono tracking-wider">
            <span>{formatTime(playedSeconds)}</span>
            <span className="text-gray-400"> / </span>
            <span>{formatTime(duration)}</span>
          </div>

          <button onClick={onToggleFullscreen} className="text-white hover:text-brand-primary transition-colors p-1">
            {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;