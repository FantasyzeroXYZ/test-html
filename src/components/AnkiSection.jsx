import React, { useState } from 'react';

const AnkiSection = ({ anki, mediaPlayer, subtitle }) => {
  const [showConfig, setShowConfig] = useState(false);

  const {
    ankiConnected,
    ankiStatusText,
    ankiDecks,
    ankiModels,
    currentModelFields,
    deckSelect,
    modelSelect,
    wordFieldSelect,
    sentenceFieldSelect,
    definitionFieldSelect,
    audioFieldSelect,
    imageFieldSelect,
    checkConnection,
    loadAnkiDecks,
    loadAnkiModels,
    loadModelFields,
    setDefaultFields,
    saveConfig
  } = anki;

  const handleModelChange = (e) => {
    modelSelect.value = e.target.value;
    loadModelFields(e.target.value);
    saveConfig();
  };

  const handleDeckChange = (e) => {
    deckSelect.value = e.target.value;
    saveConfig();
  };

  const handleFieldChange = (field, value) => {
    field.value = value;
    saveConfig();
  };

  return (
    <section className="anki-section">
      <div className="anki-container">
        <div className="anki-status-row">
          <div className="anki-status">
            <div 
              className={`status-indicator ${ankiConnected ? 'status-connected' : 'status-disconnected'}`}
              id="anki-status-indicator"
            ></div>
            <span id="anki-status-text">{ankiStatusText}</span>
          </div>
          <div className="anki-controls">
            <button className="anki-btn" onClick={checkConnection}>
              状态
            </button>
            <button 
              className="anki-btn" 
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? '收起' : '配置'}
            </button>
          </div>
        </div>
        
        {/* 顶部控制按钮 */}
        <div className="top-controls">
          <button 
            className="media-mode-btn" 
            onClick={() => mediaPlayer.setCurrentMediaType(
              mediaPlayer.currentMediaType === 'video' ? 'audio' : 'video'
            )}
          >
            <i className="fas fa-video"></i> 
            {mediaPlayer.currentMediaType === 'video' ? '视频模式' : '音频模式'}
          </button>
          
          <button 
            className="language-mode-btn"
            onClick={() => {} /* 待实现 */}
          >
            <i className="fas fa-language"></i> 英语模式
          </button>
          
          <div className="import-controls">
            <button 
              className="import-btn"
              onClick={() => document.getElementById('subtitle-file-input').click()}
            >
              <i className="fas fa-closed-captioning"></i> 字幕
            </button>
            
            <button 
              className="import-btn"
              onClick={() => {
                const input = mediaPlayer.currentMediaType === 'video' 
                  ? document.getElementById('video-file-input') 
                  : document.getElementById('audio-file-input');
                input.click();
              }}
            >
              <i className={`fas fa-file-${mediaPlayer.currentMediaType === 'video' ? 'video' : 'audio'}`}></i> 
              {mediaPlayer.currentMediaType === 'video' ? '视频' : '音频'}
            </button>
          </div>
        </div>
        
        {/* 隐藏的文件输入 */}
        <input 
          type="file" 
          id="video-file-input" 
          accept="video/*" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) mediaPlayer.handleFileSelect(file, 'video');
          }}
        />
        <input 
          type="file" 
          id="audio-file-input" 
          accept="audio/*" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) mediaPlayer.handleFileSelect(file, 'audio');
          }}
        />
        <input 
          type="file" 
          id="subtitle-file-input" 
          accept=".srt,.vtt,.txt" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => subtitle.parseSubtitle(e.target.result);
              reader.readAsText(file);
            }
          }}
        />
        
        {/* Anki配置区域 */}
        <div className={`auto-config-section ${showConfig ? '' : 'hidden'}`} id="auto-config-section">
          <div className="auto-config-row">
            <label className="auto-config-label" htmlFor="deck-select">牌组:</label>
            <select 
              className="auto-config-select" 
              id="deck-select"
              value={deckSelect.value}
              onChange={handleDeckChange}
            >
              <option value="">选择牌组...</option>
              {ankiDecks.map(deck => (
                <option key={deck} value={deck}>{deck}</option>
              ))}
            </select>
          </div>
          
          <div className="auto-config-row">
            <label className="auto-config-label" htmlFor="model-select">笔记类型:</label>
            <select 
              className="auto-config-select" 
              id="model-select"
              value={modelSelect.value}
              onChange={handleModelChange}
            >
              <option value="">选择笔记类型...</option>
              {ankiModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          {currentModelFields.length > 0 && (
            <>
              <div className="auto-config-row">
                <label className="auto-config-label" htmlFor="word-field-select">单词字段:</label>
                <select 
                  className="auto-config-select" 
                  id="word-field-select"
                  value={wordFieldSelect.value}
                  onChange={(e) => handleFieldChange(wordFieldSelect, e.target.value)}
                >
                  {currentModelFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              
              <div className="auto-config-row">
                <label className="auto-config-label" htmlFor="sentence-field-select">句子字段:</label>
                <select 
                  className="auto-config-select" 
                  id="sentence-field-select"
                  value={sentenceFieldSelect.value}
                  onChange={(e) => handleFieldChange(sentenceFieldSelect, e.target.value)}
                >
                  {currentModelFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              
              <div className="auto-config-row">
                <label className="auto-config-label" htmlFor="definition-field-select">释义字段:</label>
                <select 
                  className="auto-config-select" 
                  id="definition-field-select"
                  value={definitionFieldSelect.value}
                  onChange={(e) => handleFieldChange(definitionFieldSelect, e.target.value)}
                >
                  {currentModelFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              
              <div className="auto-config-row">
                <label className="auto-config-label" htmlFor="audio-field-select">音频字段:</label>
                <select 
                  className="auto-config-select" 
                  id="audio-field-select"
                  value={audioFieldSelect.value}
                  onChange={(e) => handleFieldChange(audioFieldSelect, e.target.value)}
                >
                  <option value="">无</option>
                  {currentModelFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              
              <div className="auto-config-row">
                <label className="auto-config-label" htmlFor="image-field-select">图片字段:</label>
                <select 
                  className="auto-config-select" 
                  id="image-field-select"
                  value={imageFieldSelect.value}
                  onChange={(e) => handleFieldChange(imageFieldSelect, e.target.value)}
                >
                  <option value="">无</option>
                  {currentModelFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              
              <div className="auto-config-row">
                <button 
                  className="anki-btn" 
                  onClick={setDefaultFields}
                  style={{ marginLeft: 'auto' }}
                >
                  智能设置字段
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnkiSection;