// 媒体处理功能

// 更新媒体显示
function updateMediaDisplay() {
    if (currentMediaType === 'video') {
        videoPlayerContainer.style.display = 'block';
        audioPlayerContainer.style.display = 'none';
    } else {
        videoPlayerContainer.style.display = 'none';
        audioPlayerContainer.style.display = 'block';
    }
    updateControlButtons();
}

// 更新控制按钮显示
function updateControlButtons() {
    const videoControls = [toggleVideoSubtitlesBtn];
    const audioControls = [toggleAudioSubtitlesBtn];
    
    if (currentMediaType === 'video') {
        videoControls.forEach(btn => {
            if (btn) btn.style.display = 'flex';
        });
        audioControls.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    } else {
        videoControls.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        audioControls.forEach(btn => {
            if (btn) btn.style.display = 'flex';
        });
    }
}

// 更新语言模式按钮文本
function updateLanguageModeButton() {
    languageModeBtn.innerHTML = currentLanguageMode === 'english' ? 
        '<i class="fas fa-language"></i> 英语模式' : 
        '<i class="fas fa-language"></i> 日语模式';
}

// 更新媒体模式按钮文本
function updateMediaModeButton() {
    mediaModeBtn.innerHTML = currentMediaType === 'video' ? 
        '<i class="fas fa-video"></i> 模式' : 
        '<i class="fas fa-music"></i> 模式';
    updateImportButton();
}

// 更新导入按钮文本
function updateImportButton() {
    mediaImportBtn.innerHTML = currentMediaType === 'video' ? 
        '<i class="fas fa-file-video"></i> 视频' : 
        '<i class="fas fa-file-audio"></i> 音频';
}

// 清除当前媒体和字幕
function clearCurrentMedia() {
    if (currentMediaType === 'video') {
        videoPlayer.pause();
        videoPlayer.src = '';
    } else if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioPlayPauseBtn.textContent = '▶';
        audioPlayPauseBtn.classList.remove('active');
    }
    
    currentMediaFile = null;
    videoFileInput.value = '';
    audioFileInput.value = '';
    
    subtitles = [];
    subtitleFileInput.value = '';
    subtitleText.innerHTML = "无字幕";
    videoSubtitles.innerHTML = "";
    updateSubtitleList();
    updateAudioSubtitles();
    
    currentSubtitleIndex = -1;
    currentWord = '';
    currentSentence = '';
    appendedWords = [];
    currentWordIndex = -1;
    panelSearchInput.value = '';
}

// 切换到视频模式
function switchToVideoMode() {
    currentMediaType = 'video';
    updateMediaModeButton();
    updateMediaDisplay();
    saveConfig();
}

// 切换到音频模式
function switchToAudioMode() {
    currentMediaType = 'audio';
    updateMediaModeButton();
    updateMediaDisplay();
    saveConfig();
}

// 切换语言模式
function toggleLanguageMode() {
    currentLanguageMode = currentLanguageMode === 'english' ? 'japanese' : 'english';
    updateLanguageModeButton();
    saveConfig();
}

// 切换媒体模式
function toggleMediaMode() {
    clearCurrentMedia();
    currentMediaType = currentMediaType === 'video' ? 'audio' : 'video';
    updateMediaModeButton();
    updateMediaDisplay();
    saveConfig();
}

// 初始化音频上下文
function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// 自适应加载音频缓冲
async function loadAudioBuffer(file) {
    const ctx = getAudioContext();
    const arrayBuffer = await file.arrayBuffer();

    try {
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
        console.warn("⚠ 无法直接从文件提取音频:", err);
        audioBuffer = null;
    }
}

// 暂停当前媒体播放
function pauseCurrentMedia() {
    if (currentMediaType === 'video') {
        playerWasPlaying = !videoPlayer.paused;
        videoPlayer.pause();
    } else if (audioElement) {
        playerWasPlaying = !audioElement.paused;
        audioElement.pause();
        audioPlayPauseBtn.textContent = '▶';
        audioPlayPauseBtn.classList.remove('active');
    }
}