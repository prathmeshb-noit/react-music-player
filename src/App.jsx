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
} from "react-icons/fa";

export default function App() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);

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

  const togglePlayerVisibility = () => {
    setIsMinimized(!isMinimized);
  };
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercentage, setScrubPercentage] = useState(0);

  const handleScrubStart = (e) => {
    setIsScrubbing(true);
    updateScrubPosition(e);
  };

  const handleScrubMove = (e) => {
    if (isScrubbing) updateScrubPosition(e);
  };

  const handleScrubEnd = () => {
    if (isScrubbing) {
      const newTime = (scrubPercentage / 100) * duration;
      soundRef.current.seek(newTime);
      setCurrentTime(newTime);
      setIsScrubbing(false);
    }
  };

  const updateScrubPosition = (e) => {
    const progressBarRect = e.target
      .closest(".music-player-slider")
      .getBoundingClientRect();
    const offsetX = e.clientX - progressBarRect.left;
    const newScrubPercentage = Math.min(
      Math.max((offsetX / progressBarRect.width) * 100, 0),
      100
    );
    setScrubPercentage(newScrubPercentage);
    setCurrentTime((newScrubPercentage / 100) * duration); // Show time as user scrubs
  };
  useEffect(() => {
    const handleMouseUp = () => {
      if (isScrubbing) handleScrubEnd();
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleScrubMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleScrubMove);
    };
  }, [isScrubbing, scrubPercentage]);

  return (
    <>
      <div
        className={`position-fixed bottom-0 w-100 podcast-player ${
          isMinimized ? "minimized" : ""
        }`}
      >
        {!isMinimized && <div className="music-player-mobile-slider"></div>}
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
                className="music-player-time-rail"
                onMouseDown={handleScrubStart}
                onMouseMove={handleScrubMove}
                onMouseUp={handleScrubEnd}
              >
                <span className="music-player-total music-player-slider">
                  <span
                    className="music-player-progress"
                    style={{
                      width: `${
                        isScrubbing ? scrubPercentage : progressPercentage
                      }%`,
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
              <div className="player-buttons music-player-audio-button">
                <FaVolumeUp size={20} />
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
