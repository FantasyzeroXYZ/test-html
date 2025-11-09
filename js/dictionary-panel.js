// 词典面板功能

// 底部面板功能
function openDictionaryPanel() {
    panelDictionaryResult.style.display = 'block';
    dictionaryPanel.classList.add('active');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭词典面板
function closeDictionaryPanel() {
    dictionaryPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // 恢复播放状态（全屏模式）
    if (isFullscreen && wasPlayingBeforeDict) {
        fullscreenVideoPlayer.play().catch(()=>{});
    }
    // 恢复播放状态（非全屏模式）
    else if (playerWasPlaying) {
        if (currentMediaType === 'video' && videoPlayer.paused) {
            videoPlayer.play();
        } else if (currentMediaType === 'audio' && audioElement && audioElement.paused) {
            audioElement.play();
            audioPlayPauseBtn.textContent = '⏸';
            audioPlayPauseBtn.classList.add('active');
        }
    }

    // 重置追加词汇状态
    resetAppendedWords();
}

// 在面板中查询英语单词
async function searchWordInPanel(word) {
    if (!word.trim()) {
        panelDictionaryResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    openDictionaryPanel();
    panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
    panelSearchInput.value = word;
    
    if (activeTab === 'web-tab') {
        loadWebSearch(word);
    }
    // dictionary-tab 时自动查询
    else if (activeTab === 'dictionary-tab')  {
        try {
            const apiUrl = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`未找到单词 "${word}"`);
                } else {
                    throw new Error(`API请求失败: ${response.status}`);
                }
            }
            
            const data = await response.json();
            displayWordDataInPanel(data);
        } catch (error) {
            panelDictionaryResult.innerHTML = `<div class="error">${error.message}</div>`;
            console.error('查询错误:', error);
        }
    }
}


