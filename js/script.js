// 获取DOM元素
const mediaModeBtn = document.getElementById('media-mode-btn');
const languageModeBtn = document.getElementById('language-mode-btn');
const subtitleImportBtn = document.getElementById('subtitle-import-btn');
const mediaImportBtn = document.getElementById('media-import-btn');
const videoFileInput = document.getElementById('video-file-input');
const audioFileInput = document.getElementById('audio-file-input');
const subtitleFileInput = document.getElementById('subtitle-file-input');
const trackTitle = document.getElementById('track-title');
const trackDescription = document.getElementById('track-description');
const subtitleText = document.getElementById('subtitle-text');
const toggleSubtitleBtn = document.getElementById('toggle-subtitle-btn');
const subtitleDisplay = document.getElementById('subtitle-display');
const videoPlayer = document.getElementById('player');
const videoSubtitles = document.getElementById('video-subtitles');
const mediaIcon = document.getElementById('media-icon');

// 媒体类型选择
const videoPlayerContainer = document.getElementById('video-player');
const audioPlayerContainer = document.getElementById('audio-player');

// 音频播放器控件
const audioCurrentTime = document.getElementById('audio-current-time');
const audioDuration = document.getElementById('audio-duration');
const audioProgress = document.getElementById('audio-progress');
const audioProgressFilled = document.getElementById('audio-progress-filled');
const progressThumb = document.getElementById('progress-thumb');
const audioVolume = document.getElementById('audio-volume');
const audioVolumeFilled = document.getElementById('audio-volume-filled');
const volumeThumb = document.getElementById('volume-thumb');
const audioPlayPauseBtn = document.getElementById('audio-play-pause-btn');
const audioSubtitles = document.getElementById('audio-subtitles');
const toggleAudioSubtitlesBtn = document.getElementById('toggle-audio-subtitles-btn');

// Anki相关元素
const ankiStatusIndicator = document.getElementById('anki-status-indicator');
const ankiStatusText = document.getElementById('anki-status-text');
const checkAnkiBtn = document.getElementById('check-anki-btn');
const showConfigBtn = document.getElementById('show-config-btn');
const autoConfigSection = document.getElementById('auto-config-section');
const addToAnkiBtn = document.getElementById('panel-add-to-anki-btn');
const customDefinitionInput = document.getElementById('panel-custom-definition-input');

// 字幕跳转相关元素
const prevSentenceBtn = document.getElementById('prev-sentence-btn');
const nextSentenceBtn = document.getElementById('next-sentence-btn');
const timeJumpInput = document.getElementById('time-jump-input');
const timeJumpBtn = document.getElementById('time-jump-btn');
const subtitleList = document.getElementById('subtitle-list');
const showSubtitleListBtn = document.getElementById('show-subtitle-list-btn');
const subtitleListPanel = document.getElementById('subtitle-list-panel');
const closeSubtitleListPanel = document.getElementById('close-subtitle-list-panel');
const toggleVideoSubtitlesBtn = document.getElementById('toggle-video-subtitles-btn');

// 剪贴板功能按钮
const clipboardBtn = document.getElementById('clipboard-btn');

// 自动配置相关元素
const deckSelect = document.getElementById('deck-select');
const modelSelect = document.getElementById('model-select');
const wordFieldSelect = document.getElementById('word-field-select');
const sentenceFieldSelect = document.getElementById('sentence-field-select');
const definitionFieldSelect = document.getElementById('definition-field-select');
const audioFieldSelect = document.getElementById('audio-field-select');
const imageFieldSelect = document.getElementById('image-field-select');

// 底部面板相关元素
const dictionaryPanel = document.getElementById('dictionary-panel');
const panelOverlay = document.getElementById('panel-overlay');
const closePanelBtn = document.getElementById('close-panel');
const panelDictionaryResult = document.getElementById('panel-dictionary-result');
const panelWordTitle = document.getElementById('panel-word-title');
const panelSearchInput = document.getElementById('panel-search-input');
const panelSearchBtn = document.getElementById('panel-search-btn');
const originalSentence = document.getElementById('original-sentence');
const appendWordBtn = document.getElementById('append-word-btn');
const webSearchFrame = document.getElementById('web-search-frame');

// 新增元素
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// ==================== 全屏相关元素 ====================
const fullscreenBtn = document.getElementById('fullscreen-btn');
const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
const fullscreenVideoPlayer = document.getElementById('fullscreenVideoPlayer');
const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
const fullscreenSubtitle = document.getElementById('fullscreenSubtitle');
const fullscreenControls = document.getElementById('fullscreenControls');
const fullscreenProgress = document.getElementById('fullscreenProgress');
const fullscreenProgressBar = document.getElementById('fullscreenProgressBar');
const fullscreenTime = document.getElementById('fullscreenTime');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevSubtitleBtn = document.getElementById('prevSubtitleBtn');
const nextSubtitleBtn = document.getElementById('nextSubtitleBtn');
const fullscreenDictBtn = document.getElementById('fullscreenDictBtn');
const fullscreenSubtitlesBtn = document.getElementById('fullscreenSubtitlesBtn');
const fullscreenSubtitlesPanel = document.getElementById('fullscreenSubtitlesPanel');
const fullscreenSubtitlesOverlay = document.getElementById('fullscreenSubtitlesOverlay');
const fullscreenSubtitlesContent = document.getElementById('fullscreenSubtitlesContent');
const closeSubtitlesBtn = document.getElementById('closeSubtitlesBtn');
const notification = document.getElementById('notification');

// 状态变量
let subtitles = [];
let subtitleVisible = true;
let videoSubtitlesVisible = true;
let audioSubtitlesVisible = false;
let currentHighlightedWord = null;
let currentWord = '';
let currentSentence = '';
let currentSubtitleIndex = -1;
let currentMediaFile = null;
let currentMediaType = 'video';
let currentLanguageMode = 'english';
let playerWasPlaying = false;
let ankiConnected = false;
let ankiDecks = [];
let ankiModels = [];
let currentModelFields = [];
let activeTab = 'dictionary-tab';
let isProcessingAnki = false;
let audioContext = null;
let audioBuffer = null;
let audioElement = null;
let isDraggingProgress = false;
let isDraggingVolume = false;
let japaneseWords = [];
let tokenizer = null;
let currentWordIndex = -1;
let appendedWords = [];
let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ==================== 新增状态变量 ====================
let isFullscreen = false;
let controlsTimeout;
let wasPlayingBeforeDict = false;
let wasPlayingBeforeSubtitles = false;
let clipboardEnabled = false; // 剪贴板功能状态
let isDraggingFullscreenProgress = false; // 全屏进度条拖拽状态

// ==================== 剪贴板功能 ====================
// 初始化剪贴板功能
function initClipboardFunction() {
    clipboardBtn.addEventListener('click', toggleClipboardFunction);
    updateClipboardButton();
}

// 切换剪贴板功能
function toggleClipboardFunction() {
    clipboardEnabled = !clipboardEnabled;
    updateClipboardButton();
    
    showNotification(clipboardEnabled ? 
        '剪贴板功能已开启，点击字幕单词将自动复制' : 
        '剪贴板功能已关闭');
}

// 更新剪贴板按钮状态
function updateClipboardButton() {
    if (clipboardEnabled) {
        clipboardBtn.classList.add('active');
        clipboardBtn.title = '关闭剪贴板功能';
    } else {
        clipboardBtn.classList.remove('active');
        clipboardBtn.title = '开启剪贴板功能';
    }
}

