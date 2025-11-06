// 工具函数

// 格式化时间显示
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 清理字幕文本
function cleanSubtitleText(text) {
    text = text.replace(/<[^>]*>/g, '');
    text = text.replace(/[\s,，.。!！?？(（\[]*[-–—]?[0-9０-９]+[)\]）]*\s*$/u, '');
    text = text.replace(/([,.，。!！?？])\s*[0-9０-９]+\s*$/u, '$1');
    text = text.replace(/\s+/g, ' ');
    return text.trim();
}

// HTML转义
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 显示通知
function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// 查找当前字幕索引
function findCurrentSubtitleIndex(currentTime) {
    for (let i = 0; i < subtitles.length; i++) {
        if (currentTime >= subtitles[i].start && currentTime < subtitles[i].end) {
            return i;
        }
    }
    return -1;
}

// 查找下一个字幕索引
function findNextSubtitleIndex(currentTime) {
    for (let i = 0; i < subtitles.length; i++) {
        if (subtitles[i].start > currentTime) {
            return i;
        }
    }
    return subtitles.length - 1;
}

// 查找上一个字幕索引
function findPrevSubtitleIndex(currentTime) {
    for (let i = subtitles.length - 1; i >= 0; i--) {
        if (subtitles[i].end < currentTime) {
            return i;
        }
    }
    return 0;
}

// 创建可点击的字幕内容
function createClickableSubtitleContent(text, index) {
    if (currentLanguageMode === 'english') {
        const wordRegex = /[a-zA-Z]+(?:[''’][a-zA-Z]+)*/g;
        let lastIndex = 0;
        let clickableWords = '';
        
        let match;
        while ((match = wordRegex.exec(text)) !== null) {
            clickableWords += text.substring(lastIndex, match.index);
            clickableWords += `<span class="word selectable-word" data-word="${match[0]}" data-index="${index}">${match[0]}</span>`;
            lastIndex = match.index + match[0].length;
        }
        
        clickableWords += text.substring(lastIndex);
        return clickableWords;
    } else {
        return `<span class="japanese-sentence selectable-text" data-sentence="${text}" data-index="${index}">${text}</span>`;
    }
}

// 将Blob转换为Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}