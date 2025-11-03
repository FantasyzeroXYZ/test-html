// 配置管理模块 - 负责应用程序配置的加载、保存和管理
export class Config {
    constructor(app) {
        this.app = app;
        this.modules = app.modules;
        this.state = app.state;
        
        // 配置数据
        this.config = {};
        this.defaultConfig = {};
        
        // 配置键名
        this.configKeys = {
            ANKI: 'ankiConfig',
            UI: 'uiConfig',
            PLAYER: 'playerConfig',
            SUBTITLE: 'subtitleConfig',
            DICTIONARY: 'dictionaryConfig'
        };
        
        this.init();
    }

    init() {
        this.loadDefaultConfig();
        this.loadAllConfig();
        console.log('配置管理模块初始化完成');
    }

    // 加载默认配置
    loadDefaultConfig() {
        this.defaultConfig = {
            // Anki配置
            anki: {
                deck: '',
                model: '',
                wordField: '',
                sentenceField: '',
                definitionField: '',
                audioField: '',
                imageField: '',
                autoConnect: true,
                autoAddCards: false
            },
            
            // UI配置
            ui: {
                languageMode: 'english',
                mediaType: 'video',
                theme: 'dark',
                fontSize: 'medium',
                showHints: true,
                autoHideControls: false,
                panelPosition: 'bottom'
            },
            
            // 播放器配置
            player: {
                defaultVolume: 0.7,
                playbackRate: 1.0,
                autoPlay: false,
                loop: false,
                rememberPosition: true,
                defaultSubtitleLanguage: 'en',
                subtitleOffset: 0
            },
            
            // 字幕配置
            subtitle: {
                displayMode: 'both', // 'both', 'video-only', 'audio-only', 'none'
                fontSize: 'medium',
                textColor: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                highlightColor: '#3498db',
                clickToPause: true,
                autoScroll: true
            },
            
            // 词典配置
            dictionary: {
                defaultSource: 'api', // 'api', 'custom', 'web'
                autoSearch: true,
                showExamples: true,
                showPhonetics: true,
                maxDefinitions: 3,
                webSearchEngine: 'jisho' // 'jisho', 'youdao', 'google'
            },
            
            // 学习配置
            learning: {
                autoPauseOnClick: true,
                showWordFrequency: true,
                difficultyLevel: 'medium',
                reviewInterval: 7,
                dailyGoal: 10
            }
        };
    }

    // 加载所有配置
    loadAllConfig() {
        this.config = { ...this.defaultConfig };
        
        // 分别加载各模块配置
        Object.values(this.configKeys).forEach(key => {
            this.loadConfig(key);
        });
        
        console.log('所有配置已加载');
    }

