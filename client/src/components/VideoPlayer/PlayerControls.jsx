import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { MdReplay10, MdForward10 } from 'react-icons/md';

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
  onSkipForward,
  onSkipBackward,
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
    <div className="absolute bottom-0 left-0 right-0 flex flex-col p-5 bg-gradient-to-t from-black/90 via-black/60 to-black/0">
      {/* --- Modern Seek Bar --- */}
      <div className="relative h-3 group mb-4">
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={duration > 0 ? playedSeconds / duration : 0}
          onMouseDown={onSeekMouseDown}
          onChange={(e) => onSeek(parseFloat(e.target.value) * duration)}
          onMouseUp={onSeekMouseUp}
          className={`absolute w-full h-full appearance-none bg-transparent m-0 p-0 z-30 cursor-pointer ${!showMainControls ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={!showMainControls}
        />
        {/* Buffered progress track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-white/20 rounded-full transition-all duration-300" 
            style={{ width: `${loadedPercentage}%` }}
          ></div>
        </div>
        {/* Played progress track with gradient */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-primary via-brand-tekhelet to-brand-primary rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(100,53,172,0.6)]"
          style={{ width: `${playedPercentage}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        {/* Hover indicator */}
        {showMainControls && (
          <div 
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl border-2 border-brand-primary opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" 
            style={{ left: `${playedPercentage}%` }}
          ></div>
        )}
      </div>

      {/* --- Main Controls Row --- */}
      <div className="flex items-center justify-between">
        {/* Left Side: Skip Backward, Play/Pause, Skip Forward, Volume */}
        <div className="flex items-center gap-2">
          {showMainControls && (
            <>
              <button 
                onClick={onSkipBackward}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
                title="Rewind 10 seconds"
              >
                <MdReplay10 size={20} />
              </button>
              <button 
                onClick={onPlayPause} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary/90 hover:bg-brand-primary text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5" />}
              </button>
              <button 
                onClick={onSkipForward}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
                title="Forward 10 seconds"
              >
                <MdForward10 size={20} />
              </button>
            </>
          )}

          <div className="flex items-center gap-2 group/volume">
            <button 
              onClick={onMuteToggle} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
              title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <HiVolumeOff size={16} />
              ) : (
                <HiVolumeUp size={16} />
              )}
            </button>
            <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-brand-primary bg-white/10 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Time, Fullscreen */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
            <div className="text-white text-xs font-mono tracking-wider">
              <span className="text-brand-primary">{formatTime(playedSeconds)}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          <button 
            onClick={onToggleFullscreen} 
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;