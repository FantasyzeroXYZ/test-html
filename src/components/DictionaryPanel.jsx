import React, { useState, useEffect } from 'react';

const DictionaryPanel = ({ 
  isOpen, 
  onClose, 
  dictionary, 
  anki, 
  mediaPlayer, 
  subtitle 
}) => {
  const [activeTab, setActiveTab] = useState('dictionary-tab');
  const [searchInput, setSearchInput] = useState('');
  const [isProcessingAnki, setIsProcessingAnki] = useState(false);

  const {
    currentWord,
    currentSentence,
    dictionaryResult,
    customDefinition,
    setCurrentWord,
    setCustomDefinition,
    searchWord
  } = dictionary;

  // 当面板打开时，初始化搜索输入
  useEffect(() => {
    if (isOpen && currentWord) {
      setSearchInput(currentWord);
    }
  }, [isOpen, currentWord]);

  // 处理搜索
  const handleSearch = () => {
    if (searchInput.trim()) {
      setCurrentWord(searchInput);
      searchWord(searchInput);
      setActiveTab('dictionary-tab');
    }
  };

  // 处理回车键搜索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理添加到Anki
  const handleAddToAnki = async () => {
    if (isProcessingAnki) return;
    
    if (!anki.ankiConnected) {
      alert('请先连接Anki!');
      return;
    }

    const word = searchInput.trim();
    if (!word) {
      alert('请输入要添加的单词!');
      return;
    }

    // 获取释义内容
    let definition = '';
    if (activeTab === 'dictionary-tab') {
      // 从字典结果中提取文本内容
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = dictionaryResult;
      definition = tempDiv.textContent || tempDiv.innerText || '';
    } else if (activeTab === 'custom-tab') {
      definition = customDefinition.trim();
    }

    if (!definition) {
      alert('请提供单词释义!');
      return;
    }

    setIsProcessingAnki(true);
    
    try {
      // 这里应该调用实际的Anki添加逻辑
      console.log('准备添加到Anki:', { word, definition, sentence: currentSentence });
      
      // 模拟Anki添加过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('卡片已成功添加到Anki!');
      onClose();
    } catch (error) {
      console.error('添加卡片失败:', error);
      alert('添加卡片失败: ' + error.message);
    } finally {
      setIsProcessingAnki(false);
    }
  };

  // 处理追加词汇（日语模式）
  const handleAppendWord = () => {
    // 这里可以实现日语词汇追加逻辑
    console.log('追加词汇功能');
  };

  // 加载网页查询
  const loadWebSearch = (word) => {
    if (!word) return;
    // 这里可以实现网页查询逻辑
    console.log('网页查询:', word);
  };

  // 切换标签页
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'web-tab' && searchInput) {
      loadWebSearch(searchInput);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="panel-overlay active" onClick={onClose}></div>
      <div className="dictionary-panel active">
        <div className="panel-header">
          <div className="panel-title">
            {currentWord ? `查询: ${currentWord}` : '单词查询'}
          </div>
          <button className="close-panel" onClick={onClose}>×</button>
        </div>
        
        {/* 搜索和操作区域 */}
        <div className="panel-search-anki-container">
          <div className="panel-search-container">
            <input 
              type="text" 
              className="panel-search-input" 
              placeholder="输入要查询的单词..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="panel-search-btn" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
            <button 
              className="append-word-btn" 
              onClick={handleAppendWord}
              title="追加词汇"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <button 
            className="panel-anki-btn" 
            onClick={handleAddToAnki}
            disabled={isProcessingAnki}
            title="添加到Anki"
          >
            {isProcessingAnki ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-plus-circle"></i>
            )}
          </button>
        </div>
        
        {/* 原句显示 */}
        <div className="original-sentence">
          {currentSentence || '原句将显示在这里...'}
        </div>
        
        {/* 标签页导航 */}
        <div className="dictionary-tabs">
          <button 
            className={`tab-button ${activeTab === 'dictionary-tab' ? 'active' : ''}`}
            onClick={() => handleTabChange('dictionary-tab')}
          >
            词典释义
          </button>
          <button 
            className={`tab-button ${activeTab === 'custom-tab' ? 'active' : ''}`}
            onClick={() => handleTabChange('custom-tab')}
          >
            自定义释义
          </button>
          <button 
            className={`tab-button ${activeTab === 'web-tab' ? 'active' : ''}`}
            onClick={() => handleTabChange('web-tab')}
          >
            网页查询
          </button>
        </div>
        
        {/* 标签页内容 */}
        <div className="tab-content">
          {/* 词典释义标签页 */}
          <div 
            id="dictionary-tab" 
            className={`tab-pane ${activeTab === 'dictionary-tab' ? 'active' : ''}`}
          >
            <div 
              className="dictionary-result"
              dangerouslySetInnerHTML={{ __html: dictionaryResult || '查询结果将显示在这里...' }}
            />
          </div>
          
          {/* 自定义释义标签页 */}
          <div 
            id="custom-tab" 
            className={`tab-pane ${activeTab === 'custom-tab' ? 'active' : ''}`}
          >
            <div className="custom-definition">
              <textarea 
                value={customDefinition}
                onChange={(e) => setCustomDefinition(e.target.value)}
                placeholder="如果查词没有返回内容或者想自定义释义内容，请在此输入..."
                rows="6"
              />
            </div>
          </div>
          
          {/* 网页查询标签页 */}
          <div 
            id="web-tab" 
            className={`tab-pane ${activeTab === 'web-tab' ? 'active' : ''}`}
          >
            <div className="dictionary-result">
              <iframe 
                id="web-search-frame" 
                style={{ width: '100%', height: '300px', border: 'none' }} 
                src={searchInput ? 
                  `https://www.youdao.com/result?word=${encodeURIComponent(searchInput)}&lang=en` : 
                  'about:blank'
                }
                title="网页查询"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DictionaryPanel;