// 显示生成结构化英语单词数据html页面转给底部面板显示
function displayWordDataInPanel(wordData) {
    if (!wordData.word || !Array.isArray(wordData.entries)) {
        panelDictionaryResult.innerHTML = '<div class="error">返回的数据格式不正确</div>';
        return;
    }
    
    let html = `
        <div class="word-header">
            <div class="word-title">${escapeHtml(wordData.word)}</div>
            <span class="language-tag">英语</span>
        </div>
    `;
    
    wordData.entries.forEach((entry, entryIndex) => {
        html += `<div class="entry">`;
        
        if (entry.partOfSpeech) {
            html += `<div class="part-of-speech">${escapeHtml(entry.partOfSpeech)}</div>`;
        }
        
        if (Array.isArray(entry.pronunciations) && entry.pronunciations.length > 0) {
            const filteredPronunciations = entry.pronunciations.filter(p => 
                p.tags && p.tags.some(tag => tag === "US" || tag === "UK")
            ).slice(0, 2);
            
            if (filteredPronunciations.length > 0) {
                html += `<div class="initial-pronunciations">`;
                filteredPronunciations.forEach(pronunciation => {
                    const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                    const tags = pronunciation.tags && pronunciation.tags.length > 0 ? 
                        ` <small>${pronunciation.tags.join(', ')}</small>` : '';
                    html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}${tags}</div>`;
                });
                html += `</div>`;
                
                if (entry.pronunciations.length > filteredPronunciations.length) {
                    const allPronunciationsId = `all-pronunciations-${entryIndex}`;
                    html += `<button class="toggle-button" 
                              onclick="toggleSection('${allPronunciationsId}', this, '显示全部发音 (${entry.pronunciations.length})', '隐藏全部发音')">显示全部发音 (${entry.pronunciations.length})</button>`;
                    html += `<div id="${allPronunciationsId}" class="collapsible-section" style="display: none;">`;
                    entry.pronunciations.forEach(pronunciation => {
                        const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                        const tags = pronunciation.tags && pronunciation.tags.length > 0 ? 
                            ` <small>${pronunciation.tags.join(', ')}</small>` : '';
                        html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}${tags}</div>`;
                    });
                    html += `</div>`;
                }
            }
        }
        
        if (Array.isArray(entry.senses)) {
            let senseCounter = 0;
            
            const renderSenses = (senses, level = 0, sensePath = '') => {
                let sensesHtml = '';
                senses.forEach((sense, index) => {
                    senseCounter++;
                    const currentSensePath = sensePath ? `${sensePath}-${index}` : `${entryIndex}-${index}`;
                    
                    sensesHtml += `<div class="sense" style="margin-left: ${level * 15}px;">`;
                    
                    if (sense.definition) {
                        const number = level === 0 ? `${senseCounter}.` : `${senseCounter}`;
                        sensesHtml += `<div class="definition"><strong>${number}</strong> ${escapeHtml(sense.definition)}</div>`;
                    }
                    
                    if (Array.isArray(sense.tags) && sense.tags.length > 0) {
                        sensesHtml += `<div style="font-size: 12px; color: #586069; margin-bottom: 5px;">标签: ${sense.tags.map(t => escapeHtml(t)).join(', ')}</div>`;
                    }
                    
                    if (Array.isArray(sense.examples) && sense.examples.length > 0) {
                        const maxInitialExamples = 2;
                        const initialExamples = sense.examples.slice(0, maxInitialExamples);
                        const remainingExamples = sense.examples.slice(maxInitialExamples);
                        
                        initialExamples.forEach(example => {
                            sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                        });
                        
                        if (remainingExamples.length > 0) {
                            const allExamplesId = `all-examples-${currentSensePath}`;
                            sensesHtml += `<button class="toggle-button examples-toggle" 
                                      onclick="toggleSection('${allExamplesId}', this, '显示更多例句 (${sense.examples.length})', '隐藏更多例句')">显示更多例句 (${sense.examples.length})</button>`;
                            sensesHtml += `<div id="${allExamplesId}" class="collapsible-section" style="display: none;">`;
                            remainingExamples.forEach(example => {
                                sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                            });
                            sensesHtml += `</div>`;
                        }
                    }
                    
                    if (Array.isArray(sense.quotes)) {
                        sense.quotes.forEach(quote => {
                            sensesHtml += `<div class="quote">"${escapeHtml(quote.text)}"`;
                            if (quote.reference) {
                                sensesHtml += `<div class="quote-reference">— ${escapeHtml(quote.reference)}</div>`;
                            }
                            sensesHtml += `</div>`;
                        });
                    }
                    
                    if (Array.isArray(sense.synonyms) && sense.synonyms.length > 0) {
                        sensesHtml += `<div class="synonyms"><span>同义词:</span> ${sense.synonyms.map(s => escapeHtml(s)).join(', ')}</div>`;
                    }
                    if (Array.isArray(sense.antonyms) && sense.antonyms.length > 0) {
                        sensesHtml += `<div class="antonyms"><span>反义词:</span> ${sense.antonyms.map(a => escapeHtml(a)).join(', ')}</div>`;
                    }
                    
                    if (Array.isArray(sense.subsenses) && sense.subsenses.length > 0) {
                        sensesHtml += renderSenses(sense.subsenses, level + 1, currentSensePath);
                    }
                    
                    sensesHtml += `</div>`;
                });
                return sensesHtml;
            };
            
            html += renderSenses(entry.senses);
        }
        
        if (Array.isArray(entry.forms) && entry.forms.length > 0) {
            const maxInitialForms = 2;
            const initialForms = entry.forms.slice(0, maxInitialForms);
            const remainingForms = entry.forms.slice(maxInitialForms);
            
            html += `<div class="initial-forms" style="margin-top: 15px;"><small><strong>词形变化:</strong> `;
            const initialFormsHtml = initialForms.map(form => 
                `${escapeHtml(form.word)}${form.tags && form.tags.length > 0 ? ` (${form.tags.join(', ')})` : ''}`
            ).join(', ');
            html += initialFormsHtml;
            html += `</small></div>`;
            
            if (remainingForms.length > 0) {
                const allFormsId = `all-forms-${entryIndex}`;
                html += `<button class="toggle-button" 
                          onclick="toggleSection('${allFormsId}', this, '显示全部词形变化 (${entry.forms.length})', '隐藏全部词形变化')">显示全部词形变化 (${entry.forms.length})</button>`;
                html += `<div id="${allFormsId}" class="collapsible-section" style="display: none;">`;
                const allFormsHtml = entry.forms.map(form => 
                    `${escapeHtml(form.word)}${form.tags && form.tags.length > 0 ? ` (${form.tags.join(', ')})` : ''}`
                ).join(', ');
                html += allFormsHtml;
                html += `</div>`;
            }
        }
        
        if (Array.isArray(entry.synonyms) && entry.synonyms.length > 0) {
            html += `<div class="synonyms"><span>同义词:</span> ${entry.synonyms.map(s => escapeHtml(s)).join(', ')}</div>`;
        }
        if (Array.isArray(entry.antonyms) && entry.antonyms.length > 0) {
            html += `<div class="antonyms"><span>反义词:</span> ${entry.antonyms.map(a => escapeHtml(a)).join(', ')}</div>`;
        }
        
        html += `</div>`;
    });
    
    panelDictionaryResult.innerHTML = html;
}

