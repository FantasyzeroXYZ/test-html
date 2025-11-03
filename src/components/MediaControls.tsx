import React, { useState } from 'react';

const MediaControls = ({ mediaPlayer, subtitle, onShowSubtitleList, onTimeJump }) => {
  const [timeInput, setTimeInput] = useState('');
  
  const {
    currentMediaType,
    videoSubtitlesVisible,
    audioSubtitlesVisible,
    setVideoSubtitlesVisible,
    setAudioSubtitlesVisible
  } = mediaPlayer;

  const handleTimeJump = () => {
    const time = parseFloat(timeInput);
    if (!isNaN(time) && time >= 0) {
      onTimeJump(time);
      setTimeInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTimeJump();
    }
  };

  const handlePrevSentence = () => {
    if (subtitle.currentSubtitleIndex > 0) {
      const prevIndex = subtitle.currentSubtitleIndex - 1;
      onTimeJump(subtitle.subtitles[prevIndex].start);
    }
  };

  const handleNextSentence = () => {
    if (subtitle.currentSubtitleIndex < subtitle.subtitles.length - 1) {
      const nextIndex = subtitle.currentSubtitleIndex + 1;
      onTimeJump(subtitle.subtitles[nextIndex].start);
    }
  };

  return (
    <div className="video-controls">
      <button 
        className="control-btn" 
        onClick={handlePrevSentence}
        title="上一句"
        disabled={subtitle.currentSubtitleIndex <= 0}
      >
        <i className="fas fa-step-backward"></i>
      </button>
      
      <button 
        className="control-btn" 
        onClick={handleNextSentence}
        title="下一句"
        disabled={subtitle.currentSubtitleIndex >= subtitle.subtitles.length - 1}
      >
        <i className="fas fa-step-forward"></i>
      </button>
      
      {currentMediaType === 'video' && (
        <button 
          className="control-btn" 
          onClick={() => setVideoSubtitlesVisible(!videoSubtitlesVisible)}
          title="切换视频内字幕"
        >
          <i className="fas fa-closed-captioning"></i>
        </button>
      )}
      
      <button 
        className="control-btn" 
        onClick={onShowSubtitleList}
        title="全部字幕"
      >
        <i className="fas fa-list"></i>
      </button>
      
      {currentMediaType === 'audio' && (
        <button 
          className="control-btn" 
          onClick={() => setAudioSubtitlesVisible(!audioSubtitlesVisible)}
          title="切换音频字幕"
        >
          <i className="fas fa-volume-up"></i>
        </button>
      )}
      
      <div className="time-input-container">
        <input 
          type="number" 
          className="time-input" 
          placeholder="时间(秒)" 
          step="0.1" 
          min="0"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="time-jump-btn" 
          onClick={handleTimeJump}
        >
          跳转
        </button>
      </div>
    </div>
  );
};

export default MediaControls;