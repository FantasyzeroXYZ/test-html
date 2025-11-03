import React from 'react';

const SubtitleSection = ({ subtitle, onWordClick, onSentenceClick }) => {
  const {
    subtitleVisible,
    currentSubtitleIndex,
    subtitles,
    setSubtitleVisible
  } = subtitle;

  const currentSubtitle = currentSubtitleIndex >= 0 ? subtitles[currentSubtitleIndex] : null;

  const renderClickableText = (text, isEnglish = true) => {
    if (!text) return "无字幕";
    
    if (isEnglish) {
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
    
    // 日语模式：整个句子可点击
    return (
      <span onClick={() => onSentenceClick(text)}>
        {text}
      </span>
    );
  };

  return (
    <section className="subtitle-section">
      <div 
        className="subtitle-display" 
        id="subtitle-display"
        style={{ display: subtitleVisible ? 'block' : 'none' }}
      >
        <div className="subtitle-text" id="subtitle-text">
          {currentSubtitle ? (
            renderClickableText(currentSubtitle.text)
          ) : (
            "无字幕"
          )}
        </div>
      </div>
      
      <div className="subtitle-controls">
        <button 
          className="subtitle-btn" 
          onClick={() => setSubtitleVisible(!subtitleVisible)}
        >
          {subtitleVisible ? '隐藏字幕' : '显示字幕'}
        </button>
      </div>
      
      <p className="hint">
        提示：直接点击字幕中的单词，该单词会自动查询并显示释义
      </p>
    </section>
  );
};

export default SubtitleSection;