// 添加这个全局函数让嵌入词典框里的释义收缩内容点击后能够正常展开和收起
function toggleSection(sectionId, button, showText, hideText) {
    const section = document.getElementById(sectionId);
    if (section) {
        if (section.style.display === 'none') {
            section.style.display = 'block';
            button.textContent = hideText;
        } else {
            section.style.display = 'none';
            button.textContent = showText;
        }
    }
}

// 查询日语单词
async function searchJapaneseWordInPanel(word) {
    if (!word.trim()) {
        panelDictionaryResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    openDictionaryPanel();
    panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
    panelSearchInput.value = word;
    
    if (activeTab === 'web-tab') {
        loadWebSearch(word);
    }
    // dictionary-tab 时自动查询
    else if (activeTab === 'dictionary-tab')  {
        try {
            const apiUrl = `https://freedictionaryapi.com/api/v1/entries/ja/${encodeURIComponent(word)}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`未找到日语单词 "${word}"`);
                } else {
                    throw new Error(`API请求失败: ${response.status}`);
                }
            }
            
            const data = await response.json();
            displayJapaneseWordDataInPanel(data);
        } catch (error) {
            panelDictionaryResult.innerHTML = `<div class="error">${error.message}</div>`;
            console.error('查询错误:', error);
        }
    }
}


// 显示生成结构化日语单词数据html页面转给底部面板显示
function displayJapaneseWordDataInPanel(wordData) {
    if (!wordData.word || !Array.isArray(wordData.entries)) {
        panelDictionaryResult.innerHTML = '<div class="error">返回的数据格式不正确</div>';
        return;
    }

    let html = `
        <div class="word-header">
            <div class="word-title">${escapeHtml(wordData.word)}</div>
            <span class="language-tag">日语</span>
        </div>
    `;

    wordData.entries.forEach((entry, entryIndex) => {
        html += `<div class="entry">`;

        if (entry.partOfSpeech) {
            html += `<div class="part-of-speech">${escapeHtml(entry.partOfSpeech)}</div>`;
        }

        // 发音处理
        if (Array.isArray(entry.pronunciations) && entry.pronunciations.length > 0) {
            const filteredPronunciations = entry.pronunciations.slice(0, 2);
            if (filteredPronunciations.length > 0) {
                html += `<div class="initial-pronunciations">`;
                filteredPronunciations.forEach(pronunciation => {
                    const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                    html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}</div>`;
                });
                html += `</div>`;

                if (entry.pronunciations.length > filteredPronunciations.length) {
                    const allPronunciationsId = `all-pronunciations-${entryIndex}`;
                    html += `<button class="toggle-button" 
                              onclick="toggleSection('${allPronunciationsId}', this, '显示全部发音 (${entry.pronunciations.length})', '隐藏全部发音')">显示全部发音 (${entry.pronunciations.length})</button>`;
                    html += `<div id="${allPronunciationsId}" class="collapsible-section" style="display: none;">`;
                    entry.pronunciations.forEach(pronunciation => {
                        const type = pronunciation.type ? ` (${pronunciation.type})` : '';
                        html += `<div class="pronunciation">/${escapeHtml(pronunciation.text)}/${type}</div>`;
                    });
                    html += `</div>`;
                }
            }
        }

        // 释义/例句/同义词/反义词
        if (Array.isArray(entry.senses)) {
            let senseCounter = 0;

            const renderSenses = (senses, level = 0, sensePath = '') => {
                let sensesHtml = '';
                senses.forEach((sense, index) => {
                    senseCounter++;
                    const currentSensePath = sensePath ? `${sensePath}-${index}` : `${entryIndex}-${index}`;
                    sensesHtml += `<div class="sense" style="margin-left: ${level * 15}px;">`;

                    if (sense.definition) {
                        const number = level === 0 ? `${senseCounter}.` : `${senseCounter}`;
                        sensesHtml += `<div class="definition"><strong>${number}</strong> ${escapeHtml(sense.definition)}</div>`;
                    }

                    if (Array.isArray(sense.examples) && sense.examples.length > 0) {
                        const maxInitialExamples = 2;
                        const initialExamples = sense.examples.slice(0, maxInitialExamples);
                        const remainingExamples = sense.examples.slice(maxInitialExamples);

                        initialExamples.forEach(example => {
                            sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                        });

                        if (remainingExamples.length > 0) {
                            const allExamplesId = `all-examples-${currentSensePath}`;
                            sensesHtml += `<button class="toggle-button examples-toggle" 
                                      onclick="toggleSection('${allExamplesId}', this, '显示更多例句 (${sense.examples.length})', '隐藏更多例句')">显示更多例句 (${sense.examples.length})</button>`;
                            sensesHtml += `<div id="${allExamplesId}" class="collapsible-section" style="display: none;">`;
                            remainingExamples.forEach(example => {
                                sensesHtml += `<div class="example">${escapeHtml(example)}</div>`;
                            });
                            sensesHtml += `</div>`;
                        }
                    }

                    if (Array.isArray(sense.subsenses) && sense.subsenses.length > 0) {
                        sensesHtml += renderSenses(sense.subsenses, level + 1, currentSensePath);
                    }

                    sensesHtml += `</div>`;
                });
                return sensesHtml;
            };

            html += renderSenses(entry.senses);
        }

        html += `</div>`; // entry 结束
    });

    panelDictionaryResult.innerHTML = html;
}



