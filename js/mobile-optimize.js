// 移动端优化功能

// 优化移动端顶部栏布局
function optimizeMobileLayout() {
    if (!isMobileDevice) return;
    
    // 调整顶部按钮布局
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
        headerControls.style.flexWrap = 'wrap';
        headerControls.style.gap = '8px';
        headerControls.style.justifyContent = 'center';
    }
    
    // 调整控制按钮大小
    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(btn => {
        btn.style.padding = '8px 12px';
        btn.style.fontSize = '14px';
    });
    
    // 优化词典面板在移动端的显示
    optimizeDictionaryPanelForMobile();
}

// 优化移动端词典面板
function optimizeDictionaryPanelForMobile() {
    if (!isMobileDevice) return;
    
    // 调整搜索框和按钮大小
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.flexDirection = 'column';
        searchContainer.style.gap = '8px';
    }
    
    const searchInput = document.getElementById('panel-search-input');
    const searchBtn = document.getElementById('panel-search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.style.fontSize = '16px'; // 防止iOS缩放
        searchInput.style.padding = '10px';
        searchBtn.style.padding = '10px 16px';
        searchBtn.style.fontSize = '14px';
    }
    
    // 确保Anki按钮可见
    const addToAnkiBtn = document.getElementById('panel-add-to-anki-btn');
    if (addToAnkiBtn) {
        addToAnkiBtn.style.margin = '10px 0';
        addToAnkiBtn.style.padding = '12px 16px';
        addToAnkiBtn.style.fontSize = '14px';
    }
    
    // 优化原句显示
    const originalSentence = document.getElementById('original-sentence');
    if (originalSentence) {
        originalSentence.style.fontSize = '14px';
        originalSentence.style.lineHeight = '1.4';
    }
}