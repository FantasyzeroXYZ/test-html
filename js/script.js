// 获取DOM元素
const videoPlayer = document.getElementById('videoPlayer');
const fullscreenVideoPlayer = document.getElementById('fullscreenVideoPlayer');
const videoFileInput = document.getElementById('videoFile');
const subtitleFileInput = document.getElementById('subtitleFile');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
const dictBtn = document.getElementById('dictBtn');
const dictionaryPanel = document.getElementById('dictionaryPanel');
const closeDictBtn = document.getElementById('closeDictBtn');
const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const dictResult = document.getElementById('dictResult');
const subtitlesList = document.getElementById('subtitlesList');
const currentSubtitle = document.getElementById('currentSubtitle');
const fullscreenSubtitle = document.getElementById('fullscreenSubtitle');
const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
const subtitleCount = document.getElementById('subtitleCount');

// 存储解析后的字幕数据
let subtitles = [];
let isFullscreen = false;

// 初始：确保隐藏的播放器默认静音，避免加载或意外播放时造成回音
fullscreenVideoPlayer.muted = true;

// 视频文件上传处理
videoFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        videoPlayer.src = url;
        fullscreenVideoPlayer.src = url;
        // 保证默认非全屏时普通播放器发声，全屏播放器静音并暂停
        videoPlayer.muted = false;
        fullscreenVideoPlayer.muted = true;
        fullscreenVideoPlayer.pause();
        currentSubtitle.innerHTML = '<div class="status-message">视频已加载，请上传字幕文件</div>';
        fullscreenSubtitle.innerHTML = '<div class="status-message">视频已加载，请上传字幕文件</div>';
    }
});

// 字幕文件上传处理
subtitleFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const srtContent = e.target.result;
            subtitles = parseSRT(srtContent);
            displaySubtitlesList(subtitles);
            subtitleCount.textContent = `${subtitles.length} 条字幕`;
            
            if (subtitles.length > 0) {
                currentSubtitle.innerHTML = '<div class="status-message">开始播放视频以显示当前字幕</div>';
                fullscreenSubtitle.innerHTML = '<div class="status-message">开始播放视频以显示当前字幕</div>';
            }
        };
        reader.readAsText(file);
    }
});

// 解析SRT字幕文件
function parseSRT(srtContent) {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\r?\n\r?\n/);
    
    for (const block of blocks) {
        const lines = block.split(/\r?\n/);
        if (lines.length < 3) continue;
        
        // 解析时间轴
        const timeLine = lines[1];
        const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        
        if (timeMatch) {
            const startTime = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
            const endTime = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
            
            // 合并文本行
            const text = lines.slice(2).join(' ');
            
            subtitles.push({
                start: startTime,
                end: endTime,
                text: text
            });
        }
    }
    
    return subtitles;
}

// 将时间字符串转换为秒
function parseTime(hours, minutes, seconds, milliseconds) {
    return parseInt(hours) * 3600 + 
           parseInt(minutes) * 60 + 
           parseInt(seconds) + 
           parseInt(milliseconds) / 1000;
}

// 显示字幕列表
function displaySubtitlesList(subtitles) {
    if (subtitles.length === 0) {
        subtitlesList.innerHTML = '<div class="status-message">没有找到有效的字幕</div>';
        return;
    }
    
    let html = '';
    subtitles.forEach((sub, index) => {
        const startTime = formatTime(sub.start);
        const endTime = formatTime(sub.end);
        
        html += `
            <div class="subtitle-line" data-index="${index}">
                <span class="subtitle-time">[${startTime} - ${endTime}]</span>
                <span>${escapeHtml(sub.text)}</span>
            </div>
        `;
    });
    
    subtitlesList.innerHTML = html;
    
    // 为字幕行添加点击事件（点击跳到该字幕时间），只让当前活动播放器播放，另一个暂停
    document.querySelectorAll('.subtitle-line').forEach(line => {
        line.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const subtitle = subtitles[index];
            if (isFullscreen) {
                fullscreenVideoPlayer.currentTime = subtitle.start;
                fullscreenVideoPlayer.play().catch(()=>{});
                // 保持普通播放器静音/暂停，避免重音
                videoPlayer.pause();
                videoPlayer.currentTime = subtitle.start;
            } else {
                videoPlayer.currentTime = subtitle.start;
                videoPlayer.play().catch(()=>{});
                fullscreenVideoPlayer.pause();
                fullscreenVideoPlayer.currentTime = subtitle.start;
            }
        });
    });
}