// 日语分词显示
async function showJapaneseWordSegmentation(sentence, currentWord = '') {
    if (!tokenizer) {
        console.error('分词器未初始化');
        return [];
    }

    try {
        const result = tokenizer.tokenize(sentence);
        const japaneseWords = result.map(item => item.surface_form);

        openDictionaryPanel();
        panelDictionaryResult.innerHTML = '';

        let clickableSentence = '';
        let lastIndex = 0;

        result.forEach((item, index) => {
            if (item.word_position > lastIndex) clickableSentence += sentence.substring(lastIndex, item.word_position);

            clickableSentence += `<span class="sentence-word selectable-word" data-word="${item.surface_form}" data-index="${index}">${item.surface_form}</span>`;

            lastIndex = item.word_position + item.surface_form.length;
        });

        if (lastIndex < sentence.length) clickableSentence += sentence.substring(lastIndex);

        originalSentence.innerHTML = clickableSentence;
        currentOriginalSentence = sentence;

        originalSentence.removeEventListener('click', handleSentenceWordClick);
        originalSentence.addEventListener('click', handleSentenceWordClick);

        currentSentence = sentence;
        currentWordIndex = currentWord ? japaneseWords.indexOf(currentWord) : -1;
        appendedWords = currentWord ? [currentWord] : [];
        panelSearchInput.value = currentWord || '';

        if (window.japaneseSegmentationComplete) window.japaneseSegmentationComplete(sentence, japaneseWords);

        return japaneseWords; // 返回分词数组，避免重复 tokenize
    } catch (error) {
        console.error('日语分词失败:', error);
        panelDictionaryResult.innerHTML = `<div class="error">日语分词失败: ${error.message}</div>`;
        return [];
    }
}


