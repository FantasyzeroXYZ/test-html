// 字幕处理功能

// 解析字幕文件（支持SRT和VTT格式）
function parseSubtitle(content) {
    subtitles = [];
    if (content.includes('WEBVTT')) {
        parseVTTSubtitle(content);
    } else {
        parseSRTSubtitle(content);
    }
    
    subtitles.sort((a, b) => a.start - b.start);
    updateSubtitleList();
    updateAudioSubtitles();
    updateSubtitle(0);
}

// 解析SRT字幕
function parseSRTSubtitle(content) {
    const blocks = content.split(/\n\s*\n/);
    
    blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length >= 3) {
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
                
                let text = lines.slice(2).join(' ').trim();
                const rawText = text;
                text = cleanSubtitleText(text);
                
                if (text) {
                    subtitles.push({
                        start: startTime,
                        end: endTime,
                        text: text
                    });
                }
            }
        }
    });
}

// 解析VTT字幕
function parseVTTSubtitle(content) {
    const lines = content.split('\n');
    let currentSubtitle = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('-->')) {
            if (currentSubtitle) {
                subtitles.push(currentSubtitle);
            }
            
            const timeMatch = line.match(/(\d+):(\d+):(\d+)[.,](\d+)\s*-->\s*(\d+):(\d+):(\d+)[.,](\d+)/);
            if (timeMatch) {
                currentSubtitle = {
                    start: parseInt(timeMatch[1]) * 3600 + 
                           parseInt(timeMatch[2]) * 60 + 
                           parseInt(timeMatch[3]) + 
                           parseInt(timeMatch[4]) / 1000,
                    end: parseInt(timeMatch[5]) * 3600 + 
                         parseInt(timeMatch[6]) * 60 + 
                         parseInt(timeMatch[7]) + 
                         parseInt(timeMatch[8]) / 1000,
                    text: ''
                };
            }
        } else if (currentSubtitle && line && !line.includes('WEBVTT') && !line.includes('NOTE')) {
            if (currentSubtitle.text) {
                currentSubtitle.text += ' ' + line;
            } else {
                currentSubtitle.text = line;
            }
        }
    }
    
    if (currentSubtitle && currentSubtitle.text) {
        currentSubtitle.text = cleanSubtitleText(currentSubtitle.text);
        subtitles.push(currentSubtitle);
    }
}

// 更新字幕显示
function updateSubtitle(currentTime) {
    if (subtitles.length === 0) {
        subtitleText.innerHTML = "无字幕";
        videoSubtitles.innerHTML = "";
        fullscreenSubtitle.innerHTML = "";
        return;
    }
    
    let foundIndex = findCurrentSubtitleIndex(currentTime);
    
    if (foundIndex !== -1) {
        const currentSubtitle = subtitles[foundIndex];
        currentSubtitleIndex = foundIndex;

        if (videoSubtitlesVisible && currentMediaType === 'video') {
            videoSubtitles.innerHTML = `<span class="video-subtitle-text selectable-text">${currentSubtitle.text}</span>`;
        } else {
            videoSubtitles.innerHTML = "";
        }
        
        const text = currentSubtitle.text;
        const processedText = createClickableSubtitleContent(text, foundIndex);
        
        subtitleText.innerHTML = processedText;
        subtitleText.style.opacity = '1';
        
        // 更新全屏字幕
        if (isFullscreen) {
            fullscreenSubtitle.innerHTML = processedText;
        }
        
        subtitleText.removeEventListener('click', handleSubtitleTextClick);
        subtitleText.addEventListener('click', handleSubtitleTextClick);
        
    } else {
        subtitleText.style.opacity = '0.5';
        videoSubtitles.innerHTML = "";
        fullscreenSubtitle.innerHTML = "";
        currentSubtitleIndex = -1;
    }
    
    updateActiveSubtitleItem();
    
    if (currentMediaType === 'audio') {
        updateAudioSubtitles();
    }
}