// 格式化时间显示
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新当前显示的字幕
function updateCurrentSubtitle() {
    const currentTime = isFullscreen ? fullscreenVideoPlayer.currentTime : videoPlayer.currentTime;
    let currentSub = null;
    
    // 查找当前时间对应的字幕
    for (const sub of subtitles) {
        if (currentTime >= sub.start && currentTime <= sub.end) {
            currentSub = sub;
            break;
        }
    }
    
    if (currentSub) {
        // 将字幕文本中的单词转换为可点击的元素（不在此处添加事件监听）
        const words = currentSub.text.split(/(\s+)/);
        const html = words.map(word => {
            if (word.trim() === '') return word;
            // 只对英文单词添加点击功能
            if (/^[a-zA-Z]+$/.test(word)) {
                return `<span class="word-span" data-word="${escapeHtml(word)}">${escapeHtml(word)}</span>`;
            }
            return escapeHtml(word);
        }).join('');
        
        if (isFullscreen) {
            fullscreenSubtitle.innerHTML = html;
        } else {
            currentSubtitle.innerHTML = html;
        }
    } else {
        // 当没有字幕时不一直显示"无字幕"，清空内容（避免闪烁）
        if (isFullscreen) {
            fullscreenSubtitle.innerHTML = '';
        } else {
            currentSubtitle.innerHTML = '';
        }
    }
}

// 视频时间更新事件
videoPlayer.addEventListener('timeupdate', updateCurrentSubtitle);
fullscreenVideoPlayer.addEventListener('timeupdate', updateCurrentSubtitle);

// 同步两个视频播放器的状态（只同步时间，避免同时发声）
videoPlayer.addEventListener('play', function() {
    if (!isFullscreen) {
        // 当非全屏时，确保全屏播放器静音并暂停，防止声音叠加
        fullscreenVideoPlayer.pause();
        fullscreenVideoPlayer.muted = true;
        fullscreenVideoPlayer.currentTime = videoPlayer.currentTime;
        videoPlayer.muted = false;
    }
});

videoPlayer.addEventListener('pause', function() {
    if (!isFullscreen) {
        fullscreenVideoPlayer.pause();
    }
});

fullscreenVideoPlayer.addEventListener('play', function() {
    if (isFullscreen) {
        // 全屏播放时暂停普通播放器并静音普通播放器
        videoPlayer.pause();
        videoPlayer.muted = true;
        videoPlayer.currentTime = fullscreenVideoPlayer.currentTime;
        fullscreenVideoPlayer.muted = false;
    }
});

fullscreenVideoPlayer.addEventListener('pause', function() {
    if (isFullscreen) {
        videoPlayer.pause();
    }
});

// 切换全屏模式
function enterFullscreen() {
    if (!document.fullscreenElement) {
        // 记录进入全屏前普通播放器是否在播放
        const wasPlaying = !videoPlayer.paused && !videoPlayer.ended;

        // 同步时间到全屏播放器
        fullscreenVideoPlayer.currentTime = videoPlayer.currentTime;

        // 暂停并静音普通播放器以避免声音叠加
        videoPlayer.muted = true;
        videoPlayer.pause();

        // 确保全屏播放器准备好（解除静音）
        fullscreenVideoPlayer.muted = false;

        // 先请求浏览器全屏，只有在成功进入全屏后再尝试播放全屏播放器
        document.documentElement.requestFullscreen().then(() => {
            // 进入全屏后的 DOM 和 UI 更新
            document.body.classList.add('fullscreen-mode');
            fullscreenVideoContainer.style.display = 'flex';
            fullscreenSubtitle.style.display = 'flex';
            // 隐藏控件以保证画面无遮挡
            try { fullscreenVideoPlayer.controls = false; } catch (e) {}
            isFullscreen = true;

            // 如果进入全屏前是播放状态，则在全屏播放器上继续播放
            if (wasPlaying) {
                fullscreenVideoPlayer.play().catch(()=>{});
            }

            updateCurrentSubtitle(); // 更新全屏字幕
        }).catch(err => {
            console.error(`全屏请求错误: ${err.message}`);
            // 如果请求全屏失败，恢复普通播放器声音状态
            videoPlayer.muted = false;
            fullscreenVideoPlayer.muted = true;
        });
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(()=>{});
        document.body.classList.remove('fullscreen-mode');
        fullscreenVideoContainer.style.display = 'none';
        fullscreenSubtitle.style.display = 'none';
        isFullscreen = false;
        
        // 恢复普通播放器声音并同步时间与播放状态
        videoPlayer.currentTime = fullscreenVideoPlayer.currentTime;
        videoPlayer.muted = false;
        if (!fullscreenVideoPlayer.paused) {
            videoPlayer.play().catch(()=>{});
        }
        // 停止并静音全屏播放器以避免回音
        fullscreenVideoPlayer.pause();
        fullscreenVideoPlayer.muted = true;
        // 恢复全屏播放器控件状态（隐藏时无需显示）
        try { fullscreenVideoPlayer.controls = true; } catch (e) {}
        
        updateCurrentSubtitle(); // 更新普通模式字幕
    }
}