// 复制单词到剪贴板
function copyWordToClipboard(word) {
    if (!clipboardEnabled) return;
    
    navigator.clipboard.writeText(word).then(() => {
        showNotification(`"${word}" 已复制到剪贴板`);
    }).catch(err => {
        console.error('复制失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = word;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification(`"${word}" 已复制到剪贴板`);
        } catch (fallbackErr) {
            showNotification('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    });
}

// ==================== 全屏功能增强 ====================

// 初始化全屏拖拽功能
function initFullscreenDrag() {
    const progressThumb = document.createElement('div');
    progressThumb.className = 'fullscreen-progress-thumb';
    fullscreenProgress.appendChild(progressThumb);
    
    // 鼠标事件
    fullscreenProgress.addEventListener('mousedown', startFullscreenDrag);
    progressThumb.addEventListener('mousedown', startFullscreenDrag);
    
    // 触摸事件
    fullscreenProgress.addEventListener('touchstart', startFullscreenDragTouch);
    progressThumb.addEventListener('touchstart', startFullscreenDragTouch);
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
    updateFullscreenControls();
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

// ==================== 全屏词典功能 ====================

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

// 关闭词典面板（增强版）
function closeDictionaryPanel() {
    dictionaryPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // 恢复播放状态（全屏模式）
    if (isFullscreen && wasPlayingBeforeDict) {
        fullscreenVideoPlayer.play().catch(()=>{});
    }
    // 恢复播放状态（非全屏模式）
    else if (playerWasPlaying) {
        if (currentMediaType === 'video' && videoPlayer.paused) {
            videoPlayer.play();
        } else if (currentMediaType === 'audio' && audioElement && audioElement.paused) {
            audioElement.play();
            audioPlayPauseBtn.textContent = '⏸';
            audioPlayPauseBtn.classList.add('active');
        }
    }

    resetAppendedWords();
}

// ==================== 全屏控制条和字幕位置调整 ====================

// 更新全屏控制条显示状态
function updateFullscreenControlsVisibility() {
    if (!isFullscreen) return;
    
    const controlsVisible = fullscreenControls.style.display !== 'none';
    const subtitleBottom = controlsVisible ? '80px' : '20px';
    
    fullscreenSubtitle.style.bottom = subtitleBottom;
    fullscreenSubtitle.style.transition = 'bottom 0.3s ease';
}

// 全屏控制条自动隐藏（增强版）
function showFullscreenControls() {
    fullscreenControls.style.display = 'flex';
    updateFullscreenControlsVisibility();
    
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        if (!fullscreenVideoPlayer.paused) {
            fullscreenControls.style.display = 'none';
            updateFullscreenControlsVisibility();
        }
    }, 3000);
}

// ==================== 字幕同步修复 ====================

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

// ==================== 初始化函数增强 ====================

// 初始化函数
async function init() {
    // 检查Anki连接
    checkAnkiConnection();
    
    // 加载配置
    loadConfig();
    
    // 更新按钮状态
    updateLanguageModeButton();
    updateMediaModeButton();
    updateControlButtons();
    updateMediaDisplay();
    
    // 初始化音频元素
    if (!audioElement) {
        audioElement = new Audio();
        initAudioControls();
    }
    
    // 初始化 kuromoji 分词器
    try {
        await initKuromoji();
        if (!tokenizer) {
            console.error("分词器未初始化");
            return;
        }
    } catch (err) {
        console.error("初始化失败:", err);
    }

    // 初始：确保隐藏的播放器默认静音
    fullscreenVideoPlayer.muted = true;
    
    // ==================== 新增初始化调用 ====================
    initClipboardFunction();
    initFullscreenDrag();
    initFullscreenSubtitleNavigation();
    initFullscreenDictionary();
    
    // 更新全屏控制条事件
    fullscreenVideoContainer.addEventListener('mousemove', showFullscreenControls);
    fullscreenControls.addEventListener('mousemove', showFullscreenControls);
    
    // 初始显示控制条
    showFullscreenControls();
}

// ==================== 修改现有函数 ====================

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

            if (wasPlaying) {
                fullscreenVideoPlayer.play().catch(()=>{});
            }

            updateCurrentSubtitle();
            updateFullscreenControls();
            showFullscreenControls(); // 显示控制条
        }).catch(err => {
            console.error(`全屏请求错误: ${err.message}`);
            videoPlayer.muted = false;
            fullscreenVideoPlayer.muted = true;
        });
    }
}

// 修改全屏播放器时间更新事件
fullscreenVideoPlayer.addEventListener('timeupdate', () => {
    updateFullscreenControls();
    updateCurrentSubtitle(); // 确保字幕同步更新
});

// 修改关闭面板函数
closePanelBtn.addEventListener('click', closeDictionaryPanel);
panelOverlay.addEventListener('click', () => {
    closeDictionaryPanel();
    closeSubtitleListPanelFunc();
});

// ==================== 原有功能函数（保持不变） ====================

// 初始化kuromoji
async function initKuromoji() {
    return new Promise((resolve, reject) => {
        if (!window.kuromoji) {
            reject(new Error("kuromoji.js 未加载"));
            return;
        }
        window.kuromoji.builder({ dicPath: "./kuromoji/dict/" }).build(function(err, tk) {
            if (err) { reject(err); return; }
            tokenizer = tk;
            resolve(tk);
        });
    });
}

// 存储配置到localStorage
function saveConfig() {
    const config = {
        deck: deckSelect.value,
        model: modelSelect.value,
        wordField: wordFieldSelect.value,
        sentenceField: sentenceFieldSelect.value,
        definitionField: definitionFieldSelect.value,
        audioField: audioFieldSelect.value,
        imageField: imageFieldSelect.value,
        languageMode: currentLanguageMode,
        mediaType: currentMediaType
    };
    localStorage.setItem('ankiConfig', JSON.stringify(config));
}

// 从localStorage加载配置
function loadConfig() {
    const savedConfig = localStorage.getItem('ankiConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.deck) deckSelect.value = config.deck;
            if (config.model) modelSelect.value = config.model;
            if (config.wordField) wordFieldSelect.value = config.wordField;
            if (config.sentenceField) sentenceFieldSelect.value = config.sentenceField;
            if (config.definitionField) definitionFieldSelect.value = config.definitionField;
            if (config.audioField) audioFieldSelect.value = config.audioField;
            if (config.imageField) imageFieldSelect.value = config.imageField;
            if (config.languageMode) {
                currentLanguageMode = config.languageMode;
                updateLanguageModeButton();
            }
            if (config.mediaType) {
                currentMediaType = config.mediaType;
                updateMediaModeButton();
                updateMediaDisplay();
            }
        } catch (e) {
            console.error('加载配置失败:', e);
        }
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
        '<i class="fas fa-video"></i> 视频模式' : 
        '<i class="fas fa-music"></i> 音频模式';
    updateImportButton();
}

// 更新导入按钮文本
function updateImportButton() {
    mediaImportBtn.innerHTML = currentMediaType === 'video' ? 
        '<i class="fas fa-file-video"></i> 视频' : 
        '<i class="fas fa-file-audio"></i> 音频';
}

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
    
    trackTitle.textContent = '未选择媒体文件';
    trackDescription.textContent = '请导入媒体文件开始学习';
    mediaIcon.className = 'fas fa-file';
    
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
    trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
    trackDescription.textContent = `文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    mediaIcon.className = 'fas fa-video';

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
    trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
    trackDescription.textContent = `文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    mediaIcon.className = 'fas fa-music';

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

