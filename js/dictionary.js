// 词典查询模块
function initDictionarySystem(player, subtitleManager) {
    // 设置全局单词点击回调
    window.onWordClick = function(word) {
        // 点击单词时暂停播放
        player.pause();
        
        // 将单词填入查询框
        const dictionaryInput = document.getElementById('dictionary-input');
        dictionaryInput.value = word;
        
        // 查询单词 - 使用在线词典
        searchWordOnline(word);
    };
    
    // 使用Free Dictionary API查询单词
    async function searchWordOnline(word) {
        if (!word.trim()) {
            showDictionaryResult('<div class="error">请输入要查询的单词</div>');
            return;
        }
        
        showDictionaryResult('<div class="loading">在线查询中...</div>');
        
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`未找到单词 "${word}" 的定义`);
                } else {
                    throw new Error(`API请求失败: ${response.status}`);
                }
            }
            
            const data = await response.json();
            displayWordData(data[0]);
        } catch (error) {
            showDictionaryResult(`<div class="error">${error.message}</div>`);
            console.error('查询错误:', error);
        }
    }
    
    // 显示单词数据（在线词典）
    function displayWordData(wordData) {
        let html = '';
        
        // 单词标题和音标
        html += `<div class="word-header">`;
        html += `<div class="word-title">${wordData.word}</div>`;
        
        if (wordData.phonetic) {
            html += `<div class="phonetic">${wordData.phonetic}</div>`;
        } else if (wordData.phonetics && wordData.phonetics.length > 0) {
            const phonetic = wordData.phonetics.find(p => p.text) || wordData.phonetics[0];
            if (phonetic && phonetic.text) {
                html += `<div class="phonetic">${phonetic.text}</div>`;
            }
        }
        
        html += `</div>`;
        
        // 词义解释
        if (wordData.meanings && wordData.meanings.length > 0) {
            wordData.meanings.forEach(meaning => {
                html += `<div class="meaning-section">`;
                html += `<div class="part-of-speech">${meaning.partOfSpeech}</div>`;
                
                if (meaning.definitions && meaning.definitions.length > 0) {
                    meaning.definitions.forEach((def, index) => {
                        if (index < 3) { // 只显示前三个定义
                            html += `<div class="definition">${index + 1}. ${def.definition}</div>`;
                            if (def.example) {
                                html += `<div class="example">例句: "${def.example}"</div>`;
                            }
                        }
                    });
                }
                
                html += `</div>`;
            });
        } else {
            html += `<div class="meaning-section">`;
            html += `<div class="definition">未找到该单词的详细释义。</div>`;
            html += `</div>`;
        }
        
        showDictionaryResult(html);
    }
    
    // 显示词典查询结果
    function showDictionaryResult(html) {
        const dictionaryResult = document.getElementById('dictionary-result');
        dictionaryResult.innerHTML = html;
    }
    
    // 返回公共API
    return {
        searchWord: searchWordOnline,
        showDictionaryResult
    };
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDictionarySystem };
}