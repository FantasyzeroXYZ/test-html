// 全屏处理功能

// 修复全屏控制条显示问题
function fixFullscreenControlsDisplay() {
    // 确保刚进入页面时全屏控制条不显示
    if (!hasEnteredFullscreenBefore) {
        fullscreenControls.style.display = 'none';
    }
}

// 初始化全屏拖拽功能
function initFullscreenDrag() {
    // 创建进度条滑块
    const progressThumb = document.createElement('div');
    progressThumb.className = 'fullscreen-progress-thumb';
    fullscreenProgress.appendChild(progressThumb);
    
    // 鼠标事件
    fullscreenProgress.addEventListener('mousedown', startFullscreenDrag);
    progressThumb.addEventListener('mousedown', startFullscreenDrag);
    
    // 触摸事件
    fullscreenProgress.addEventListener('touchstart', startFullscreenDragTouch);
    progressThumb.addEventListener('touchstart', startFullscreenDragTouch);
    
    // 修复进度条更新
    fullscreenVideoPlayer.addEventListener('timeupdate', updateFullscreenProgressDisplay);
}

// 更新全屏进度条显示
function updateFullscreenProgressDisplay() {
    if (!isFullscreen) return;
    
    const currentTime = fullscreenVideoPlayer.currentTime;
    const duration = fullscreenVideoPlayer.duration || 0;
    
    if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        fullscreenProgressBar.style.width = `${progressPercent}%`;
        
        // 更新滑块位置
        const thumb = fullscreenProgress.querySelector('.fullscreen-progress-thumb');
        if (thumb) {
            thumb.style.left = `${progressPercent}%`;
        }
        
        fullscreenTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
}

