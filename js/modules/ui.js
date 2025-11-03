// 用户界面模块 - 负责UI初始化、事件处理和界面状态管理
export class UI {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // DOM元素缓存
        this.elements = {};
        
        // 界面状态
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        await this.getDOMElements();
        this.initEventListeners();
        this.initControls();
        this.isInitialized = true;
        
        console.log('UI模块初始化完成');
    }

    // 获取DOM元素
    async getDOMElements() {
        // 文件输入元素
        this.elements.videoFileInput = document.getElementById('video-file-input');
        this.elements.audioFileInput = document.getElementById('audio-file-input');
        this.elements.subtitleFileInput = document.getElementById('subtitle-file-input');
        
        // 控制按钮
        this.elements.mediaModeBtn = document.getElementById('media-mode-btn');
        this.elements.languageModeBtn = document.getElementById('language-mode-btn');
        this.elements.subtitleImportBtn = document.getElementById('subtitle-import-btn');
        this.elements.mediaImportBtn = document.getElementById('media-import-btn');
        
        // 时间跳转元素
        this.elements.timeJumpInput = document.getElementById('time-jump-input');
        this.elements.timeJumpBtn = document.getElementById('time-jump-btn');
        
        // 面板控制元素
        this.elements.closePanelBtn = document.getElementById('close-panel');
        this.elements.closeSubtitleListPanel = document.getElementById('close-subtitle-list-panel');
        this.elements.panelOverlay = document.getElementById('panel-overlay');
        this.elements.dictionaryPanel = document.getElementById('dictionary-panel');
        this.elements.subtitleListPanel = document.getElementById('subtitle-list-panel');
        
        // 字幕列表显示按钮
        this.elements.showSubtitleListBtn = document.getElementById('show-subtitle-list-btn');
        
        // 等待DOM完全加载
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // 初始化事件监听器
    initEventListeners() {
        this.initFileInputEvents();
        this.initControlButtonEvents();
        this.initPanelEvents();
        this.initTimeJumpEvents();
    }

    // 初始化文件输入事件
    initFileInputEvents() {
        // 字幕文件导入
        if (this.elements.subtitleImportBtn) {
            this.elements.subtitleImportBtn.addEventListener('click', () => {
                this.elements.subtitleFileInput.click();
            });
        }
        
        // 媒体文件导入
        if (this.elements.mediaImportBtn) {
            this.elements.mediaImportBtn.addEventListener('click', () => {
                if (this.state.currentMediaType === 'video') {
                    this.elements.videoFileInput.click();
                } else {
                    this.elements.audioFileInput.click();
                }
            });
        }
        
        // 视频文件选择
        if (this.elements.videoFileInput) {
            this.elements.videoFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.modules.player.loadVideoFile(file);
                }
            });
        }
        
        // 音频文件选择
        if (this.elements.audioFileInput) {
            this.elements.audioFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.modules.player.loadAudioFile(file);
                }
            });
        }
        
        // 字幕文件选择
        if (this.elements.subtitleFileInput) {
            this.elements.subtitleFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        this.app.notifyModules('subtitleFileLoaded', { content });
                    };
                    reader.readAsText(file);
                }
            });
        }
    }

    // 初始化控制按钮事件
    initControlButtonEvents() {
        // 媒体模式切换
        if (this.elements.mediaModeBtn) {
            this.elements.mediaModeBtn.addEventListener('click', () => {
                this.toggleMediaMode();
            });
        }
        
        // 语言模式切换
        if (this.elements.languageModeBtn) {
            this.elements.languageModeBtn.addEventListener('click', () => {
                this.toggleLanguageMode();
            });
        }
        
        // 显示字幕列表
        if (this.elements.showSubtitleListBtn) {
            this.elements.showSubtitleListBtn.addEventListener('click', () => {
                this.openSubtitleListPanel();
            });
        }
    }

    // 初始化面板事件
    initPanelEvents() {
        // 关闭词典面板
        if (this.elements.closePanelBtn) {
            this.elements.closePanelBtn.addEventListener('click', () => {
                this.closeDictionaryPanel();
            });
        }
        
        // 关闭字幕列表面板
        if (this.elements.closeSubtitleListPanel) {
            this.elements.closeSubtitleListPanel.addEventListener('click', () => {
                this.closeSubtitleListPanel();
            });
        }
        
        // 点击遮罩层关闭面板
        if (this.elements.panelOverlay) {
            this.elements.panelOverlay.addEventListener('click', () => {
                this.closeDictionaryPanel();
                this.closeSubtitleListPanel();
            });
        }
    }

    // 初始化时间跳转事件
    initTimeJumpEvents() {
        // 时间跳转按钮
        if (this.elements.timeJumpBtn) {
            this.elements.timeJumpBtn.addEventListener('click', () => {
                this.handleTimeJump();
            });
        }
        
        // 时间跳转输入框回车键
        if (this.elements.timeJumpInput) {
            this.elements.timeJumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleTimeJump();
                }
            });
        }
    }

    // 初始化控件状态
    initControls() {
        this.updateMediaModeButton();
        this.updateLanguageModeButton();
        this.updateImportButton();
    }

    // 切换媒体模式
    toggleMediaMode() {
        this.state.currentMediaType = this.state.currentMediaType === 'video' ? 'audio' : 'video';
        this.updateMediaModeButton();
        this.updateImportButton();
        
        // 保存配置
        this.modules.config.save();
        
        // 通知其他模块
        this.app.notifyModules('mediaModeChanged', { 
            mode: this.state.currentMediaType 
        });
        
        // 如果已有媒体文件，切换到对应的播放器
        if (this.state.currentMediaFile) {
            if (this.state.currentMediaType === 'video') {
                this.modules.player.switchToVideoMode();
            } else {
                this.modules.player.switchToAudioMode();
            }
        }
    }

    // 切换语言模式
    toggleLanguageMode() {
        this.state.currentLanguageMode = this.state.currentLanguageMode === 'english' ? 'japanese' : 'english';
        this.updateLanguageModeButton();
        
        // 保存配置
        this.modules.config.save();
        
        // 通知其他模块
        this.app.notifyModules('languageModeChanged', { 
            mode: this.state.currentLanguageMode 
        });
    }

    // 更新媒体模式按钮
    updateMediaModeButton() {
        if (!this.elements.mediaModeBtn) return;
        
        this.elements.mediaModeBtn.innerHTML = this.state.currentMediaType === 'video' ? 
            '<i class="fas fa-video"></i> 视频模式' : 
            '<i class="fas fa-music"></i> 音频模式';
    }

    // 更新语言模式按钮
    updateLanguageModeButton() {
        if (!this.elements.languageModeBtn) return;
        
        this.elements.languageModeBtn.innerHTML = this.state.currentLanguageMode === 'english' ? 
            '<i class="fas fa-language"></i> 英语模式' : 
            '<i class="fas fa-language"></i> 日语模式';
    }

    // 更新导入按钮
    updateImportButton() {
        if (!this.elements.mediaImportBtn) return;
        
        this.elements.mediaImportBtn.innerHTML = this.state.currentMediaType === 'video' ? 
            '<i class="fas fa-file-video"></i> 视频' : 
            '<i class="fas fa-file-audio"></i> 音频';
    }

    // 处理时间跳转
    handleTimeJump() {
        if (!this.elements.timeJumpInput) return;
        
        const time = parseFloat(this.elements.timeJumpInput.value);
        if (!isNaN(time) && time >= 0) {
            this.modules.player.jumpToTime(time);
        }
    }

    // 打开词典面板
    openDictionaryPanel() {
        if (this.elements.dictionaryPanel) {
            this.elements.dictionaryPanel.classList.add('active');
            
            if (this.elements.panelOverlay) {
                this.elements.panelOverlay.classList.add('active');
            }
            
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭词典面板
    closeDictionaryPanel() {
        if (this.elements.dictionaryPanel) {
            this.elements.dictionaryPanel.classList.remove('active');
            
            if (this.elements.panelOverlay) {
                this.elements.panelOverlay.classList.remove('active');
            }
            
            document.body.style.overflow = '';
        }
        
        // 恢复播放
        this.modules.player.resume();
    }

    // 打开字幕列表面板
    openSubtitleListPanel() {
        if (this.elements.subtitleListPanel) {
            this.elements.subtitleListPanel.classList.add('active');
            
            if (this.elements.panelOverlay) {
                this.elements.panelOverlay.classList.add('active');
            }
            
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭字幕列表面板
    closeSubtitleListPanel() {
        if (this.elements.subtitleListPanel) {
            this.elements.subtitleListPanel.classList.remove('active');
            
            if (this.elements.panelOverlay) {
                this.elements.panelOverlay.classList.remove('active');
            }
            
            document.body.style.overflow = '';
        }
    }

    // 显示通知消息
    showNotification(message, type = 'info', duration = 3000) {
        // 移除现有的通知
        const existingNotification = document.querySelector('.ui-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `ui-notification ui-notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // 添加动画样式
        if (!document.querySelector('#ui-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ui-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    // 显示错误消息
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    }

    // 显示成功消息
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        // 创建或更新加载指示器
        let loader = document.querySelector('.ui-loading');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'ui-loading';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-size: 1.2rem;
            `;
            document.body.appendChild(loader);
        }
        
        loader.innerHTML = `
            <div style="text-align: center;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #3498db;
                    border-top: 4px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <div>${message}</div>
            </div>
        `;
        
        // 添加旋转动画
        if (!document.querySelector('#ui-loading-styles')) {
            const style = document.createElement('style');
            style.id = 'ui-loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loader.style.display = 'flex';
    }

    // 隐藏加载状态
    hideLoading() {
        const loader = document.querySelector('.ui-loading');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // 更新控制按钮显示
    updateControlButtons() {
        // 视频相关按钮
        const videoControls = ['toggle-video-subtitles-btn'];
        // 音频相关按钮
        const audioControls = ['toggle-audio-subtitles-btn'];
        
        videoControls.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.style.display = this.state.currentMediaType === 'video' ? 'flex' : 'none';
            }
        });
        
        audioControls.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.style.display = this.state.currentMediaType === 'audio' ? 'flex' : 'none';
            }
        });
    }

    // 更新播放器显示
    updatePlayerDisplay() {
        const videoPlayer = document.getElementById('video-player');
        const audioPlayer = document.getElementById('audio-player');
        
        if (videoPlayer && audioPlayer) {
            if (this.state.currentMediaType === 'video') {
                videoPlayer.classList.add('active');
                audioPlayer.classList.remove('active');
            } else {
                audioPlayer.classList.add('active');
                videoPlayer.classList.remove('active');
            }
        }
    }

    // 更新轨道信息显示
    updateTrackInfo(title, description, iconClass) {
        const trackTitle = document.getElementById('track-title');
        const trackDescription = document.getElementById('track-description');
        const mediaIcon = document.getElementById('media-icon');
        
        if (trackTitle) trackTitle.textContent = title;
        if (trackDescription) trackDescription.textContent = description;
        if (mediaIcon) mediaIcon.className = iconClass;
    }

    // 显示文件选择对话框
    showFileSelection(type) {
        switch (type) {
            case 'video':
                if (this.elements.videoFileInput) {
                    this.elements.videoFileInput.click();
                }
                break;
            case 'audio':
                if (this.elements.audioFileInput) {
                    this.elements.audioFileInput.click();
                }
                break;
            case 'subtitle':
                if (this.elements.subtitleFileInput) {
                    this.elements.subtitleFileInput.click();
                }
                break;
        }
    }

    // 显示确认对话框
    showConfirm(message, title = '确认') {
        return new Promise((resolve) => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: rgba(30,30,40,0.95);
                color: white;
                padding: 25px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            `;
            
            dialog.innerHTML = `
                <h3 style="margin-bottom: 15px; color: #3498db;">${title}</h3>
                <p style="margin-bottom: 25px; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="ui-confirm-cancel" style="
                        background: rgba(231, 76, 60, 0.7);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background 0.3s;
                    ">取消</button>
                    <button class="ui-confirm-ok" style="
                        background: rgba(52, 152, 219, 0.7);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background 0.3s;
                    ">确定</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // 添加事件监听器
            const cancelBtn = dialog.querySelector('.ui-confirm-cancel');
            const okBtn = dialog.querySelector('.ui-confirm-ok');
            
            const cleanup = () => {
                overlay.remove();
            };
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            okBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            // 点击遮罩层关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            });
        });
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'mediaModeChanged':
                this.updateMediaModeButton();
                this.updateImportButton();
                this.updateControlButtons();
                this.updatePlayerDisplay();
                break;
                
            case 'languageModeChanged':
                this.updateLanguageModeButton();
                break;
                
            case 'fileLoaded':
                this.updateTrackInfo(data.title, data.description, data.iconClass);
                break;
                
            case 'error':
                this.showError(data.message, data.duration);
                break;
                
            case 'success':
                this.showSuccess(data.message, data.duration);
                break;
                
            case 'loadingStart':
                this.showLoading(data.message);
                break;
                
            case 'loadingEnd':
                this.hideLoading();
                break;
                
            case 'closeDictionaryPanel':
                this.closeDictionaryPanel();
                break;
                
            case 'closeSubtitleListPanel':
                this.closeSubtitleListPanel();
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理事件监听器
        // 注意：在实际实现中需要保存事件监听器引用以便移除
        
        // 清理UI元素
        const elementsToRemove = [
            '.ui-notification',
            '.ui-loading',
            '.ui-confirm-dialog'
        ];
        
        elementsToRemove.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        this.isInitialized = false;
    }
}