fullscreenBtn.addEventListener('click', enterFullscreen);
exitFullscreenBtn.addEventListener('click', exitFullscreen);

// 监听全屏变化（如按 ESC）
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        // 当退出全屏（例如 ESC）时执行与 exitFullscreen 相同的恢复逻辑
        document.body.classList.remove('fullscreen-mode');
        fullscreenVideoContainer.style.display = 'none';
        fullscreenSubtitle.style.display = 'none';
        isFullscreen = false;
        
        // 同步回普通播放器并恢复声音
        videoPlayer.currentTime = fullscreenVideoPlayer.currentTime;
        videoPlayer.muted = false;
        if (!fullscreenVideoPlayer.paused) {
            videoPlayer.play().catch(()=>{});
        }
        
        // 停止并静音全屏播放器，避免并发发声
        fullscreenVideoPlayer.pause();
        fullscreenVideoPlayer.muted = true;
        
        updateCurrentSubtitle(); // 更新普通模式字幕
    }
});

// 打开词典面板
dictBtn.addEventListener('click', () => {
    dictionaryPanel.classList.add('active');
});

// 关闭词典面板
closeDictBtn.addEventListener('click', () => {
    dictionaryPanel.classList.remove('active');
});

// 查询单词
searchBtn.addEventListener('click', searchWord);
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWord();
});

// 事件委托：统一处理字幕中单词点击，避免重复绑定和绑定遗漏
document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains('word-span')) {
        const word = target.getAttribute('data-word');
        if (word) {
            wordInput.value = word;
            searchWord();
            dictionaryPanel.classList.add('active');
        }
    }
});

// 支持划词查询（鼠标抬起时读取选择的文本）
[currentSubtitle, fullscreenSubtitle].forEach(container => {
    container.addEventListener('mouseup', () => {
        const sel = (window.getSelection && window.getSelection().toString().trim()) || '';
        if (sel && /^[a-zA-Z]+$/.test(sel)) {
            wordInput.value = sel;
            searchWord();
            dictionaryPanel.classList.add('active');
        }
    });
});

// 查询单词函数
async function searchWord() {
    const word = wordInput.value.trim();
    
    if (!word) {
        dictResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    dictResult.innerHTML = '<div class="loading">查询中...</div>';
    
    try {
        // 使用Free Dictionary API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        
        if (!response.ok) {
            throw new Error('单词未找到');
        }
        
        const data = await response.json();
        displayResult(data[0]);
    } catch (error) {
        dictResult.innerHTML = `<div class="error">错误: ${error.message}</div>`;
    }
}

// 显示查询结果
function displayResult(wordData) {
    let html = `
        <div class="word-header">
            <h2 class="word-title">${escapeHtml(wordData.word)}</h2>
    `;
    
    if (wordData.phonetic) {
        html += `<div class="phonetic">${escapeHtml(wordData.phonetic)}</div>`;
    }
    
    html += `</div>`;
    
    if (wordData.meanings && wordData.meanings.length > 0) {
        wordData.meanings.forEach(meaning => {
            html += `<div class="meaning-section">
                <div class="part-of-speech">${escapeHtml(meaning.partOfSpeech)}</div>`;
            
            if (meaning.definitions && meaning.definitions.length > 0) {
                meaning.definitions.forEach((def, index) => {
                    if (index < 3) { // 只显示前三个定义
                        html += `<div class="definition">${index + 1}. ${escapeHtml(def.definition)}</div>`;
                        if (def.example) {
                            html += `<div class="example">${escapeHtml(def.example)}</div>`;
                        }
                    }
                });
            }
            
            html += `</div>`;
        });
    } else {
        html += `<div class="meaning-section">
            <div class="definition">未找到该单词的详细释义。</div>
        </div>`;
    }
    
    dictResult.innerHTML = html;
}

// HTML转义函数
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 初始化播放器事件
videoPlayer.addEventListener('loadedmetadata', function() {
    console.log('视频时长: ' + videoPlayer.duration + '秒');
});

videoPlayer.addEventListener('play', function() {
    console.log('视频开始播放');
});

videoPlayer.addEventListener('pause', function() {
    console.log('视频已暂停');
});