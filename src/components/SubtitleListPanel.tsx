import React from 'react';

const SubtitleListPanel = ({ 
  isOpen, 
  onClose, 
  subtitle, 
  mediaPlayer, 
  onTimeJump 
}) => {
  const { subtitles, currentSubtitleIndex } = subtitle;

  const handleSubtitleClick = (index) => {
    if (index >= 0 && index < subtitles.length) {
      onTimeJump(subtitles[index].start);
      onClose();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="panel-overlay active" onClick={onClose}></div>
      <div className="subtitle-list-panel active">
        <div className="panel-header">
          <div className="panel-title">全部字幕</div>
          <button className="close-panel" onClick={onClose}>×</button>
        </div>
        
        <ul className="subtitle-list">
          {subtitles.length === 0 ? (
            <li className="subtitle-item">无字幕</li>
          ) : (
            subtitles.map((subtitle, index) => (
              <li 
                key={index}
                className={`subtitle-item ${index === currentSubtitleIndex ? 'active' : ''}`}
                onClick={() => handleSubtitleClick(index)}
              >
                {formatTime(subtitle.start)} - {formatTime(subtitle.end)}: {subtitle.text}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
};

export default SubtitleListPanel;