// ==UserScript==
// @name         剑桥词典稳定版
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  稳定获取剑桥词典内容
// @author       Assistant
// @match        http://localhost:8080/*
// @match        http://127.0.0.1:8080/*
// @grant        GM_xmlhttpRequest
// @connect      dictionary.cambridge.org
// ==/UserScript==

(function() {
    'use strict';

    console.log('剑桥词典稳定版脚本加载成功');

    let isSearching = false;

    // 初始化
    setTimeout(initialize, 1500);

    function initialize() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (!searchBtn || !searchInput) {
            console.log('未找到搜索元素，3秒后重试...');
            setTimeout(initialize, 3000);
            return;
        }

        // 绑定事件
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        console.log('剑桥词典脚本初始化完成');
    }

    function handleSearch() {
        const query = document.getElementById('searchInput').value.trim();
        const isWebMode = document.getElementById('modeWeb')?.checked;

        if (!query || !isWebMode || isSearching) return;

        isSearching = true;
        console.log('开始搜索:', query);
        searchCambridge(query);
    }

    function searchCambridge(query) {
        updateWebContent(`
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> 正在查询剑桥词典...
                <br>
                <small>搜索词: "${escapeHtml(query)}"</small>
            </div>
        `);

        const url = `https://dictionary.cambridge.org/zhs/%E8%AF%8D%E5%85%B8/%E8%8B%B1%E8%AF%AD/${encodeURIComponent(query.toLowerCase())}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache'
            },
            onload: function(response) {
                isSearching = false;

                if (response.status === 200) {
                    processCambridgeResponse(response.responseText, query);
                } else if (response.status === 404) {
                    showResult('未找到', `在剑桥词典中未找到单词 "${query}"`, 'error');
                } else if (response.status === 403) {
                    showResult('访问被拒绝', '剑桥词典拒绝了请求，请稍后重试', 'error');
                } else {
                    showResult('请求失败', `HTTP错误: ${response.status}`, 'error');
                }
            },
            onerror: function(error) {
                isSearching = false;
                showResult('网络错误', '无法连接到剑桥词典，请检查网络连接', 'error');
            },
            ontimeout: function() {
                isSearching = false;
                showResult('请求超时', '连接剑桥词典超时，请稍后重试', 'error');
            }
        });
    }

    function processCambridgeResponse(html, query) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 多种方式检查是否找到单词
            const notFoundSelectors = [
                '.hflx.lt2b.lmb-25.cdo-section-title-handle',
                '.lmb-25.cdo-section-title-handle',
                '.hflx.lt2b',
                '[data-title="无此词条"]',
                '.empty-message'
            ];

            let notFound = false;
            for (const selector of notFoundSelectors) {
                const element = doc.querySelector(selector);
                if (element && (element.textContent.includes('无此词条') || element.textContent.includes('not found'))) {
                    notFound = true;
                    break;
                }
            }

            if (notFound) {
                showResult('未找到', `在剑桥词典中未找到单词 "${query}"`, 'error');
                return;
            }

            // 尝试多种选择器提取内容
            const content = extractContentWithFallback(doc, query);
            if (content) {
                updateWebContent(content);
            } else {
                showResult('解析失败', '无法解析剑桥词典页面内容，页面结构可能已更新', 'error');
            }

        } catch (error) {
            console.error('解析错误:', error);
            showResult('解析错误', `处理页面内容时出错: ${error.message}`, 'error');
        }
    }

    function extractContentWithFallback(doc, query) {
        // 方法1: 尝试新的选择器
        let content = tryModernSelectors(doc, query);
        if (content) return content;

        // 方法2: 尝试旧的选择器
        content = tryLegacySelectors(doc, query);
        if (content) return content;

        // 方法3: 通用解析
        content = tryGenericExtraction(doc, query);
        return content;
    }

    function tryModernSelectors(doc, query) {
        let content = '';

        // 尝试新的单词标题选择器
        const wordSelectors = [
            'h1.hw',
            '.headword',
            '.di-title h1',
            '.hw.dhw',
            '[class*="headword"]',
            '.dheadword'
        ];

        let wordElement = null;
        for (const selector of wordSelectors) {
            wordElement = doc.querySelector(selector);
            if (wordElement) break;
        }

        if (wordElement) {
            content += `
                <div style="border-bottom: 2px solid #2575fc; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #2575fc; margin-bottom: 10px;">
                        <i class="fas fa-book"></i> ${escapeHtml(wordElement.textContent.trim())}
                    </h2>
            `;

            // 发音
            const pronSelectors = ['.pron.dpron', '.pronunciation', '.dpron', '[class*="pron"]'];
            let pronElement = null;
            for (const selector of pronSelectors) {
                pronElement = doc.querySelector(selector);
                if (pronElement) break;
            }

            if (pronElement) {
                content += `
                    <div style="color: #6c757d; font-size: 1.1rem; margin-bottom: 10px;">
                        <i class="fas fa-volume-up"></i> ${escapeHtml(pronElement.textContent.trim())}
                    </div>
                `;
            }

            // 词性
            const posSelectors = ['.pos.dpos', '.posgram', '.dpos', '[class*="pos"]'];
            let posElement = null;
            for (const selector of posSelectors) {
                posElement = doc.querySelector(selector);
                if (posElement) break;
            }

            if (posElement) {
                content += `
                    <div style="background: #e7f1ff; color: #2575fc; padding: 5px 10px; border-radius: 5px; display: inline-block; font-weight: bold;">
                        ${escapeHtml(posElement.textContent.trim())}
                    </div>
                `;
            }

            content += `</div>`;
        }

        // 定义
        const defSelectors = [
            '.def.ddef_d.db',
            '.ddef_d',
            '.definition',
            '.ddef_d.db',
            '[class*="def"]'
        ];

        let definitions = [];
        for (const selector of defSelectors) {
            definitions = Array.from(doc.querySelectorAll(selector));
            if (definitions.length > 0) break;
        }

        if (definitions.length > 0) {
            content += `<h3 style="color: #495057; margin-bottom: 15px;"><i class="fas fa-list"></i> 词义解释</h3>`;

            definitions.slice(0, 6).forEach((def, index) => {
                content += `
                    <div style="margin-bottom: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2575fc;">
                        <div style="font-weight: bold; color: #495057;">
                            ${index + 1}. ${escapeHtml(def.textContent.trim())}
                        </div>
                    </div>
                `;
            });
        }

        // 例句
        const exampleSelectors = [
            '.eg.deg',
            '.dexamp',
            '.example',
            '.deg',
            '[class*="example"]'
        ];

        let examples = [];
        for (const selector of exampleSelectors) {
            examples = Array.from(doc.querySelectorAll(selector));
            if (examples.length > 0) break;
        }

        if (examples.length > 0) {
            content += `<h3 style="color: #495057; margin-bottom: 15px; margin-top: 20px;"><i class="fas fa-comment"></i> 例句</h3>`;

            examples.slice(0, 4).forEach(example => {
                content += `
                    <div style="margin-bottom: 10px; padding: 10px; background: white; border: 1px solid #e9ecef; border-radius: 6px; font-style: italic;">
                        <i class="fas fa-quote-left" style="color: #6c757d; margin-right: 5px;"></i>
                        ${escapeHtml(example.textContent.trim())}
                    </div>
                `;
            });
        }

        if (content && (wordElement || definitions.length > 0)) {
            content += addFooter();
            return content;
        }

        return null;
    }

    function tryLegacySelectors(doc, query) {
        // 旧版本选择器作为备选
        const word = doc.querySelector('.hw.dhw') || doc.querySelector('.headword');
        const definitions = doc.querySelectorAll('.def.ddef_d.db, .definition');
        const examples = doc.querySelectorAll('.eg.deg, .example');

        if (!word && definitions.length === 0) {
            return null;
        }

        let content = '';

        if (word) {
            content += `
                <div style="border-bottom: 2px solid #2575fc; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #2575fc; margin-bottom: 10px;">
                        <i class="fas fa-book"></i> ${escapeHtml(word.textContent.trim())}
                    </h2>
                </div>
            `;
        }

        if (definitions.length > 0) {
            content += `<h3 style="color: #495057; margin-bottom: 15px;"><i class="fas fa-list"></i> 词义解释</h3>`;

            Array.from(definitions).slice(0, 5).forEach((def, index) => {
                content += `
                    <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        <strong>${index + 1}.</strong> ${escapeHtml(def.textContent.trim())}
                    </div>
                `;
            });
        }

        if (examples.length > 0) {
            content += `<h3 style="color: #495057; margin-bottom: 15px; margin-top: 20px;"><i class="fas fa-comment"></i> 例句</h3>`;

            Array.from(examples).slice(0, 3).forEach(example => {
                content += `
                    <div style="margin-bottom: 8px; padding: 8px; background: white; border: 1px solid #e9ecef; border-radius: 4px;">
                        ${escapeHtml(example.textContent.trim())}
                    </div>
                `;
            });
        }

        content += addFooter();
        return content;
    }

    function tryGenericExtraction(doc, query) {
        // 最后的手段：尝试提取任何看起来像词典内容的东西
        const possibleContent = doc.querySelectorAll('p, div, span');
        let foundContent = [];

        possibleContent.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > 20 && text.length < 500 &&
                !text.includes('cookie') && !text.includes('Cookie') &&
                !text.includes('隐私') && !text.includes('使用条款')) {
                foundContent.push(text);
            }
        });

        if (foundContent.length > 0) {
            let content = `
                <div style="border-bottom: 2px solid #2575fc; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #2575fc;">
                        <i class="fas fa-book"></i> ${escapeHtml(query)}
                    </h2>
                    <p><em>使用通用解析模式</em></p>
                </div>
                <h3>提取的内容:</h3>
            `;

            foundContent.slice(0, 8).forEach((text, index) => {
                content += `
                    <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        ${escapeHtml(text)}
                    </div>
                `;
            });

            content += addFooter();
            return content;
        }

        return null;
    }

    function addFooter() {
        return `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 0.8rem;">
                <i class="fas fa-database"></i> 数据来源: 剑桥词典 (Cambridge Dictionary)
                <br>
                <i class="fas fa-clock"></i> 更新时间: ${new Date().toLocaleString()}
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
        // 尝试使用全局函数
        if (typeof window.injectWebContent === 'function') {
            window.injectWebContent(html);
        } else {
            // 直接更新DOM
            const webContent = document.getElementById('webResultsContent');
            if (webContent) {
                webContent.innerHTML = html;
            }
        }

        // 更新计数显示
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