    // 加载特定配置
    loadConfig(configKey) {
        try {
            const savedConfig = localStorage.getItem(configKey);
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.mergeConfig(this.config, parsedConfig);
                console.log(`配置 ${configKey} 已加载`);
            }
        } catch (error) {
            console.error(`加载配置 ${configKey} 失败:`, error);
        }
    }

    // 合并配置（深度合并）
    mergeConfig(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.mergeConfig(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    // 保存所有配置
    saveAllConfig() {
        Object.entries(this.configKeys).forEach(([module, key]) => {
            this.saveConfig(key, this.config[module]);
        });
    }

    // 保存特定配置
    saveConfig(configKey, configData) {
        try {
            localStorage.setItem(configKey, JSON.stringify(configData));
            console.log(`配置 ${configKey} 已保存`);
        } catch (error) {
            console.error(`保存配置 ${configKey} 失败:`, error);
        }
    }

    // 获取配置值
    get(keyPath, defaultValue = null) {
        const keys = keyPath.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value !== undefined ? value : defaultValue;
    }

    // 设置配置值
    set(keyPath, value) {
        const keys = keyPath.split('.');
        let current = this.config;
        
        // 遍历到倒数第二个键
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // 设置最后一个键的值
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
        
        // 自动保存到对应的配置模块
        this.autoSaveConfig(keyPath);
    }

    // 自动保存配置到对应模块
    autoSaveConfig(keyPath) {
        const module = keyPath.split('.')[0];
        const configKey = this.configKeys[module.toUpperCase()];
        
        if (configKey && this.config[module]) {
            this.saveConfig(configKey, this.config[module]);
        }
    }

    // 重置配置为默认值
    resetConfig(module = null) {
        if (module) {
            // 重置特定模块配置
            if (this.defaultConfig[module]) {
                this.config[module] = { ...this.defaultConfig[module] };
                this.saveConfig(this.configKeys[module.toUpperCase()], this.config[module]);
                console.log(`模块 ${module} 配置已重置`);
            }
        } else {
            // 重置所有配置
            this.config = { ...this.defaultConfig };
            this.saveAllConfig();
            console.log('所有配置已重置为默认值');
        }
        
        // 通知应用配置已更改
        this.app.notifyModules('configChanged', { module, config: this.config });
    }

    // 导出配置
    exportConfig() {
        const configData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            config: this.config
        };
        
        const blob = new Blob([JSON.stringify(configData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `media-player-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // 导入配置
    importConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedConfig = JSON.parse(event.target.result);
                    
                    // 验证配置格式
                    if (!this.validateImportedConfig(importedConfig)) {
                        reject(new Error('配置文件格式无效'));
                        return;
                    }
                    
                    // 合并配置
                    this.mergeConfig(this.config, importedConfig.config);
                    this.saveAllConfig();
                    
                    // 通知应用配置已更改
                    this.app.notifyModules('configChanged', { 
                        module: 'all', 
                        config: this.config 
                    });
                    
                    resolve(this.config);
                    
                } catch (error) {
                    reject(new Error('配置文件解析失败: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    }

    // 验证导入的配置
    validateImportedConfig(importedConfig) {
        return importedConfig && 
               importedConfig.config && 
               typeof importedConfig.config === 'object';
    }

    // 获取配置摘要
    getConfigSummary() {
        return {
            anki: {
                deck: this.config.anki.deck || '未设置',
                model: this.config.anki.model || '未设置',
                connected: this.state.ankiConnected
            },
            ui: {
                languageMode: this.config.ui.languageMode,
                mediaType: this.config.ui.mediaType,
                theme: this.config.ui.theme
            },
            player: {
                volume: Math.round(this.config.player.defaultVolume * 100) + '%',
                playbackRate: this.config.player.playbackRate + 'x'
            },
            subtitle: {
                displayMode: this.config.subtitle.displayMode,
                fontSize: this.config.subtitle.fontSize
            }
        };
    }

    // 监听配置变化
    watch(keyPath, callback) {
        const currentValue = this.get(keyPath);
        let previousValue = currentValue;
        
        // 定期检查配置变化
        const checkInterval = setInterval(() => {
            const newValue = this.get(keyPath);
            if (newValue !== previousValue) {
                callback(newValue, previousValue);
                previousValue = newValue;
            }
        }, 1000);
        
        // 返回清理函数
        return () => clearInterval(checkInterval);
    }

    // 批量设置配置
    batchSet(configUpdates) {
        Object.entries(configUpdates).forEach(([keyPath, value]) => {
            this.set(keyPath, value);
        });
    }

    // 获取配置历史
    getConfigHistory() {
        try {
            const history = localStorage.getItem('configHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('获取配置历史失败:', error);
            return [];
        }
    }

    // 保存配置历史
    saveConfigHistory() {
        try {
            const history = this.getConfigHistory();
            const historyEntry = {
                timestamp: new Date().toISOString(),
                config: { ...this.config }
            };
            
            // 保留最近10个历史记录
            history.unshift(historyEntry);
            if (history.length > 10) {
                history.pop();
            }
            
            localStorage.setItem('configHistory', JSON.stringify(history));
        } catch (error) {
            console.error('保存配置历史失败:', error);
        }
    }

    // 恢复到历史配置
    restoreFromHistory(historyIndex) {
        const history = this.getConfigHistory();
        if (history[historyIndex]) {
            this.config = { ...history[historyIndex].config };
            this.saveAllConfig();
            
            this.app.notifyModules('configChanged', { 
                module: 'all', 
                config: this.config 
            });
            
            return true;
        }
        return false;
    }

    // 验证配置完整性
    validateConfig() {
        const errors = [];
        
        // 检查必要配置
        if (!this.config.anki.deck && this.state.ankiConnected) {
            errors.push('Anki牌组未设置');
        }
        
        if (!this.config.anki.model && this.state.ankiConnected) {
            errors.push('Anki模型未设置');
        }
        
        // 检查配置值范围
        if (this.config.player.defaultVolume < 0 || this.config.player.defaultVolume > 1) {
            errors.push('播放器音量超出有效范围 (0-1)');
        }
        
        if (this.config.player.playbackRate < 0.5 || this.config.player.playbackRate > 2) {
            errors.push('播放速度超出有效范围 (0.5-2)');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // 自动修复配置
    autoFixConfig() {
        const fixes = [];
        
        // 修复音量范围
        if (this.config.player.defaultVolume < 0) {
            this.config.player.defaultVolume = 0;
            fixes.push('音量已设置为最小值 0');
        } else if (this.config.player.defaultVolume > 1) {
            this.config.player.defaultVolume = 1;
            fixes.push('音量已设置为最大值 1');
        }
        
        // 修复播放速度范围
        if (this.config.player.playbackRate < 0.5) {
            this.config.player.playbackRate = 0.5;
            fixes.push('播放速度已设置为最小值 0.5x');
        } else if (this.config.player.playbackRate > 2) {
            this.config.player.playbackRate = 2;
            fixes.push('播放速度已设置为最大值 2x');
        }
        
        // 保存修复后的配置
        if (fixes.length > 0) {
            this.saveAllConfig();
        }
        
        return fixes;
    }

    // 获取配置统计信息
    getConfigStats() {
        const allConfig = JSON.stringify(this.config);
        return {
            totalKeys: this.countConfigKeys(this.config),
            configSize: new Blob([allConfig]).size,
            lastModified: this.getLastModifiedTime(),
            autoSaveEnabled: true
        };
    }

    // 计算配置键数量
    countConfigKeys(obj) {
        let count = 0;
        for (const key in obj) {
            count++;
            if (obj[key] && typeof obj[key] === 'object') {
                count += this.countConfigKeys(obj[key]);
            }
        }
        return count;
    }

    // 获取最后修改时间
    getLastModifiedTime() {
        try {
            const history = this.getConfigHistory();
            return history.length > 0 ? history[0].timestamp : null;
        } catch (error) {
            return null;
        }
    }

    // 事件处理
    handleEvent(event, data) {
        switch (event) {
            case 'appInitialized':
                // 应用初始化时加载配置
                this.loadAllConfig();
                break;
                
            case 'configChangeRequested':
                this.set(data.keyPath, data.value);
                break;
                
            case 'configResetRequested':
                this.resetConfig(data.module);
                break;
                
            case 'configExportRequested':
                this.exportConfig();
                break;
                
            case 'configImportRequested':
                this.importConfig(data.file)
                    .then(() => {
                        this.app.notifyModules('configImportSuccess', { config: this.config });
                    })
                    .catch(error => {
                        this.app.notifyModules('configImportError', { error: error.message });
                    });
                break;
                
            case 'stateChanged':
                // 状态变化时保存配置历史
                if (data.ankiConnected !== undefined) {
                    this.saveConfigHistory();
                }
                break;
        }
    }

    // 销毁方法
    destroy() {
        // 保存最终配置
        this.saveAllConfig();
        this.saveConfigHistory();
    }
}