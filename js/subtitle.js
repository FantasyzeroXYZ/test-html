// 字幕管理模块
function initSubtitleSystem(player) {
    let subtitles = [];
    let subtitleVisible = true;
    let currentHighlightedWord = null;
    let wasPlayingBeforeHover = false;
    let hoverTimer = null;
    
    // 解析字幕文件（简单SRT格式解析）
    function parseSubtitle(content) {
        subtitles = [];
        
        // 简单的SRT解析器
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
                            text: text
                        });
                    }
                }
            }
        });
        
        // 如果没有解析到字幕，使用默认字幕
        if (subtitles.length === 0) {
            subtitles = [
                { start: 0, end: 5, text: "Welcome to our English learning audio player." },
                { start: 5, end: 10, text: "This player supports subtitles and vocabulary lookup." },
                { start: 10, end: 15, text: "You can select any word in the subtitle to look up its meaning." },
                { start: 15, end: 20, text: "This is especially useful for language learners." },
                { start: 20, end: 25, text: "Let's begin our English learning journey!" }
            ];
        }
        
        // 按开始时间排序
        subtitles.sort((a, b) => a.start - b.start);
        
        // 更新初始字幕显示
        updateSubtitle(0);
        
        return subtitles.length;
    }
    
    // 更新字幕显示
    function updateSubtitle(currentTime) {
        if (subtitles.length === 0) return;
        
        const currentSubtitle = subtitles.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        const subtitleText = document.getElementById('subtitle-text');
        
        if (currentSubtitle) {
            // 改进的字幕文本转换，修复句末单词无法点击的问题
            // 使用更复杂的正则表达式匹配单词，包括句末单词
            const text = currentSubtitle.text;
            
            // 使用正则表达式匹配单词，包括带有标点符号的单词
            const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
            let lastIndex = 0;
            let clickableWords = '';
            
            let match;
            while ((match = wordRegex.exec(text)) !== null) {
                // 添加匹配前的非单词部分
                clickableWords += text.substring(lastIndex, match.index);
                
                // 添加可点击的单词
                clickableWords += `<span class="word" data-word="${match[0]}">${match[0]}</span>`;
                
                lastIndex = match.index + match[0].length;
            }
            
            // 添加剩余的非单词部分
            clickableWords += text.substring(lastIndex);
            
            subtitleText.innerHTML = clickableWords;
            
            // 为每个单词添加点击事件
            document.querySelectorAll('.word').forEach(wordElem => {
                wordElem.addEventListener('click', function() {
                    const word = this.getAttribute('data-word');
                    
                    // 高亮显示选中的单词
                    if (currentHighlightedWord) {
                        currentHighlightedWord.classList.remove('highlight');
                    }
                    this.classList.add('highlight');
                    currentHighlightedWord = this;
                    
                    // 返回单词供其他模块使用
                    if (typeof window.onWordClick === 'function') {
                        window.onWordClick(word);
                    }
                });
            });
            
            subtitleText.style.opacity = '1';
        } else {
            subtitleText.style.opacity = '0.5';
        }
    }
    
    // 切换字幕显示/隐藏
    function toggleSubtitle() {
        subtitleVisible = !subtitleVisible;
        const subtitleDisplay = document.getElementById('subtitle-display');
        subtitleDisplay.style.display = subtitleVisible ? 'block' : 'none';
        return subtitleVisible;
    }
    
    // 初始化悬浮暂停功能
    function initHoverPause() {
        const subtitleDisplay = document.getElementById('subtitle-display');
        
        if (!subtitleDisplay) {
            console.error('字幕显示区域未找到');
            return;
        }
        
        // 鼠标进入字幕区域
        subtitleDisplay.addEventListener('mouseenter', function() {
            // 清除之前的计时器
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
            
            // 延迟暂停，避免快速划过时的频繁暂停
            hoverTimer = setTimeout(() => {
                // 检查播放器是否正在播放
                if (player && !player.paused) {
                    wasPlayingBeforeHover = true;
                    player.pause();
                    console.log('字幕区域悬浮，暂停播放');
                }
            }, 300); // 300ms延迟
        });
        
        // 鼠标离开字幕区域
        subtitleDisplay.addEventListener('mouseleave', function() {
            // 清除计时器
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            
            // 如果之前是播放状态，恢复播放
            if (wasPlayingBeforeHover && player) {
                player.play().then(() => {
                    wasPlayingBeforeHover = false;
                    console.log('离开字幕区域，恢复播放');
                }).catch(error => {
                    console.error('恢复播放失败:', error);
                });
            }
        });
        
        // 触摸设备支持
        subtitleDisplay.addEventListener('touchstart', function() {
            if (player && !player.paused) {
                wasPlayingBeforeHover = true;
                player.pause();
                console.log('触摸字幕区域，暂停播放');
            }
        });
        
        subtitleDisplay.addEventListener('touchend', function() {
            if (wasPlayingBeforeHover && player) {
                // 延迟恢复播放，避免立即恢复
                setTimeout(() => {
                    player.play().then(() => {
                        wasPlayingBeforeHover = false;
                        console.log('触摸结束，恢复播放');
                    }).catch(error => {
                        console.error('恢复播放失败:', error);
                    });
                }, 1000); // 1秒后恢复
            }
        });
    }
    
    // 监听播放器时间更新
    player.on('timeupdate', event => {
        updateSubtitle(player.currentTime);
    });
    
    // 初始化悬浮暂停功能
    initHoverPause();
    
    // 返回公共API
    return {
        parseSubtitle,
        updateSubtitle,
        toggleSubtitle,
        getSubtitles: () => subtitles
    };
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSubtitleSystem };
}