// 初始化音频上下文
function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// 初始化音频控件
function initAudioControls() {
    if (!audioElement) return;

    audioElement.addEventListener('loadedmetadata', () => {
        if (audioElement.duration) {
            audioDuration.textContent = formatTime(audioElement.duration);
            updateProgressThumb();
            updateVolumeThumb();
        }
    });
    
    audioPlayPauseBtn.addEventListener('click', () => {
        if (audioElement.paused) {
            audioElement.play();
            audioPlayPauseBtn.textContent = '⏸';
            audioPlayPauseBtn.classList.add('active');
        } else {
            audioElement.pause();
            audioPlayPauseBtn.textContent = '▶';
            audioPlayPauseBtn.classList.remove('active');
        }
    });
    
    audioProgress.addEventListener('click', (e) => {
        const rect = audioProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
        updateProgressThumb();
    });
    
    progressThumb.addEventListener('mousedown', startDragProgress);
    progressThumb.addEventListener('touchstart', startDragProgress);
    
    audioVolume.addEventListener('click', (e) => {
        const rect = audioVolume.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.volume = percent;
        updateVolumeThumb();
    });
    
    volumeThumb.addEventListener('mousedown', startDragVolume);
    volumeThumb.addEventListener('touchstart', startDragVolume);
    
    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            audioProgressFilled.style.width = `${percent}%`;
            audioCurrentTime.textContent = formatTime(audioElement.currentTime);
            
            if (!isDraggingProgress) {
                updateProgressThumb();
            }
        }
        updateAudioSubtitles();
    });
    
    audioElement.addEventListener('play', () => {
        audioPlayPauseBtn.textContent = '⏸';
        audioPlayPauseBtn.classList.add('active');
    });
    
    audioElement.addEventListener('pause', () => {
        audioPlayPauseBtn.textContent = '▶';
        audioPlayPauseBtn.classList.remove('active');
    });
    
    audioElement.addEventListener('timeupdate', () => {
        updateSubtitle(audioElement.currentTime);
    });
}

