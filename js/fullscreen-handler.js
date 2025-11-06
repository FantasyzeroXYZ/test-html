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
    if (e.target.classList.contains('word') || e.target.classList.contains('selectable-word') || e.target.classList.contains('japanese-sentence')) {
        const word = e.target.getAttribute('data-word') || e.target.textContent.trim();
        
        // 剪贴板功能
        if (clipboardEnabled) {
            copyWordToClipboard(word);
        }
        
        // 打开词典
        openFullscreenDictionary();
        
        // 搜索单词
        if (currentLanguageMode === 'english') {
            searchWordInPanel(word);
        } else {
            const sentence = e.target.getAttribute('data-sentence') || e.target.textContent;
            showJapaneseWordSegmentation(sentence, word);
        }
        
        currentWord = word;
        currentSentence = e.target.getAttribute('data-sentence') || e.target.textContent;
        updateOriginalSentence(currentSentence, word);
    }
}

// 打开全屏词典
function openFullscreenDictionary() {
    // 记录播放状态
    wasPlayingBeforeDict = !fullscreenVideoPlayer.paused;
    
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

// 修改进入全屏函数
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
            hasEnteredFullscreenBefore = true; // 标记已进入过全屏

            if (wasPlaying) {
                fullscreenVideoPlayer.play().catch(()=>{});
            }

            updateCurrentSubtitle();
            updateFullscreenProgressDisplay();
            showFullscreenControls(); // 显示控制条
        }).catch(err => {
            console.error(`全屏请求错误: ${err.message}`);
            videoPlayer.muted = false;
            fullscreenVideoPlayer.muted = true;
        });
    }
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