// 开始全屏拖拽（鼠标）
function startFullscreenDrag(e) {
    e.preventDefault();
    isDraggingFullscreenProgress = true;
    
    const moveHandler = (e) => {
        if (!isDraggingFullscreenProgress) return;
        updateFullscreenProgress(e.clientX);
    };
    
    const upHandler = () => {
        isDraggingFullscreenProgress = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    
    updateFullscreenProgress(e.clientX);
}

// 开始全屏拖拽（触摸）
function startFullscreenDragTouch(e) {
    e.preventDefault();
    isDraggingFullscreenProgress = true;
    
    const moveHandler = (e) => {
        if (!isDraggingFullscreenProgress) return;
        const touch = e.touches[0];
        updateFullscreenProgress(touch.clientX);
    };
    
    const upHandler = () => {
        isDraggingFullscreenProgress = false;
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', upHandler);
    };
    
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('touchend', upHandler);
    
    const touch = e.touches[0];
    updateFullscreenProgress(touch.clientX);
}

// 更新全屏进度
function updateFullscreenProgress(clientX) {
    const rect = fullscreenProgress.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    
    const duration = fullscreenVideoPlayer.duration || 0;
    const newTime = percent * duration;
    
    fullscreenVideoPlayer.currentTime = newTime;
    updateFullscreenProgressDisplay();
    updateCurrentSubtitle(); // 强制更新字幕
}

// 修复全屏字幕连续跳转
function initFullscreenSubtitleNavigation() {
    prevSubtitleBtn.addEventListener('click', () => {
        if (subtitles.length === 0) return;
        
        let targetIndex;
        if (currentSubtitleIndex >= 0) {
            targetIndex = currentSubtitleIndex - 1;
            if (targetIndex < 0) targetIndex = 0;
        } else {
            const currentTime = fullscreenVideoPlayer.currentTime;
            targetIndex = findPrevSubtitleIndex(currentTime);
        }
        
        jumpToSubtitleInFullscreen(targetIndex);
    });
    
    nextSubtitleBtn.addEventListener('click', () => {
        if (subtitles.length === 0) return;
        
        let targetIndex;
        if (currentSubtitleIndex >= 0) {
            targetIndex = currentSubtitleIndex + 1;
            if (targetIndex >= subtitles.length) targetIndex = subtitles.length - 1;
        } else {
            const currentTime = fullscreenVideoPlayer.currentTime;
            targetIndex = findNextSubtitleIndex(currentTime);
        }
        
        jumpToSubtitleInFullscreen(targetIndex);
    });
}

// 初始化全屏词典功能
function initFullscreenDictionary() {
    fullscreenDictBtn.addEventListener('click', openFullscreenDictionary);
    
    // 监听全屏字幕点击事件
    fullscreenSubtitle.addEventListener('click', handleFullscreenSubtitleClick);
}

// 处理全屏字幕点击
function handleFullscreenSubtitleClick(e) {
    if (!e.target.classList.contains('word') && 
        !e.target.classList.contains('selectable-word') && 
        !e.target.classList.contains('japanese-sentence')) {
        return;
    }

    // 获取点击的单词或句子
    let word = e.target.getAttribute('data-word') || e.target.textContent.trim();
    
    // 获取完整句子，优先使用 data-sentence 属性
    let fullSentence = e.target.getAttribute('data-sentence') || '';
    if (!fullSentence && currentSubtitleIndex >= 0 && subtitles[currentSubtitleIndex]) {
        fullSentence = subtitles[currentSubtitleIndex].text;
    }
    if (!fullSentence) {
        fullSentence = e.target.textContent.trim();
    }

    // 剪贴板功能
    if (clipboardEnabled) copyWordToClipboard(word);

    // 打开全屏词典
    openFullscreenDictionary();

    if (currentLanguageMode === 'english') {
        // 英语模式：搜索单词
        searchWordInPanel(word);
    } else {
        // 日语模式：分词处理
        showJapaneseWordSegmentation(fullSentence, word).then(japaneseWords => {
            if (japaneseWords && japaneseWords.length > 0) {
                currentSentence = fullSentence;
                currentWordIndex = 0;
                appendedWords = [japaneseWords[0]];
                panelSearchInput.value = japaneseWords[0];

                updateOriginalSentence(currentSentence, japaneseWords[0], currentLanguageMode, japaneseWords);
            }
        });
    }

    // 设置全局状态
    currentWord = word;
    currentSentence = fullSentence;
    currentWordIndex = -1;
    appendedWords = [];
    panelSearchInput.value = word;

    // 更新原句显示（英语/日语通用）
    updateOriginalSentence(currentSentence, word);

    // 强制设置当前单词索引，保持高亮逻辑一致
    setTimeout(() => {
        const sentenceSpans = originalSentence.querySelectorAll('.sentence-word');
        let foundIndex = -1;

        sentenceSpans.forEach((span, idx) => {
            const spanWord = span.getAttribute('data-word');
            const clickedWordClean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
            const spanWordClean = spanWord.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (spanWordClean === clickedWordClean && foundIndex === -1) {
                foundIndex = idx;
            }
        });

        if (foundIndex !== -1) {
            currentWordIndex = foundIndex;
            appendedWords = [word];
        } else {
            currentWordIndex = 0;
            appendedWords = [sentenceSpans[0]?.getAttribute('data-word') || word];
        }

        // 更新高亮显示
        sentenceSpans.forEach((span, idx) => {
            span.classList.toggle('highlight', idx === currentWordIndex);
        });
    }, 10);
}


// 打开全屏词典
function openFullscreenDictionary() {
    // 记录播放状态
    wasPlayingBeforeDict = !fullscreenVideoPlayer.paused;
    playerWasPlaying = wasPlayingBeforeDict; // 确保全局状态同步
    
    // 暂停播放
    if (wasPlayingBeforeDict) {
        fullscreenVideoPlayer.pause();
    }
    
    // 显示词典面板
    dictionaryPanel.classList.add('active');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}


// 全屏控制条自动隐藏（增强版）
function showFullscreenControls() {
    if (!isFullscreen) return;
    
    fullscreenControls.style.display = 'flex';
    updateFullscreenControlsVisibility();
    
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        if (!fullscreenVideoPlayer.paused && isFullscreen) {
            fullscreenControls.style.display = 'none';
            updateFullscreenControlsVisibility();
        }
    }, 3000);
}

