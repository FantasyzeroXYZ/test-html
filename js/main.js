// 主入口文件 - 协调各模块功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化播放器...');
    
    try {
        // 初始化播放器
        const player = initPlayer();
        
        // 初始化文件处理
        initFileHandlers(player);
        
        // 初始化字幕系统
        const subtitleManager = initSubtitleSystem(player);
        
        // 初始化词典系统
        const dictionaryManager = initDictionarySystem(player, subtitleManager);
        
        // 初始化UI交互
        initUIInteractions(player, subtitleManager, dictionaryManager);
        
        console.log('音频播放器初始化完成');
    } catch (error) {
        console.error('初始化过程中出现错误:', error);
    }
});

// 初始化文件处理
function initFileHandlers(player) {
    console.log('初始化文件处理...');
    
    const audioFileBtn = document.getElementById('audio-file-btn');
    const subtitleFileBtn = document.getElementById('subtitle-file-btn');
    const audioFileInput = document.getElementById('audio-file-input');
    const subtitleFileInput = document.getElementById('subtitle-file-input');
    const audioFileName = document.getElementById('audio-file-name');
    const subtitleFileName = document.getElementById('subtitle-file-name');
    const trackTitle = document.getElementById('track-title');
    const trackDescription = document.getElementById('track-description');
    
    if (!audioFileBtn || !subtitleFileBtn) {
        console.error('文件按钮元素未找到');
        return;
    }
    
    // 文件选择事件处理
    audioFileBtn.addEventListener('click', () => {
        console.log('点击音频文件按钮');
        audioFileInput.click();
    });
    
    subtitleFileBtn.addEventListener('click', () => {
        console.log('点击字幕文件按钮');
        subtitleFileInput.click();
    });
    
    // 音频/视频文件选择处理
    audioFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('选择音频文件:', file.name);
            audioFileName.textContent = file.name;
            trackTitle.textContent = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
            trackDescription.textContent = `文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
            
            // 处理音频文件
            handleAudioFileSelect(file, player);
        }
    });
    
    // 字幕文件选择处理
    subtitleFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('选择字幕文件:', file.name);
            subtitleFileName.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                // 调用字幕模块的解析函数
                if (window.subtitleManager) {
                    window.subtitleManager.parseSubtitle(content);
                }
            };
            reader.onerror = function(error) {
                console.error('读取字幕文件失败:', error);
            };
            reader.readAsText(file);
        }
    });
}

// 初始化UI交互
function initUIInteractions(player, subtitleManager, dictionaryManager) {
    console.log('初始化UI交互...');
    
    const toggleSubtitleBtn = document.getElementById('toggle-subtitle-btn');
    const dictionaryInput = document.getElementById('dictionary-input');
    const dictionaryBtn = document.getElementById('dictionary-btn');
    
    if (!toggleSubtitleBtn || !dictionaryInput || !dictionaryBtn) {
        console.error('UI元素未找到');
        return;
    }
    
    // 显示/隐藏字幕
    toggleSubtitleBtn.addEventListener('click', () => {
        subtitleManager.toggleSubtitle();
    });
    
    // 查询按钮事件
    dictionaryBtn.addEventListener('click', () => {
        const word = dictionaryInput.value.trim();
        dictionaryManager.searchWord(word);
    });
    
    // 输入框回车事件
    dictionaryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const word = dictionaryInput.value.trim();
            dictionaryManager.searchWord(word);
        }
    });
    
    // 将字幕管理器设为全局，供其他模块访问
    window.subtitleManager = subtitleManager;
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initFileHandlers, initUIInteractions };
}