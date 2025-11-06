// Anki功能处理

// Anki连接检查
async function checkAnkiConnection() {
    ankiStatusText.textContent = '检查Anki连接状态...';
    
    try {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'version',
                version: 6
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.result) {
                ankiConnected = true;
                ankiStatusIndicator.className = 'status-indicator status-connected';
                ankiStatusText.textContent = 'Anki已连接';
                await loadAnkiDecks();
                await loadAnkiModels();
            } else {
                throw new Error('AnkiConnect响应错误');
            }
        } else {
            throw new Error('AnkiConnect响应错误');
        }
    } catch (error) {
        ankiConnected = false;
        ankiStatusIndicator.className = 'status-indicator status-disconnected';
        ankiStatusText.textContent = 'Anki未连接';
        console.error('Anki连接错误:', error);
    }
}

// 获取Anki牌组列表
async function loadAnkiDecks() {
    try {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'deckNames',
                version: 6
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            ankiDecks = data.result;
            
            deckSelect.innerHTML = '';
            ankiDecks.forEach(deck => {
                const option = document.createElement('option');
                option.value = deck;
                option.textContent = deck;
                deckSelect.appendChild(option);
            });
            
            loadConfig();
        }
    } catch (error) {
        console.error('获取牌组列表错误:', error);
    }
}

// 获取Anki模型列表
async function loadAnkiModels() {
    try {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'modelNames',
                version: 6
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            ankiModels = data.result;
            
            modelSelect.innerHTML = '';
            ankiModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
            
            loadConfig();
            
            if (ankiModels.length > 0 && !modelSelect.value) {
                modelSelect.value = ankiModels[0];
                await loadModelFields(ankiModels[0]);
            } else if (modelSelect.value) {
                await loadModelFields(modelSelect.value);
            }
        }
    } catch (error) {
        console.error('获取模型列表错误:', error);
    }
}

// 获取模型字段
async function loadModelFields(modelName) {
    try {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'modelFieldNames',
                version: 6,
                params: {
                    modelName: modelName
                }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentModelFields = data.result;
            
            wordFieldSelect.innerHTML = '';
            sentenceFieldSelect.innerHTML = '';
            definitionFieldSelect.innerHTML = '';
            audioFieldSelect.innerHTML = '';
            imageFieldSelect.innerHTML = '';
            
            currentModelFields.forEach(field => {
                const option = document.createElement('option');
                option.value = field;
                option.textContent = field;
                
                wordFieldSelect.appendChild(option.cloneNode(true));
                sentenceFieldSelect.appendChild(option.cloneNode(true));
                definitionFieldSelect.appendChild(option.cloneNode(true));
                audioFieldSelect.appendChild(option.cloneNode(true));
                imageFieldSelect.appendChild(option.cloneNode(true));
            });
            
            loadConfig();
            
            if (!wordFieldSelect.value) {
                setDefaultFields();
            }
        }
    } catch (error) {
        console.error('获取模型字段错误:', error);
    }
}

// 智能设置默认字段
function setDefaultFields() {
    const fields = currentModelFields.map(f => f.toLowerCase());
    
    if (fields.includes('word')) {
        wordFieldSelect.value = 'word';
    } else if (fields.includes('front')) {
        wordFieldSelect.value = 'front';
    } else if (fields.length > 0) {
        wordFieldSelect.selectedIndex = 0;
    }
    
    if (fields.includes('sentence')) {
        sentenceFieldSelect.value = 'sentence';
    } else if (fields.includes('example')) {
        sentenceFieldSelect.value = 'example';
    } else if (fields.includes('back')) {
        sentenceFieldSelect.value = 'back';
    } else if (fields.length > 1) {
        sentenceFieldSelect.selectedIndex = 1;
    }
    
    if (fields.includes('definition')) {
        definitionFieldSelect.value = 'definition';
    } else if (fields.includes('meaning')) {
        definitionFieldSelect.value = 'meaning';
    } else if (fields.includes('back')) {
        definitionFieldSelect.value = 'back';
    } else if (fields.length > 2) {
        definitionFieldSelect.selectedIndex = 2;
    }
    
    if (fields.includes('audio')) {
        audioFieldSelect.value = 'audio';
    } else if (fields.includes('sound')) {
        audioFieldSelect.value = 'sound';
    } else if (fields.length > 3) {
        audioFieldSelect.selectedIndex = 3;
    }
    
    if (fields.includes('image')) {
        imageFieldSelect.value = 'image';
    } else if (fields.includes('picture')) {
        imageFieldSelect.value = 'picture';
    } else if (fields.length > 4) {
        imageFieldSelect.selectedIndex = 4;
    }
    
    saveConfig();
}