// 增强版字幕更新函数
function updateCurrentSubtitle() {
    if (subtitles.length === 0) {
        if (isFullscreen) {
            fullscreenSubtitle.innerHTML = "";
        } else {
            subtitleText.innerHTML = "无字幕";
            videoSubtitles.innerHTML = "";
        }
        return;
    }
    
    const currentTime = isFullscreen ? 
        fullscreenVideoPlayer.currentTime : 
        (currentMediaType === 'video' ? videoPlayer.currentTime : audioElement.currentTime);
    
    let foundIndex = findCurrentSubtitleIndex(currentTime);
    
    if (foundIndex !== -1) {
        const currentSubtitle = subtitles[foundIndex];
        currentSubtitleIndex = foundIndex;

        // 更新视频内字幕
        if (videoSubtitlesVisible && currentMediaType === 'video') {
            const processedText = createClickableSubtitleContent(currentSubtitle.text, foundIndex);
            videoSubtitles.innerHTML = `<span class="video-subtitle-text selectable-text">${processedText}</span>`;
        } else {
            videoSubtitles.innerHTML = "";
        }
        
        // 更新主字幕显示
        const processedText = createClickableSubtitleContent(currentSubtitle.text, foundIndex);
        
        if (isFullscreen) {
            fullscreenSubtitle.innerHTML = processedText;
        } else {
            subtitleText.innerHTML = processedText;
            subtitleText.style.opacity = '1';
        }
        
        // 添加点击事件
        if (isFullscreen) {
            fullscreenSubtitle.removeEventListener('click', handleFullscreenSubtitleClick);
            fullscreenSubtitle.addEventListener('click', handleFullscreenSubtitleClick);
        } else {
            subtitleText.removeEventListener('click', handleSubtitleTextClick);
            subtitleText.addEventListener('click', handleSubtitleTextClick);
        }
        
    } else {
        if (isFullscreen) {
            fullscreenSubtitle.innerHTML = "";
        } else {
            subtitleText.style.opacity = '0.5';
            videoSubtitles.innerHTML = "";
        }
        currentSubtitleIndex = -1;
    }
    
    updateActiveSubtitleItem();
    
    if (currentMediaType === 'audio') {
        updateAudioSubtitles();
    }
}

// 处理字幕文本点击事件 - 修复版本
function handleSubtitleTextClick(e) {
    if (currentLanguageMode === 'english') {
        if (e.target.classList.contains('word')) {
            const word = e.target.getAttribute('data-word');
            const subtitleIndex = parseInt(e.target.getAttribute('data-index'));
            
            // console.log('字幕点击 - 单词:', word, '字幕索引:', subtitleIndex); // 调试信息

            // 剪贴板功能
            if (clipboardEnabled) {
                copyWordToClipboard(word);
            }

            pauseCurrentMedia();
            searchWordInPanel(word);
            
            if (activeTab === 'web-tab') {
                loadWebSearch(word);
            }

            currentWord = word;
            if (subtitleIndex >= 0 && subtitleIndex < subtitles.length) {
                currentSentence = subtitles[subtitleIndex].text;
                
                // 关键修复：立即重置状态
                currentWordIndex = -1;
                appendedWords = [];
                panelSearchInput.value = word;
                
                // console.log('更新原句前状态:', { currentWordIndex, appendedWords }); // 调试
                
                // 更新原句显示
                updateOriginalSentence(currentSentence, word, currentLanguageMode);
                
                // 强制设置当前单词索引
                setTimeout(() => {
                    const sentenceSpans = originalSentence.querySelectorAll('.sentence-word');
                    // console.log('原句单词数量:', sentenceSpans.length); // 调试
                    
                    let foundIndex = -1;
                    sentenceSpans.forEach((span, idx) => {
                        const spanWord = span.getAttribute('data-word');
                        const clickedWordClean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const spanWordClean = spanWord.toLowerCase().replace(/[^a-z0-9]/g, '');
                        
                        // console.log(`比较: "${spanWordClean}" === "${clickedWordClean}"`, spanWordClean === clickedWordClean); // 调试
                        
                        if (spanWordClean === clickedWordClean && foundIndex === -1) {
                            foundIndex = idx;
                            // console.log('找到匹配索引:', foundIndex); // 调试
                        }
                    });
                    
                    if (foundIndex !== -1) {
                        currentWordIndex = foundIndex;
                        appendedWords = [word];
                        // console.log('最终设置索引:', currentWordIndex, '追加词汇:', appendedWords); // 调试
                        
                        // 立即更新高亮显示
                        sentenceSpans.forEach((span, idx) => {
                            span.classList.toggle('highlight', idx === foundIndex);
                        });
                    } else {
                        console.warn('未找到匹配的单词索引'); // 调试
                        // 如果没有找到精确匹配，设置第一个单词
                        currentWordIndex = 0;
                        appendedWords = [sentenceSpans[0]?.getAttribute('data-word') || word];
                    }
                }, 10);
            }
            
            // 更新字幕高亮
            if (currentHighlightedWord) {
                currentHighlightedWord.classList.remove('highlight');
            }
            e.target.classList.add('highlight');
            currentHighlightedWord = e.target;
        }
    } else {
        if (e.target.classList.contains('japanese-sentence')) {
            const text = e.target.getAttribute('data-sentence');
            const index = parseInt(e.target.getAttribute('data-index'));

            // 剪贴板功能
            if (clipboardEnabled) {
                copyWordToClipboard(text);
            }
            
            pauseCurrentMedia();
            showJapaneseWordSegmentation(text);
            
            currentSentence = text;
            // 对于日语模式，重置索引
            currentWordIndex = 0;
            appendedWords = [text];
            panelSearchInput.value = text;
            
            // 更新原句显示
            updateOriginalSentence(currentSentence, '', currentLanguageMode);
        }
    }
}

