// ==UserScript==
// @name         Vocabulary.com内容获取器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  为Yomitan查询页面获取Vocabulary.com内容
// @author       Assistant
// @match        http://localhost:8080/*
// @match        http://127.0.0.1:8080/*
// @grant        GM_xmlhttpRequest
// @connect      vocabulary.com
// @connect      www.vocabulary.com
// ==/UserScript==

(function() {
    'use strict';

    console.log('Vocabulary.com脚本加载成功');

    let isSearching = false;

    // 初始化
    setTimeout(initialize, 1500);

    function initialize() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (!searchBtn || !searchInput) {
            console.log('Vocabulary.com: 未找到搜索元素，3秒后重试...');
            setTimeout(initialize, 3000);
            return;
        }

        // 绑定事件
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        console.log('Vocabulary.com脚本初始化完成');
    }

    function handleSearch() {
        const query = document.getElementById('searchInput').value.trim();
        const isWebMode = document.getElementById('modeWeb')?.checked;

        if (!query || !isWebMode || isSearching) return;

        isSearching = true;
        console.log('Vocabulary.com: 开始搜索:', query);
        searchVocabulary(query);
    }

    function searchVocabulary(query) {
        updateWebContent(`
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> 正在查询Vocabulary.com...
                <br>
                <small>搜索词: "${escapeHtml(query)}"</small>
            </div>
        `);

        const url = `https://www.vocabulary.com/dictionary/${encodeURIComponent(query.toLowerCase())}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            onload: function(response) {
                isSearching = false;

                if (response.status === 200) {
                    processVocabularyResponse(response.responseText, query);
                } else if (response.status === 404) {
                    showResult('未找到', `在Vocabulary.com中未找到 "${query}"`, 'error');
                } else {
                    showResult('请求失败', `HTTP错误: ${response.status}`, 'error');
                }
            },
            onerror: function(error) {
                isSearching = false;
                showResult('网络错误', '无法连接到Vocabulary.com', 'error');
            },
            ontimeout: function() {
                isSearching = false;
                showResult('请求超时', '连接Vocabulary.com超时', 'error');
            }
        });
    }

    function processVocabularyResponse(html, query) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 检查是否找到单词
            const notFound = doc.querySelector('.notfound') ||
                            doc.querySelector('.no-results') ||
                            !doc.querySelector('.word-area');

            if (notFound) {
                showResult('未找到', `在Vocabulary.com中未找到 "${query}"`, 'error');
                return;
            }

            const content = extractVocabularyContent(doc, query);
            if (content) {
                updateWebContent(content);
            } else {
                showResult('解析失败', '无法解析Vocabulary.com页面内容', 'error');
            }

        } catch (error) {
            console.error('Vocabulary.com解析错误:', error);
            showResult('解析错误', `处理内容时出错: ${error.message}`, 'error');
        }
    }

    function extractVocabularyContent(doc, query) {
        let content = '';

        // 提取单词基本信息
        const wordArea = doc.querySelector('.word-area');
        const wordHeader = doc.querySelector('h1.word');

        if (wordHeader) {
            content += `
                <div style="border-bottom: 2px solid #4caf50; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #4caf50; margin-bottom: 10px;">
                        <i class="fas fa-book"></i> ${escapeHtml(wordHeader.textContent.trim())}
                    </h2>
            `;

            // 提取发音和音节
            const pronunciation = doc.querySelector('.pronunciation');
            const syllables = doc.querySelector('.syllables');

            if (pronunciation) {
                content += `
                    <div style="color: #6c757d; font-size: 1.1rem; margin-bottom: 8px;">
                        <i class="fas fa-volume-up"></i> ${escapeHtml(pronunciation.textContent.trim())}
                    </div>
                `;
            }

            if (syllables) {
                content += `
                    <div style="color: #6c757d; font-size: 1rem; margin-bottom: 10px;">
                        <i class="fas fa-divide"></i> ${escapeHtml(syllables.textContent.trim())}
                    </div>
                `;
            }

            content += `</div>`;
        }

        // 提取简短定义
        const shortDefinition = doc.querySelector('.short');
        if (shortDefinition) {
            content += `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #495057; margin-bottom: 10px;">
                        <i class="fas fa-star"></i> 简短定义
                    </h3>
                    <div style="padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4caf50;">
                        <div style="font-size: 1.1rem; line-height: 1.5;">
                            ${escapeHtml(shortDefinition.textContent.trim())}
                        </div>
                    </div>
                </div>
            `;
        }

        // 提取详细定义
        const definitionSections = doc.querySelectorAll('.definition, .group');
        if (definitionSections.length > 0) {
            content += `<h3 style="color: #495057; margin-bottom: 15px;"><i class="fas fa-list-alt"></i> 详细解释</h3>`;

            definitionSections.forEach((section, index) => {
                if (index < 3) {
                    const definition = section.querySelector('.definition');
                    const example = section.querySelector('.example');

                    if (definition) {
                        content += `
                            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-weight: bold; color: #495057; margin-bottom: 10px;">
                                    ${index + 1}. ${escapeHtml(definition.textContent.trim())}
                                </div>
                        `;

                        if (example) {
                            content += `
                                <div style="padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #4caf50; font-style: italic; color: #555;">
                                    <i class="fas fa-quote-left" style="color: #4caf50; margin-right: 5px;"></i>
                                    ${escapeHtml(example.textContent.trim())}
                                </div>
                            `;
                        }

                        content += `</div>`;
                    }
                }
            });
        }

        // 提取例句
        const sentences = doc.querySelectorAll('.sentences .example');
        if (sentences.length > 0) {
            content += `<h3 style="color: #495057; margin-bottom: 15px; margin-top: 25px;"><i class="fas fa-comments"></i> 例句</h3>`;
            content += `<div style="margin-bottom: 20px;">`;

            sentences.forEach((sentence, index) => {
                if (index < 5) {
                    content += `
                        <div style="margin-bottom: 12px; padding: 12px; background: white; border: 1px solid #e0e0e0; border-radius: 6px;">
                            <div style="display: flex; align-items: flex-start; gap: 10px;">
                                <span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${index + 1}</span>
                                <div style="line-height: 1.5;">
                                    ${escapeHtml(sentence.textContent.trim())}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            content += `</div>`;
        }

        // 提取词性统计（如果存在）
        const wordStats = doc.querySelector('.word-stats');
        if (wordStats) {
            content += `
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <h4 style="color: #1976d2; margin-bottom: 10px;">
                        <i class="fas fa-chart-bar"></i> 单词统计
                    </h4>
                    <div style="color: #555;">
                        ${escapeHtml(wordStats.textContent.trim())}
                    </div>
                </div>
            `;
        }

        if (!wordHeader && !shortDefinition && definitionSections.length === 0) {
            return null;
        }

        content += addVocabularyFooter();
        return content;
    }

    function addVocabularyFooter() {
        return `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4caf50;">
                <div style="display: flex; align-items: center; gap: 10px; color: #495057;">
                    <i class="fas fa-info-circle" style="color: #4caf50;"></i>
                    <div>
                        <strong>关于Vocabulary.com</strong>
                        <br>
                        <small>Vocabulary.com使用自适应学习技术帮助用户掌握英语词汇，提供精准的定义和上下文例句。</small>
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 0.8rem;">
                    <i class="fas fa-database"></i> 数据来源: Vocabulary.com
                    <br>
                    <i class="fas fa-clock"></i> 更新时间: ${new Date().toLocaleString()}
                </div>
            </div>
        `;
    }

    function showResult(title, message, type = 'info') {
        const icon = type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        const color = type === 'error' ? '#dc3545' : '#17a2b8';

        updateWebContent(`
            <div style="text-align: center; padding: 30px; color: ${color};">
                <i class="fas ${icon}" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        `);
    }

    function updateWebContent(html) {
        if (typeof window.injectWebContent === 'function') {
            window.injectWebContent(html);
        } else {
            const webContent = document.getElementById('webResultsContent');
            if (webContent) {
                webContent.innerHTML = html;
            }
        }

        const countElement = document.getElementById('webResultsCount');
        if (countElement) {
            countElement.textContent = '获取完成';
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();