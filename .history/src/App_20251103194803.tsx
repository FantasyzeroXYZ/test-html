import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import AnkiSection from './components/AnkiSection';
import PlayerSection from './components/PlayerSection';
import SubtitleSection from './components/SubtitleSection';
import DictionaryPanel from './components/DictionaryPanel';
import SubtitleListPanel from './components/SubtitleListPanel';
import { useAnki } from './hooks/useAnki';
import { useMediaPlayer } from './hooks/useMediaPlayer';
import { useSubtitle } from './hooks/useSubtitle';
import { useDictionary } from './hooks/useDictionary';
import './styles/App.css';

function App() {
  // Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  
  // Hooks
  const anki = useAnki();
  const mediaPlayer = useMediaPlayer(videoRef, audioRef);
  const subtitle = useSubtitle();
  const dictionary = useDictionary();
  
  // State
  const [showDictionaryPanel, setShowDictionaryPanel] = useState(false);
  const [showSubtitleListPanel, setShowSubtitleListPanel] = useState(false);

  // 初始化
  useEffect(() => {
    anki.checkConnection();
  }, []);

  // 同步字幕更新
  useEffect(() => {
    if (mediaPlayer.currentTime !== undefined) {
      subtitle.updateSubtitle(mediaPlayer.currentTime);
    }
  }, [mediaPlayer.currentTime, subtitle]);

  // 处理单词点击
  const handleWordClick = (word, sentence) => {
    dictionary.setCurrentWord(word);
    dictionary.setCurrentSentence(sentence);
    mediaPlayer.pause();
    setShowDictionaryPanel(true);
    dictionary.searchWord(word);
  };

  // 处理句子点击（日语模式）
  const handleSentenceClick = (sentence) => {
    dictionary.setCurrentSentence(sentence);
    mediaPlayer.pause();
    setShowDictionaryPanel(true);
    // 这里可以添加日语分词逻辑
  };

  // 处理时间跳转
  const handleTimeJump = (time) => {
    mediaPlayer.handleTimeJump(time);
  };

  return (
    <div className="app">
      <Header />
      
      <div className="container">
        <AnkiSection 
          anki={anki}
          mediaPlayer={mediaPlayer}
          subtitle={subtitle}
        />
        
        <PlayerSection
          mediaPlayer={mediaPlayer}
          subtitle={subtitle}
          dictionary={dictionary}
          onWordClick={handleWordClick}
          onSentenceClick={handleSentenceClick}
          onShowSubtitleList={() => setShowSubtitleListPanel(true)}
        />
        
        <SubtitleSection
          subtitle={subtitle}
          onWordClick={handleWordClick}
          onSentenceClick={handleSentenceClick}
        />
        
        <div className="github-link">
          <a href="https://github.com/FantasyzeroXYZ/test-html" target="_blank" title="查看项目源码">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>

      {/* 底部弹出面板 */}
      <DictionaryPanel
        isOpen={showDictionaryPanel}
        onClose={() => setShowDictionaryPanel(false)}
        dictionary={dictionary}
        anki={anki}
        mediaPlayer={mediaPlayer}
        subtitle={subtitle}
      />

      <SubtitleListPanel
        isOpen={showSubtitleListPanel}
        onClose={() => setShowSubtitleListPanel(false)}
        subtitle={subtitle}
        mediaPlayer={mediaPlayer}
        onTimeJump={handleTimeJump}
      />
    </div>
  );
}

export default App;