// 更新全屏控制条显示状态
function updateFullscreenControlsVisibility() {
    if (!isFullscreen) return;
    
    const controlsVisible = fullscreenControls.style.display !== 'none';
    // 减少字幕与控制条之间的间距
    const subtitleBottom = controlsVisible ? '60px' : '20px';
    
    fullscreenSubtitle.style.bottom = subtitleBottom;
    fullscreenSubtitle.style.transition = 'bottom 0.3s ease';
}

// 确保在进入全屏时更新字幕显示和绑定事件
function enterFullscreen() {
    if (currentMediaType !== 'video') {
        showNotification('全屏模式仅支持视频播放');
        return;
    }
    
    if (!document.fullscreenElement) {
        const wasPlaying = !videoPlayer.paused && !videoPlayer.ended;

        fullscreenVideoPlayer.currentTime = videoPlayer.currentTime;

        videoPlayer.muted = true;
        videoPlayer.pause();

        fullscreenVideoPlayer.muted = false;

        document.documentElement.requestFullscreen().then(() => {
            document.body.classList.add('fullscreen-mode');
            fullscreenVideoContainer.style.display = 'flex';
            fullscreenSubtitle.style.display = 'flex';
            fullscreenVideoPlayer.controls = false;
            isFullscreen = true;
            hasEnteredFullscreenBefore = true;

            if (wasPlaying) {
                fullscreenVideoPlayer.play().catch(()=>{});
            }

            updateCurrentSubtitle();
            updateFullscreenProgressDisplay();
            showFullscreenControls();
            
            // 重要：更新全屏字幕显示并绑定点击事件
            updateFullscreenSubtitle();
            bindFullscreenSubtitleClickEvents();
            
            console.log('进入全屏模式，字幕事件已绑定');
            
        }).catch(err => {
            console.error(`全屏请求错误: ${err.message}`);
            videoPlayer.muted = false;
            fullscreenVideoPlayer.muted = true;
        });
    }
}

// 绑定全屏字幕点击事件
function bindFullscreenSubtitleClickEvents() {
    const fullscreenSubtitle = document.getElementById('fullscreenSubtitle');
    if (!fullscreenSubtitle) return;

    // 移除现有的事件监听器，避免重复绑定
    fullscreenSubtitle.removeEventListener('click', handleFullscreenSubtitleClick);
    fullscreenSubtitle.addEventListener('click', handleFullscreenSubtitleClick);
}

// 更新全屏字幕显示函数
function updateFullscreenSubtitle() {
    if (!isFullscreen || currentSubtitleIndex < 0 || !subtitles[currentSubtitleIndex]) {
        return;
    }

    const subtitle = subtitles[currentSubtitleIndex];
    const fullscreenSubtitle = document.getElementById('fullscreenSubtitle');
    
    if (!fullscreenSubtitle) return;

    // 移除状态消息
    const statusMessage = fullscreenSubtitle.querySelector('.status-message');
    if (statusMessage) {
        statusMessage.remove();
    }

    let subtitleHTML = '';
    
    if (currentLanguageMode === 'english') {
        // 英文模式：单词可点击，并为每个单词添加完整句子的data-sentence属性
        // 使用与普通字幕相同的单词分割逻辑
        const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
        let lastIndex = 0;
        
        let match;
        while ((match = wordRegex.exec(subtitle.text)) !== null) {
            // 添加非单词内容（标点符号等）
            subtitleHTML += subtitle.text.substring(lastIndex, match.index);
            
            // 创建可点击的单词，但存储清理后的单词
            const cleanWord = match[0].replace(/[^\w]/g, '');
            subtitleHTML += `<span class="word selectable-word" data-word="${cleanWord}" data-sentence="${escapeHtml(subtitle.text)}">${match[0]}</span>`;
            lastIndex = match.index + match[0].length;
        }
        
        // 添加剩余内容
        subtitleHTML += subtitle.text.substring(lastIndex);
    } else {
        // 日文模式：整个句子可点击
        subtitleHTML = `<span class="japanese-sentence selectable-word" data-sentence="${escapeHtml(subtitle.text)}">${subtitle.text}</span>`;
    }

    fullscreenSubtitle.innerHTML = subtitleHTML;
    
    // 重新绑定点击事件
    bindFullscreenSubtitleClickEvents();
}