// 更新字幕列表
function updateSubtitleList() {
    subtitleList.innerHTML = '';
    
    if (subtitles.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'subtitle-item';
        emptyItem.textContent = '无字幕';
        subtitleList.appendChild(emptyItem);
        return;
    }
    
    subtitles.forEach((subtitle, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'subtitle-item';
        listItem.innerHTML = `
            <div class="subtitle-time">${formatTime(subtitle.start)} - ${formatTime(subtitle.end)}</div>
            <div class="subtitle-content">${subtitle.text}</div>
        `;
        listItem.addEventListener('click', () => {
            jumpToSubtitle(index);
            closeSubtitleListPanelFunc();
        });
        subtitleList.appendChild(listItem);
    });
    
    updateActiveSubtitleItem();
}

// 更新当前激活的字幕项
function updateActiveSubtitleItem() {
    const items = subtitleList.querySelectorAll('.subtitle-item');
    items.forEach((item, index) => {
        if (index === currentSubtitleIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const audioItems = audioSubtitles.querySelectorAll('.audio-subtitle-item');
    audioItems.forEach((item, index) => {
        if (index === currentSubtitleIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 修复音频滚动字幕显示
function updateAudioSubtitles() {
    audioSubtitles.innerHTML = '';
    
    if (subtitles.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'audio-subtitle-item';
        emptyItem.textContent = '无字幕';
        audioSubtitles.appendChild(emptyItem);
        return;
    }
    
    subtitles.forEach((subtitle, index) => {
        const subtitleItem = document.createElement('div');
        subtitleItem.className = 'audio-subtitle-item';
        if (index === currentSubtitleIndex) {
            subtitleItem.classList.add('active');
        }
        
        // 修复英语模式显示：确保正常行显示
        if (currentLanguageMode === 'english') {
            subtitleItem.innerHTML = createClickableSubtitleContent(subtitle.text, index);
        } else {
            subtitleItem.innerHTML = `<span class="japanese-sentence selectable-text" data-sentence="${subtitle.text}" data-index="${index}">${subtitle.text}</span>`;
        }
        
        subtitleItem.addEventListener('click', (e) => {
            handleSubtitleClick(e, subtitle.text, index);
        });
        
        audioSubtitles.appendChild(subtitleItem);
    });
    
    ensureCurrentSubtitleVisible();
}

// 确保当前字幕在音频字幕区域中可见
function ensureCurrentSubtitleVisible() {
    if (currentSubtitleIndex >= 0) {
        const activeItem = audioSubtitles.children[currentSubtitleIndex];
        if (activeItem) {
            activeItem.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest' 
            });
        }
    }
}

// 处理字幕点击事件
function handleSubtitleClick(e, text, index) {
    if (currentLanguageMode === 'english') {
        if (e.target.classList.contains('word')) {
            const word = e.target.getAttribute('data-word');

            // 剪贴板功能
            if (clipboardEnabled) {
                copyWordToClipboard(word);
            }

            pauseCurrentMedia();
            searchWordInPanel(word);

            if (activeTab === 'web-tab') {
                loadWebSearch(word);
            }

            currentWord = word;
            currentSentence = text;
            updateOriginalSentence(currentSentence, word, currentLanguageMode);
        }
    } else {
        if (e.target.classList.contains('japanese-sentence')) {
            // 剪贴板功能
            if (clipboardEnabled) {
                copyWordToClipboard(text);
            }

            pauseCurrentMedia();
            showJapaneseWordSegmentation(text);
            currentSentence = text;
        }
    }
}

// 跳转到指定字幕
function jumpToSubtitle(index) {
    if (index < 0 || index >= subtitles.length) return;
    
    if (currentMediaType === 'video') {
        videoPlayer.currentTime = subtitles[index].start;
        fullscreenVideoPlayer.currentTime = subtitles[index].start;
    } else if (audioElement) {
        audioElement.currentTime = subtitles[index].start;
    }
    currentSubtitleIndex = index;
    updateActiveSubtitleItem();
}

// 全屏模式下跳转到字幕
function jumpToSubtitleInFullscreen(index) {
    if (index < 0 || index >= subtitles.length) return;
    
    fullscreenVideoPlayer.currentTime = subtitles[index].start;
    if (fullscreenVideoPlayer.paused) {
        fullscreenVideoPlayer.play().catch(()=>{});
    }
    currentSubtitleIndex = index;
    updateActiveSubtitleItem();
    updateCurrentSubtitle(); // 强制更新字幕显示
}