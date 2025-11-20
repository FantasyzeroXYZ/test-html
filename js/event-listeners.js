// 事件监听器设置

// 模式切换事件
mediaModeBtn.addEventListener('click', toggleMediaMode);
languageModeBtn.addEventListener('click', toggleLanguageMode);

// 文件选择事件处理
subtitleImportBtn.addEventListener('click', () => {
    subtitleFileInput.click();
});

mediaImportBtn.addEventListener('click', () => {
    if (currentMediaType === 'video') {
        videoFileInput.click();
    } else {
        audioFileInput.click();
    }
});

// 视频文件加载
videoFileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    currentMediaFile = file;
    currentMediaType = 'video';

    if (audioElement && !audioElement.paused) {
        audioElement.pause();
        audioPlayPauseBtn.textContent = '▶';
        audioPlayPauseBtn.classList.remove('active');
    }

    const fileURL = URL.createObjectURL(file);
    videoPlayer.src = fileURL;
    fullscreenVideoPlayer.src = fileURL;

    switchToVideoMode();

    subtitles = [];
    subtitleText.innerHTML = "无字幕";
    videoSubtitles.innerHTML = "";
    updateSubtitleList();

    await loadAudioBuffer(file);
});

// 音频文件加载
audioFileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    currentMediaFile = file;
    currentMediaType = 'audio';

    if (!videoPlayer.paused) {
        videoPlayer.pause();
    }

    const fileURL = URL.createObjectURL(file);
    if (!audioElement) {
        audioElement = new Audio();
        initAudioControls();
    }
    audioElement.src = fileURL;

    switchToAudioMode();

    subtitles = [];
    subtitleText.innerHTML = "无字幕";
    updateSubtitleList();

    await loadAudioBuffer(file);
});

// 字幕文件选择处理
subtitleFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseSubtitle(content);
        };
        reader.readAsText(file);
    }
});

// 切换音频字幕显示
toggleAudioSubtitlesBtn.addEventListener('click', () => {
    audioSubtitlesVisible = !audioSubtitlesVisible;
    if (audioSubtitlesVisible) {
        audioSubtitles.classList.add('active');
    } else {
        audioSubtitles.classList.remove('active');
    }
});

// 显示/隐藏字幕
toggleSubtitleBtn.addEventListener('click', () => {
    subtitleVisible = !subtitleVisible;
    subtitleDisplay.style.display = subtitleVisible ? 'block' : 'none';
});

// 切换视频内字幕显示
toggleVideoSubtitlesBtn.addEventListener('click', () => {
    videoSubtitlesVisible = !videoSubtitlesVisible;
    if (!videoSubtitlesVisible) {
        videoSubtitles.innerHTML = "";
    } else if (currentSubtitleIndex >= 0) {
        videoSubtitles.innerHTML = `<span class="video-subtitle-text selectable-text">${subtitles[currentSubtitleIndex].text}</span>`;
    }
});

// 上一句跳转
prevSentenceBtn.addEventListener('click', () => {
    if (subtitles.length === 0) return;
    
    let targetIndex;
    const currentTime = currentMediaType === 'video' ? videoPlayer.currentTime : audioElement.currentTime;
    
    if (currentSubtitleIndex >= 0) {
        targetIndex = currentSubtitleIndex - 1;
        if (targetIndex < 0) targetIndex = 0;
    } else {
        targetIndex = findPrevSubtitleIndex(currentTime);
    }
    
    jumpToSubtitle(targetIndex);
});

// 下一句跳转
nextSentenceBtn.addEventListener('click', () => {
    if (subtitles.length === 0) return;
    
    let targetIndex;
    const currentTime = currentMediaType === 'video' ? videoPlayer.currentTime : audioElement.currentTime;
    
    if (currentSubtitleIndex >= 0) {
        targetIndex = currentSubtitleIndex + 1;
        if (targetIndex >= subtitles.length) targetIndex = subtitles.length - 1;
    } else {
        targetIndex = findNextSubtitleIndex(currentTime);
    }
    
    jumpToSubtitle(targetIndex);
});

// 时间跳转
timeJumpBtn.addEventListener('click', () => {
    const time = parseFloat(timeJumpInput.value);
    if (!isNaN(time) && time >= 0) {
        if (currentMediaType === 'video') {
            videoPlayer.currentTime = time;
            fullscreenVideoPlayer.currentTime = time;
        } else if (audioElement) {
            audioElement.currentTime = time;
        }
    }
});

timeJumpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const time = parseFloat(timeJumpInput.value);
        if (!isNaN(time) && time >= 0) {
            if (currentMediaType === 'video') {
                videoPlayer.currentTime = time;
                fullscreenVideoPlayer.currentTime = time;
            } else if (audioElement) {
                audioElement.currentTime = time;
            }
        }
    }
});

// 显示字幕列表
showSubtitleListBtn.addEventListener('click', () => {
    openSubtitleListPanel();
});

closeSubtitleListPanel.addEventListener('click', closeSubtitleListPanelFunc);

// 标签页切换功能-切换页面时触发
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        activeTab = tabId;
        
        if (tabId === 'web-tab') {
            const word = panelSearchInput.value.trim();
            if (word) {
                loadWebSearch(word);
            }
        } else if (tabId === 'dictionary-tab') {
            const word = panelSearchInput.value.trim();
            if (word) {
                if (currentLanguageMode === 'english') {
                    searchWordInPanel(word);
                } else {
                    searchJapaneseWordInPanel(word);
                }
            }
        }
    });
});

