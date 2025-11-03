// 主程序入口文件 - 外语学习媒体播放器
import { Player } from './modules/player.js';
import { Subtitle } from './modules/subtitle.js';
import { Dictionary } from './modules/dictionary.js';
import { Anki } from './modules/anki.js';
import { Japanese } from './modules/japanese.js';
import { UI } from './modules/ui.js';
import { FileHandler } from './utils/file-handler.js';
import { TimeUtils } from './utils/time-utils.js';
import { Config } from './utils/config.js';

class ForeignLanguageMediaPlayer {
    constructor() {
        this.modules = {};
        this.state = {
            currentWord: '',
            currentSentence: '',
            currentLanguageMode: 'english',
            currentMediaType: 'video',
            currentSubtitleIndex: -1,
            playerWasPlaying: false,
            ankiConnected: false,
            isProcessingAnki: false
        };
        
        this.init();
    }

    async init() {
        try {
            // 初始化工具模块
            this.modules.config = new Config();
            this.modules.timeUtils = new TimeUtils();
            this.modules.fileHandler = new FileHandler();
            
            // 初始化功能模块
            this.modules.player = new Player(this);
            this.modules.subtitle = new Subtitle(this);
            this.modules.dictionary = new Dictionary(this);
            this.modules.anki = new Anki(this);
            this.modules.japanese = new Japanese(this);
            this.modules.ui = new UI(this);
            
            // 加载配置
            this.modules.config.load();
            
            // 初始化UI
            await this.modules.ui.init();
            
            // 检查Anki连接
            await this.modules.anki.checkConnection();
            
            // 初始化日语分词
            await this.modules.japanese.init();
            
            console.log('外语学习媒体播放器初始化完成');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.modules.ui.showError('初始化失败: ' + error.message);
        }
    }

    // 状态管理方法
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyModules('stateChanged', this.state);
    }

    getState() {
        return { ...this.state };
    }

    // 模块间通信
    notifyModules(event, data) {
        Object.values(this.modules).forEach(module => {
            if (module.handleEvent && typeof module.handleEvent === 'function') {
                module.handleEvent(event, data);
            }
        });
    }

    // 公共API - 供油猴脚本或其他外部脚本使用
    getPublicAPI() {
        return {
            // 设置日语分词结果
            setJapaneseSegmentation: (words) => {
                this.modules.japanese.setWords(words);
            },
            
            // 设置日语查询结果
            setJapaneseWordData: (html) => {
                this.modules.dictionary.setJapaneseResult(html);
            },
            
            // 设置网页查询URL
            setWebSearchUrl: (url) => {
                this.modules.dictionary.setWebSearchUrl(url);
            },
            
            // 获取当前状态
            getState: () => this.getState(),
            
            // 日语分词完成回调
            onJapaneseSegmentationComplete: (callback) => {
                this.modules.japanese.onSegmentationComplete = callback;
            },
            
            // 日语单词点击回调
            onJapaneseWordClicked: (callback) => {
                this.modules.japanese.onWordClicked = callback;
            },
            
            // 日语单词查询回调
            onJapaneseWordSearch: (callback) => {
                this.modules.japanese.onWordSearch = callback;
            },
            
            // 日语词汇追加回调
            onJapaneseWordAppended: (callback) => {
                this.modules.japanese.onWordAppended = callback;
            },
            
            // 网页查询回调
            onWebSearch: (callback) => {
                this.modules.dictionary.onWebSearch = callback;
            }
        };
    }

    // 销毁方法
    destroy() {
        Object.values(this.modules).forEach(module => {
            if (module.destroy && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
    }
}

// 全局访问
window.ForeignLanguageMediaPlayer = ForeignLanguageMediaPlayer;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.mediaPlayerApp = new ForeignLanguageMediaPlayer();
    
    // 暴露公共API给油猴脚本
    window.mediaPlayer = window.mediaPlayerApp.getPublicAPI();
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});