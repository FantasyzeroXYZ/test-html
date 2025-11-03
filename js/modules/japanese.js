// 日语分词模块 - 负责日语文本的分词处理和单词管理
export class Japanese {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // 分词数据
        this.mecab = null;
        this.japaneseWords = [];
        this.currentWordIndex = 0;
        
        // 回调函数
        this.onSegmentationComplete = null;
        this.onWordClicked = null;
        this.onWordSearch = null;
        this.onWordAppended = null;
        
        this.init();
    }

    async init() {
        await this.initMeCab();
    }

    // 初始化MeCab分词器
    async initMeCab() {
        try {
            // 检查MeCab是否可用
            if (typeof MeCab === 'undefined') {
                console.warn('MeCab未加载，日语分词功能将不可用');
                return;
            }
            
            this.mecab = await MeCab.create();
            console.log('MeCab初始化成功');
        } catch (error) {
            console.error('MeCab初始化失败:', error);
            this.modules.ui.showError('日语分词功能初始化失败: ' + error.message);
        }
    }

    // 显示日语分词结果
    async showSegmentation(sentence) {
        if (!this.mecab) {
            this.modules.ui.showError('日语分词功能未初始化');
            return;
        }
        
        try {
            // 使用MeCab进行日语分词
            const result = await this.mecab.parse(sentence);
            this.japaneseWords = result.map(item => item[0]);
            this.currentWordIndex = 0;
            
            // 打开字典面板
            this.modules.dictionary.openPanel();
            
            // 显示分词结果
            this.displaySegmentationResult(sentence);
            
            // 触发回调
            if (this.onSegmentationComplete) {
                this.onSegmentationComplete(sentence, this.japaneseWords);
            }
            
        } catch (error) {
            console.error('日语分词失败:', error);
            this.modules.ui.showError('日语分词失败: ' + error.message);
        }
    }

    // 显示分词结果
    displaySegmentationResult(sentence) {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        const panelWordTitle = document.getElementById('panel-word-title');
        const originalSentence = document.getElementById('original-sentence');
        
        if (!panelDictionaryResult || !panelWordTitle || !originalSentence) {
            return;
        }
        
        panelDictionaryResult.innerHTML = `
            <div class="word-header">
                <div class="word-title">日语分词结果</div>
            </div>
            <div class="meaning-section">
                <div class="part-of-speech">句子: ${sentence}</div>
                <div class="definition">分词结果:</div>
                <div class="definition">
                    ${this.japaneseWords.map((word, index) => 
                        `<span class="word ${index === 0 ? 'highlight' : ''}" 
                              data-word="${word}" 
                              data-index="${index}">${word}</span>`
                    ).join(' ')}
                </div>
                <div class="example">提示: 点击任意分词进行查询</div>
            </div>
        `;
        
        panelWordTitle.textContent = `日语分词`;
        originalSentence.textContent = sentence;
        
        // 为分词结果添加点击事件
        this.addWordClickEvents();
    }

    // 为分词结果添加点击事件
    addWordClickEvents() {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        if (!panelDictionaryResult) return;
        
        const wordElements = panelDictionaryResult.querySelectorAll('.word');
        
        wordElements.forEach(wordElement => {
            wordElement.addEventListener('click', () => {
                const word = wordElement.getAttribute('data-word');
                const index = parseInt(wordElement.getAttribute('data-index'));
                
                // 高亮显示选中的单词
                this.highlightSelectedWord(wordElement);
                
                this.currentWordIndex = index;
                
                // 更新搜索框
                const panelSearchInput = document.getElementById('panel-search-input');
                if (panelSearchInput) {
                    panelSearchInput.value = word;
                }
                
                // 触发单词点击回调
                if (this.onWordClicked) {
                    this.onWordClicked(word, index);
                } else {
                    // 默认行为：查询日语单词
                    this.searchWord(word);
                }
            });
        });
    }

    // 高亮显示选中的单词
    highlightSelectedWord(selectedElement) {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        if (!panelDictionaryResult) return;
        
        const allWords = panelDictionaryResult.querySelectorAll('.word');
        allWords.forEach(word => {
            word.classList.remove('highlight');
        });
        
        selectedElement.classList.add('highlight');
    }

    // 查询日语单词
    async searchWord(word) {
        if (!word.trim()) {
            this.modules.ui.showError('请输入要查询的单词');
            return;
        }
        
        // 触发单词查询回调
        if (this.onWordSearch) {
            this.onWordSearch(word);
        } else {
            // 默认行为：使用Jisho API查询日语单词
            await this.searchWithJisho(word);
        }
    }

    // 使用Jisho API查询日语单词
    async searchWithJisho(word) {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        const panelWordTitle = document.getElementById('panel-word-title');
        
        if (!panelDictionaryResult || !panelWordTitle) return;
        
        panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
        panelWordTitle.textContent = `查询: ${word}`;
        
        try {
            const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayJishoResult(data);
        } catch (error) {
            panelDictionaryResult.innerHTML = `<div class="error">${error.message}</div>`;
            console.error('查询错误:', error);
        }
    }

    // 显示Jisho查询结果
    displayJishoResult(wordData) {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        if (!panelDictionaryResult) return;
        
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
        
        panelDictionaryResult.innerHTML = html;
    }

    // 追加词汇
    appendWord() {
        if (this.japaneseWords.length === 0) {
            this.modules.ui.showError('没有可追加的词汇');
            return;
        }
        
        this.currentWordIndex++;
        if (this.currentWordIndex >= this.japaneseWords.length) {
            this.currentWordIndex = this.japaneseWords.length - 1;
            this.modules.ui.showError('已经是最后一个词汇了');
            return;
        }
        
        // 构建追加后的词汇
        let combinedWord = '';
        for (let i = 0; i <= this.currentWordIndex; i++) {
            combinedWord += this.japaneseWords[i];
        }
        
        // 更新搜索框
        const panelSearchInput = document.getElementById('panel-search-input');
        if (panelSearchInput) {
            panelSearchInput.value = combinedWord;
        }
        
        // 触发词汇追加回调
        if (this.onWordAppended) {
            this.onWordAppended(combinedWord, this.currentWordIndex);
        } else {
            // 默认行为：查询日语单词
            this.searchWord(combinedWord);
        }
        
        // 高亮显示追加的词汇
        this.highlightAppendedWord();
    }

    // 高亮显示追加的词汇
    highlightAppendedWord() {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        if (!panelDictionaryResult) return;
        
        const allWords = panelDictionaryResult.querySelectorAll('.word');
        allWords.forEach(word => {
            word.classList.remove('highlight');
            const index = parseInt(word.getAttribute('data-index'));
            if (index === this.currentWordIndex) {
                word.classList.add('highlight');
            }
        });
    }

    // 设置日语分词结果（供外部脚本使用）
    setWords(words) {
        this.japaneseWords = words;
        this.currentWordIndex = 0;
    }

    // 设置日语查询结果（供外部脚本使用）
    setJapaneseResult(html) {
        const panelDictionaryResult = document.getElementById('panel-dictionary-result');
        if (panelDictionaryResult) {
            panelDictionaryResult.innerHTML = html;
        }
    }

    // 获取当前词汇
    getCurrentWord() {
        if (this.currentWordIndex >= 0 && this.currentWordIndex < this.japaneseWords.length) {
            return this.japaneseWords[this.currentWordIndex];
        }
        return '';
    }

    // 获取所有分词结果
    getAllWords() {
        return [...this.japaneseWords];
    }

    // 获取当前词汇索引
    getCurrentWordIndex() {
        return this.currentWordIndex;
    }

    // 检查MeCab是否可用
    isMeCabAvailable() {
        return this.mecab !== null;
    }

    // 简单的日语分词（不使用MeCab的备选方案）
    simpleJapaneseSegmentation(text) {
        // 简单的基于规则的日语分词
        // 这是一个简化的实现，实际应用中应该使用更专业的分词库
        
        const segments = [];
        let currentSegment = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = char.charCodeAt(0);
            
            // 检查字符类型
            const isHiragana = (charCode >= 0x3040 && charCode <= 0x309F);
            const isKatakana = (charCode >= 0x30A0 && charCode <= 0x30FF);
            const isKanji = (charCode >= 0x4E00 && charCode <= 0x9FAF);
            const isPunctuation = /[、。！？・]/.test(char);
            
            if (isHiragana || isKatakana || isKanji) {
                currentSegment += char;
            } else if (isPunctuation) {
                if (currentSegment) {
                    segments.push(currentSegment);
                    currentSegment = '';
                }
                segments.push(char);
            } else {
                // 其他字符（空格、标点等）
                if (currentSegment) {
                    segments.push(currentSegment);
                    currentSegment = '';
                }
            }
        }
        
        // 添加最后一个片段
        if (currentSegment) {
            segments.push(currentSegment);
        }
        
        return segments.filter(segment => segment.trim());
    }

    // 分析日语句子结构
    analyzeSentenceStructure(sentence) {
        if (!this.mecab) {
            return this.simpleSentenceAnalysis(sentence);
        }
        
        try {
            // 使用MeCab进行详细分析
            return this.mecab.parse(sentence).then(result => {
                return this.formatSentenceAnalysis(result);
            });
        } catch (error) {
            console.error('句子分析失败:', error);
            return this.simpleSentenceAnalysis(sentence);
        }
    }

    // 简单的句子分析（备选方案）
    simpleSentenceAnalysis(sentence) {
        const words = this.simpleJapaneseSegmentation(sentence);
        return {
            sentence: sentence,
            words: words.map((word, index) => ({
                word: word,
                index: index,
                length: word.length
            })),
            wordCount: words.length
        };
    }

    // 格式化句子分析结果
    formatSentenceAnalysis(mecabResult) {
        return {
            sentence: mecabResult.map(item => item[0]).join(''),
            words: mecabResult.map((item, index) => ({
                word: item[0],
                reading: item[1] || '',
                baseForm: item[2] || item[0],
                pos: item[3] || '',
                posDetail: item[4] || '',
                index: index
            })),
            wordCount: mecabResult.length
        };
    }

    // 生成学习提示
    generateLearningTips(sentenceAnalysis) {
        const tips = [];
        
        if (sentenceAnalysis.words && sentenceAnalysis.words.length > 0) {
            // 分析词性分布
            const posCount = {};
            sentenceAnalysis.words.forEach(word => {
                if (word.pos) {
                    posCount[word.pos] = (posCount[word.pos] || 0) + 1;
                }
            });
            
            // 根据词性分布生成提示
            if (posCount['名詞'] > 0) {
                tips.push(`这个句子包含 ${posCount['名詞']} 个名词，可以重点记忆这些名词`);
            }
            
            if (posCount['動詞'] > 0) {
                tips.push(`包含 ${posCount['動詞']} 个动词，注意动词的变形和用法`);
            }
            
            if (posCount['形容詞'] > 0) {
                tips.push(`有 ${posCount['形容詞']} 个形容词，注意形容词的用法和修饰关系`);
            }
            
            // 句子复杂度提示
            const wordCount = sentenceAnalysis.wordCount;
            if (wordCount > 10) {
                tips.push('这是一个较长的句子，建议分段学习');
            } else if (wordCount <= 5) {
                tips.push('这是一个简短的句子，适合初学者学习');
            }
        }
        
        return tips.length > 0 ? tips : ['这是一个很好的学习句子，建议逐个词汇学习'];
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'japaneseSentenceClicked':
                this.showSegmentation(data.sentence);
                break;
                
            case 'languageModeChanged':
                // 语言模式改变时重置状态
                if (data.mode !== 'japanese') {
                    this.japaneseWords = [];
                    this.currentWordIndex = 0;
                }
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理MeCab实例
        if (this.mecab && this.mecab.terminate) {
            this.mecab.terminate();
        }
        
        // 清理数据
        this.japaneseWords = [];
        this.currentWordIndex = 0;
    }
}