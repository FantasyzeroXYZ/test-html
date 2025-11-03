import { useState, useRef, useCallback } from 'react';

export const useAnki = () => {
  const [ankiConnected, setAnkiConnected] = useState(false);
  const [ankiStatusText, setAnkiStatusText] = useState('检查Anki连接状态...');
  const [ankiDecks, setAnkiDecks] = useState([]);
  const [ankiModels, setAnkiModels] = useState([]);
  const [currentModelFields, setCurrentModelFields] = useState([]);

  // 使用ref来存储配置值，避免重新渲染
  const deckSelect = useRef({ value: '' });
  const modelSelect = useRef({ value: '' });
  const wordFieldSelect = useRef({ value: '' });
  const sentenceFieldSelect = useRef({ value: '' });
  const definitionFieldSelect = useRef({ value: '' });
  const audioFieldSelect = useRef({ value: '' });
  const imageFieldSelect = useRef({ value: '' });

  const checkConnection = useCallback(async () => {
    setAnkiStatusText('检查Anki连接状态...');
    
    try {
      const response = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'version',
          version: 6
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          setAnkiConnected(true);
          setAnkiStatusText('Anki已连接');
          
          // 获取牌组和模型信息
          await loadAnkiDecks();
          await loadAnkiModels();
        } else {
          throw new Error('AnkiConnect响应错误');
        }
      } else {
        throw new Error('AnkiConnect响应错误');
      }
    } catch (error) {
      setAnkiConnected(false);
      setAnkiStatusText('Anki未连接');
      console.error('Anki连接错误:', error);
    }
  }, []);

  const loadAnkiDecks = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'deckNames',
          version: 6
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnkiDecks(data.result);
        loadConfig();
      }
    } catch (error) {
      console.error('获取牌组列表错误:', error);
    }
  }, []);

  const loadAnkiModels = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'modelNames',
          version: 6
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnkiModels(data.result);
        loadConfig();
        
        // 默认选择第一个模型并加载字段
        if (data.result.length > 0 && !modelSelect.current.value) {
          modelSelect.current.value = data.result[0];
          await loadModelFields(data.result[0]);
        } else if (modelSelect.current.value) {
          // 如果已有保存的模型，加载其字段
          await loadModelFields(modelSelect.current.value);
        }
      }
    } catch (error) {
      console.error('获取模型列表错误:', error);
    }
  }, []);

  const loadModelFields = useCallback(async (modelName) => {
    try {
      const response = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'modelFieldNames',
          version: 6,
          params: {
            modelName: modelName
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentModelFields(data.result);
        loadConfig();
        
        // 如果字段为空，尝试智能设置默认字段
        if (!wordFieldSelect.current.value) {
          setDefaultFields();
        }
      }
    } catch (error) {
      console.error('获取模型字段错误:', error);
    }
  }, []);

  const setDefaultFields = useCallback(() => {
    const fields = currentModelFields.map(f => f.toLowerCase());
    
    // 设置单词字段
    if (fields.includes('word')) {
      wordFieldSelect.current.value = 'word';
    } else if (fields.includes('front')) {
      wordFieldSelect.current.value = 'front';
    } else if (fields.length > 0) {
      wordFieldSelect.current.value = currentModelFields[0];
    }
    
    // 设置句子字段
    if (fields.includes('sentence')) {
      sentenceFieldSelect.current.value = 'sentence';
    } else if (fields.includes('example')) {
      sentenceFieldSelect.current.value = 'example';
    } else if (fields.includes('back')) {
      sentenceFieldSelect.current.value = 'back';
    } else if (fields.length > 1) {
      sentenceFieldSelect.current.value = currentModelFields[1];
    }
    
    // 设置释义字段
    if (fields.includes('definition')) {
      definitionFieldSelect.current.value = 'definition';
    } else if (fields.includes('meaning')) {
      definitionFieldSelect.current.value = 'meaning';
    } else if (fields.includes('back')) {
      definitionFieldSelect.current.value = 'back';
    } else if (fields.length > 2) {
      definitionFieldSelect.current.value = currentModelFields[2];
    }
    
    // 设置音频字段
    if (fields.includes('audio')) {
      audioFieldSelect.current.value = 'audio';
    } else if (fields.includes('sound')) {
      audioFieldSelect.current.value = 'sound';
    } else if (fields.length > 3) {
      audioFieldSelect.current.value = currentModelFields[3];
    }
    
    // 设置图片字段
    if (fields.includes('image')) {
      imageFieldSelect.current.value = 'image';
    } else if (fields.includes('picture')) {
      imageFieldSelect.current.value = 'picture';
    } else if (fields.length > 4) {
      imageFieldSelect.current.value = currentModelFields[4];
    }
    
    saveConfig();
  }, [currentModelFields]);

  const saveConfig = useCallback(() => {
    const config = {
      deck: deckSelect.current.value,
      model: modelSelect.current.value,
      wordField: wordFieldSelect.current.value,
      sentenceField: sentenceFieldSelect.current.value,
      definitionField: definitionFieldSelect.current.value,
      audioField: audioFieldSelect.current.value,
      imageField: imageFieldSelect.current.value
    };
    localStorage.setItem('ankiConfig', JSON.stringify(config));
  }, []);

  const loadConfig = useCallback(() => {
    const savedConfig = localStorage.getItem('ankiConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.deck) deckSelect.current.value = config.deck;
        if (config.model) modelSelect.current.value = config.model;
        if (config.wordField) wordFieldSelect.current.value = config.wordField;
        if (config.sentenceField) sentenceFieldSelect.current.value = config.sentenceField;
        if (config.definitionField) definitionFieldSelect.current.value = config.definitionField;
        if (config.audioField) audioFieldSelect.current.value = config.audioField;
        if (config.imageField) imageFieldSelect.current.value = config.imageField;
      } catch (e) {
        console.error('加载配置失败:', e);
      }
    }
  }, []);

  return {
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
  };
};