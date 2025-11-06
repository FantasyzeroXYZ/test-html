// 音频控制功能

// 初始化音频控件
function initAudioControls() {
    if (!audioElement) return;

    audioElement.addEventListener('loadedmetadata', () => {
        if (audioElement.duration) {
            audioDuration.textContent = formatTime(audioElement.duration);
            updateProgressThumb();
            updateVolumeThumb();
        }
    });
    
    audioPlayPauseBtn.addEventListener('click', () => {
        if (audioElement.paused) {
            audioElement.play();
            audioPlayPauseBtn.textContent = '⏸';
            audioPlayPauseBtn.classList.add('active');
        } else {
            audioElement.pause();
            audioPlayPauseBtn.textContent = '▶';
            audioPlayPauseBtn.classList.remove('active');
        }
    });
    
    audioProgress.addEventListener('click', (e) => {
        const rect = audioProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
        updateProgressThumb();
    });
    
    progressThumb.addEventListener('mousedown', startDragProgress);
    progressThumb.addEventListener('touchstart', startDragProgress);
    
    audioVolume.addEventListener('click', (e) => {
        const rect = audioVolume.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.volume = percent;
        updateVolumeThumb();
    });
    
    volumeThumb.addEventListener('mousedown', startDragVolume);
    volumeThumb.addEventListener('touchstart', startDragVolume);
    
    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            audioProgressFilled.style.width = `${percent}%`;
            audioCurrentTime.textContent = formatTime(audioElement.currentTime);
            
            if (!isDraggingProgress) {
                updateProgressThumb();
            }
        }
        updateAudioSubtitles();
    });
    
    audioElement.addEventListener('play', () => {
        audioPlayPauseBtn.textContent = '⏸';
        audioPlayPauseBtn.classList.add('active');
    });
    
    audioElement.addEventListener('pause', () => {
        audioPlayPauseBtn.textContent = '▶';
        audioPlayPauseBtn.classList.remove('active');
    });
    
    audioElement.addEventListener('timeupdate', () => {
        updateSubtitle(audioElement.currentTime);
    });
}

// 开始拖动进度条
function startDragProgress(e) {
    e.preventDefault();
    isDraggingProgress = true;
    
    const moveHandler = (e) => {
        if (!isDraggingProgress) return;
        
        const rect = audioProgress.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        
        audioElement.currentTime = percent * audioElement.duration;
        updateProgressThumb();
    };
    
    const upHandler = () => {
        isDraggingProgress = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('touchend', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchend', upHandler);
}

// 开始拖动音量条
function startDragVolume(e) {
    e.preventDefault();
    isDraggingVolume = true;
    
    const moveHandler = (e) => {
        if (!isDraggingVolume) return;
        
        const rect = audioVolume.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        
        audioElement.volume = percent;
        updateVolumeThumb();
    };
    
    const upHandler = () => {
        isDraggingVolume = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('touchend', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchend', upHandler);
}

// 更新进度条滑块位置
function updateProgressThumb() {
    if (!audioElement || !audioElement.duration) return;
    const percent = (audioElement.currentTime / audioElement.duration) * 100;
    progressThumb.style.left = `${percent}%`;
}

// 更新音量滑块位置
function updateVolumeThumb() {
    if (!audioElement) return;
    const percent = audioElement.volume * 100;
    audioVolumeFilled.style.width = `${percent}%`;
    volumeThumb.style.left = `${percent}%`;
}