// 存储配置到localStorage
function saveConfig() {
    const config = {
        deck: deckSelect.value,
        model: modelSelect.value,
        wordField: wordFieldSelect.value,
        sentenceField: sentenceFieldSelect.value,
        definitionField: definitionFieldSelect.value,
        audioField: audioFieldSelect.value,
        imageField: imageFieldSelect.value,
        languageMode: currentLanguageMode,
        mediaType: currentMediaType
    };
    localStorage.setItem('ankiConfig', JSON.stringify(config));
}

// 从localStorage加载配置
function loadConfig() {
    const savedConfig = localStorage.getItem('ankiConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.deck) deckSelect.value = config.deck;
            if (config.model) modelSelect.value = config.model;
            if (config.wordField) wordFieldSelect.value = config.wordField;
            if (config.sentenceField) sentenceFieldSelect.value = config.sentenceField;
            if (config.definitionField) definitionFieldSelect.value = config.definitionField;
            if (config.audioField) audioFieldSelect.value = config.audioField;
            if (config.imageField) imageFieldSelect.value = config.imageField;
            if (config.languageMode) {
                currentLanguageMode = config.languageMode;
                updateLanguageModeButton();
            }
            if (config.mediaType) {
                currentMediaType = config.mediaType;
                updateMediaModeButton();
                updateMediaDisplay();
            }
        } catch (e) {
            console.error('加载配置失败:', e);
        }
    }
}

// 页面加载时保存原始按钮 HTML
const originalAddToAnkiHTML = addToAnkiBtn.innerHTML;

// 添加Anki卡片
addToAnkiBtn.addEventListener('click', async () => {
    if (isProcessingAnki) return;

    if (!ankiConnected) {
        alert('请先连接Anki!');
        return;
    }

    const word = panelSearchInput.value.trim();
    if (!word) {
        alert('请输入要添加的单词!');
        return;
    }

    let definition = '';

    if (activeTab === 'dictionary-tab') {
        const definitionElements = panelDictionaryResult.querySelectorAll('.definition');
        if (definitionElements.length > 0) {
            definitionElements.forEach(el => {
                definition += el.textContent + '\n';
            });
        }
    } else if (activeTab === 'custom-tab') {
        definition = customDefinitionInput.value.trim();
    }

    if (!definition) {
        alert('请提供单词释义!');
        return;
    }

    isProcessingAnki = true;
    addToAnkiBtn.disabled = true;
    addToAnkiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        await processAnkiCard(word, definition);
        console.log('卡片添加成功');

        customDefinitionInput.value = '';
        panelSearchInput.value = '';
        panelDictionaryResult.innerHTML = '查询结果将显示在这里...';

        closeDictionaryPanel();

    } catch (error) {
        console.error('添加卡片失败:', error);
        alert('添加卡片失败: ' + error.message);

    } finally {
        isProcessingAnki = false;
        addToAnkiBtn.disabled = false;
        addToAnkiBtn.innerHTML = originalAddToAnkiHTML;
    }
});

// 处理Anki卡片
async function processAnkiCard(word, definition) {
    console.log('audioBuffer', audioBuffer, 'audioContext', audioContext, 'currentSubtitleIndex', currentSubtitleIndex);

    let cleanSentence = currentSentence;
    if (cleanSentence) {
        cleanSentence = cleanSubtitleText(cleanSentence);
    }

    const note = {
        deckName: deckSelect.value,
        modelName: modelSelect.value,
        fields: {
            [wordFieldSelect.value]: word,
            [sentenceFieldSelect.value]: cleanSentence,
            [definitionFieldSelect.value]: definition
        },
        options: { allowDuplicate: false },
        tags: ['media-player']
    };

    if (audioBuffer && currentSubtitleIndex >= 0) {
        try {
            const audioBlob = await generateAudioClip(currentSubtitleIndex);
            if (audioBlob) {
                const storedAudioName = await processAudioFile(word, audioBlob);
                if (storedAudioName) {
                    note.fields[audioFieldSelect.value] = `[sound:${storedAudioName}]`;
                    console.log('音频字段设置:', storedAudioName);
                }
            }
        } catch (error) {
            console.error('音频截取失败:', error);
        }
    }

    if (imageFieldSelect.value && currentMediaType === 'video' && currentMediaFile) {
        try {
            const storedImageName = await captureVideoFrame(word);
            if (storedImageName) {
                note.fields[imageFieldSelect.value] = `<img src="${storedImageName}">`;
                console.log('图片字段设置:', storedImageName);
            }
        } catch (error) {
            console.error('截图失败:', error);
        }
    }

    await addCardToAnki(note);
}

