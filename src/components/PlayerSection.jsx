import React from 'react';
import MediaControls from './MediaControls';

const PlayerSection = ({ 
  mediaPlayer, 
  subtitle, 
  dictionary, 
  onWordClick, 
  onSentenceClick, 
  onShowSubtitleList 
}) => {
  const {
    videoRef,
    audioRef,
    currentMediaType,
    trackTitle,
    trackDescription,
    mediaIcon,
    isPlaying,
    currentTime,
    duration,
    volume,
    handlePlayPause,
    handleTimeUpdate,
    handleVolumeChange,
    handleTimeJump,
    handleFileSelect
  } = mediaPlayer;

  return (
    <section className="player-section">
      <div className="player-container">
        <div className="audio-info">
          <div className="album-art">
            <i id="media-icon">{mediaIcon}</i>
          </div>
          <div className="track-info">
            <h2 id="track-title">{trackTitle}</h2>
            <p id="track-description">{trackDescription}</p>
          </div>
        </div>
        
        {/* 视频播放器 */}
        <div className={`video-player ${currentMediaType === 'video' ? 'active' : ''}`} id="video-player">
          <video 
            ref={videoRef} 
            id="player" 
            controls
            onTimeUpdate={handleTimeUpdate}
          >
            {/* 视频源将通过JavaScript动态设置 */}
          </video>
          <div className="video-subtitles" id="video-subtitles">
            {/* 视频内字幕将动态生成 */}
          </div>
        </div>
        
        {/* 音频播放器 */}
        <div className={`audio-player ${currentMediaType === 'audio' ? 'active' : ''}`} id="audio-player">
          <div className="audio-player-container">
            <div className="audio-controls">
              <div className="audio-progress-container">
                <span className="audio-time" id="audio-current-time">
                  {formatTime(currentTime)}
                </span>
                <div className="audio-progress" id="audio-progress">
                  <div 
                    className="audio-progress-filled" 
                    id="audio-progress-filled"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                  <div className="progress-thumb" id="progress-thumb"></div>
                </div>
                <span className="audio-time" id="audio-duration">
                  {formatTime(duration)}
                </span>
              </div>
              
              <div className="audio-volume-container">
                <span>🔊</span>
                <div className="audio-volume" id="audio-volume">
                  <div 
                    className="audio-volume-filled" 
                    id="audio-volume-filled"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                  <div className="volume-thumb" id="volume-thumb"></div>
                </div>
              </div>
              
              <div className="audio-buttons">
                <button 
                  className={`audio-btn ${isPlaying ? 'active' : ''}`} 
                  id="audio-play-pause-btn"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
              </div>
            </div>
          </div>
          
          {/* 音频滚动字幕 */}
          <div className={`audio-subtitles ${subtitle.audioSubtitlesVisible ? 'active' : ''}`} id="audio-subtitles">
            {subtitle.audioSubtitles.map((item, index) => (
              <div 
                key={index}
                className={`audio-subtitle-item ${index === subtitle.currentSubtitleIndex ? 'active' : ''}`}
                onClick={() => onSentenceClick(item.text)}
              >
                {renderClickableText(item.text, dictionary.currentLanguageMode, onWordClick)}
              </div>
            ))}
          </div>
        </div>
        
        <MediaControls
          mediaPlayer={mediaPlayer}
          subtitle={subtitle}
          onShowSubtitleList={onShowSubtitleList}
          onTimeJump={handleTimeJump}
        />
      </div>
    </section>
  );
};

// 辅助函数
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderClickableText(text, languageMode, onWordClick) {
  if (languageMode === 'english') {
    const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
    let lastIndex = 0;
    let result = [];
    let match;
    
    while ((match = wordRegex.exec(text)) !== null) {
      // 添加匹配前的非单词部分
      if (match.index > lastIndex) {
        result.push(text.substring(lastIndex, match.index));
      }
      
      // 添加可点击的单词
      result.push(
        <span 
          key={match.index}
          className="word" 
          onClick={() => onWordClick(match[0], text)}
        >
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加剩余的非单词部分
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result;
  }
  
  return text;
}

export default PlayerSection;