// 开始拖动进度条
function startDragProgress(e) {
    e.preventDefault();
    isDraggingProgress = true;
    
    const moveHandler = (e) => {
        if (!isDraggingProgress) return;
        
        const rect = audioProgress.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        
        audioElement.currentTime = percent * audioElement.duration;
        updateProgressThumb();
    };
    
    const upHandler = () => {
        isDraggingProgress = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('touchend', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchend', upHandler);
}

// 开始拖动音量条
function startDragVolume(e) {
    e.preventDefault();
    isDraggingVolume = true;
    
    const moveHandler = (e) => {
        if (!isDraggingVolume) return;
        
        const rect = audioVolume.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        
        audioElement.volume = percent;
        updateVolumeThumb();
    };
    
    const upHandler = () => {
        isDraggingVolume = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('touchend', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchend', upHandler);
}

// 更新进度条滑块位置
function updateProgressThumb() {
    if (!audioElement || !audioElement.duration) return;
    const percent = (audioElement.currentTime / audioElement.duration) * 100;
    progressThumb.style.left = `${percent}%`;
}

// 更新音量滑块位置
function updateVolumeThumb() {
    if (!audioElement) return;
    const percent = audioElement.volume * 100;
    audioVolumeFilled.style.width = `${percent}%`;
    volumeThumb.style.left = `${percent}%`;
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

// 模式切换事件
mediaModeBtn.addEventListener('click', toggleMediaMode);
languageModeBtn.addEventListener('click', toggleLanguageMode);

// 切换音频字幕显示
toggleAudioSubtitlesBtn.addEventListener('click', () => {
    audioSubtitlesVisible = !audioSubtitlesVisible;
    if (audioSubtitlesVisible) {
        audioSubtitles.classList.add('active');
    } else {
        audioSubtitles.classList.remove('active');
    }
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

// 清理字幕文本
function cleanSubtitleText(text) {
    text = text.replace(/<[^>]*>/g, '');
    text = text.replace(/[\s,，.。!！?？(（\[]*[-–—]?[0-9０-９]+[)\]）]*\s*$/u, '');
    text = text.replace(/([,.，。!！?？])\s*[0-9０-９]+\s*$/u, '$1');
    text = text.replace(/\s+/g, ' ');
    return text.trim();
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

// 更新音频滚动字幕
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
        
        subtitleItem.innerHTML = createClickableSubtitleContent(subtitle.text, index);
        
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

// 创建可点击的字幕内容
function createClickableSubtitleContent(text, index) {
    if (currentLanguageMode === 'english') {
        const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
        let lastIndex = 0;
        let clickableWords = '';
        
        let match;
        while ((match = wordRegex.exec(text)) !== null) {
            clickableWords += text.substring(lastIndex, match.index);
            clickableWords += `<span class="word selectable-word" data-word="${match[0]}" data-index="${index}">${match[0]}</span>`;
            lastIndex = match.index + match[0].length;
        }
        
        clickableWords += text.substring(lastIndex);
        return clickableWords;
    } else {
        return `<span class="japanese-sentence selectable-text" data-sentence="${text}" data-index="${index}">${text}</span>`;
    }
}

// 处理字幕点击事件
function handleSubtitleClick(e, text, index) {
    if (currentLanguageMode === 'english') {
        if (e.target.classList.contains('word')) {
            const word = e.target.getAttribute('data-word');
            pauseCurrentMedia();
            searchWordInPanel(word);
            currentWord = word;
            currentSentence = text;
            updateOriginalSentence(currentSentence, word);
        }
    } else {
        if (e.target.classList.contains('japanese-sentence')) {
            pauseCurrentMedia();
            showJapaneseWordSegmentation(text);
            currentSentence = text;
        }
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

// 日语分词显示
async function showJapaneseWordSegmentation(sentence, currentWord = '') {
    if (!tokenizer) {
        console.error('分词器未初始化');
        return;
    }

    try {
        const result = tokenizer.tokenize(sentence);
        const japaneseWords = result.map(item => item.surface_form);

        openDictionaryPanel();
        updateOriginalSentence(sentence, currentWord, 'japanese', japaneseWords);

        panelDictionaryResult.querySelectorAll('.word').forEach(wordElement => {
            wordElement.addEventListener('click', () => {
                const word = wordElement.getAttribute('data-word');
                const index = parseInt(wordElement.getAttribute('data-index'));
                panelDictionaryResult.querySelectorAll('.word').forEach(w => w.classList.remove('highlight'));
                wordElement.classList.add('highlight');
                panelSearchInput.value = word;
                
                if (window.japaneseWordClicked) {
                    window.japaneseWordClicked(word, index);
                } else {
                    searchJapaneseWordInPanel(word);
                }
            });
        });

        panelWordTitle.textContent = `日语分词`;

        if (window.japaneseSegmentationComplete) {
            window.japaneseSegmentationComplete(sentence, japaneseWords);
        }

    } catch (error) {
        console.error('日语分词失败:', error);
        panelDictionaryResult.innerHTML = `<div class="error">日语分词失败: ${error.message}</div>`;
    }
}

// 辅助函数：HTML转义
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 查询日语单词
async function searchJapaneseWordInPanel(word) {
    if (!word.trim()) {
        panelDictionaryResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    openDictionaryPanel();
    panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
    panelWordTitle.textContent = `查询: ${word}`;
    panelSearchInput.value = word;
    
    try {
        const apiUrl = `https://freedictionaryapi.com/api/v1/entries/ja/${encodeURIComponent(word)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`未找到日语单词 "${word}"`);
            } else {
                throw new Error(`API请求失败: ${response.status}`);
            }
        }
        
        const data = await response.json();
        displayJapaneseWordDataInPanel(data);
    } catch (error) {
        panelDictionaryResult.innerHTML = `<div class="error">${error.message}</div>`;
        console.error('查询错误:', error);
    }
}

// 显示日语单词数据在底部面板
function displayJapaneseWordDataInPanel(wordData) {
    if (!wordData.word || !Array.isArray(wordData.entries)) {
        panelDictionaryResult.innerHTML = '<div class="error">返回的数据格式不正确</div>';
        return;
    }
    
    let html = `
        <div class="word-header">
            <div class="word-title">${escapeHtml(wordData.word)}</div>
            <span class="language-tag">日语</span>
        </div>
    `;
    
    wordData.entries.forEach((entry, entryIndex) => {
        html += `<div class="entry">`;
        
        if (entry.partOfSpeech) {
            html += `<div class="part-of-speech">${escapeHtml(entry.partOfSpeech)}</div>`;
        }
        
        if (Array.isArray(entry.pronunciations) && entry.pronunciations.length > 0) {
            const filteredPronunciations = entry.pronunciations.filter(p => 
                p.tags && p.tags.some(tag => tag === "US" || tag === "UK")
            ).slice(0, 2);
            
            if (filteredPronunciations.length > 0) {
                html += `<div class="initial-pronunciations">`;
                filteredPronunciations.forEach(pronunciation => {
                    const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                    const tags = pronunciation.tags && pronunciation.tags.length > 0 ? 
                        ` <small>${pronunciation.tags.join(', ')}</small>` : '';
                    html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}${tags}</div>`;
                });
                html += `</div>`;
                
                if (entry.pronunciations.length > filteredPronunciations.length) {
                    const allPronunciationsId = `all-pronunciations-${entryIndex}`;
                    html += `<button class="toggle-button" 
                              data-target="${allPronunciationsId}"
                              data-show-text="显示全部发音 (${entry.pronunciations.length})"
                              data-hide-text="隐藏全部发音">显示全部发音 (${entry.pronunciations.length})</button>`;
                    html += `<div id="${allPronunciationsId}" class="collapsible-section" style="display: none;">`;
                    entry.pronunciations.forEach(pronunciation => {
                        const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                        const tags = pronunciation.tags && pronunciation.tags.length > 0 ? 
                            ` <small>${pronunciation.tags.join(', ')}</small>` : '';
                        html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}${tags}</div>`;
                    });
                    html += `</div>`;
                }
            }
        }
        
        if (Array.isArray(entry.senses)) {
            let senseCounter = 0;
            
            const renderSenses = (senses, level = 0, sensePath = '') => {
                let sensesHtml = '';
                senses.forEach((sense, index) => {
                    senseCounter++;
                    const currentSensePath = sensePath ? `${sensePath}-${index}` : `${entryIndex}-${index}`;
                    
                    sensesHtml += `<div class="sense" style="margin-left: ${level * 15}px;">`;
                    
                    if (sense.definition) {
                        const number = level === 0 ? `${senseCounter}.` : `${senseCounter}`;
                        sensesHtml += `<div class="definition"><strong>${number}</strong> ${escapeHtml(sense.definition)}</div>`;
                    }
                    
                    if (Array.isArray(sense.tags) && sense.tags.length > 0) {
                        sensesHtml += `<div style="font-size: 12px; color: #586069; margin-bottom: 5px;">标签: ${sense.tags.map(t => escapeHtml(t)).join(', ')}</div>`;
                    }
                    
                    if (Array.isArray(sense.examples) && sense.examples.length > 0) {
                        const maxInitialExamples = 2;
                        const initialExamples = sense.examples.slice(0, maxInitialExamples);
                        const remainingExamples = sense.examples.slice(maxInitialExamples);
                        
                        initialExamples.forEach(example => {
                            sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                        });
                        
                        if (remainingExamples.length > 0) {
                            const allExamplesId = `all-examples-${currentSensePath}`;
                            sensesHtml += `<button class="toggle-button examples-toggle" 
                                      data-target="${allExamplesId}"
                                      data-show-text="显示更多例句 (${sense.examples.length})"
                                      data-hide-text="隐藏更多例句">显示更多例句 (${sense.examples.length})</button>`;
                            sensesHtml += `<div id="${allExamplesId}" class="collapsible-section" style="display: none;">`;
                            remainingExamples.forEach(example => {
                                sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                            });
                            sensesHtml += `</div>`;
                        }
                    }
                    
                    if (Array.isArray(sense.quotes)) {
                        sense.quotes.forEach(quote => {
                            sensesHtml += `<div class="quote">"${escapeHtml(quote.text)}"`;
                            if (quote.reference) {
                                sensesHtml += `<div class="quote-reference">— ${escapeHtml(quote.reference)}</div>`;
                            }
                            sensesHtml += `</div>`;
                        });
                    }
                    
                    if (Array.isArray(sense.synonyms) && sense.synonyms.length > 0) {
                        sensesHtml += `<div class="synonyms"><span>同义词:</span> ${sense.synonyms.map(s => escapeHtml(s)).join(', ')}</div>`;
                    }
                    if (Array.isArray(sense.antonyms) && sense.antonyms.length > 0) {
                        sensesHtml += `<div class="antonyms"><span>反义词:</span> ${sense.antonyms.map(a => escapeHtml(a)).join(', ')}</div>`;
                    }
                    
                    if (Array.isArray(sense.subsenses) && sense.subsenses.length > 0) {
                        sensesHtml += renderSenses(sense.subsenses, level + 1, currentSensePath);
                    }
                    
                    sensesHtml += `</div>`;
                });
                return sensesHtml;
            };
            
            html += renderSenses(entry.senses);
        }
        
        if (Array.isArray(entry.forms) && entry.forms.length > 0) {
            const maxInitialForms = 2;
            const initialForms = entry.forms.slice(0, maxInitialForms);
            const remainingForms = entry.forms.slice(maxInitialForms);
            
            html += `<div class="initial-forms" style="margin-top: 15px;"><small><strong>词形变化:</strong> `;
            const initialFormsHtml = initialForms.map(form => 
                `${escapeHtml(form.word)}${form.tags && form.tags.length > 0 ? ` (${form.tags.join(', ')})` : ''}`
            ).join(', ');
            html += initialFormsHtml;
            html += `</small></div>`;
            
            if (remainingForms.length > 0) {
                const allFormsId = `all-forms-${entryIndex}`;
                html += `<button class="toggle-button" 
                          data-target="${allFormsId}"
                          data-show-text="显示全部词形变化 (${entry.forms.length})"
                          data-hide-text="隐藏全部词形变化">显示全部词形变化 (${entry.forms.length})</button>`;
                html += `<div id="${allFormsId}" class="collapsible-section" style="display: none;">`;
                const allFormsHtml = entry.forms.map(form => 
                    `${escapeHtml(form.word)}${form.tags && form.tags.length > 0 ? ` (${form.tags.join(', ')})` : ''}`
                ).join(', ');
                html += allFormsHtml;
                html += `</div>`;
            }
        }
        
        if (Array.isArray(entry.synonyms) && entry.synonyms.length > 0) {
            html += `<div class="synonyms"><span>同义词:</span> ${entry.synonyms.map(s => escapeHtml(s)).join(', ')}</div>`;
        }
        if (Array.isArray(entry.antonyms) && entry.antonyms.length > 0) {
            html += `<div class="antonyms"><span>反义词:</span> ${entry.antonyms.map(a => escapeHtml(a)).join(', ')}</div>`;
        }
        
        html += `</div>`;
    });
    
    panelDictionaryResult.innerHTML = html;
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

// 格式化时间显示
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 查找下一个有字幕的位置
function findNextSubtitleIndex(currentTime) {
    for (let i = 0; i < subtitles.length; i++) {
        if (subtitles[i].start > currentTime) {
            return i;
        }
    }
    return subtitles.length - 1;
}

// 查找上一个有字幕的位置
function findPrevSubtitleIndex(currentTime) {
    for (let i = subtitles.length - 1; i >= 0; i--) {
        if (subtitles[i].end < currentTime) {
            return i;
        }
    }
    return 0;
}

// 根据当前时间找到应该显示的字幕索引
function findCurrentSubtitleIndex(currentTime) {
    for (let i = 0; i < subtitles.length; i++) {
        if (currentTime >= subtitles[i].start && currentTime < subtitles[i].end) {
            return i;
        }
    }
    return -1;
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

// 处理字幕文本点击事件
function handleSubtitleTextClick(e) {
    if (currentLanguageMode === 'english') {
        if (e.target.classList.contains('word')) {
            const word = e.target.getAttribute('data-word');
            const index = parseInt(e.target.getAttribute('data-index'));
            
            pauseCurrentMedia();
            searchWordInPanel(word);
            
            currentWord = word;
            if (index >= 0 && index < subtitles.length) {
                currentSentence = subtitles[index].text;
                updateOriginalSentence(currentSentence, word);
            }
            
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
            
            pauseCurrentMedia();
            showJapaneseWordSegmentation(text);
            
            currentSentence = text;
        }
    }
}

// 更新原句显示
function updateOriginalSentence(sentence, currentWord, currentLanguageMode = 'english', japaneseWords = []) {
    let clickableSentence = '';

    const words = currentLanguageMode === 'japanese' && japaneseWords.length > 0 
        ? japaneseWords 
        : sentence.match(/\S+/g) || [];

    words.forEach((word, index) => {
        const wordClass = appendedWords.includes(word) ? 'sentence-word highlight selectable-word' : 'sentence-word selectable-word';
        const space = currentLanguageMode === 'japanese' ? '' : '&nbsp;';

        clickableSentence += `<span class="${wordClass}" data-word="${word}" data-index="${index}">${word}</span>${space}`;
    });

    originalSentence.innerHTML = clickableSentence;

    originalSentence.removeEventListener('click', handleSentenceWordClick);
    originalSentence.addEventListener('click', handleSentenceWordClick);
}

// 处理原句中单词点击
function handleSentenceWordClick(e) {
    const span = e.target.closest('.sentence-word');
    if (!span) return;

    const word = span.getAttribute('data-word');
    const index = parseInt(span.getAttribute('data-index'));

    appendedWords = [word];
    currentWordIndex = index;
    panelSearchInput.value = word;

    originalSentence.querySelectorAll('.sentence-word').forEach((s) => {
        s.classList.toggle('highlight', appendedWords.includes(s.getAttribute('data-word')));
    });

    if (currentLanguageMode === 'english') {
        searchWordInPanel(word);
    } else {
        searchJapaneseWordInPanel(word);
    }

    if (activeTab === 'web-tab') {
        loadWebSearch(word);
    }
}

// 在面板中查询单词
async function searchWordInPanel(word) {
    if (!word.trim()) {
        panelDictionaryResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    openDictionaryPanel();
    panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
    panelWordTitle.textContent = `查询: ${word}`;
    panelSearchInput.value = word;
    
    try {
        const apiUrl = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`未找到单词 "${word}"`);
            } else {
                throw new Error(`API请求失败: ${response.status}`);
            }
        }
        
        const data = await response.json();
        displayWordDataInPanel(data);
    } catch (error) {
        panelDictionaryResult.innerHTML = `<div class="error">${error.message}</div>`;
        console.error('查询错误:', error);
    }
}

// 显示单词数据在底部面板
function displayWordDataInPanel(wordData) {
    if (!wordData.word || !Array.isArray(wordData.entries)) {
        panelDictionaryResult.innerHTML = '<div class="error">返回的数据格式不正确</div>';
        return;
    }
    
    let html = `
        <div class="word-header">
            <div class="word-title">${escapeHtml(wordData.word)}</div>
            <span class="language-tag">英语</span>
        </div>
    `;
    
    wordData.entries.forEach((entry, entryIndex) => {
        html += `<div class="entry">`;
        
        if (entry.partOfSpeech) {
            html += `<div class="part-of-speech">${escapeHtml(entry.partOfSpeech)}</div>`;
        }
        
        if (Array.isArray(entry.pronunciations) && entry.pronunciations.length > 0) {
            const filteredPronunciations = entry.pronunciations.filter(p => 
                p.tags && p.tags.some(tag => tag === "US" || tag === "UK")
            ).slice(0, 2);
            
            if (filteredPronunciations.length > 0) {
                html += `<div class="initial-pronunciations">`;
                filteredPronunciations.forEach(pronunciation => {
                    const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                    const tags = pronunciation.tags && pronunciation.tags.length > 0 ? 
                        ` <small>${pronunciation.tags.join(', ')}</small>` : '';
                    html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}${tags}</div>`;
                });
                html += `</div>`;
                
                if (entry.pronunciations.length > filteredPronunciations.length) {
                    const allPronunciationsId = `all-pronunciations-${entryIndex}`;
                    html += `<button class="toggle-button" 
                              data-target="${allPronunciationsId}"
                              data-show-text="显示全部发音 (${entry.pronunciations.length})"
                              data-hide-text="隐藏全部发音">显示全部发音 (${entry.pronunciations.length})</button>`;
                    html += `<div id="${allPronunciationsId}" class="collapsible-section" style="display: none;">`;
                    entry.pronunciations.forEach(pronunciation => {
                        const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                        const tags = pronunciation.tags && pronunciation.tags.length > 0 ? 
                            ` <small>${pronunciation.tags.join(', ')}</small>` : '';
                        html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}${tags}</div>`;
                    });
                    html += `</div>`;
                }
            }
        }
        
        if (Array.isArray(entry.senses)) {
            let senseCounter = 0;
            
            const renderSenses = (senses, level = 0, sensePath = '') => {
                let sensesHtml = '';
                senses.forEach((sense, index) => {
                    senseCounter++;
                    const currentSensePath = sensePath ? `${sensePath}-${index}` : `${entryIndex}-${index}`;
                    
                    sensesHtml += `<div class="sense" style="margin-left: ${level * 15}px;">`;
                    
                    if (sense.definition) {
                        const number = level === 0 ? `${senseCounter}.` : `${senseCounter}`;
                        sensesHtml += `<div class="definition"><strong>${number}</strong> ${escapeHtml(sense.definition)}</div>`;
                    }
                    
                    if (Array.isArray(sense.tags) && sense.tags.length > 0) {
                        sensesHtml += `<div style="font-size: 12px; color: #586069; margin-bottom: 5px;">标签: ${sense.tags.map(t => escapeHtml(t)).join(', ')}</div>`;
                    }
                    
                    if (Array.isArray(sense.examples) && sense.examples.length > 0) {
                        const maxInitialExamples = 2;
                        const initialExamples = sense.examples.slice(0, maxInitialExamples);
                        const remainingExamples = sense.examples.slice(maxInitialExamples);
                        
                        initialExamples.forEach(example => {
                            sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                        });
                        
                        if (remainingExamples.length > 0) {
                            const allExamplesId = `all-examples-${currentSensePath}`;
                            sensesHtml += `<button class="toggle-button examples-toggle" 
                                      data-target="${allExamplesId}"
                                      data-show-text="显示更多例句 (${sense.examples.length})"
                                      data-hide-text="隐藏更多例句">显示更多例句 (${sense.examples.length})</button>`;
                            sensesHtml += `<div id="${allExamplesId}" class="collapsible-section" style="display: none;">`;
                            remainingExamples.forEach(example => {
                                sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                            });
                            sensesHtml += `</div>`;
                        }
                    }
                    
                    if (Array.isArray(sense.quotes)) {
                        sense.quotes.forEach(quote => {
                            sensesHtml += `<div class="quote">"${escapeHtml(quote.text)}"`;
                            if (quote.reference) {
                                sensesHtml += `<div class="quote-reference">— ${escapeHtml(quote.reference)}</div>`;
                            }
                            sensesHtml += `</div>`;
                        });
                    }
                    
                    if (Array.isArray(sense.synonyms) && sense.synonyms.length > 0) {
                        sensesHtml += `<div class="synonyms"><span>同义词:</span> ${sense.synonyms.map(s => escapeHtml(s)).join(', ')}</div>`;
                    }
                    if (Array.isArray(sense.antonyms) && sense.antonyms.length > 0) {
                        sensesHtml += `<div class="antonyms"><span>反义词:</span> ${sense.antonyms.map(a => escapeHtml(a)).join(', ')}</div>`;
                    }
                    
                    if (Array.isArray(sense.subsenses) && sense.subsenses.length > 0) {
                        sensesHtml += renderSenses(sense.subsenses, level + 1, currentSensePath);
                    }
                    
                    sensesHtml += `</div>`;
                });
                return sensesHtml;
            };
            
            html += renderSenses(entry.senses);
        }
        
        if (Array.isArray(entry.forms) && entry.forms.length > 0) {
            const maxInitialForms = 2;
            const initialForms = entry.forms.slice(0, maxInitialForms);
            const remainingForms = entry.forms.slice(maxInitialForms);
            
            html += `<div class="initial-forms" style="margin-top: 15px;"><small><strong>词形变化:</strong> `;
            const initialFormsHtml = initialForms.map(form => 
                `${escapeHtml(form.word)}${form.tags && form.tags.length > 0 ? ` (${form.tags.join(', ')})` : ''}`
            ).join(', ');
            html += initialFormsHtml;
            html += `</small></div>`;
            
            if (remainingForms.length > 0) {
                const allFormsId = `all-forms-${entryIndex}`;
                html += `<button class="toggle-button" 
                          data-target="${allFormsId}"
                          data-show-text="显示全部词形变化 (${entry.forms.length})"
                          data-hide-text="隐藏全部词形变化">显示全部词形变化 (${entry.forms.length})</button>`;
                html += `<div id="${allFormsId}" class="collapsible-section" style="display: none;">`;
                const allFormsHtml = entry.forms.map(form => 
                    `${escapeHtml(form.word)}${form.tags && form.tags.length > 0 ? ` (${form.tags.join(', ')})` : ''}`
                ).join(', ');
                html += allFormsHtml;
                html += `</div>`;
            }
        }
        
        if (Array.isArray(entry.synonyms) && entry.synonyms.length > 0) {
            html += `<div class="synonyms"><span>同义词:</span> ${entry.synonyms.map(s => escapeHtml(s)).join(', ')}</div>`;
        }
        if (Array.isArray(entry.antonyms) && entry.antonyms.length > 0) {
            html += `<div class="antonyms"><span>反义词:</span> ${entry.antonyms.map(a => escapeHtml(a)).join(', ')}</div>`;
        }
        
        html += `</div>`;
    });
    
    panelDictionaryResult.innerHTML = html;
}

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

closeSubtitleListPanel.addEventListener('click', closeSubtitleListPanelFunc);

// 追加词汇功能
appendWordBtn.addEventListener('click', () => {
    const sentenceSpans = originalSentence.querySelectorAll('.sentence-word');
    if (!sentenceSpans.length) return;

    if (currentWordIndex >= sentenceSpans.length - 1) {
        return;
    }

    currentWordIndex++;
    const currentSpan = sentenceSpans[currentWordIndex];
    const word = currentSpan.getAttribute('data-word');

    if (currentLanguageMode === 'english' && appendedWords.length > 0) {
        panelSearchInput.value += ' ' + word;
    } else {
        panelSearchInput.value += word;
    }
    
    appendedWords.push(word);

    sentenceSpans.forEach((span, idx) => {
        const spanWord = span.getAttribute('data-word');
        span.classList.toggle('highlight', appendedWords.includes(spanWord) && idx <= currentWordIndex);
    });

    if (currentLanguageMode === 'english') {
        searchWordInPanel(panelSearchInput.value);
    } else {
        searchJapaneseWordInPanel(panelSearchInput.value);
    }

    if (activeTab === 'web-tab') {
        loadWebSearch(panelSearchInput.value);
    }
});

// 重置追加词汇和搜索栏
function resetAppendedWords() {
    currentWordIndex = -1;
    appendedWords = [];
    panelSearchInput.value = '';
    
    originalSentence.querySelectorAll('.sentence-word').forEach(span => {
        span.classList.remove('highlight');
    });
}

// ==================== 全屏功能 ====================

// 切换全屏模式
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

            if (wasPlaying) {
                fullscreenVideoPlayer.play().catch(()=>{});
            }

            updateCurrentSubtitle();
            updateFullscreenControls();
            showFullscreenControls(); // 显示控制条
        }).catch(err => {
            console.error(`全屏请求错误: ${err.message}`);
            videoPlayer.muted = false;
            fullscreenVideoPlayer.muted = true;
        });
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(()=>{});
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
}

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

// 更新全屏控制条
function updateFullscreenControls() {
    if (!isFullscreen) return;
    
    const currentTime = fullscreenVideoPlayer.currentTime;
    const duration = fullscreenVideoPlayer.duration || 0;
    
    const progressPercent = (currentTime / duration) * 100;
    fullscreenProgressBar.style.width = `${progressPercent}%`;
    
    fullscreenTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    
    playPauseBtn.innerHTML = fullscreenVideoPlayer.paused ? '▶' : '⏸';
}

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
        updateFullscreenControls();
    }
});

fullscreenVideoPlayer.addEventListener('pause', function() {
    if (isFullscreen) {
        videoPlayer.pause();
        updateFullscreenControls();
    }
});

fullscreenVideoPlayer.addEventListener('timeupdate', updateFullscreenControls);

// 全屏控制功能
playPauseBtn.addEventListener('click', () => {
    if (fullscreenVideoPlayer.paused) {
        fullscreenVideoPlayer.play().catch(()=>{});
    } else {
        fullscreenVideoPlayer.pause();
    }
});

// 上一句字幕
prevSubtitleBtn.addEventListener('click', () => {
    if (currentSubtitleIndex > 0) {
        const prevSubtitle = subtitles[currentSubtitleIndex - 1];
        fullscreenVideoPlayer.currentTime = prevSubtitle.start;
        if (fullscreenVideoPlayer.paused) {
            fullscreenVideoPlayer.play().catch(()=>{});
        }
    }
});

// 下一句字幕
nextSubtitleBtn.addEventListener('click', () => {
    if (currentSubtitleIndex < subtitles.length - 1) {
        const nextSubtitle = subtitles[currentSubtitleIndex + 1];
        fullscreenVideoPlayer.currentTime = nextSubtitle.start;
        if (fullscreenVideoPlayer.paused) {
            fullscreenVideoPlayer.play().catch(()=>{});
        }
    }
});

// 进度条点击跳转
fullscreenProgress.addEventListener('click', (e) => {
    const rect = fullscreenProgress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    fullscreenVideoPlayer.currentTime = percent * fullscreenVideoPlayer.duration;
});

// 全屏控制条自动隐藏
function showControls() {
    fullscreenControls.style.display = 'flex';
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        if (!fullscreenVideoPlayer.paused) {
            fullscreenControls.style.display = 'none';
        }
    }, 3000);
}

fullscreenVideoContainer.addEventListener('mousemove', showControls);
fullscreenControls.addEventListener('mousemove', showControls);

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

fullscreenSubtitlesBtn.addEventListener('click', openFullscreenSubtitles);
closeSubtitlesBtn.addEventListener('click', closeFullscreenSubtitles);
fullscreenSubtitlesOverlay.addEventListener('click', closeFullscreenSubtitles);

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

// ==================== Anki功能 ====================

// Anki连接检查
async function checkAnkiConnection() {
    ankiStatusText.textContent = '检查Anki连接状态...';
    
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
                ankiConnected = true;
                ankiStatusIndicator.className = 'status-indicator status-connected';
                ankiStatusText.textContent = 'Anki已连接';
                await loadAnkiDecks();
                await loadAnkiModels();
            } else {
                throw new Error('AnkiConnect响应错误');
            }
        } else {
            throw new Error('AnkiConnect响应错误');
        }
    } catch (error) {
        ankiConnected = false;
        ankiStatusIndicator.className = 'status-indicator status-disconnected';
        ankiStatusText.textContent = 'Anki未连接';
        console.error('Anki连接错误:', error);
    }
}

// 获取Anki牌组列表
async function loadAnkiDecks() {
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
            ankiDecks = data.result;
            
            deckSelect.innerHTML = '';
            ankiDecks.forEach(deck => {
                const option = document.createElement('option');
                option.value = deck;
                option.textContent = deck;
                deckSelect.appendChild(option);
            });
            
            loadConfig();
        }
    } catch (error) {
        console.error('获取牌组列表错误:', error);
    }
}

// 获取Anki模型列表
async function loadAnkiModels() {
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
            ankiModels = data.result;
            
            modelSelect.innerHTML = '';
            ankiModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
            
            loadConfig();
            
            if (ankiModels.length > 0 && !modelSelect.value) {
                modelSelect.value = ankiModels[0];
                await loadModelFields(ankiModels[0]);
            } else if (modelSelect.value) {
                await loadModelFields(modelSelect.value);
            }
        }
    } catch (error) {
        console.error('获取模型列表错误:', error);
    }
}

// 获取模型字段
async function loadModelFields(modelName) {
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
            currentModelFields = data.result;
            
            wordFieldSelect.innerHTML = '';
            sentenceFieldSelect.innerHTML = '';
            definitionFieldSelect.innerHTML = '';
            audioFieldSelect.innerHTML = '';
            imageFieldSelect.innerHTML = '';
            
            currentModelFields.forEach(field => {
                const option = document.createElement('option');
                option.value = field;
                option.textContent = field;
                
                wordFieldSelect.appendChild(option.cloneNode(true));
                sentenceFieldSelect.appendChild(option.cloneNode(true));
                definitionFieldSelect.appendChild(option.cloneNode(true));
                audioFieldSelect.appendChild(option.cloneNode(true));
                imageFieldSelect.appendChild(option.cloneNode(true));
            });
            
            loadConfig();
            
            if (!wordFieldSelect.value) {
                setDefaultFields();
            }
        }
    } catch (error) {
        console.error('获取模型字段错误:', error);
    }
}

// 智能设置默认字段
function setDefaultFields() {
    const fields = currentModelFields.map(f => f.toLowerCase());
    
    if (fields.includes('word')) {
        wordFieldSelect.value = 'word';
    } else if (fields.includes('front')) {
        wordFieldSelect.value = 'front';
    } else if (fields.length > 0) {
        wordFieldSelect.selectedIndex = 0;
    }
    
    if (fields.includes('sentence')) {
        sentenceFieldSelect.value = 'sentence';
    } else if (fields.includes('example')) {
        sentenceFieldSelect.value = 'example';
    } else if (fields.includes('back')) {
        sentenceFieldSelect.value = 'back';
    } else if (fields.length > 1) {
        sentenceFieldSelect.selectedIndex = 1;
    }
    
    if (fields.includes('definition')) {
        definitionFieldSelect.value = 'definition';
    } else if (fields.includes('meaning')) {
        definitionFieldSelect.value = 'meaning';
    } else if (fields.includes('back')) {
        definitionFieldSelect.value = 'back';
    } else if (fields.length > 2) {
        definitionFieldSelect.selectedIndex = 2;
    }
    
    if (fields.includes('audio')) {
        audioFieldSelect.value = 'audio';
    } else if (fields.includes('sound')) {
        audioFieldSelect.value = 'sound';
    } else if (fields.length > 3) {
        audioFieldSelect.selectedIndex = 3;
    }
    
    if (fields.includes('image')) {
        imageFieldSelect.value = 'image';
    } else if (fields.includes('picture')) {
        imageFieldSelect.value = 'picture';
    } else if (fields.length > 4) {
        imageFieldSelect.selectedIndex = 4;
    }
    
    saveConfig();
}

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

// 页面加载时保存原始按钮 HTML
const originalAddToAnkiHTML = addToAnkiBtn.innerHTML;

// 添加Anki卡片
addToAnkiBtn.addEventListener('click', async () => {
    if (isProcessingAnki) return;

    if (!ankiConnected) {
        alert('请先连接Anki!');
        return;
    }

    const word = panelSearchInput.value.trim();
    if (!word) {
        alert('请输入要添加的单词!');
        return;
    }

    let definition = '';

    if (activeTab === 'dictionary-tab') {
        const definitionElements = panelDictionaryResult.querySelectorAll('.definition');
        if (definitionElements.length > 0) {
            definitionElements.forEach(el => {
                definition += el.textContent + '\n';
            });
        }
    } else if (activeTab === 'custom-tab') {
        definition = customDefinitionInput.value.trim();
    }

    if (!definition) {
        alert('请提供单词释义!');
        return;
    }

    isProcessingAnki = true;
    addToAnkiBtn.disabled = true;
    addToAnkiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        await processAnkiCard(word, definition);
        console.log('卡片添加成功');

        customDefinitionInput.value = '';
        panelSearchInput.value = '';
        panelDictionaryResult.innerHTML = '查询结果将显示在这里...';

        closeDictionaryPanel();

    } catch (error) {
        console.error('添加卡片失败:', error);
        alert('添加卡片失败: ' + error.message);

    } finally {
        isProcessingAnki = false;
        addToAnkiBtn.disabled = false;
        addToAnkiBtn.innerHTML = originalAddToAnkiHTML;
    }
});

// 处理Anki卡片
async function processAnkiCard(word, definition) {
    console.log('audioBuffer', audioBuffer, 'audioContext', audioContext, 'currentSubtitleIndex', currentSubtitleIndex);

    let cleanSentence = currentSentence;
    if (cleanSentence) {
        cleanSentence = cleanSubtitleText(cleanSentence);
    }

    const note = {
        deckName: deckSelect.value,
        modelName: modelSelect.value,
        fields: {
            [wordFieldSelect.value]: word,
            [sentenceFieldSelect.value]: cleanSentence,
            [definitionFieldSelect.value]: definition
        },
        options: { allowDuplicate: false },
        tags: ['media-player']
    };

    if (audioBuffer && currentSubtitleIndex >= 0) {
        try {
            const audioBlob = await generateAudioClip(currentSubtitleIndex);
            if (audioBlob) {
                const storedAudioName = await processAudioFile(word, audioBlob);
                if (storedAudioName) {
                    note.fields[audioFieldSelect.value] = `[sound:${storedAudioName}]`;
                    console.log('音频字段设置:', storedAudioName);
                }
            }
        } catch (error) {
            console.error('音频截取失败:', error);
        }
    }

    if (imageFieldSelect.value && currentMediaType === 'video' && currentMediaFile) {
        try {
            const storedImageName = await captureVideoFrame(word);
            if (storedImageName) {
                note.fields[imageFieldSelect.value] = `<img src="${storedImageName}">`;
                console.log('图片字段设置:', storedImageName);
            }
        } catch (error) {
            console.error('截图失败:', error);
        }
    }

    await addCardToAnki(note);
}

// 生成文件名
function generateAudioFileName(word) {
    const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase() || 'audio';
    let fileName = `audio_${cleanWord}_${Date.now()}.wav`;
    fileName = fileName.replace(/[^\w.\-]/g, '_');
    return fileName;
}

function generateImageFileName(word) {
    const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase() || 'screenshot';
    let fileName = `screenshot_${cleanWord}_${Date.now()}.jpg`;
    fileName = fileName.replace(/[^\w.\-]/g, '_');
    return fileName;
}

// 自动截取当前字幕的音频片段
async function processAudioFile(word, audioBlob) {
    try {
        const audioFileName = generateAudioFileName(word);
        console.log('准备存储音频文件:', audioFileName);

        const base64Audio = await blobToBase64(audioBlob);

        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'storeMediaFile',
                version: 6,
                params: {
                    filename: audioFileName,
                    data: base64Audio.split(',')[1],
                    deleteExisting: true
                }
            })
        });

        const result = await response.json();
        if (result.error) {
            console.error('存储音频文件失败:', result.error);
            return null;
        }

        const storedName = result.result || audioFileName;
        console.log('音频文件实际存储名:', storedName);
        return storedName;

    } catch (error) {
        console.error('音频处理错误:', error);
        return null;
    }
}
        
// 截图功能
async function captureVideoFrame(word) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const video = document.getElementById('player');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (blob) => {
                try {
                    const imageFileName = generateImageFileName(word);
                    const base64Image = await blobToBase64(blob);

                    const response = await fetch('http://127.0.0.1:8765', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'storeMediaFile',
                            version: 6,
                            params: {
                                filename: imageFileName,
                                data: base64Image.split(',')[1],
                                deleteExisting: true
                            }
                        })
                    });

                    const result = await response.json();
                    if (result.error) {
                        console.error('存储图片文件失败:', result.error);
                        reject(new Error(result.error));
                        return;
                    }

                    const storedName = result.result || imageFileName;
                    console.log('图片文件实际存储名:', storedName);
                    resolve(storedName);
                } catch (error) {
                    console.error('图片处理错误:', error);
                    reject(error);
                }
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('截图错误:', error);
            reject(error);
        }
    });
}

function bufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);

    let offset = 0;
    function writeString(s) {
        for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
    }

    function write16(v) { view.setInt16(offset, v, true); offset += 2; }
    function write32(v) { view.setUint32(offset, v, true); offset += 4; }

    writeString('RIFF');
    write32(length - 8);
    writeString('WAVEfmt ');
    write32(16);
    write16(1);
    write16(numChannels);
    write32(sampleRate);
    write32(sampleRate * numChannels * 2);
    write16(numChannels * 2);
    write16(16);
    writeString('data');
    write32(length - 44);

    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let sample = buffer.getChannelData(ch)[i];
            sample = Math.max(-1, Math.min(1, sample));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
            offset += 2;
        }
    }

    return new Blob([view], { type: 'audio/wav' });
}

// 生成当前句子的音频片段
async function generateAudioClip(subtitleIndex) {
    if (!audioBuffer) throw new Error('audioBuffer 未加载');

    const startTime = subtitles[subtitleIndex].start;
    const endTime = subtitles[subtitleIndex].end;

    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const frameCount = endSample - startSample;

    const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            newData[i] = oldData[startSample + i];
        }
    }

    return bufferToWavBlob(newBuffer);
}

// 将AudioBuffer转换为WAV Blob
function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataSize = length * blockAlign;
    
    const bufferArray = new ArrayBuffer(44 + dataSize);
    const view = new DataView(bufferArray);
    
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    const offset = 44;
    let index = 0;
    
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset + index, int16Sample, true);
            index += 2;
        }
    }
    
    return new Blob([bufferArray], { type: 'audio/wav' });
}
        
async function addCardToAnki(note) {
    console.log('准备添加卡片到 Anki:', note);

    try {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'addNote',
                version: 6,
                params: { note }
            }),
        });

        if (!response.ok) {
            throw new Error(`AnkiConnect HTTP错误: ${response.status} ${response.statusText}`);
        }

        let result;
        try {
            result = await response.json();
        } catch (err) {
            throw new Error('无法解析 AnkiConnect 返回的 JSON。可能未启动 AnkiConnect。');
        }

        if (result.error) {
            if (result.error.includes('cannot create note because it is a duplicate')) {
                console.warn('检测到重复卡片，未添加:', note.fields);
                showStatusMessage('⚠️ 已存在相同卡片，跳过添加。');
                return null;
            } else {
                console.error('添加卡片失败:', result.error);
                console.error('卡片数据:', note);
                showStatusMessage('❌ 添加卡片失败，请查看控制台日志。');
                throw new Error(result.error);
            }
        }

        if (!result.result) {
            console.warn('AnkiConnect 返回空结果，可能未创建卡片。');
            showStatusMessage('⚠️ 未创建卡片，可能是重复或模型不匹配。');
            return null;
        }

        console.log('✅ 卡片添加成功，ID:', result.result);
        showStatusMessage('✅ 卡片已成功添加到 Anki!');
        return result.result;

    } catch (error) {
        console.error('❌ 与 AnkiConnect 通信失败:', error);
        showStatusMessage('❌ 无法连接到 AnkiConnect，请确认它已运行。');
        return null;
    }
}

// 状态提示函数
function showStatusMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.background = 'rgba(0,0,0,0.8)';
    div.style.color = '#fff';
    div.style.padding = '8px 12px';
    div.style.borderRadius = '6px';
    div.style.fontSize = '14px';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

// 将Blob转换为Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ==================== 面板功能 ====================

// 底部面板功能
function openDictionaryPanel() {
    panelDictionaryResult.style.display = 'block';
    panelWordTitle.style.display = 'block';
    dictionaryPanel.classList.add('active');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 标签页切换功能
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
        }
    });
});

// 加载网页查询
function loadWebSearch(word) {
    if (!word) return;
    
    if (window.webSearch) {
        window.webSearch(word);
    } else {
        const url = currentLanguageMode === 'japanese' ? 
            `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=ja` :
            `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`;
        webSearchFrame.src = url;
    }
}

// 监听播放器时间更新
videoPlayer.addEventListener('timeupdate', event => {
    updateSubtitle(videoPlayer.currentTime);
});

// 显示通知
function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// 启动初始化
init();

// 油猴脚本接口
window.mediaPlayer = {
    setJapaneseSegmentation: (words) => {
        japaneseWords = words;
        currentWordIndex = 0;
    },
    
    setJapaneseWordData: (html) => {
        panelDictionaryResult.innerHTML = html;
    },
    
    setWebSearchUrl: (url) => {
        webSearchFrame.src = url;
    },
    
    getState: () => ({
        currentWord: currentWord,
        currentSentence: currentSentence,
        currentLanguageMode: currentLanguageMode,
        currentMediaType: currentMediaType,
        clipboardEnabled: clipboardEnabled
    }),
    
    // 新增接口
    toggleClipboard: toggleClipboardFunction,
    openDictionary: openFullscreenDictionary
};