// 更新原句显示
function updateOriginalSentence(sentence, currentWord, currentLanguageMode = 'english', japaneseWords = []) {
    if (currentLanguageMode === 'japanese') {
        let clickableSentence = '';
        
        if (japaneseWords && japaneseWords.length > 0) {
            // 日语模式：保持原句完整结构，分词可点击
            let lastIndex = 0;
            let currentPos = 0;
            
            japaneseWords.forEach((word, index) => {
                // 在原句中查找单词位置
                const wordPosition = sentence.indexOf(word, currentPos);
                if (wordPosition === -1) {
                    // 如果找不到单词，跳过
                    return;
                }
                
                // 添加单词前的文本
                if (wordPosition > currentPos) {
                    clickableSentence += sentence.substring(currentPos, wordPosition);
                }
                
                // 添加可点击的单词
                const isCurrentWord = currentWord && word === currentWord;
                const wordClass = isCurrentWord ? 'sentence-word highlight selectable-word' : 'sentence-word selectable-word';
                clickableSentence += `<span class="${wordClass}" data-word="${word}" data-index="${index}">${word}</span>`;
                
                currentPos = wordPosition + word.length;
            });
            
            // 添加剩余文本
            if (currentPos < sentence.length) {
                clickableSentence += sentence.substring(currentPos);
            }
        } else {
            // 如果没有分词数据，直接显示原句（不可点击）
            clickableSentence = `<span>${sentence}</span>`;
        }

        originalSentence.innerHTML = clickableSentence;
        currentOriginalSentence = sentence;

        // 重新绑定点击事件
        originalSentence.removeEventListener('click', handleSentenceWordClick);
        originalSentence.addEventListener('click', handleSentenceWordClick);
    } else {
        // 英语模式处理逻辑
        let clickableSentence = '';
        
        // 英语模式：分割单词，清理标点符号，单词可点击
        const words = sentence.split(/(\s+)/).filter(word => word.trim().length > 0);
        
        // 重置状态
        appendedWords = [];
        currentWordIndex = -1;
        
        words.forEach((word, index) => {
            // 只处理字母单词，忽略纯空格
            if (/^[a-zA-Z]/.test(word)) {
                const cleanWord = word.replace(/[^\w]/g, '');
                
                // 检查是否是当前点击的单词
                const isCurrentWord = currentWord && 
                    cleanWord.toLowerCase() === currentWord.toLowerCase();
                
                const wordClass = isCurrentWord ? 'sentence-word highlight selectable-word' : 'sentence-word selectable-word';
                const space = ' ';
                
                clickableSentence += `<span class="${wordClass}" data-word="${cleanWord}" data-index="${index}">${word}</span>${space}`;
                
                // 记录第一个匹配的索引
                if (isCurrentWord && currentWordIndex === -1) {
                    currentWordIndex = index;
                    appendedWords = [cleanWord];
                }
            } else if (word.trim().length > 0) {
                // 非字母字符（标点符号等）直接显示，不可点击
                clickableSentence += `<span>${word}</span>`;
            } else {
                // 空格直接添加
                clickableSentence += word;
            }
        });

        originalSentence.innerHTML = clickableSentence;
        currentOriginalSentence = sentence;

        // 重新绑定点击事件
        originalSentence.removeEventListener('click', handleSentenceWordClick);
        originalSentence.addEventListener('click', handleSentenceWordClick);
        
        console.log('英语原句更新完成:', { 
            sentence, 
            currentWord, 
            currentWordIndex,
            appendedWords 
        });
    }
}

