// Anki集成模块 - 负责与AnkiConnect API的通信和卡片管理
export class Anki {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // Anki连接状态
        this.connected = false;
        this.decks = [];
        this.models = [];
        this.currentModelFields = [];
        
        // DOM元素
        this.ankiStatusIndicator = null;
        this.ankiStatusText = null;
        this.checkAnkiBtn = null;
        this.showConfigBtn = null;
        this.autoConfigSection = null;
        
        // 配置元素
        this.deckSelect = null;
        this.modelSelect = null;
        this.wordFieldSelect = null;
        this.sentenceFieldSelect = null;
        this.definitionFieldSelect = null;
        this.audioFieldSelect = null;
        this.imageFieldSelect = null;
        
        this.init();
    }

    init() {
        this.getDOMElements();
        this.initEventListeners();
    }

    getDOMElements() {
        // 状态指示元素
        this.ankiStatusIndicator = document.getElementById('anki-status-indicator');
        this.ankiStatusText = document.getElementById('anki-status-text');
        this.checkAnkiBtn = document.getElementById('check-anki-btn');
        this.showConfigBtn = document.getElementById('show-config-btn');
        this.autoConfigSection = document.getElementById('auto-config-section');
        
        // 配置选择元素
        this.deckSelect = document.getElementById('deck-select');
        this.modelSelect = document.getElementById('model-select');
        this.wordFieldSelect = document.getElementById('word-field-select');
        this.sentenceFieldSelect = document.getElementById('sentence-field-select');
        this.definitionFieldSelect = document.getElementById('definition-field-select');
        this.audioFieldSelect = document.getElementById('audio-field-select');
        this.imageFieldSelect = document.getElementById('image-field-select');
    }

    initEventListeners() {
        // 检查Anki连接
        if (this.checkAnkiBtn) {
            this.checkAnkiBtn.addEventListener('click', () => {
                this.checkConnection();
            });
        }

        // 显示/隐藏配置
        if (this.showConfigBtn) {
            this.showConfigBtn.addEventListener('click', () => {
                this.toggleConfigVisibility();
            });
        }

        // 模型选择变化时加载字段
        if (this.modelSelect) {
            this.modelSelect.addEventListener('change', () => {
                this.loadModelFields(this.modelSelect.value);
                this.saveConfig();
            });
        }

        // 配置变化时保存
        if (this.deckSelect) {
            this.deckSelect.addEventListener('change', this.saveConfig.bind(this));
        }
        if (this.wordFieldSelect) {
            this.wordFieldSelect.addEventListener('change', this.saveConfig.bind(this));
        }
        if (this.sentenceFieldSelect) {
            this.sentenceFieldSelect.addEventListener('change', this.saveConfig.bind(this));
        }
        if (this.definitionFieldSelect) {
            this.definitionFieldSelect.addEventListener('change', this.saveConfig.bind(this));
        }
        if (this.audioFieldSelect) {
            this.audioFieldSelect.addEventListener('change', this.saveConfig.bind(this));
        }
        if (this.imageFieldSelect) {
            this.imageFieldSelect.addEventListener('change', this.saveConfig.bind(this));
        }
    }

    // 检查Anki连接状态
    async checkConnection() {
        if (this.ankiStatusText) {
            this.ankiStatusText.textContent = '检查Anki连接状态...';
        }
        
        try {
            const response = await this.makeAnkiRequest('version', {});
            
            if (response && response.result) {
                this.connected = true;
                if (this.ankiStatusIndicator) {
                    this.ankiStatusIndicator.className = 'status-indicator status-connected';
                }
                if (this.ankiStatusText) {
                    this.ankiStatusText.textContent = 'Anki已连接';
                }
                
                // 获取牌组和模型信息
                await this.loadDecks();
                await this.loadModels();
                
                console.log('Anki连接成功，版本:', response.result);
            } else {
                throw new Error('AnkiConnect响应错误');
            }
        } catch (error) {
            this.connected = false;
            if (this.ankiStatusIndicator) {
                this.ankiStatusIndicator.className = 'status-indicator status-disconnected';
            }
            if (this.ankiStatusText) {
                this.ankiStatusText.textContent = 'Anki未连接';
            }
            console.error('Anki连接错误:', error);
            
            // 显示错误状态
            this.app.modules.ui.showError('无法连接到AnkiConnect，请确保Anki正在运行且AnkiConnect插件已安装');
        }
        
        // 更新应用状态
        this.app.setState({ ankiConnected: this.connected });
    }

    // 发送Anki请求
    async makeAnkiRequest(action, params) {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                version: 6,
                params: params
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        return await response.json();
    }

    // 获取Anki牌组列表
    async loadDecks() {
        try {
            const response = await this.makeAnkiRequest('deckNames', {});
            this.decks = response.result;
            
            // 更新牌组选择框
            if (this.deckSelect) {
                this.deckSelect.innerHTML = '';
                this.decks.forEach(deck => {
                    const option = document.createElement('option');
                    option.value = deck;
                    option.textContent = deck;
                    this.deckSelect.appendChild(option);
                });
            }
            
            // 加载保存的配置
            this.loadConfig();
            
        } catch (error) {
            console.error('获取牌组列表错误:', error);
        }
    }

    // 获取Anki模型列表
    async loadModels() {
        try {
            const response = await this.makeAnkiRequest('modelNames', {});
            this.models = response.result;
            
            // 更新模型选择框
            if (this.modelSelect) {
                this.modelSelect.innerHTML = '';
                this.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    this.modelSelect.appendChild(option);
                });
            }
            
            // 加载保存的配置
            this.loadConfig();
            
            // 默认选择第一个模型并加载字段
            if (this.models.length > 0 && (!this.modelSelect.value || this.modelSelect.value === '')) {
                this.modelSelect.value = this.models[0];
                await this.loadModelFields(this.models[0]);
            } else if (this.modelSelect.value) {
                // 如果已有保存的模型，加载其字段
                await this.loadModelFields(this.modelSelect.value);
            }
            
        } catch (error) {
            console.error('获取模型列表错误:', error);
        }
    }

    // 获取模型字段
    async loadModelFields(modelName) {
        try {
            const response = await this.makeAnkiRequest('modelFieldNames', {
                modelName: modelName
            });
            
            this.currentModelFields = response.result;
            
            // 更新字段选择框
            this.updateFieldSelects();
            
            // 加载保存的配置
            this.loadConfig();
            
            // 如果字段为空，尝试智能设置默认字段
            if (!this.wordFieldSelect.value) {
                this.setDefaultFields();
            }
            
        } catch (error) {
            console.error('获取模型字段错误:', error);
        }
    }

    // 更新字段选择框
    updateFieldSelects() {
        if (!this.currentModelFields || this.currentModelFields.length === 0) return;
        
        // 清空所有选择框
        const selects = [
            this.wordFieldSelect,
            this.sentenceFieldSelect,
            this.definitionFieldSelect,
            this.audioFieldSelect,
            this.imageFieldSelect
        ];
        
        selects.forEach(select => {
            if (select) {
                select.innerHTML = '';
            }
        });
        
        // 填充字段选项
        this.currentModelFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field;
            
            selects.forEach(select => {
                if (select) {
                    select.appendChild(option.cloneNode(true));
                }
            });
        });
    }

    // 智能设置默认字段
    setDefaultFields() {
        const fields = this.currentModelFields.map(f => f.toLowerCase());
        
        // 设置单词字段
        if (fields.includes('word')) {
            this.setSelectValue(this.wordFieldSelect, 'word');
        } else if (fields.includes('front')) {
            this.setSelectValue(this.wordFieldSelect, 'front');
        } else if (this.currentModelFields.length > 0) {
            this.setSelectValue(this.wordFieldSelect, this.currentModelFields[0]);
        }
        
        // 设置句子字段
        if (fields.includes('sentence')) {
            this.setSelectValue(this.sentenceFieldSelect, 'sentence');
        } else if (fields.includes('example')) {
            this.setSelectValue(this.sentenceFieldSelect, 'example');
        } else if (fields.includes('back')) {
            this.setSelectValue(this.sentenceFieldSelect, 'back');
        } else if (this.currentModelFields.length > 1) {
            this.setSelectValue(this.sentenceFieldSelect, this.currentModelFields[1]);
        }
        
        // 设置释义字段
        if (fields.includes('definition')) {
            this.setSelectValue(this.definitionFieldSelect, 'definition');
        } else if (fields.includes('meaning')) {
            this.setSelectValue(this.definitionFieldSelect, 'meaning');
        } else if (fields.includes('back')) {
            this.setSelectValue(this.definitionFieldSelect, 'back');
        } else if (this.currentModelFields.length > 2) {
            this.setSelectValue(this.definitionFieldSelect, this.currentModelFields[2]);
        }
        
        // 设置音频字段
        if (fields.includes('audio')) {
            this.setSelectValue(this.audioFieldSelect, 'audio');
        } else if (fields.includes('sound')) {
            this.setSelectValue(this.audioFieldSelect, 'sound');
        } else if (this.currentModelFields.length > 3) {
            this.setSelectValue(this.audioFieldSelect, this.currentModelFields[3]);
        }
        
        // 设置图片字段
        if (fields.includes('image')) {
            this.setSelectValue(this.imageFieldSelect, 'image');
        } else if (fields.includes('picture')) {
            this.setSelectValue(this.imageFieldSelect, 'picture');
        } else if (this.currentModelFields.length > 4) {
            this.setSelectValue(this.imageFieldSelect, this.currentModelFields[4]);
        }
        
        // 保存配置
        this.saveConfig();
    }

    // 设置选择框值
    setSelectValue(select, value) {
        if (select) {
            select.value = value;
        }
    }

    // 处理Anki卡片
    async processAnkiCard(word, definition, sentence = '') {
        // 准备Anki卡片数据
        const note = {
            deckName: this.deckSelect ? this.deckSelect.value : '',
            modelName: this.modelSelect ? this.modelSelect.value : '',
            fields: {
                [this.wordFieldSelect ? this.wordFieldSelect.value : 'word']: word,
                [this.sentenceFieldSelect ? this.sentenceFieldSelect.value : 'sentence']: sentence,
                [this.definitionFieldSelect ? this.definitionFieldSelect.value : 'definition']: definition
            },
            options: {
                allowDuplicate: false
            },
            tags: ['media-player']
        };
        
        // 如果有音频，先处理音频
        const audioBuffer = this.modules.player.audioBuffer;
        const audioContext = this.modules.player.audioContext;
        const currentSubtitleIndex = this.modules.subtitle.getCurrentSubtitleIndex();
        
        if (audioBuffer && audioContext && currentSubtitleIndex >= 0) {
            try {
                const audioFileName = await this.processAudioFile(word, currentSubtitleIndex);
                if (audioFileName && this.audioFieldSelect && this.audioFieldSelect.value) {
                    note.fields[this.audioFieldSelect.value] = `[sound:${audioFileName}]`;
                    console.log('音频字段设置:', audioFileName);
                }
            } catch (error) {
                console.error('音频处理失败:', error);
                // 即使音频处理失败，仍然继续添加卡片
            }
        }
        
        // 如果有图片字段设置，则截图
        if (this.imageFieldSelect && this.imageFieldSelect.value && 
            this.state.currentMediaType === 'video' && this.state.currentMediaFile) {
            try {
                const imageFileName = await this.captureVideoFrame(word);
                if (imageFileName) {
                    note.fields[this.imageFieldSelect.value] = `<img src="${imageFileName}">`;
                    console.log('图片字段设置:', imageFileName);
                }
            } catch (error) {
                console.error('截图失败:', error);
                // 即使截图失败，仍然继续添加卡片
            }
        }
        
        // 添加卡片到Anki
        return await this.addCardToAnki(note);
    }

    // 处理音频文件并返回实际存储名
    async processAudioFile(word, subtitleIndex) {
        try {
            const audioBlob = await this.modules.player.generateAudioClip(subtitleIndex);
            const audioFileName = this.generateAudioFileName(word);
            console.log('准备存储音频文件:', audioFileName);

            const base64Audio = await this.blobToBase64(audioBlob);

            const response = await this.makeAnkiRequest('storeMediaFile', {
                filename: audioFileName,
                data: base64Audio.split(',')[1],
                deleteExisting: true // 允许覆盖，防止自动改名
            });

            if (response.error) {
                console.error('存储音频文件失败:', response.error);
                return null;
            }

            // 使用返回的 result 字段（实际文件名）
            const storedName = response.result || audioFileName;
            console.log('音频文件实际存储名:', storedName);
            return storedName;

        } catch (error) {
            console.error('音频处理错误:', error);
            return null;
        }
    }

    // 截图功能
    async captureVideoFrame(word) {
        return new Promise((resolve, reject) => {
            try {
                // 创建canvas元素
                const canvas = document.createElement('canvas');
                const video = document.getElementById('player');
                
                if (!video || !video.videoWidth || !video.videoHeight) {
                    reject(new Error('视频未准备好或未加载'));
                    return;
                }
                
                // 设置canvas尺寸与视频一致
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // 绘制视频当前帧到canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // 将canvas转换为Blob
                canvas.toBlob(async (blob) => {
                    try {
                        const imageFileName = this.generateImageFileName(word);
                        const base64Image = await this.blobToBase64(blob);

                        const response = await this.makeAnkiRequest('storeMediaFile', {
                            filename: imageFileName,
                            data: base64Image.split(',')[1],
                            deleteExisting: true
                        });

                        if (response.error) {
                            console.error('存储图片文件失败:', response.error);
                            reject(new Error(response.error));
                            return;
                        }

                        // 使用返回的 result 字段（实际文件名）
                        const storedName = response.result || imageFileName;
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

    // 生成音频文件名
    generateAudioFileName(word) {
        const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase() || 'audio';
        // 增加时间戳避免重名
        let fileName = `audio_${cleanWord}_${Date.now()}.wav`;
        fileName = fileName.replace(/[^\w.\-]/g, '_');
        return fileName;
    }

    // 生成图片文件名
    generateImageFileName(word) {
        const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase() || 'screenshot';
        // 增加时间戳避免重名
        let fileName = `screenshot_${cleanWord}_${Date.now()}.jpg`;
        fileName = fileName.replace(/[^\w.\-]/g, '_');
        return fileName;
    }

    // 将Blob转换为Base64
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // 添加卡片到Anki
    async addCardToAnki(note) {
        console.log('准备添加卡片到 Anki:', note);

        try {
            const response = await this.makeAnkiRequest('addNote', { note });

            // 检查 API 层面错误
            if (response.error) {
                // 常见情况：卡片已存在
                if (response.error.includes('cannot create note because it is a duplicate')) {
                    console.warn('检测到重复卡片，未添加:', note.fields);
                    this.showStatusMessage('⚠️ 已存在相同卡片，跳过添加。');
                    return null;
                } else {
                    console.error('添加卡片失败:', response.error);
                    console.error('卡片数据:', note);
                    this.showStatusMessage('❌ 添加卡片失败，请查看控制台日志。');
                    throw new Error(response.error);
                }
            }

            // 确保 result.result 存在
            if (!response.result) {
                console.warn('AnkiConnect 返回空结果，可能未创建卡片。');
                this.showStatusMessage('⚠️ 未创建卡片，可能是重复或模型不匹配。');
                return null;
            }

            console.log('✅ 卡片添加成功，ID:', response.result);
            this.showStatusMessage('✅ 卡片已成功添加到 Anki!');
            return response.result;

        } catch (error) {
            console.error('❌ 与 AnkiConnect 通信失败:', error);
            this.showStatusMessage('❌ 无法连接到 AnkiConnect，请确认它已运行。');
            return null;
        }
    }

    // 显示状态消息
    showStatusMessage(message) {
        this.app.modules.ui.showNotification(message);
    }

    // 切换配置显示/隐藏
    toggleConfigVisibility() {
        const isHidden = this.autoConfigSection.classList.contains('hidden');
        if (isHidden) {
            this.autoConfigSection.classList.remove('hidden');
            if (this.showConfigBtn) {
                this.showConfigBtn.textContent = '收起';
            }
        } else {
            this.autoConfigSection.classList.add('hidden');
            if (this.showConfigBtn) {
                this.showConfigBtn.textContent = '配置';
            }
        }
    }

    // 保存配置到localStorage
    saveConfig() {
        const config = {
            deck: this.deckSelect ? this.deckSelect.value : '',
            model: this.modelSelect ? this.modelSelect.value : '',
            wordField: this.wordFieldSelect ? this.wordFieldSelect.value : '',
            sentenceField: this.sentenceFieldSelect ? this.sentenceFieldSelect.value : '',
            definitionField: this.definitionFieldSelect ? this.definitionFieldSelect.value : '',
            audioField: this.audioFieldSelect ? this.audioFieldSelect.value : '',
            imageField: this.imageFieldSelect ? this.imageFieldSelect.value : ''
        };
        
        localStorage.setItem('ankiConfig', JSON.stringify(config));
        console.log('Anki配置已保存');
    }

    // 从localStorage加载配置
    loadConfig() {
        const savedConfig = localStorage.getItem('ankiConfig');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                
                if (config.deck && this.deckSelect) this.deckSelect.value = config.deck;
                if (config.model && this.modelSelect) this.modelSelect.value = config.model;
                if (config.wordField && this.wordFieldSelect) this.wordFieldSelect.value = config.wordField;
                if (config.sentenceField && this.sentenceFieldSelect) this.sentenceFieldSelect.value = config.sentenceField;
                if (config.definitionField && this.definitionFieldSelect) this.definitionFieldSelect.value = config.definitionField;
                if (config.audioField && this.audioFieldSelect) this.audioFieldSelect.value = config.audioField;
                if (config.imageField && this.imageFieldSelect) this.imageFieldSelect.value = config.imageField;
                
                console.log('Anki配置已加载');
            } catch (e) {
                console.error('加载配置失败:', e);
            }
        }
    }

    // 获取连接状态
    isConnected() {
        return this.connected;
    }

    // 获取配置
    getConfig() {
        return {
            deck: this.deckSelect ? this.deckSelect.value : '',
            model: this.modelSelect ? this.modelSelect.value : '',
            wordField: this.wordFieldSelect ? this.wordFieldSelect.value : '',
            sentenceField: this.sentenceFieldSelect ? this.sentenceFieldSelect.value : '',
            definitionField: this.definitionFieldSelect ? this.definitionFieldSelect.value : '',
            audioField: this.audioFieldSelect ? this.audioFieldSelect.value : '',
            imageField: this.imageFieldSelect ? this.imageFieldSelect.value : ''
        };
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'appInitialized':
                this.checkConnection();
                break;
                
            case 'addToAnkiRequested':
                this.processAnkiCard(data.word, data.definition, data.sentence);
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 清理事件监听器
        // 注意：在实际实现中需要保存事件监听器引用以便移除
    }
}