// 播放器管理模块
function initPlayer() {
    console.log('初始化播放器...');
    
    try {
        // 初始化Plyr播放器 
        const player = new Plyr('#player', {
            controls: [
                'play',
                'progress',
                'current-time',
                'duration',
                'mute',
                'volume'
            ]
        });
        
        console.log('Plyr播放器初始化成功');
        return player;
    } catch (error) {
        console.error('播放器初始化失败:', error);
        // 返回一个基本的播放器对象作为降级方案
        return document.getElementById('player');
    }
}

// 处理音频/视频文件选择
function handleAudioFileSelect(file, player) {
    if (!file) return;
    
    console.log('处理音频文件:', file.name);
    
    // 创建文件URL并设置播放器源
    const fileURL = URL.createObjectURL(file);
    const audioElement = document.querySelector('#player');
    
    if (!audioElement) {
        console.error('音频元素未找到');
        return false;
    }
    
    try {
        // 清除之前的源
        while (audioElement.firstChild) {
            audioElement.removeChild(audioElement.firstChild);
        }
        
        // 添加新的源
        const source = document.createElement('source');
        source.src = fileURL;
        source.type = file.type;
        audioElement.appendChild(source);
        
        // 重新加载播放器
        if (player && player.source) {
            player.source = {
                type: 'audio',
                sources: [{
                    src: fileURL,
                    type: file.type
                }]
            };
        } else {
            // 如果Plyr不可用，直接加载源
            audioElement.load();
        }
        
        // 重置字幕显示
        const subtitleText = document.getElementById('subtitle-text');
        if (subtitleText) {
            subtitleText.innerHTML = "请加载字幕文件<br><strong>点击字幕中的单词即可查询其含义</strong>";
        }
        
        console.log('音频文件加载成功');
        return true;
    } catch (error) {
        console.error('加载音频文件失败:', error);
        return false;
    }
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initPlayer, handleAudioFileSelect };
}