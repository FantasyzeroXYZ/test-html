import { useState, useCallback } from 'react';

export const useDictionary = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [currentSentence, setCurrentSentence] = useState('');
  const [dictionaryResult, setDictionaryResult] = useState('');
  const [currentLanguageMode, setCurrentLanguageMode] = useState('english');
  const [customDefinition, setCustomDefinition] = useState('');

  const searchWord = useCallback(async (word) => {
    if (!word.trim()) {
      setDictionaryResult('请输入要查询的单词');
      return;
    }

    setDictionaryResult('查询中...');
    
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`未找到单词 "${word}" 的定义`);
        } else {
          throw new Error(`API请求失败: ${response.status}`);
        }
      }
      
      const data = await response.json();
      displayWordData(data[0]);
    } catch (error) {
      setDictionaryResult(`错误: ${error.message}`);
      console.error('查询错误:', error);
    }
  }, []);

  const displayWordData = useCallback((wordData) => {
    let html = '';
    
    if (!wordData) {
      html = '<div class="error">未找到单词信息</div>';
      setDictionaryResult(html);
      return;
    }

    // 单词标题和音标
    html += `<div class="word-header">`;
    html += `<div class="word-title">${wordData.word}</div>`;
    
    if (wordData.phonetic) {
      html += `<div class="phonetic">${wordData.phonetic}</div>`;
    } else if (wordData.phonetics && wordData.phonetics.length > 0) {
      const phonetic = wordData.phonetics.find(p => p.text) || wordData.phonetics[0];
      if (phonetic && phonetic.text) {
        html += `<div class="phonetic">${phonetic.text}</div>`;
      }
    }
    
    html += `</div>`;
    
    // 词义解释
    if (wordData.meanings && wordData.meanings.length > 0) {
      wordData.meanings.forEach(meaning => {
        html += `<div class="meaning-section">`;
        html += `<div class="part-of-speech">${meaning.partOfSpeech}</div>`;
        
        if (meaning.definitions && meaning.definitions.length > 0) {
          meaning.definitions.forEach((def, index) => {
            if (index < 3) { // 只显示前三个定义
              html += `<div class="definition">${index + 1}. ${def.definition}</div>`;
              if (def.example) {
                html += `<div class="example">例句: "${def.example}"</div>`;
              }
            }
          });
        }
        
        html += `</div>`;
      });
    } else {
      html += `<div class="meaning-section">`;
      html += `<div class="definition">未找到该单词的详细释义。</div>`;
      html += `</div>`;
    }
    
    setDictionaryResult(html);
  }, []);

  const toggleLanguageMode = useCallback(() => {
    setCurrentLanguageMode(current => 
      current === 'english' ? 'japanese' : 'english'
    );
  }, []);

  return {
    currentWord,
    currentSentence,
    dictionaryResult,
    currentLanguageMode,
    customDefinition,
    setCurrentWord,
    setCurrentSentence,
    setDictionaryResult,
    setCustomDefinition,
    searchWord,
    toggleLanguageMode
  };
};