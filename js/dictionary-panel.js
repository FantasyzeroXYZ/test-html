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

    resetAppendedWords();
}

// 在面板中查询单词
async function searchWordInPanel(word) {
    if (!word.trim()) {
        panelDictionaryResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    openDictionaryPanel();
    panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
    panelSearchInput.value = word;
    
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

// 显示单词数据在底部面板
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
                              data-target="${allPronunciationsId}"
                              data-show-text="显示全部发音 (${entry.pronunciations.length})"
                              data-hide-text="隐藏全部发音">显示全部发音 (${entry.pronunciations.length})</button>`;
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
                                      data-target="${allExamplesId}"
                                      data-show-text="显示更多例句 (${sense.examples.length})"
                                      data-hide-text="隐藏更多例句">显示更多例句 (${sense.examples.length})</button>`;
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
                          data-target="${allFormsId}"
                          data-show-text="显示全部词形变化 (${entry.forms.length})"
                          data-hide-text="隐藏全部词形变化">显示全部词形变化 (${entry.forms.length})</button>`;
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

// 查询日语单词
async function searchJapaneseWordInPanel(word) {
    if (!word.trim()) {
        panelDictionaryResult.innerHTML = '<div class="error">请输入要查询的单词</div>';
        return;
    }
    
    openDictionaryPanel();
    panelDictionaryResult.innerHTML = '<div class="loading">查询中...</div>';
    panelSearchInput.value = word;
    
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

// 显示日语单词数据在底部面板
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
                              data-target="${allPronunciationsId}"
                              data-show-text="显示全部发音 (${entry.pronunciations.length})"
                              data-hide-text="隐藏全部发音">显示全部发音 (${entry.pronunciations.length})</button>`;
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
                                      data-target="${allExamplesId}"
                                      data-show-text="显示更多例句 (${sense.examples.length})"
                                      data-hide-text="隐藏更多例句">显示更多例句 (${sense.examples.length})</button>`;
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
                          data-target="${allFormsId}"
                          data-show-text="显示全部词形变化 (${entry.forms.length})"
                          data-hide-text="隐藏全部词形变化">显示全部词形变化 (${entry.forms.length})</button>`;
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

// 日语分词显示
async function showJapaneseWordSegmentation(sentence, currentWord = '') {
    if (!tokenizer) {
        console.error('分词器未初始化');
        return;
    }

    try {
        const result = tokenizer.tokenize(sentence);
        const japaneseWords = result.map(item => item.surface_form);

        openDictionaryPanel();
        updateOriginalSentence(sentence, currentWord, 'japanese', japaneseWords);

        panelDictionaryResult.querySelectorAll('.word').forEach(wordElement => {
            wordElement.addEventListener('click', () => {
                const word = wordElement.getAttribute('data-word');
                const index = parseInt(wordElement.getAttribute('data-index'));
                panelDictionaryResult.querySelectorAll('.word').forEach(w => w.classList.remove('highlight'));
                wordElement.classList.add('highlight');
                panelSearchInput.value = word;
                
                if (window.japaneseWordClicked) {
                    window.japaneseWordClicked(word, index);
                } else {
                    searchJapaneseWordInPanel(word);
                }
            });
        });

        if (window.japaneseSegmentationComplete) {
            window.japaneseSegmentationComplete(sentence, japaneseWords);
        }

    } catch (error) {
        console.error('日语分词失败:', error);
        panelDictionaryResult.innerHTML = `<div class="error">日语分词失败: ${error.message}</div>`;
    }
}

// 更新原句显示
function updateOriginalSentence(sentence, currentWord, currentLanguageMode = 'english', japaneseWords = []) {
    let clickableSentence = '';

    const words = currentLanguageMode === 'japanese' && japaneseWords.length > 0 
        ? japaneseWords 
        : sentence.match(/\S+/g) || [];

    words.forEach((word, index) => {
        const wordClass = appendedWords.includes(word) ? 'sentence-word highlight selectable-word' : 'sentence-word selectable-word';
        const space = currentLanguageMode === 'japanese' ? '' : '&nbsp;';

        clickableSentence += `<span class="${wordClass}" data-word="${word}" data-index="${index}">${word}</span>${space}`;
    });

    originalSentence.innerHTML = clickableSentence;

    originalSentence.removeEventListener('click', handleSentenceWordClick);
    originalSentence.addEventListener('click', handleSentenceWordClick);
}

// 处理原句中单词点击
function handleSentenceWordClick(e) {
    const span = e.target.closest('.sentence-word');
    if (!span) return;

    const word = span.getAttribute('data-word');
    const index = parseInt(span.getAttribute('data-index'));

    // 剪贴板功能
    if (clipboardEnabled) {
        copyWordToClipboard(word);
    }

    appendedWords = [word];
    currentWordIndex = index;
    panelSearchInput.value = word;

    originalSentence.querySelectorAll('.sentence-word').forEach((s) => {
        s.classList.toggle('highlight', appendedWords.includes(s.getAttribute('data-word')));
    });

    if (currentLanguageMode === 'english') {
        searchWordInPanel(word);
    } else {
        searchJapaneseWordInPanel(word);
    }

    if (activeTab === 'web-tab') {
        loadWebSearch(word);
    }
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
    if (!sentenceSpans.length) return;

    if (currentWordIndex >= sentenceSpans.length - 1) {
        return;
    }

    currentWordIndex++;
    const currentSpan = sentenceSpans[currentWordIndex];
    const word = currentSpan.getAttribute('data-word');

    if (currentLanguageMode === 'english' && appendedWords.length > 0) {
        panelSearchInput.value += ' ' + word;
    } else {
        panelSearchInput.value += word;
    }
    
    appendedWords.push(word);

    sentenceSpans.forEach((span, idx) => {
        const spanWord = span.getAttribute('data-word');
        span.classList.toggle('highlight', appendedWords.includes(spanWord) && idx <= currentWordIndex);
    });

    if (currentLanguageMode === 'english') {
        searchWordInPanel(panelSearchInput.value);
    } else {
        searchJapaneseWordInPanel(panelSearchInput.value);
    }

    if (activeTab === 'web-tab') {
        loadWebSearch(panelSearchInput.value);
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
    
    if (activeTab === 'web-tab') {
        loadWebSearch(word);
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