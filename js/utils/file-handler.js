// 文件处理模块 - 负责文件操作、格式验证和数据处理
export class FileHandler {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // 支持的文件格式
        this.supportedFormats = {
            video: [
                'video/mp4',
                'video/webm',
                'video/ogg',
                'video/avi',
                'video/x-msvideo',
                'video/quicktime',
                'video/x-matroska'
            ],
            audio: [
                'audio/mpeg',
                'audio/mp3',
                'audio/wav',
                'audio/ogg',
                'audio/webm',
                'audio/x-wav',
                'audio/flac'
            ],
            subtitle: [
                'text/plain',
                'application/x-subrip',
                'text/vtt'
            ]
        };
        
        // 文件扩展名映射
        this.fileExtensions = {
            video: ['.mp4', '.webm', '.ogv', '.avi', '.mov', '.mkv'],
            audio: ['.mp3', '.wav', '.ogg', '.webm', '.flac'],
            subtitle: ['.srt', '.vtt', '.txt']
        };
        
        this.init();
    }

    init() {
        console.log('文件处理模块初始化完成');
    }

    // 验证文件类型
    validateFile(file, expectedType) {
        if (!file) {
            throw new Error('文件为空');
        }

        // 检查文件大小（最大500MB）
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            throw new Error(`文件大小超过限制 (${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
        }

        // 根据预期类型进行验证
        switch (expectedType) {
            case 'video':
                return this.validateVideoFile(file);
            case 'audio':
                return this.validateAudioFile(file);
            case 'subtitle':
                return this.validateSubtitleFile(file);
            default:
                throw new Error(`未知的文件类型: ${expectedType}`);
        }
    }

    // 验证视频文件
    validateVideoFile(file) {
        const isValidByMime = this.supportedFormats.video.includes(file.type);
        const isValidByExtension = this.fileExtensions.video.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );

        if (!isValidByMime && !isValidByExtension) {
            throw new Error(`不支持的视频格式: ${file.name}. 支持格式: ${this.fileExtensions.video.join(', ')}`);
        }

        return true;
    }

    // 验证音频文件
    validateAudioFile(file) {
        const isValidByMime = this.supportedFormats.audio.includes(file.type);
        const isValidByExtension = this.fileExtensions.audio.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );

        if (!isValidByMime && !isValidByExtension) {
            throw new Error(`不支持的音频格式: ${file.name}. 支持格式: ${this.fileExtensions.audio.join(', ')}`);
        }

        return true;
    }

    // 验证字幕文件
    validateSubtitleFile(file) {
        const isValidByMime = this.supportedFormats.subtitle.includes(file.type);
        const isValidByExtension = this.fileExtensions.subtitle.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );

        if (!isValidByMime && !isValidByExtension) {
            throw new Error(`不支持的字母格式: ${file.name}. 支持格式: ${this.fileExtensions.subtitle.join(', ')}`);
        }

        return true;
    }

    // 读取文件为文本
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(new Error(`文件读取失败: ${error}`));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    // 读取文件为ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(new Error(`文件读取失败: ${error}`));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // 读取文件为DataURL
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(new Error(`文件读取失败: ${error}`));
            };
            
            reader.readAsDataURL(file);
        });
    }

    // 创建对象URL（用于媒体播放）
    createObjectURL(file) {
        return URL.createObjectURL(file);
    }

    // 释放对象URL
    revokeObjectURL(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }

    // 解析SRT字幕格式
    parseSRTContent(content) {
        const subtitles = [];
        const blocks = content.split(/\n\s*\n/);
        
        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                // 第一行是序号，跳过
                // 第二行是时间轴
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
                    
                    // 第三行及之后是字幕文本
                    const text = lines.slice(2).join(' ').trim();
                    
                    if (text) {
                        subtitles.push({
                            start: startTime,
                            end: endTime,
                            text: text,
                            originalIndex: parseInt(lines[0]) || subtitles.length + 1
                        });
                    }
                }
            }
        });
        
        // 按开始时间排序
        subtitles.sort((a, b) => a.start - b.start);
        
        return subtitles;
    }

    // 解析VTT字幕格式
    parseVTTContent(content) {
        const subtitles = [];
        const lines = content.split('\n');
        let currentSubtitle = null;
        let inHeader = true;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 跳过空行和WebVTT头部
            if (line === '' || line === 'WEBVTT' || line.startsWith('NOTE') || line.startsWith('STYLE')) {
                continue;
            }
            
            // 检查时间轴
            const timeMatch = line.match(/(\d+):(\d+):(\d+)\.(\d+)\s*-->\s*(\d+):(\d+):(\d+)\.(\d+)/);
            if (timeMatch) {
                // 如果有上一个字幕，保存它
                if (currentSubtitle && currentSubtitle.text) {
                    subtitles.push(currentSubtitle);
                }
                
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
                
                currentSubtitle = {
                    start: startTime,
                    end: endTime,
                    text: ''
                };
            } else if (currentSubtitle && line !== '') {
                // 添加文本到当前字幕
                if (currentSubtitle.text) {
                    currentSubtitle.text += ' ' + line;
                } else {
                    currentSubtitle.text = line;
                }
            }
        }
        
        // 添加最后一个字幕
        if (currentSubtitle && currentSubtitle.text) {
            subtitles.push(currentSubtitle);
        }
        
        // 按开始时间排序
        subtitles.sort((a, b) => a.start - b.start);
        
        return subtitles;
    }

    // 解析文本字幕格式（简单的每行一句）
    parseTextContent(content) {
        const subtitles = [];
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        // 假设每行是一个字幕，每句显示3秒
        const durationPerLine = 3; // 秒
        
        lines.forEach((line, index) => {
            const startTime = index * durationPerLine;
            const endTime = (index + 1) * durationPerLine;
            
            subtitles.push({
                start: startTime,
                end: endTime,
                text: line.trim(),
                originalIndex: index + 1
            });
        });
        
        return subtitles;
    }

    // 自动检测并解析字幕内容
    parseSubtitleContent(content, fileName = '') {
        if (!content || content.trim() === '') {
            throw new Error('字幕内容为空');
        }
        
        // 根据文件扩展名或内容特征检测格式
        if (fileName.toLowerCase().endsWith('.srt')) {
            return this.parseSRTContent(content);
        } else if (fileName.toLowerCase().endsWith('.vtt')) {
            return this.parseVTTContent(content);
        } else {
            // 尝试检测格式
            if (content.includes('-->') && /^\d+$/.test(content.split('\n')[0].trim())) {
                // 看起来像SRT格式
                return this.parseSRTContent(content);
            } else if (content.includes('WEBVTT') || content.includes('-->') && content.includes('.')) {
                // 看起来像VTT格式
                return this.parseVTTContent(content);
            } else {
                // 作为纯文本处理
                return this.parseTextContent(content);
            }
        }
    }

    // 生成字幕文件
    generateSubtitleFile(subtitles, format = 'srt') {
        let content = '';
        
        switch (format.toLowerCase()) {
            case 'srt':
                content = this.generateSRTContent(subtitles);
                break;
            case 'vtt':
                content = this.generateVTTContent(subtitles);
                break;
            case 'txt':
                content = this.generateTextContent(subtitles);
                break;
            default:
                throw new Error(`不支持的字母格式: ${format}`);
        }
        
        return new Blob([content], { type: 'text/plain' });
    }

    // 生成SRT格式内容
    generateSRTContent(subtitles) {
        let content = '';
        
        subtitles.forEach((subtitle, index) => {
            content += `${index + 1}\n`;
            content += `${this.formatTimeSRT(subtitle.start)} --> ${this.formatTimeSRT(subtitle.end)}\n`;
            content += `${subtitle.text}\n\n`;
        });
        
        return content;
    }

    // 生成VTT格式内容
    generateVTTContent(subtitles) {
        let content = 'WEBVTT\n\n';
        
        subtitles.forEach((subtitle, index) => {
            content += `${this.formatTimeVTT(subtitle.start)} --> ${this.formatTimeVTT(subtitle.end)}\n`;
            content += `${subtitle.text}\n\n`;
        });
        
        return content;
    }

    // 生成文本格式内容
    generateTextContent(subtitles) {
        return subtitles.map(subtitle => subtitle.text).join('\n');
    }

    // 格式化时间为SRT格式 (HH:MM:SS,mmm)
    formatTimeSRT(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
    }

    // 格式化时间为VTT格式 (HH:MM:SS.mmm)
    formatTimeVTT(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }

    // 下载文件
    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    // 获取文件信息
    getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            formattedSize: this.formatFileSize(file.size)
        };
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 检查文件是否支持
    isFileSupported(file, type) {
        try {
            return this.validateFile(file, type);
        } catch (error) {
            return false;
        }
    }

    // 获取支持的文件格式描述
    getSupportedFormatsDescription() {
        return {
            video: this.fileExtensions.video.map(ext => ext.substring(1)).join(', '),
            audio: this.fileExtensions.audio.map(ext => ext.substring(1)).join(', '),
            subtitle: this.fileExtensions.subtitle.map(ext => ext.substring(1)).join(', ')
        };
    }

    // 处理拖放文件
    handleDropEvent(event, expectedType) {
        event.preventDefault();
        
        const files = Array.from(event.dataTransfer.files);
        if (files.length === 0) return null;
        
        const file = files[0];
        
        try {
            this.validateFile(file, expectedType);
            return file;
        } catch (error) {
            throw new Error(`拖放文件错误: ${error.message}`);
        }
    }

    // 设置拖放区域高亮
    setupDropZone(element, onDropCallback) {
        if (!element) return;
        
        const highlight = () => {
            element.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
            element.style.border = '2px dashed #3498db';
        };
        
        const unhighlight = () => {
            element.style.backgroundColor = '';
            element.style.border = '';
        };
        
        // 防止默认拖放行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        // 高亮拖放区域
        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, unhighlight, false);
        });
        
        // 处理文件放置
        element.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && onDropCallback) {
                onDropCallback(files[0]);
            }
        }, false);
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'fileValidationRequired':
                try {
                    const isValid = this.validateFile(data.file, data.expectedType);
                    this.app.notifyModules('fileValidationResult', {
                        file: data.file,
                        isValid: isValid,
                        type: data.expectedType
                    });
                } catch (error) {
                    this.app.notifyModules('fileValidationError', {
                        file: data.file,
                        error: error.message,
                        type: data.expectedType
                    });
                }
                break;
                
            case 'subtitleParseRequested':
                try {
                    const subtitles = this.parseSubtitleContent(data.content, data.fileName);
                    this.app.notifyModules('subtitleParseResult', {
                        subtitles: subtitles,
                        fileName: data.fileName
                    });
                } catch (error) {
                    this.app.notifyModules('subtitleParseError', {
                        error: error.message,
                        fileName: data.fileName
                    });
                }
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理所有创建的URL
        // 注意：在实际应用中需要跟踪所有创建的URL
    }
}