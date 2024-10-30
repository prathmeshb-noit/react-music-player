import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import "./musicplayer.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";

export default function App() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [
        "https://api.silocloud.io/podcastdata/music/bf9f389115697e46d6b28ce7d622580e_160.mp3",
      ],
      html5: true,
      onload: () => {
        setDuration(soundRef.current.duration());
      },
      onend: () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      },
      onloaderror: (id, error) => {
        alert(`Error loading audio: ${error}`);
        console.error("Howl error:", error);
      },
    });

    return () => {
      soundRef.current.unload();
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (duration) {
      setProgressPercentage((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  const togglePlay = () => {
    if (isPlaying) {
      soundRef.current.pause();
      clearInterval(intervalRef.current);
    } else {
      soundRef.current.play();
      intervalRef.current = setInterval(() => {
        setCurrentTime(soundRef.current.seek());
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    const newTime = Math.max(0, soundRef.current.seek() - 15);
    soundRef.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, soundRef.current.seek() + 15);
    soundRef.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    soundRef.current.rate(rate);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    soundRef.current.volume(newMutedState ? 0 : 1);
  };

  const handleScrubStart = (e) => {
    setIsScrubbing(true);
    updateScrubPosition(e);
  };

  const handleScrubMove = (e) => {
    if (isScrubbing) updateScrubPosition(e);
  };

  const handleScrubEnd = () => {
    if (isScrubbing) {
      setIsScrubbing(false);
    }
  };

  const updateScrubPosition = (e) => {
    const target = e.target.closest(
      ".music-player-slider, .music-player-mobile-slider"
    );
    const progressBarRect = target.getBoundingClientRect();
    const offsetX = (e.clientX || e.touches[0].clientX) - progressBarRect.left; // For touch events
    const newScrubPercentage = Math.min(
      Math.max((offsetX / progressBarRect.width) * 100, 0),
      100
    );
    const newTime = (newScrubPercentage / 100) * duration;

    // Update currentTime and soundRef
    setCurrentTime(newTime);
    soundRef.current.seek(newTime);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      handleScrubEnd();
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleScrubMove);
    window.addEventListener("touchend", handleMouseUp); // Handle touch end
    window.addEventListener("touchmove", handleScrubMove); // Handle touch move

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleScrubMove);
      window.removeEventListener("touchend", handleMouseUp); // Cleanup touch end
      window.removeEventListener("touchmove", handleScrubMove); // Cleanup touch move
    };
  }, [isScrubbing]);

  return (
    <>
      <div
        className={`position-fixed bottom-0 w-100 podcast-player ${
          isMinimized ? "minimized" : ""
        }`}
      >
        {!isMinimized && (
          <div
            className="music-player-mobile-slider"
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart} // Allow touch support
          >
            <span
              className="music-player-progress"
              style={{
                width: `${progressPercentage}%`,
              }}
            >
              <span className="progress-scrubber"></span>
            </span>
          </div>
        )}
        {!isMinimized && (
          <div className="musicPlayerParent w-100 d-flex justify-content-between align-items-center position-relative">
            <div className="music-player-info d-flex">
              <div className="music-player-nav">
                <div className="music-player-nav-right music-player-nav-buttons position-relative">
                  <FiChevronLeft color="#fff" strokeWidth={3} />
                </div>
                <div className="music-player-nav-left music-player-nav-buttons position-relative">
                  <FiChevronRight color="#fff" strokeWidth={3} />
                </div>
              </div>
              <div className="music-player-content d-flex flex-column justify-content-between">
                <div>
                  <h4>Easy Strategies to Help</h4>
                </div>
                <div className="music-player-category">
                  <a href="/">Fashion</a>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <div
                  className="player-skip-back-button player-buttons"
                  onClick={skipBackward}
                >
                  <span>-15s</span>
                </div>
                <div
                  className="player-buttons playButton position-relative"
                  onClick={togglePlay}
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </div>
                <div
                  className="player-jump-forward-button player-buttons"
                  onClick={skipForward}
                >
                  <span>+15s</span>
                </div>
              </div>
              <div
                className="music-player-time-rail music-player-slider"
                onMouseDown={handleScrubStart}
                onTouchStart={handleScrubStart} // Allow touch support
              >
                <span className="music-player-total music-player-slider">
                  <span
                    className="music-player-progress"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  >
                    <span className="progress-scrubber"></span>
                  </span>
                </span>
              </div>

              <div className="align-items-center music-player-time">
                <span className="music-player-currenttime">
                  {formatTime(currentTime)}
                </span>
                <span>&nbsp;/&nbsp;</span>
                <span className="music-player-duration">
                  {formatTime(duration)}
                </span>
              </div>
              <div
                className="player-buttons music-player-audio-button"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <FaVolumeMute size={20} />
                ) : (
                  <FaVolumeUp size={20} />
                )}
              </div>
              <div className="player-buttons music-player-speed-button d-flex flex-column position-relative">
                <ul className="music-player-speed-change list-unstyled">
                  {[2, 1.75, 1.5, 1.25, 1, 0.5].map((rate) => (
                    <li key={rate} onClick={() => changePlaybackRate(rate)}>
                      {rate}x
                    </li>
                  ))}
                </ul>
                <span>{playbackRate}x</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};