// 关闭面板函数
closePanelBtn.addEventListener('click', closeDictionaryPanel);
panelOverlay.addEventListener('click', () => {
    closeDictionaryPanel();
    closeSubtitleListPanelFunc();
});

// 全屏按钮事件
fullscreenBtn.addEventListener('click', enterFullscreen);
exitFullscreenBtn.addEventListener('click', exitFullscreen);

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen-mode');
        fullscreenVideoContainer.style.display = 'none';
        fullscreenSubtitle.style.display = 'none';
        fullscreenControls.style.display = 'none';
        isFullscreen = false;
        
        videoPlayer.currentTime = fullscreenVideoPlayer.currentTime;
        videoPlayer.muted = false;
        if (!fullscreenVideoPlayer.paused) {
            videoPlayer.play().catch(()=>{});
        }
        
        fullscreenVideoPlayer.pause();
        fullscreenVideoPlayer.muted = true;
        fullscreenVideoPlayer.controls = true;
        
        updateCurrentSubtitle();
    }
});

// 全屏模式下点击画面暂停/播放
fullscreenVideoContainer.addEventListener('click', function(e) {
    if (isFullscreen && e.target === fullscreenVideoContainer) {
        if (fullscreenVideoPlayer.paused) {
            fullscreenVideoPlayer.play().catch(()=>{});
        } else {
            fullscreenVideoPlayer.pause();
        }
    }
});

// 同步两个视频播放器的状态
videoPlayer.addEventListener('play', function() {
    if (!isFullscreen) {
        fullscreenVideoPlayer.pause();
        fullscreenVideoPlayer.muted = true;
        fullscreenVideoPlayer.currentTime = videoPlayer.currentTime;
        videoPlayer.muted = false;
    }
});

videoPlayer.addEventListener('pause', function() {
    if (!isFullscreen) {
        fullscreenVideoPlayer.pause();
    }
});

fullscreenVideoPlayer.addEventListener('play', function() {
    if (isFullscreen) {
        videoPlayer.pause();
        videoPlayer.muted = true;
        videoPlayer.currentTime = fullscreenVideoPlayer.currentTime;
        fullscreenVideoPlayer.muted = false;
        updateFullscreenProgressDisplay();
    }
});

fullscreenVideoPlayer.addEventListener('pause', function() {
    if (isFullscreen) {
        videoPlayer.pause();
        updateFullscreenProgressDisplay();
    }
});

// 全屏控制功能
playPauseBtn.addEventListener('click', () => {
    if (fullscreenVideoPlayer.paused) {
        fullscreenVideoPlayer.play().catch(()=>{});
    } else {
        fullscreenVideoPlayer.pause();
    }
});

// 进度条点击跳转
fullscreenProgress.addEventListener('click', (e) => {
    const rect = fullscreenProgress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    fullscreenVideoPlayer.currentTime = percent * fullscreenVideoPlayer.duration;
});

fullscreenSubtitlesBtn.addEventListener('click', openFullscreenSubtitles);
closeSubtitlesBtn.addEventListener('click', closeFullscreenSubtitles);
fullscreenSubtitlesOverlay.addEventListener('click', closeFullscreenSubtitles);

// 检查Anki连接
checkAnkiBtn.addEventListener('click', checkAnkiConnection);

// 显示/隐藏配置
showConfigBtn.addEventListener('click', () => {
    const isHidden = autoConfigSection.classList.contains('hidden');
    if (isHidden) {
        autoConfigSection.classList.remove('hidden');
        showConfigBtn.textContent = '收起';
    } else {
        autoConfigSection.classList.add('hidden');
        showConfigBtn.textContent = '配置';
    }
});

// 模型选择变化时加载字段
modelSelect.addEventListener('change', () => {
    loadModelFields(modelSelect.value);
    saveConfig();
});

// 配置变化时保存
deckSelect.addEventListener('change', saveConfig);
wordFieldSelect.addEventListener('change', saveConfig);
sentenceFieldSelect.addEventListener('change', saveConfig);
definitionFieldSelect.addEventListener('change', saveConfig);
audioFieldSelect.addEventListener('change', saveConfig);
imageFieldSelect.addEventListener('change', saveConfig);

// 监听播放器时间更新
videoPlayer.addEventListener('timeupdate', event => {
    updateSubtitle(videoPlayer.currentTime);
});

// 全屏播放器时间更新事件
fullscreenVideoPlayer.addEventListener('timeupdate', () => {
    updateFullscreenProgressDisplay();
    updateCurrentSubtitle(); // 确保字幕同步更新
});

// 更新全屏控制条事件
fullscreenVideoContainer.addEventListener('mousemove', showFullscreenControls);
fullscreenControls.addEventListener('mousemove', showFullscreenControls);


// 侧边栏功能
function initSidebarEvents() {
    // 打开侧边栏
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', openSidebar);
    }
    
    // 关闭侧边栏
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    
    // 点击遮罩层关闭侧边栏
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // ESC键关闭侧边栏
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

// 打开侧边栏函数
function openSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
}

// 关闭侧边栏函数
function closeSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // 恢复背景滚动
    }
}
