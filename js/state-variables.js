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
let currentOriginalSentence = '';
let isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 全屏相关状态变量
let isFullscreen = false;
let controlsTimeout;
let wasPlayingBeforeDict = false;
let wasPlayingBeforeSubtitles = false;
let clipboardEnabled = false;
let isDraggingFullscreenProgress = false;
let hasEnteredFullscreenBefore = false;