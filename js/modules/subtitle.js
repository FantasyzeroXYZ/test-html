// 字幕处理模块 - 负责字幕文件的解析、显示和管理
export class Subtitle {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // 字幕数据
        this.subtitles = [];
        this.currentSubtitleIndex = -1;
        
        // 显示状态
        this.subtitleVisible = true;
        this.videoSubtitlesVisible = true;
        this.audioSubtitlesVisible = false;
        
        // DOM元素
        this.subtitleText = null;
        this.subtitleDisplay = null;
        this.videoSubtitles = null;
        this.audioSubtitles = null;
        this.subtitleList = null;
        
        this.init();
    }

    init() {
        this.getDOMElements();
        this.initEventListeners();
    }

    getDOMElements() {
        this.subtitleText = document.getElementById('subtitle-text');
        this.subtitleDisplay = document.getElementById('subtitle-display');
        this.videoSubtitles = document.getElementById('video-subtitles');
        this.audioSubtitles = document.getElementById('audio-subtitles');
        this.subtitleList = document.getElementById('subtitle-list');
        
        // 控制按钮
        this.toggleSubtitleBtn = document.getElementById('toggle-subtitle-btn');
        this.prevSentenceBtn = document.getElementById('prev-sentence-btn');
        this.nextSentenceBtn = document.getElementById('next-sentence-btn');
        this.toggleVideoSubtitlesBtn = document.getElementById('toggle-video-subtitles-btn');
        this.toggleAudioSubtitlesBtn = document.getElementById('toggle-audio-subtitles-btn');
    }

    initEventListeners() {
        // 字幕显示/隐藏
        if (this.toggleSubtitleBtn) {
            this.toggleSubtitleBtn.addEventListener('click', () => {
                this.toggleSubtitleVisibility();
            });
        }

        // 字幕跳转
        if (this.prevSentenceBtn) {
            this.prevSentenceBtn.addEventListener('click', () => {
                this.jumpToPreviousSentence();
            });
        }

        if (this.nextSentenceBtn) {
            this.nextSentenceBtn.addEventListener('click', () => {
                this.jumpToNextSentence();
            });
        }

        // 视频内字幕显示切换
        if (this.toggleVideoSubtitlesBtn) {
            this.toggleVideoSubtitlesBtn.addEventListener('click', () => {
                this.toggleVideoSubtitles();
            });
        }

        // 音频字幕显示切换
        if (this.toggleAudioSubtitlesBtn) {
            this.toggleAudioSubtitlesBtn.addEventListener('click', () => {
                this.toggleAudioSubtitles();
            });
        }

        // 字幕点击事件委托
        if (this.subtitleText) {
            this.subtitleText.addEventListener('click', (e) => {
                this.handleSubtitleClick(e);
            });
        }
    }

    // 解析字幕文件
    parseSubtitle(content) {
        this.subtitles = [];
        
        if (!content) {
            this.updateSubtitleDisplay();
            return;
        }

        // 简单的SRT解析器
        const blocks = content.split(/\n\s*\n/);
        
        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                // 第一行是序号，跳过
                // 第二行是时间轴
                const timeLine = lines[1];
                const timeMatch = timeLine.match(/(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)/);
                
                if (timeMatch) {
                    const startTime = 
                        parseInt(timeMatch[1]) * 3600 + 
                        parseInt(timeMatch[2]) * 60 + 
                        parseInt(timeMatch[3]) + 
                        parseInt(timeMatch[4]) / 1000;
                    
                    const endTime = 
                        parseInt(timeMatch[5]) * 3600 + 
                        parseInt(timeMatch[6]) * 60 + 
                        parseInt(timeMatch[7]) + 
                        parseInt(timeMatch[8]) / 1000;
                    
                    // 第三行及之后是字幕文本
                    const text = lines.slice(2).join(' ').trim();
                    
                    if (text) {
                        this.subtitles.push({
                            start: startTime,
                            end: endTime,
                            text: text
                        });
                    }
                }
            }
        });
        
        // 按开始时间排序
        this.subtitles.sort((a, b) => a.start - b.start);
        
        // 更新显示
        this.updateSubtitleList();
        this.updateAudioSubtitles();
        this.updateSubtitle(0);
        
        console.log(`解析了 ${this.subtitles.length} 条字幕`);
    }

    // 更新字幕显示
    updateSubtitle(currentTime) {
        if (this.subtitles.length === 0) {
            this.showNoSubtitles();
            return;
        }
        
        // 查找当前时间对应的字幕
        let foundIndex = -1;
        for (let i = 0; i < this.subtitles.length; i++) {
            if (currentTime >= this.subtitles[i].start && currentTime < this.subtitles[i].end) {
                foundIndex = i;
                break;
            }
        }
        
        if (foundIndex !== -1) {
            const currentSubtitle = this.subtitles[foundIndex];
            this.currentSubtitleIndex = foundIndex;
            
            // 更新视频内字幕
            this.updateVideoSubtitles(currentSubtitle);
            
            // 更新主字幕显示
            this.updateMainSubtitle(currentSubtitle);
            
            if (this.subtitleText) {
                this.subtitleText.style.opacity = '1';
            }
            
        } else {
            // 不在任何字幕时间范围内
            if (this.subtitleText) {
                this.subtitleText.style.opacity = '0.5';
            }
            if (this.videoSubtitles) {
                this.videoSubtitles.innerHTML = "";
            }
            this.currentSubtitleIndex = -1;
        }
        
        this.updateActiveSubtitleItem();
        
        // 更新音频滚动字幕
        if (this.state.currentMediaType === 'audio') {
            this.updateAudioSubtitles();
        }
        
        // 更新状态
        this.app.setState({
            currentSubtitleIndex: this.currentSubtitleIndex
        });
    }

    // 显示无字幕状态
    showNoSubtitles() {
        if (this.subtitleText) {
            this.subtitleText.innerHTML = "无字幕";
        }
        if (this.videoSubtitles) {
            this.videoSubtitles.innerHTML = "";
        }
        this.updateSubtitleList();
    }

    // 更新视频内字幕
    updateVideoSubtitles(subtitle) {
        if (!this.videoSubtitles) return;
        
        if (this.videoSubtitlesVisible && this.state.currentMediaType === 'video') {
            this.videoSubtitles.innerHTML = `<span>${subtitle.text}</span>`;
        } else {
            this.videoSubtitles.innerHTML = "";
        }
    }

    // 更新主字幕显示
    updateMainSubtitle(subtitle) {
        if (!this.subtitleText) return;
        
        const text = subtitle.text;
        
        if (this.state.currentLanguageMode === 'english') {
            // 英语模式：创建可点击的单词
            this.createClickableEnglishSubtitle(text);
        } else {
            // 日语模式：显示原始文本
            this.createJapaneseSubtitle(text);
        }
    }

    // 创建可点击的英语字幕
    createClickableEnglishSubtitle(text) {
        const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
        let lastIndex = 0;
        let clickableWords = '';
        
        let match;
        while ((match = wordRegex.exec(text)) !== null) {
            // 添加匹配前的非单词部分
            clickableWords += text.substring(lastIndex, match.index);
            
            // 添加可点击的单词
            clickableWords += `<span class="word" data-word="${match[0]}">${match[0]}</span>`;
            
            lastIndex = match.index + match[0].length;
        }
        
        // 添加剩余的非单词部分
        clickableWords += text.substring(lastIndex);
        
        this.subtitleText.innerHTML = clickableWords;
    }

    // 创建日语字幕
    createJapaneseSubtitle(text) {
        this.subtitleText.innerHTML = text;
        
        // 日语模式下点击整个句子
        this.subtitleText.addEventListener('click', () => {
            this.handleJapaneseSubtitleClick(text);
        });
    }

    // 处理字幕点击事件
    handleSubtitleClick(e) {
        if (e.target.classList.contains('word')) {
            const word = e.target.getAttribute('data-word');
            this.handleWordClick(word, e.target);
        }
    }

    // 处理单词点击
    handleWordClick(word, targetElement) {
        // 暂停播放
        this.modules.player.pause();
        
        // 查询单词并显示底部面板
        this.modules.dictionary.searchWord(word);
        
        // 高亮显示选中的单词
        this.highlightWord(targetElement);
        
        // 记录当前单词和句子
        this.app.setState({
            currentWord: word
        });
        
        if (this.currentSubtitleIndex >= 0) {
            const currentSentence = this.subtitles[this.currentSubtitleIndex].text;
            this.app.setState({
                currentSentence: currentSentence
            });
            
            // 更新原句显示
            this.modules.dictionary.updateOriginalSentence(currentSentence, word);
        }
    }

    // 处理日语字幕点击
    handleJapaneseSubtitleClick(text) {
        // 暂停播放
        this.modules.player.pause();
        
        // 显示日语分词结果
        this.modules.japanese.showSegmentation(text);
        
        // 记录当前句子
        this.app.setState({
            currentSentence: text
        });
    }

    // 高亮显示单词
    highlightWord(targetElement) {
        // 移除之前的高亮
        if (this.currentHighlightedWord) {
            this.currentHighlightedWord.classList.remove('highlight');
        }
        
        // 添加新高亮
        targetElement.classList.add('highlight');
        this.currentHighlightedWord = targetElement;
    }

    // 更新字幕列表
    updateSubtitleList() {
        if (!this.subtitleList) return;
        
        this.subtitleList.innerHTML = '';
        
        if (this.subtitles.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'subtitle-item';
            emptyItem.textContent = '无字幕';
            this.subtitleList.appendChild(emptyItem);
            return;
        }
        
        this.subtitles.forEach((subtitle, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'subtitle-item';
            listItem.textContent = `${this.modules.timeUtils.formatTime(subtitle.start)} - ${this.modules.timeUtils.formatTime(subtitle.end)}: ${subtitle.text}`;
            listItem.addEventListener('click', () => {
                this.jumpToSubtitle(index);
            });
            this.subtitleList.appendChild(listItem);
        });
        
        this.updateActiveSubtitleItem();
    }

    // 更新音频滚动字幕
    updateAudioSubtitles() {
        if (!this.audioSubtitles) return;
        
        this.audioSubtitles.innerHTML = '';
        
        if (this.subtitles.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'audio-subtitle-item';
            emptyItem.textContent = '无字幕';
            this.audioSubtitles.appendChild(emptyItem);
            return;
        }
        
        this.subtitles.forEach((subtitle, index) => {
            const subtitleItem = document.createElement('div');
            subtitleItem.className = 'audio-subtitle-item';
            if (index === this.currentSubtitleIndex) {
                subtitleItem.classList.add('active');
            }
            
            // 根据语言模式创建内容
            if (this.state.currentLanguageMode === 'english') {
                this.createClickableAudioEnglishSubtitle(subtitleItem, subtitle.text);
            } else {
                subtitleItem.textContent = subtitle.text;
            }
            
            // 添加点击事件
            subtitleItem.addEventListener('click', (e) => {
                this.handleAudioSubtitleClick(e, subtitle.text, index);
            });
            
            this.audioSubtitles.appendChild(subtitleItem);
        });
        
        // 滚动到当前字幕
        this.scrollToCurrentAudioSubtitle();
    }

    // 创建可点击的音频英语字幕
    createClickableAudioEnglishSubtitle(subtitleItem, text) {
        const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
        let lastIndex = 0;
        let clickableWords = '';
        
        let match;
        while ((match = wordRegex.exec(text)) !== null) {
            // 添加匹配前的非单词部分
            clickableWords += text.substring(lastIndex, match.index);
            
            // 添加可点击的单词
            clickableWords += `<span class="word" data-word="${match[0]}">${match[0]}</span>`;
            
            lastIndex = match.index + match[0].length;
        }
        
        // 添加剩余的非单词部分
        clickableWords += text.substring(lastIndex);
        
        subtitleItem.innerHTML = clickableWords;
    }

    // 处理音频字幕点击
    handleAudioSubtitleClick(e, text, index) {
        if (this.state.currentLanguageMode === 'english') {
            // 英语模式：点击单词查询
            if (e.target.classList.contains('word')) {
                const word = e.target.getAttribute('data-word');
                
                // 暂停播放
                this.modules.player.pause();
                
                // 查询单词
                this.modules.dictionary.searchWord(word);
                
                // 记录当前单词和句子
                this.app.setState({
                    currentWord: word,
                    currentSentence: text
                });
                
                // 更新原句显示
                this.modules.dictionary.updateOriginalSentence(text, word);
            }
        } else {
            // 日语模式：点击句子，显示分词结果
            this.modules.player.pause();
            this.modules.japanese.showSegmentation(text);
            this.app.setState({
                currentSentence: text
            });
        }
    }

    // 滚动到当前音频字幕
    scrollToCurrentAudioSubtitle() {
        if (this.currentSubtitleIndex >= 0 && this.audioSubtitles) {
            const activeItem = this.audioSubtitles.children[this.currentSubtitleIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    // 更新激活的字幕项
    updateActiveSubtitleItem() {
        // 更新字幕列表中的激活项
        if (this.subtitleList) {
            const items = this.subtitleList.querySelectorAll('.subtitle-item');
            items.forEach((item, index) => {
                if (index === this.currentSubtitleIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
        
        // 更新音频滚动字幕中的激活项
        if (this.audioSubtitles) {
            const audioItems = this.audioSubtitles.querySelectorAll('.audio-subtitle-item');
            audioItems.forEach((item, index) => {
                if (index === this.currentSubtitleIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }

    // 跳转到指定字幕
    jumpToSubtitle(index) {
        if (index < 0 || index >= this.subtitles.length) return;
        
        const subtitle = this.subtitles[index];
        this.modules.player.jumpToTime(subtitle.start);
        this.currentSubtitleIndex = index;
        this.updateActiveSubtitleItem();
        
        // 通知UI关闭字幕列表面板
        this.app.notifyModules('closeSubtitleListPanel');
    }

    // 跳转到上一句
    jumpToPreviousSentence() {
        if (this.subtitles.length === 0) return;
        
        let targetIndex = this.currentSubtitleIndex - 1;
        if (targetIndex < 0) targetIndex = 0;
        
        this.jumpToSubtitle(targetIndex);
    }

    // 跳转到下一句
    jumpToNextSentence() {
        if (this.subtitles.length === 0) return;
        
        let targetIndex = this.currentSubtitleIndex + 1;
        if (targetIndex >= this.subtitles.length) targetIndex = this.subtitles.length - 1;
        
        this.jumpToSubtitle(targetIndex);
    }

    // 切换字幕显示/隐藏
    toggleSubtitleVisibility() {
        this.subtitleVisible = !this.subtitleVisible;
        if (this.subtitleDisplay) {
            this.subtitleDisplay.style.display = this.subtitleVisible ? 'block' : 'none';
        }
    }

    // 切换视频内字幕显示
    toggleVideoSubtitles() {
        this.videoSubtitlesVisible = !this.videoSubtitlesVisible;
        if (!this.videoSubtitlesVisible && this.videoSubtitles) {
            this.videoSubtitles.innerHTML = "";
        } else if (this.videoSubtitlesVisible && this.currentSubtitleIndex >= 0 && this.videoSubtitles) {
            this.videoSubtitles.innerHTML = `<span>${this.subtitles[this.currentSubtitleIndex].text}</span>`;
        }
    }

    // 切换音频字幕显示
    toggleAudioSubtitles() {
        this.audioSubtitlesVisible = !this.audioSubtitlesVisible;
        if (this.audioSubtitles) {
            if (this.audioSubtitlesVisible) {
                this.audioSubtitles.classList.add('active');
            } else {
                this.audioSubtitles.classList.remove('active');
            }
        }
    }

    // 获取字幕数据
    getSubtitles() {
        return this.subtitles;
    }

    // 获取当前字幕索引
    getCurrentSubtitleIndex() {
        return this.currentSubtitleIndex;
    }

    // 获取当前字幕文本
    getCurrentSubtitleText() {
        if (this.currentSubtitleIndex >= 0 && this.currentSubtitleIndex < this.subtitles.length) {
            return this.subtitles[this.currentSubtitleIndex].text;
        }
        return '';
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'timeUpdate':
                this.updateSubtitle(data.currentTime);
                break;
                
            case 'languageModeChanged':
                // 语言模式改变时重新渲染字幕
                if (this.currentSubtitleIndex >= 0) {
                    const currentSubtitle = this.subtitles[this.currentSubtitleIndex];
                    this.updateMainSubtitle(currentSubtitle);
                }
                break;
                
            case 'subtitleFileLoaded':
                this.parseSubtitle(data.content);
                break;
                
            case 'closeSubtitleListPanel':
                // 由UI模块处理面板关闭
                break;
        }
    }

    // 清除字幕
    clearSubtitles() {
        this.subtitles = [];
        this.currentSubtitleIndex = -1;
        this.showNoSubtitles();
        this.updateSubtitleList();
        this.updateAudioSubtitles();
    }

    // 销毁方法
    destroy() {
        // 清理事件监听器
        if (this.subtitleText) {
            this.subtitleText.removeEventListener('click', this.handleSubtitleClick);
        }
        
        // 清理数据
        this.subtitles = [];
        this.currentSubtitleIndex = -1;
    }
}