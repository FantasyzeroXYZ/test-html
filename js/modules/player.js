// 媒体播放器模块 - 负责视频和音频播放控制
export class Player {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // DOM元素
        this.videoPlayer = null;
        this.audioElement = null;
        this.videoPlayerContainer = null;
        this.audioPlayerContainer = null;
        
        // 音频相关
        this.audioContext = null;
        this.audioBuffer = null;
        this.isDraggingProgress = false;
        this.isDraggingVolume = false;
        
        this.init();
    }

    init() {
        this.getDOMElements();
        this.initEventListeners();
        this.initAudioControls();
    }

    getDOMElements() {
        // 视频播放器元素
        this.videoPlayer = document.getElementById('player');
        this.videoPlayerContainer = document.getElementById('video-player');
        
        // 音频播放器元素
        this.audioElement = new Audio();
        this.audioPlayerContainer = document.getElementById('audio-player');
        
        // 控制元素
        this.audioCurrentTime = document.getElementById('audio-current-time');
        this.audioDuration = document.getElementById('audio-duration');
        this.audioProgress = document.getElementById('audio-progress');
        this.audioProgressFilled = document.getElementById('audio-progress-filled');
        this.progressThumb = document.getElementById('progress-thumb');
        this.audioVolume = document.getElementById('audio-volume');
        this.audioVolumeFilled = document.getElementById('audio-volume-filled');
        this.volumeThumb = document.getElementById('volume-thumb');
        this.audioPlayPauseBtn = document.getElementById('audio-play-pause-btn');
        
        // 信息显示元素
        this.trackTitle = document.getElementById('track-title');
        this.trackDescription = document.getElementById('track-description');
        this.mediaIcon = document.getElementById('media-icon');
    }

    initEventListeners() {
        // 播放器时间更新事件
        if (this.videoPlayer) {
            this.videoPlayer.addEventListener('timeupdate', () => {
                this.handleTimeUpdate(this.videoPlayer.currentTime);
            });
        }

        // 音频播放器事件
        if (this.audioElement) {
            this.audioElement.addEventListener('timeupdate', () => {
                this.handleTimeUpdate(this.audioElement.currentTime);
            });
        }
    }

    initAudioControls() {
        if (!this.audioElement) return;

        // 更新音频时长
        this.audioElement.addEventListener('loadedmetadata', () => {
            if (this.audioDuration) {
                this.audioDuration.textContent = this.modules.timeUtils.formatTime(this.audioElement.duration);
            }
            this.updateProgressThumb();
            this.updateVolumeThumb();
        });
        
        // 播放/暂停按钮
        if (this.audioPlayPauseBtn) {
            this.audioPlayPauseBtn.addEventListener('click', () => {
                this.toggleAudioPlayback();
            });
        }
        
        // 进度条点击
        if (this.audioProgress) {
            this.audioProgress.addEventListener('click', (e) => {
                this.handleProgressClick(e);
            });
        }
        
        // 进度条拖动
        if (this.progressThumb) {
            this.progressThumb.addEventListener('mousedown', (e) => this.startDragProgress(e));
            this.progressThumb.addEventListener('touchstart', (e) => this.startDragProgress(e));
        }
        
        // 音量条点击
        if (this.audioVolume) {
            this.audioVolume.addEventListener('click', (e) => {
                this.handleVolumeClick(e);
            });
        }
        
        // 音量条拖动
        if (this.volumeThumb) {
            this.volumeThumb.addEventListener('mousedown', (e) => this.startDragVolume(e));
            this.volumeThumb.addEventListener('touchstart', (e) => this.startDragVolume(e));
        }
        
        // 音频播放状态变化
        this.audioElement.addEventListener('play', () => {
            if (this.audioPlayPauseBtn) {
                this.audioPlayPauseBtn.textContent = '⏸';
                this.audioPlayPauseBtn.classList.add('active');
            }
        });
        
        this.audioElement.addEventListener('pause', () => {
            if (this.audioPlayPauseBtn) {
                this.audioPlayPauseBtn.textContent = '▶';
                this.audioPlayPauseBtn.classList.remove('active');
            }
        });
    }

    // 处理时间更新
    handleTimeUpdate(currentTime) {
        // 更新进度显示
        if (this.state.currentMediaType === 'audio' && this.audioElement) {
            const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            if (this.audioProgressFilled) {
                this.audioProgressFilled.style.width = `${percent}%`;
            }
            if (this.audioCurrentTime) {
                this.audioCurrentTime.textContent = this.modules.timeUtils.formatTime(this.audioElement.currentTime);
            }
            
            if (!this.isDraggingProgress) {
                this.updateProgressThumb();
            }
        }
        
        // 通知其他模块时间更新
        this.app.notifyModules('timeUpdate', { currentTime });
    }

    // 切换音频播放状态
    toggleAudioPlayback() {
        if (!this.audioElement) return;
        
        if (this.audioElement.paused) {
            this.audioElement.play();
        } else {
            this.audioElement.pause();
        }
    }

    // 处理进度条点击
    handleProgressClick(e) {
        if (!this.audioElement || !this.audioProgress) return;
        
        const rect = this.audioProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audioElement.currentTime = percent * this.audioElement.duration;
        this.updateProgressThumb();
    }

    // 开始拖动进度条
    startDragProgress(e) {
        e.preventDefault();
        this.isDraggingProgress = true;
        
        const moveHandler = (e) => {
            if (!this.isDraggingProgress || !this.audioElement || !this.audioProgress) return;
            
            const rect = this.audioProgress.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            let percent = (clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            this.audioElement.currentTime = percent * this.audioElement.duration;
            this.updateProgressThumb();
        };
        
        const upHandler = () => {
            this.isDraggingProgress = false;
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

    // 处理音量条点击
    handleVolumeClick(e) {
        if (!this.audioElement || !this.audioVolume) return;
        
        const rect = this.audioVolume.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audioElement.volume = percent;
        this.updateVolumeThumb();
    }

    // 开始拖动音量条
    startDragVolume(e) {
        e.preventDefault();
        this.isDraggingVolume = true;
        
        const moveHandler = (e) => {
            if (!this.isDraggingVolume || !this.audioElement || !this.audioVolume) return;
            
            const rect = this.audioVolume.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            let percent = (clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            this.audioElement.volume = percent;
            this.updateVolumeThumb();
        };
        
        const upHandler = () => {
            this.isDraggingVolume = false;
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
    updateProgressThumb() {
        if (!this.audioElement || !this.audioElement.duration || !this.progressThumb) return;
        
        const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        this.progressThumb.style.left = `${percent}%`;
    }

    // 更新音量滑块位置
    updateVolumeThumb() {
        if (!this.audioElement || !this.volumeThumb || !this.audioVolumeFilled) return;
        
        const percent = this.audioElement.volume * 100;
        this.audioVolumeFilled.style.width = `${percent}%`;
        this.volumeThumb.style.left = `${percent}%`;
    }

    // 加载视频文件
    loadVideoFile(file) {
        if (!file || !this.videoPlayer) return;
        
        this.state.currentMediaFile = file;
        this.state.currentMediaType = 'video';
        
        // 更新UI显示
        if (this.trackTitle) {
            this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
        }
        if (this.trackDescription) {
            this.trackDescription.textContent = `文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        }
        if (this.mediaIcon) {
            this.mediaIcon.className = 'fas fa-video';
        }
        
        // 暂停音频播放器（如果正在播放）
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
            if (this.audioPlayPauseBtn) {
                this.audioPlayPauseBtn.textContent = '▶';
            }
        }
        
        // 创建文件URL并设置播放器源
        const fileURL = URL.createObjectURL(file);
        this.videoPlayer.src = fileURL;
        
        // 切换到视频模式
        this.switchToVideoMode();
        
        // 显示视频播放器
        if (this.videoPlayerContainer) {
            this.videoPlayerContainer.classList.add('active');
        }
        
        // 通知应用状态变化
        this.app.setState({
            currentMediaFile: file,
            currentMediaType: 'video'
        });
    }

    // 加载音频文件
    async loadAudioFile(file) {
        if (!file) return;
        
        this.state.currentMediaFile = file;
        this.state.currentMediaType = 'audio';
        
        // 更新UI显示
        if (this.trackTitle) {
            this.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
        }
        if (this.trackDescription) {
            this.trackDescription.textContent = `文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        }
        if (this.mediaIcon) {
            this.mediaIcon.className = 'fas fa-music';
        }
        
        // 暂停视频播放器（如果正在播放）
        if (this.videoPlayer && !this.videoPlayer.paused) {
            this.videoPlayer.pause();
        }
        
        // 创建文件URL并设置播放器源
        const fileURL = URL.createObjectURL(file);
        
        if (!this.audioElement) {
            this.audioElement = new Audio();
            this.initAudioControls();
        }
        this.audioElement.src = fileURL;
        
        // 切换到音频模式
        this.switchToAudioMode();
        
        // 显示音频播放器
        if (this.audioPlayerContainer) {
            this.audioPlayerContainer.classList.add('active');
        }
        
        // 加载音频文件到Web Audio API
        await this.loadAudioBuffer(file);
        
        // 通知应用状态变化
        this.app.setState({
            currentMediaFile: file,
            currentMediaType: 'audio'
        });
    }

    // 加载音频文件到Web Audio API
    async loadAudioBuffer(file) {
        try {
            // 创建AudioContext
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // 读取文件
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            console.log('音频文件已加载到Web Audio API');
        } catch (error) {
            console.error('加载音频文件失败:', error);
        }
    }

    // 切换到视频模式
    switchToVideoMode() {
        this.state.currentMediaType = 'video';
        
        if (this.videoPlayerContainer) {
            this.videoPlayerContainer.classList.add('active');
        }
        if (this.audioPlayerContainer) {
            this.audioPlayerContainer.classList.remove('active');
        }
        
        this.app.notifyModules('mediaModeChanged', { mode: 'video' });
    }

    // 切换到音频模式
    switchToAudioMode() {
        this.state.currentMediaType = 'audio';
        
        if (this.audioPlayerContainer) {
            this.audioPlayerContainer.classList.add('active');
        }
        if (this.videoPlayerContainer) {
            this.videoPlayerContainer.classList.remove('active');
        }
        
        this.app.notifyModules('mediaModeChanged', { mode: 'audio' });
    }

    // 跳转到指定时间
    jumpToTime(time) {
        if (isNaN(time) || time < 0) return;
        
        if (this.state.currentMediaType === 'video' && this.videoPlayer) {
            this.videoPlayer.currentTime = time;
        } else if (this.state.currentMediaType === 'audio' && this.audioElement) {
            this.audioElement.currentTime = time;
        }
    }

    // 生成当前句子的音频片段
    generateAudioClip(subtitleIndex) {
        return new Promise((resolve, reject) => {
            if (!this.audioBuffer || !this.audioContext) {
                reject(new Error('音频未加载，无法生成音频片段'));
                return;
            }
            
            const subtitles = this.modules.subtitle.getSubtitles();
            if (!subtitles || subtitleIndex >= subtitles.length) {
                reject(new Error('无效的字幕索引'));
                return;
            }
            
            const subtitle = subtitles[subtitleIndex];
            const startTime = Math.max(0, subtitle.start);
            const endTime = Math.min(this.audioBuffer.duration, subtitle.end);
            
            // 计算开始和结束的样本位置
            const startOffset = Math.floor(startTime * this.audioBuffer.sampleRate);
            const endOffset = Math.floor(endTime * this.audioBuffer.sampleRate);
            const length = endOffset - startOffset;
            
            if (length <= 0) {
                reject(new Error('无效的音频片段长度'));
                return;
            }
            
            // 创建新的音频缓冲区
            const newBuffer = this.audioContext.createBuffer(
                this.audioBuffer.numberOfChannels,
                length,
                this.audioBuffer.sampleRate
            );
            
            // 复制音频数据
            for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
                const channelData = this.audioBuffer.getChannelData(channel);
                const newChannelData = newBuffer.getChannelData(channel);
                
                for (let i = 0; i < length; i++) {
                    newChannelData[i] = channelData[startOffset + i];
                }
            }
            
            // 将音频缓冲区转换为WAV格式
            const wavBlob = this.bufferToWav(newBuffer);
            
            console.log('音频片段已生成');
            resolve(wavBlob);
        });
    }
    
    // 将AudioBuffer转换为WAV Blob
    bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length;
        const bytesPerSample = 2;
        const blockAlign = numChannels * bytesPerSample;
        
        // 计算数据大小
        const dataSize = length * blockAlign;
        
        // 创建WAV文件头
        const bufferArray = new ArrayBuffer(44 + dataSize);
        const view = new DataView(bufferArray);
        
        // RIFF标识
        this.writeString(view, 0, 'RIFF');
        // 文件长度
        view.setUint32(4, 36 + dataSize, true);
        // WAVE标识
        this.writeString(view, 8, 'WAVE');
        // fmt chunk
        this.writeString(view, 12, 'fmt ');
        // fmt chunk长度
        view.setUint32(16, 16, true);
        // 音频格式 (1 = PCM)
        view.setUint16(20, 1, true);
        // 声道数
        view.setUint16(22, numChannels, true);
        // 采样率
        view.setUint32(24, sampleRate, true);
        // 字节率
        view.setUint32(28, sampleRate * blockAlign, true);
        // 块对齐
        view.setUint16(32, blockAlign, true);
        // 位深度
        view.setUint16(34, bytesPerSample * 8, true);
        // data chunk
        this.writeString(view, 36, 'data');
        // data chunk长度
        view.setUint32(40, dataSize, true);
        
        // 写入PCM数据
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
    
    // 写入字符串到DataView
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // 获取当前播放器时间
    getCurrentTime() {
        if (this.state.currentMediaType === 'video' && this.videoPlayer) {
            return this.videoPlayer.currentTime;
        } else if (this.state.currentMediaType === 'audio' && this.audioElement) {
            return this.audioElement.currentTime;
        }
        return 0;
    }

    // 暂停播放
    pause() {
        if (this.state.currentMediaType === 'video' && this.videoPlayer) {
            this.state.playerWasPlaying = !this.videoPlayer.paused;
            this.videoPlayer.pause();
        } else if (this.state.currentMediaType === 'audio' && this.audioElement) {
            this.state.playerWasPlaying = !this.audioElement.paused;
            this.audioElement.pause();
            if (this.audioPlayPauseBtn) {
                this.audioPlayPauseBtn.textContent = '▶';
            }
        }
    }

    // 恢复播放
    resume() {
        if (this.state.playerWasPlaying) {
            if (this.state.currentMediaType === 'video' && this.videoPlayer) {
                this.videoPlayer.play();
            } else if (this.state.currentMediaType === 'audio' && this.audioElement) {
                this.audioElement.play();
                if (this.audioPlayPauseBtn) {
                    this.audioPlayPauseBtn.textContent = '⏸';
                }
            }
        }
        this.state.playerWasPlaying = false;
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'timeJump':
                this.jumpToTime(data.time);
                break;
            case 'mediaModeChanged':
                if (data.mode === 'video') {
                    this.switchToVideoMode();
                } else {
                    this.switchToAudioMode();
                }
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理资源
        if (this.videoPlayer) {
            this.videoPlayer.pause();
            this.videoPlayer.src = '';
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // 移除事件监听器
        // 注意：在实际实现中需要保存事件监听器引用以便移除
    }
}