// 词典查询模块 - 负责单词查询、结果显示和词典管理
export class Dictionary {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // 查询状态
        this.currentWord = '';
        this.currentSentence = '';
        this.activeTab = 'dictionary-tab';
        
        // DOM元素
        this.dictionaryPanel = null;
        this.panelDictionaryResult = null;
        this.panelWordTitle = null;
        this.panelSearchInput = null;
        this.originalSentence = null;
        this.customDefinitionInput = null;
        this.webSearchFrame = null;
        
        // 回调函数
        this.onWebSearch = null;
        
        this.init();
    }

    init() {
        this.getDOMElements();
        this.initEventListeners();
        this.initTabs();
    }

    getDOMElements() {
        // 底部面板元素
        this.dictionaryPanel = document.getElementById('dictionary-panel');
        this.panelDictionaryResult = document.getElementById('panel-dictionary-result');
        this.panelWordTitle = document.getElementById('panel-word-title');
        this.panelSearchInput = document.getElementById('panel-search-input');
        this.originalSentence = document.getElementById('original-sentence');
        this.customDefinitionInput = document.getElementById('panel-custom-definition-input');
        this.webSearchFrame = document.getElementById('web-search-frame');
        
        // 控制按钮
        this.panelSearchBtn = document.getElementById('panel-search-btn');
        this.panelAddToAnkiBtn = document.getElementById('panel-add-to-anki-btn');
        this.appendWordBtn = document.getElementById('append-word-btn');
    }

    initEventListeners() {
        // 搜索按钮
        if (this.panelSearchBtn) {
            this.panelSearchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // 搜索输入框回车键
        if (this.panelSearchInput) {
            this.panelSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // 添加到Anki按钮
        if (this.panelAddToAnkiBtn) {
            this.panelAddToAnkiBtn.addEventListener('click', () => {
                this.handleAddToAnki();
            });
        }

        // 追加词汇按钮
        if (this.appendWordBtn) {
            this.appendWordBtn.addEventListener('click', () => {
                this.handleAppendWord();
            });
        }
    }

    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    // 切换标签页
    switchTab(tabId) {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        // 更新激活的标签页
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        const activePane = document.getElementById(tabId);
        
        if (activeButton && activePane) {
            activeButton.classList.add('active');
            activePane.classList.add('active');
            this.activeTab = tabId;
            
            // 如果是网页查询标签，加载预设的网页
            if (tabId === 'web-tab') {
                const word = this.panelSearchInput.value.trim();
                if (word) {
                    this.loadWebSearch(word);
                }
            }
        }
    }

    // 处理搜索
    handleSearch() {
        const word = this.panelSearchInput.value.trim();
        if (!word) return;
        
        if (this.state.currentLanguageMode === 'english') {
            this.searchWord(word);
        } else {
            this.searchJapaneseWord(word);
        }
    }

    // 查询英语单词
    async searchWord(word) {
        if (!word.trim()) {
            this.showError('请输入要查询的单词');
            return;
        }
        
        // 确保面板已打开
        this.openPanel();
        
        this.showLoading('查询中...');
        this.panelWordTitle.textContent = `查询: ${word}`;
        this.panelSearchInput.value = word;
        this.currentWord = word;
        
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
            this.displayWordData(data[0]);
        } catch (error) {
            this.showError(error.message);
            console.error('查询错误:', error);
        }
    }

    // 显示英语单词数据
    displayWordData(wordData) {
        let html = '';
        
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
        
        this.panelDictionaryResult.innerHTML = html;
    }

    // 查询日语单词
    async searchJapaneseWord(word) {
        if (!word.trim()) {
            this.showError('请输入要查询的单词');
            return;
        }
        
        // 确保面板已打开
        this.openPanel();
        
        this.showLoading('查询中...');
        this.panelWordTitle.textContent = `查询: ${word}`;
        this.panelSearchInput.value = word;
        this.currentWord = word;
        
        // 油猴脚本接口：日语查询回调
        if (window.japaneseWordSearch) {
            window.japaneseWordSearch(word);
        } else {
            // 默认行为：使用Jisho API查询日语单词
            try {
                const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
                
                if (!response.ok) {
                    throw new Error(`API请求失败: ${response.status}`);
                }
                
                const data = await response.json();
                this.displayJapaneseWordData(data);
            } catch (error) {
                this.showError(error.message);
                console.error('查询错误:', error);
            }
        }
    }

    // 显示日语单词数据
    displayJapaneseWordData(wordData) {
        let html = '';
        
        if (wordData.data && wordData.data.length > 0) {
            const word = wordData.data[0];
            
            // 单词标题和读音
            html += `<div class="word-header">`;
            html += `<div class="word-title">${word.japanese[0].word || word.japanese[0].reading}</div>`;
            
            if (word.japanese[0].reading) {
                html += `<div class="phonetic">${word.japanese[0].reading}</div>`;
            }
            
            html += `</div>`;
            
            // 词义解释
            if (word.senses && word.senses.length > 0) {
                word.senses.forEach((sense, index) => {
                    if (index < 3) { // 只显示前三个定义
                        html += `<div class="meaning-section">`;
                        html += `<div class="part-of-speech">${sense.parts_of_speech.join(', ')}</div>`;
                        
                        if (sense.english_definitions && sense.english_definitions.length > 0) {
                            sense.english_definitions.forEach((def, defIndex) => {
                                if (defIndex < 3) { // 只显示前三个英文定义
                                    html += `<div class="definition">${defIndex + 1}. ${def}</div>`;
                                }
                            });
                        }
                        
                        html += `</div>`;
                    }
                });
            } else {
                html += `<div class="meaning-section">`;
                html += `<div class="definition">未找到该单词的详细释义。</div>`;
                html += `</div>`;
            }
        } else {
            html += `<div class="meaning-section">`;
            html += `<div class="definition">未找到该单词的详细释义。</div>`;
            html += `</div>`;
        }
        
        this.panelDictionaryResult.innerHTML = html;
    }

    // 加载网页查询
    loadWebSearch(word) {
        if (!word) return;
        
        // 油猴脚本接口：网页查询回调
        if (this.onWebSearch) {
            this.onWebSearch(word);
        } else if (window.webSearch) {
            window.webSearch(word);
        } else {
            // 默认行为：使用Jisho进行日语查询
            const url = this.state.currentLanguageMode === 'japanese' ? 
                `https://jisho.org/search/${encodeURIComponent(word)}` :
                `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`;
            
            if (this.webSearchFrame) {
                this.webSearchFrame.src = url;
            }
        }
    }

    // 处理添加到Anki
    async handleAddToAnki() {
        if (this.state.isProcessingAnki) return;
        
        if (!this.state.ankiConnected) {
            this.showError('请先连接Anki!');
            return;
        }
        
        const word = this.panelSearchInput.value.trim();
        if (!word) {
            this.showError('请输入要添加的单词!');
            return;
        }
        
        // 获取词典内容
        let definition = '';
        
        // 根据当前激活的标签页获取释义
        if (this.activeTab === 'dictionary-tab') {
            // 从词典释义标签页获取内容
            const definitionElements = this.panelDictionaryResult.querySelectorAll('.definition');
            if (definitionElements.length > 0) {
                definitionElements.forEach(el => {
                    definition += el.textContent + '\n';
                });
            }
        } else if (this.activeTab === 'custom-tab') {
            // 从自定义释义标签页获取内容
            definition = this.customDefinitionInput.value.trim();
        }
        
        if (!definition) {
            this.showError('请提供单词释义!');
            return;
        }
        
        // 防止重复点击
        this.app.setState({ isProcessingAnki: true });
        if (this.panelAddToAnkiBtn) {
            this.panelAddToAnkiBtn.disabled = true;
        }
        
        // 立即关闭面板并恢复播放
        this.closePanel();
        
        try {
            await this.modules.anki.processAnkiCard(word, definition, this.currentSentence);
            console.log('卡片添加成功');
        } catch (error) {
            console.error('添加卡片失败:', error);
            this.showError('添加卡片失败: ' + error.message);
        } finally {
            // 重置处理状态
            this.app.setState({ isProcessingAnki: false });
            if (this.panelAddToAnkiBtn) {
                this.panelAddToAnkiBtn.disabled = false;
            }
            
            // 重置表单
            if (this.customDefinitionInput) {
                this.customDefinitionInput.value = '';
            }
            if (this.panelSearchInput) {
                this.panelSearchInput.value = '';
            }
            if (this.panelDictionaryResult) {
                this.panelDictionaryResult.innerHTML = '查询结果将显示在这里...';
            }
        }
    }

    // 处理追加词汇
    handleAppendWord() {
        if (this.state.currentLanguageMode === 'japanese') {
            this.modules.japanese.appendWord();
        }
    }

    // 更新原句显示
    updateOriginalSentence(sentence, currentWord) {
        if (!this.originalSentence) return;
        
        // 使用正则表达式匹配单词，包括带有标点符号的单词
        const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
        let lastIndex = 0;
        let clickableSentence = '';
        
        let match;
        while ((match = wordRegex.exec(sentence)) !== null) {
            // 添加匹配前的非单词部分
            clickableSentence += sentence.substring(lastIndex, match.index);
            
            // 添加可点击的单词，当前单词高亮显示
            const wordClass = match[0].toLowerCase() === currentWord.toLowerCase() ? 
                'sentence-word highlight' : 'sentence-word';
            clickableSentence += `<span class="${wordClass}" data-word="${match[0]}">${match[0]}</span>`;
            
            lastIndex = match.index + match[0].length;
        }
        
        // 添加剩余的非单词部分
        clickableSentence += sentence.substring(lastIndex);
        
        this.originalSentence.innerHTML = clickableSentence;
        
        // 为原句中的单词添加点击事件
        this.originalSentence.removeEventListener('click', this.handleSentenceWordClick);
        this.originalSentence.addEventListener('click', this.handleSentenceWordClick.bind(this));
    }

    // 处理原句中单词点击
    handleSentenceWordClick(e) {
        if (e.target.classList.contains('sentence-word')) {
            const word = e.target.getAttribute('data-word');
            if (this.panelSearchInput) {
                this.panelSearchInput.value = word;
            }
            
            if (this.state.currentLanguageMode === 'english') {
                this.searchWord(word);
            } else {
                this.searchJapaneseWord(word);
            }
            
            // 高亮显示选中的单词
            document.querySelectorAll('.sentence-word').forEach(w => {
                w.classList.remove('highlight');
            });
            e.target.classList.add('highlight');
            
            // 更新当前单词
            this.currentWord = word;
        }
    }

    // 打开底部面板
    openPanel() {
        if (this.dictionaryPanel) {
            this.dictionaryPanel.classList.add('active');
            
            const panelOverlay = document.getElementById('panel-overlay');
            if (panelOverlay) {
                panelOverlay.classList.add('active');
            }
            
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭底部面板
    closePanel() {
        if (this.dictionaryPanel) {
            this.dictionaryPanel.classList.remove('active');
            
            const panelOverlay = document.getElementById('panel-overlay');
            if (panelOverlay) {
                panelOverlay.classList.remove('active');
            }
            
            document.body.style.overflow = '';
        }
        
        // 恢复播放
        this.modules.player.resume();
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        if (this.panelDictionaryResult) {
            this.panelDictionaryResult.innerHTML = `<div class="loading">${message}</div>`;
        }
    }

    // 显示错误信息
    showError(message) {
        if (this.panelDictionaryResult) {
            this.panelDictionaryResult.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    // 设置日语查询结果
    setJapaneseResult(html) {
        if (this.panelDictionaryResult) {
            this.panelDictionaryResult.innerHTML = html;
        }
    }

    // 设置网页查询URL
    setWebSearchUrl(url) {
        if (this.webSearchFrame) {
            this.webSearchFrame.src = url;
        }
    }

    // 获取当前单词
    getCurrentWord() {
        return this.currentWord;
    }

    // 获取当前句子
    getCurrentSentence() {
        return this.currentSentence;
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'wordClicked':
                this.searchWord(data.word);
                break;
                
            case 'japaneseWordClicked':
                this.searchJapaneseWord(data.word);
                break;
                
            case 'japaneseSegmentationComplete':
                this.currentSentence = data.sentence;
                break;
                
            case 'closeDictionaryPanel':
                this.closePanel();
                break;
                
            case 'languageModeChanged':
                // 语言模式改变时重置搜索状态
                if (this.panelSearchInput) {
                    this.panelSearchInput.value = '';
                }
                if (this.panelDictionaryResult) {
                    this.panelDictionaryResult.innerHTML = '查询结果将显示在这里...';
                }
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理事件监听器
        if (this.originalSentence) {
            this.originalSentence.removeEventListener('click', this.handleSentenceWordClick);
        }
        
        // 清理数据
        this.currentWord = '';
        this.currentSentence = '';
    }
}