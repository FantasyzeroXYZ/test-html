// 初始化函数

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
    
    // 新增初始化调用
    initClipboardFunction();
    initClipboardSupport(); // 新增：检查剪贴板支持
    initFullscreenDrag();
    initFullscreenSubtitleNavigation();
    initFullscreenDictionary();
    initSearchFunction();
    optimizeMobileLayout();
    fixFullscreenControlsDisplay();
    // 初始隐藏控制条
    fullscreenControls.style.display = 'none';
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