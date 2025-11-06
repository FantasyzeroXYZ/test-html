// 剪贴板处理功能

// 初始化剪贴板功能
function initClipboardFunction() {
    clipboardBtn.addEventListener('click', toggleClipboardFunction);
    updateClipboardButton();

    // 添加剪贴板状态指示到body
    updateClipboardBodyClass();
}

// 切换剪贴板功能
function toggleClipboardFunction() {
    clipboardEnabled = !clipboardEnabled;
    updateClipboardButton();
    updateClipboardBodyClass();

    showNotification(clipboardEnabled ? 
        '剪贴板功能已开启' : 
        '剪贴板功能已关闭');
}

// 更新body类以显示剪贴板状态
function updateClipboardBodyClass() {
    if (clipboardEnabled) {
        document.body.classList.add('clipboard-active');
    } else {
        document.body.classList.remove('clipboard-active');
    }
}

// 更新剪贴板按钮状态
function updateClipboardButton() {
    if (clipboardEnabled) {
        clipboardBtn.classList.add('active');
        clipboardBtn.title = '关闭剪贴板功能';
    } else {
        clipboardBtn.classList.remove('active');
        clipboardBtn.title = '开启剪贴板功能';
    }
}

// 复制单词到剪贴板
function copyWordToClipboard(word) {
    if (!clipboardEnabled) return;

    // 确保单词不为空
    if (!word || word.trim() === '') return;
    
    const cleanWord = word.trim();
    
    navigator.clipboard.writeText(word).then(() => {
        showNotification(`"${word}" 已复制到剪贴板`);
    }).catch(err => {
        console.error('复制失败:', err);
        // 降级方案
        fallbackCopyToClipboard(cleanWord);
    });
}

// 降级复制方案
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 避免滚动到底部
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showNotification(`"${text}" 已复制到剪贴板`);
            console.log('降级复制成功:', text);
        } else {
            showNotification('复制失败，请手动复制');
            console.error('降级复制失败');
        }
    } catch (err) {
        document.body.removeChild(textArea);
        showNotification('复制失败，请手动复制');
        console.error('降级复制异常:', err);
    }
}

// 检查剪贴板API支持
function checkClipboardSupport() {
    if (!navigator.clipboard) {
        console.warn('Clipboard API not supported, using fallback');
        showNotification('当前浏览器不支持剪贴板API，使用兼容模式');
        return false;
    }
    return true;
}

// 在初始化时检查剪贴板支持
function initClipboardSupport() {
    const isSupported = checkClipboardSupport();
    if (!isSupported) {
        // 如果不支持Clipboard API，禁用高级剪贴板功能
        clipboardBtn.style.opacity = '0.6';
        clipboardBtn.title = '当前浏览器不支持剪贴板功能';
    }
}