// 生成文件名
function generateAudioFileName(word) {
    const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase() || 'audio';
    let fileName = `audio_${cleanWord}_${Date.now()}.wav`;
    fileName = fileName.replace(/[^\w.\-]/g, '_');
    return fileName;
}

function generateImageFileName(word) {
    const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase() || 'screenshot';
    let fileName = `screenshot_${cleanWord}_${Date.now()}.jpg`;
    fileName = fileName.replace(/[^\w.\-]/g, '_');
    return fileName;
}

// 自动截取当前字幕的音频片段
async function processAudioFile(word, audioBlob) {
    try {
        const audioFileName = generateAudioFileName(word);
        console.log('准备存储音频文件:', audioFileName);

        const base64Audio = await blobToBase64(audioBlob);

        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'storeMediaFile',
                version: 6,
                params: {
                    filename: audioFileName,
                    data: base64Audio.split(',')[1],
                    deleteExisting: true
                }
            })
        });

        const result = await response.json();
        if (result.error) {
            console.error('存储音频文件失败:', result.error);
            return null;
        }

        const storedName = result.result || audioFileName;
        console.log('音频文件实际存储名:', storedName);
        return storedName;

    } catch (error) {
        console.error('音频处理错误:', error);
        return null;
    }
}
        
// 截图功能
async function captureVideoFrame(word) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const video = document.getElementById('player');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (blob) => {
                try {
                    const imageFileName = generateImageFileName(word);
                    const base64Image = await blobToBase64(blob);

                    const response = await fetch('http://127.0.0.1:8765', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'storeMediaFile',
                            version: 6,
                            params: {
                                filename: imageFileName,
                                data: base64Image.split(',')[1],
                                deleteExisting: true
                            }
                        })
                    });

                    const result = await response.json();
                    if (result.error) {
                        console.error('存储图片文件失败:', result.error);
                        reject(new Error(result.error));
                        return;
                    }

                    const storedName = result.result || imageFileName;
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

// 生成当前句子的音频片段
async function generateAudioClip(subtitleIndex) {
    if (!audioBuffer) throw new Error('audioBuffer 未加载');

    const startTime = subtitles[subtitleIndex].start;
    const endTime = subtitles[subtitleIndex].end;

    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const frameCount = endSample - startSample;

    const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            newData[i] = oldData[startSample + i];
        }
    }

    return bufferToWavBlob(newBuffer);
}

// 将AudioBuffer转换为WAV Blob
function bufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataSize = length * blockAlign;
    
    const bufferArray = new ArrayBuffer(44 + dataSize);
    const view = new DataView(bufferArray);
    
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    const offset = 44;
    let index = 0;
    
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset + index, int16Sample, true);
            index += 2;
        }
    }
    
    return new Blob([bufferArray], { type: 'audio/wav' });
}
        
async function addCardToAnki(note) {
    console.log('准备添加卡片到 Anki:', note);

    try {
        const response = await fetch('http://127.0.0.1:8765', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'addNote',
                version: 6,
                params: { note }
            }),
        });

        if (!response.ok) {
            throw new Error(`AnkiConnect HTTP错误: ${response.status} ${response.statusText}`);
        }

        let result;
        try {
            result = await response.json();
        } catch (err) {
            throw new Error('无法解析 AnkiConnect 返回的 JSON。可能未启动 AnkiConnect。');
        }

        if (result.error) {
            if (result.error.includes('cannot create note because it is a duplicate')) {
                console.warn('检测到重复卡片，未添加:', note.fields);
                showStatusMessage('⚠️ 已存在相同卡片，跳过添加。');
                return null;
            } else {
                console.error('添加卡片失败:', result.error);
                console.error('卡片数据:', note);
                showStatusMessage('❌ 添加卡片失败，请查看控制台日志。');
                throw new Error(result.error);
            }
        }

        if (!result.result) {
            console.warn('AnkiConnect 返回空结果，可能未创建卡片。');
            showStatusMessage('⚠️ 未创建卡片，可能是重复或模型不匹配。');
            return null;
        }

        console.log('✅ 卡片添加成功，ID:', result.result);
        showStatusMessage('✅ 卡片已成功添加到 Anki!');
        return result.result;

    } catch (error) {
        console.error('❌ 与 AnkiConnect 通信失败:', error);
        showStatusMessage('❌ 无法连接到 AnkiConnect，请确认它已运行。');
        return null;
    }
}

// 状态提示函数
function showStatusMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.background = 'rgba(0,0,0,0.8)';
    div.style.color = '#fff';
    div.style.padding = '8px 12px';
    div.style.borderRadius = '6px';
    div.style.fontSize = '14px';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}