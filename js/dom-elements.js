// DOM元素获取
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

// 全屏相关元素
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