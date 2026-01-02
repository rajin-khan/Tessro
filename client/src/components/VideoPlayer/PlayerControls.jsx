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

        <div className="absolute inset-0 flex flex-col justify-end p-0 pointer-events-none">
            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

            {/* Controls Container */}
            <div className="pointer-events-auto w-full px-6 pb-6 relative z-10 flex flex-col gap-2 group/controls">

                {/* --- Seek Bar (Netflix Style) --- */}
                <div className="relative h-2 w-full flex items-center cursor-pointer group/seek py-4">
                    <input
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={duration > 0 ? playedSeconds / duration : 0}
                        onMouseDown={onSeekMouseDown}
                        onChange={(e) => onSeek(parseFloat(e.target.value) * duration)}
                        onMouseUp={onSeekMouseUp}
                        className={`absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer ${!showMainControls ? 'cursor-not-allowed' : ''}`}
                        disabled={!showMainControls}
                    />

                    {/* Track Background */}
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative group-hover/seek:h-1.5 transition-all duration-200 backdrop-blur-sm">
                        {/* Buffered */}
                        <div
                            className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300"
                            style={{ width: `${loadedPercentage}%` }}
                        />
                        {/* Played */}
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary/60 to-brand-primary shadow-[0_0_20px_rgba(100,53,172,0.5)] transition-all duration-100"
                            style={{ width: `${playedPercentage}%` }}
                        />
                    </div>

                    {/* Scrubber Knob */}
                    <div
                        className="absolute h-4 w-4 bg-white rounded-full shadow-lg border-2 border-brand-primary pointer-events-none transition-transform duration-100 opacity-0 group-hover/seek:opacity-100 scale-0 group-hover/seek:scale-100"
                        style={{ left: `${playedPercentage}%`, transform: 'translateX(-50%)' }}
                    />
                </div>

                {/* --- Control Buttons Row --- */}
                <div className="flex items-center justify-between mt-1">

                    {/* Left: Playback Controls */}
                    <div className="flex items-center gap-6">
                        {showMainControls && (
                            <>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={onSkipBackward}
                                        className="text-white/80 hover:text-white transition-all transform hover:-rotate-12"
                                        title="-10s"
                                    >
                                        <MdReplay10 size={28} />
                                    </button>

                                    <button
                                        onClick={onPlayPause}
                                        className="text-white hover:text-brand-primary transition-all transform hover:scale-110 active:scale-95"
                                    >
                                        {isPlaying ? <FaPause size={32} /> : <FaPlay size={32} />}
                                    </button>

                                    <button
                                        onClick={onSkipForward}
                                        className="text-white/80 hover:text-white transition-all transform hover:rotate-12"
                                        title="+10s"
                                    >
                                        <MdForward10 size={28} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/volume ml-2">
                            <button
                                onClick={onMuteToggle}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                {isMuted || volume === 0 ? <HiVolumeOff size={24} /> : <HiVolumeUp size={24} />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-28 transition-all duration-300 ease-out flex items-center pl-2">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                    className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-brand-primary hover:accent-brand-light"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Title/Time & Fullscreen */}
                    <div className="flex items-center gap-6">
                        <div className="text-sm font-medium tracking-wide font-barlow">
                            <span className="text-white">{formatTime(playedSeconds)}</span>
                            <span className="text-white/40 mx-2">|</span>
                            <span className="text-white/60">{formatTime(duration)}</span>
                        </div>

                        <button
                            onClick={onToggleFullscreen}
                            className="text-white/80 hover:text-white transition-transform hover:scale-110"
                        >
                            {isFullscreen ? <FaCompress size={22} /> : <FaExpand size={22} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default PlayerControls;