// 处理原句中单词点击
function handleSentenceWordClick(e) {
    const span = e.target.closest('.sentence-word');
    if (!span) return;

    const word = span.getAttribute('data-word');
    const index = parseInt(span.getAttribute('data-index'));

    console.log('点击原句日语分词:', word, '索引:', index);

    // 剪贴板功能
    if (clipboardEnabled) {
        copyWordToClipboard(word);
    }

    // 移除其他高亮
    originalSentence.querySelectorAll('.sentence-word').forEach(s => {
        s.classList.remove('highlight');
    });

    // 高亮当前点击的单词
    span.classList.add('highlight');

    // 重置状态并设置新的点击单词
    appendedWords = [word];
    currentWordIndex = index;
    panelSearchInput.value = word;

    // 执行搜索
    searchJapaneseWordInPanel(word);
}


// 重置追加词汇和搜索栏
function resetAppendedWords() {
    currentWordIndex = -1;
    appendedWords = [];
    panelSearchInput.value = '';
    
    originalSentence.querySelectorAll('.sentence-word').forEach(span => {
        span.classList.remove('highlight');
    });
}

// 追加词汇功能
appendWordBtn.addEventListener('click', () => {
    const sentenceSpans = originalSentence.querySelectorAll('.sentence-word');
    if (!sentenceSpans.length) {
        console.log('没有可用的句子单词');
        return;
    }

    console.log('追加前状态 - 索引:', currentWordIndex, '追加词汇:', appendedWords, '句子长度:', sentenceSpans.length);

    // 如果没有有效的当前索引，从第一个单词开始
    if (currentWordIndex === -1) {
        currentWordIndex = 0;
        console.log('重置索引为0');
    } 
    // 如果已经是最后一个单词，不再追加
    else if (currentWordIndex >= sentenceSpans.length - 1) {
        console.log('已经是最后一个单词，无法继续追加');
        return;
    }
    // 否则移动到下一个单词
    else {
        currentWordIndex++;
        console.log('移动到下一个索引:', currentWordIndex);
    }

    const currentSpan = sentenceSpans[currentWordIndex];
    const word = currentSpan.getAttribute('data-word');

    console.log('追加单词:', word, '位置:', currentWordIndex);

    // 更新搜索输入框
    if (currentLanguageMode === 'english' && appendedWords.length > 0) {
        panelSearchInput.value += ' ' + word;
    } else {
        panelSearchInput.value += word;
    }
    
    appendedWords.push(word);

    // 更新高亮显示 - 高亮所有已追加的单词
    sentenceSpans.forEach((span, idx) => {
        const spanWord = span.getAttribute('data-word');
        const isAppended = appendedWords.includes(spanWord);
        span.classList.toggle('highlight', isAppended && idx <= currentWordIndex);
    });

    // 执行搜索
    if (currentLanguageMode === 'english') {
        searchWordInPanel(panelSearchInput.value);
    } else {
        searchJapaneseWordInPanel(panelSearchInput.value);
    }
});


// 修复搜索按钮功能
function initSearchFunction() {
    panelSearchBtn.addEventListener('click', handleSearch);
    panelSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

function handleSearch() {
    const word = panelSearchInput.value.trim();
    if (!word) {
        showNotification('请输入要查询的单词');
        return;
    }
    
    if (currentLanguageMode === 'english') {
        searchWordInPanel(word);
    } else {
        searchJapaneseWordInPanel(word);
    }
}

// 加载网页查询
function loadWebSearch(word) {
    if (!word) return;
    
    if (window.webSearch) {
        window.webSearch(word);
    } else {
        const url = currentLanguageMode === 'japanese' ? 
            `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=ja` :
            `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`;
        webSearchFrame.src = url;
    }
}