// 修改退出全屏函数
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(()=>{});
        document.body.classList.remove('fullscreen-mode');
        fullscreenVideoContainer.style.display = 'none';
        fullscreenSubtitle.style.display = 'none';
        fullscreenControls.style.display = 'none';
        isFullscreen = false;
        
        // 恢复普通播放器
        if (currentMediaType === 'video') {
            videoPlayer.currentTime = fullscreenVideoPlayer.currentTime;
            videoPlayer.muted = false;
            if (!fullscreenVideoPlayer.paused) {
                videoPlayer.play().catch(()=>{});
            }
        }
        
        // 停止全屏播放器
        fullscreenVideoPlayer.pause();
        fullscreenVideoPlayer.muted = true;
        
        updateCurrentSubtitle();
    }
}

// 打开全屏字幕面板
function openFullscreenSubtitles() {
    wasPlayingBeforeSubtitles = !fullscreenVideoPlayer.paused;
    fullscreenVideoPlayer.pause();
    fullscreenSubtitlesPanel.classList.add('active');
    fullscreenSubtitlesOverlay.classList.add('active');
    displayFullscreenSubtitlesList();
}

// 关闭全屏字幕面板
function closeFullscreenSubtitles() {
    fullscreenSubtitlesPanel.classList.remove('active');
    fullscreenSubtitlesOverlay.classList.remove('active');
    if (wasPlayingBeforeSubtitles) {
        fullscreenVideoPlayer.play().catch(()=>{});
    }
}

// 显示全屏字幕列表
function displayFullscreenSubtitlesList() {
    if (subtitles.length === 0) {
        fullscreenSubtitlesContent.innerHTML = '<div class="status-message">没有找到有效的字幕</div>';
        return;
    }
    
    let html = '';
    subtitles.forEach((sub, index) => {
        const startTime = formatTime(sub.start);
        const endTime = formatTime(sub.end);
        const isCurrent = index === currentSubtitleIndex;
        
        html += `
            <div class="fullscreen-subtitle-item ${isCurrent ? 'current' : ''}" data-index="${index}">
                <span class="subtitle-time">[${startTime} - ${endTime}]</span>
                <span>${escapeHtml(sub.text)}</span>
            </div>
        `;
    });
    
    fullscreenSubtitlesContent.innerHTML = html;
    
    const currentItem = fullscreenSubtitlesContent.querySelector('.fullscreen-subtitle-item.current');
    if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    document.querySelectorAll('.fullscreen-subtitle-item').forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const subtitle = subtitles[index];
            fullscreenVideoPlayer.currentTime = subtitle.start;
            closeFullscreenSubtitles();
        });
    });
}

// 打开字幕列表面板
function openSubtitleListPanel() {
    pauseCurrentMedia();
    subtitleListPanel.classList.add('active');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const currentTime = currentMediaType === 'video' ? videoPlayer.currentTime : audioElement.currentTime;
    let targetIndex = findCurrentSubtitleIndex(currentTime);
    
    if (targetIndex === -1) {
        targetIndex = findNextSubtitleIndex(currentTime);
    }
    
    if (targetIndex >= 0) {
        const targetItem = subtitleList.querySelector(`.subtitle-item:nth-child(${targetIndex + 1})`);
        if (targetItem) {
            setTimeout(() => {
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                subtitleList.querySelectorAll('.subtitle-item').forEach(item => {
                    item.classList.remove('active');
                });
                targetItem.classList.add('active');
            }, 100);
        }
    }
}

// 关闭字幕列表面板
function closeSubtitleListPanelFunc() {
    subtitleListPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (playerWasPlaying) {
        if (currentMediaType === 'video') {
            videoPlayer.play();
        } else if (audioElement) {
            audioElement.play();
            audioPlayPauseBtn.textContent = '⏸';
            audioPlayPauseBtn.classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // 绑定全屏字幕点击事件
    bindFullscreenSubtitleClickEvents();
});