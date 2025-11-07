// ==UserScript==
// @name         Urban Dictionary内容获取器 - 修复版
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  修复Urban Dictionary内容获取问题
// @author       Assistant
// @match        http://localhost:8080/*
// @match        http://127.0.0.1:8080/*
// @grant        GM_xmlhttpRequest
// @connect      urbandictionary.com
// @connect      www.urbandictionary.com
// ==/UserScript==

(function() {
    'use strict';

    console.log('Urban Dictionary修复版脚本加载成功');

    let isSearching = false;

    // 初始化
    setTimeout(initialize, 1500);

    function initialize() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (!searchBtn || !searchInput) {
            console.log('Urban Dictionary: 未找到搜索元素，3秒后重试...');
            setTimeout(initialize, 3000);
            return;
        }

        // 绑定事件
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        console.log('Urban Dictionary脚本初始化完成');
    }

    function handleSearch() {
        const query = document.getElementById('searchInput').value.trim();
        const isWebMode = document.getElementById('modeWeb')?.checked;

        if (!query || !isWebMode || isSearching) return;

        isSearching = true;
        console.log('Urban Dictionary: 开始搜索:', query);
        searchUrbanDictionary(query);
    }

    function searchUrbanDictionary(query) {
        updateWebContent(`
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> 正在查询Urban Dictionary...
                <br>
                <small>搜索词: "${escapeHtml(query)}"</small>
                <br>
                <small style="color: #6c757d;">正在尝试多种解析方式...</small>
            </div>
        `);

        const url = `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(query)}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Referer': 'https://www.urbandictionary.com/'
            },
            onload: function(response) {
                isSearching = false;

                if (response.status === 200) {
                    console.log('Urban Dictionary: 收到响应，长度:', response.responseText.length);
                    processUrbanDictionaryResponse(response.responseText, query);
                } else {
                    console.log('Urban Dictionary: HTTP状态码:', response.status);
                    showResult('请求失败', `HTTP错误: ${response.status}`, 'error');
                }
            },
            onerror: function(error) {
                isSearching = false;
                console.log('Urban Dictionary: 网络错误:', error);
                showResult('网络错误', '无法连接到Urban Dictionary', 'error');
            },
            ontimeout: function() {
                isSearching = false;
                showResult('请求超时', '连接超时，请稍后重试', 'error');
            }
        });
    }

    function processUrbanDictionaryResponse(html, query) {
        try {
            console.log('Urban Dictionary: 开始解析HTML内容');

            // 创建临时DOM进行解析
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 调试：检查页面内容
            const title = doc.querySelector('title');
            console.log('页面标题:', title ? title.textContent : '无标题');

            // 检查是否被重定向或显示错误页面
            if (html.includes('There aren\'t any definitions for') ||
                html.includes('No results found for') ||
                html.includes('Sorry, no results for')) {
                showResult('未找到', `在Urban Dictionary中未找到 "${query}"`, 'error');
                return;
            }

            // 尝试多种解析方法
            const content = tryAllParsingMethods(doc, query);
            if (content) {
                updateWebContent(content);
                console.log('Urban Dictionary: 成功解析内容');
            } else {
                // 显示原始HTML用于调试
                showDebugInfo(html, query);
            }

        } catch (error) {
            console.error('Urban Dictionary解析错误:', error);
            showResult('解析错误', `处理内容时出错: ${error.message}`, 'error');
        }
    }

    function tryAllParsingMethods(doc, query) {
        console.log('尝试方法1: 现代选择器');
        let content = parseWithModernSelectors(doc, query);
        if (content) return content;

        console.log('尝试方法2: 传统选择器');
        content = parseWithLegacySelectors(doc, query);
        if (content) return content;

        console.log('尝试方法3: 数据属性选择器');
        content = parseWithDataAttributes(doc, query);
        if (content) return content;

        console.log('尝试方法4: 通用解析');
        content = parseGenericContent(doc, query);
        return content;
    }

    function parseWithModernSelectors(doc, query) {
        // 尝试新的选择器模式
        const definitions = doc.querySelectorAll('[data-defid]');

        if (definitions.length === 0) {
            console.log('方法1: 未找到[data-defid]元素');
            return null;
        }

        console.log(`方法1: 找到 ${definitions.length} 个定义`);

        let content = createHeader(query, definitions.length);

        definitions.forEach((definition, index) => {
            if (index < 5) {
                const definitionContent = parseModernDefinition(definition, index + 1);
                if (definitionContent) {
                    content += definitionContent;
                }
            }
        });

        content += addFooter();
        return content;
    }

    function parseModernDefinition(definition, number) {
        // 提取单词
        const word = definition.querySelector('.word') ||
                    definition.querySelector('a.word') ||
                    definition.querySelector('h1') ||
                    definition.querySelector('h2') ||
                    definition.querySelector('h3');

        // 提取含义
        const meaning = definition.querySelector('.meaning') ||
                       definition.querySelector('.definition');

        // 提取例句
        const example = definition.querySelector('.example') ||
                       definition.querySelector('.usage');

        // 提取投票
        const upvotes = definition.querySelector('.up .count') ||
                       definition.querySelector('.upvotes') ||
                       definition.querySelector('[data-upvotes]');
        const downvotes = definition.querySelector('.down .count') ||
                         definition.querySelector('.downvotes') ||
                         definition.querySelector('[data-downvotes]');

        // 提取贡献者
        const contributor = definition.querySelector('.contributor') ||
                           definition.querySelector('.author');

        if (!meaning) {
            console.log(`定义 #${number}: 未找到含义`);
            return null;
        }

        const wordText = word ? word.textContent.trim() : '';
        const meaningText = meaning.textContent.trim();
        const exampleText = example ? example.textContent.trim() : '';
        const upvotesText = upvotes ? upvotes.textContent.trim() : '0';
        const downvotesText = downvotes ? downvotes.textContent.trim() : '0';
        const contributorText = contributor ? contributor.textContent.replace('by', '').trim() : 'Unknown';

        return createDefinitionCard({
            number,
            word: wordText,
            meaning: meaningText,
            example: exampleText,
            upvotes: upvotesText,
            downvotes: downvotesText,
            contributor: contributorText
        });
    }

    function parseWithLegacySelectors(doc, query) {
        // 传统选择器
        const definitions = doc.querySelectorAll('.def-panel, .definition-panel');

        if (definitions.length === 0) {
            console.log('方法2: 未找到传统定义面板');
            return null;
        }

        console.log(`方法2: 找到 ${definitions.length} 个传统定义`);

        let content = createHeader(query, definitions.length);

        definitions.forEach((definition, index) => {
            if (index < 5) {
                const definitionContent = parseLegacyDefinition(definition, index + 1);
                if (definitionContent) {
                    content += definitionContent;
                }
            }
        });

        content += addFooter();
        return content;
    }

    function parseLegacyDefinition(panel, number) {
        const word = panel.querySelector('.word, .term, h1, h2, h3');
        const meaning = panel.querySelector('.meaning, .definition');
        const example = panel.querySelector('.example, .usage');
        const upvotes = panel.querySelector('.up .count, .upvotes');
        const downvotes = panel.querySelector('.down .count, .downvotes');
        const contributor = panel.querySelector('.contributor, .author');

        if (!meaning) return null;

        const wordText = word ? word.textContent.trim() : '';
        const meaningText = meaning.textContent.trim();
        const exampleText = example ? example.textContent.trim() : '';
        const upvotesText = upvotes ? upvotes.textContent.trim() : '0';
        const downvotesText = downvotes ? downvotes.textContent.trim() : '0';
        const contributorText = contributor ? contributor.textContent.replace('by', '').trim() : 'Unknown';

        return createDefinitionCard({
            number,
            word: wordText,
            meaning: meaningText,
            example: exampleText,
            upvotes: upvotesText,
            downvotes: downvotesText,
            contributor: contributorText
        });
    }

    function parseWithDataAttributes(doc, query) {
        // 尝试通过类名和结构解析
        const potentialDefinitions = doc.querySelectorAll('div, section, article');
        let definitions = [];

        potentialDefinitions.forEach(element => {
            // 寻找包含定义文本的元素
            const text = element.textContent || '';
            if (text.length > 50 && text.length < 2000 &&
                !text.includes('cookie') && !text.includes('privacy') &&
                !text.includes('广告') && !text.includes('advertisement')) {

                // 检查是否包含投票信息
                const hasVotes = element.innerHTML.includes('up') && element.innerHTML.includes('down');
                const hasMeaning = text.includes(' ') && text.split(' ').length > 5;

                if (hasMeaning || hasVotes) {
                    definitions.push(element);
                }
            }
        });

        if (definitions.length === 0) {
            console.log('方法3: 未找到数据属性定义');
            return null;
        }

        console.log(`方法3: 找到 ${definitions.length} 个潜在定义`);

        let content = createHeader(query, definitions.length);

        definitions.forEach((definition, index) => {
            if (index < 3) {
                content += createGenericDefinitionCard(definition, index + 1);
            }
        });

        content += addFooter();
        return content;
    }

    function parseGenericContent(doc, query) {
        // 最后的手段：提取所有看起来像定义的内容
        const allText = doc.body.textContent || '';
        const lines = allText.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 20 && trimmed.length < 500 &&
                   !trimmed.includes('©') && !trimmed.includes('Privacy');
        });

        if (lines.length === 0) {
            console.log('方法4: 未找到通用内容');
            return null;
        }

        console.log(`方法4: 找到 ${lines.length} 行文本`);

        let content = createHeader(query, lines.length);

        lines.slice(0, 5).forEach((line, index) => {
            content += `
                <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #ff6b6b;">
                    <div style="font-weight: bold; margin-bottom: 8px; color: #495057;">
                        内容 ${index + 1}
                    </div>
                    <div style="line-height: 1.5;">
                        ${escapeHtml(line.trim())}
                    </div>
                </div>
            `;
        });

        content += `
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>注意：</strong> 这是通用解析结果，可能包含无关内容
            </div>
            ${addFooter()}
        `;

        return content;
    }

    function createHeader(query, count) {
        return `
            <div style="border-bottom: 2px solid #ff6b6b; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color: #ff6b6b; margin-bottom: 10px;">
                    <i class="fas fa-theater-masks"></i> Urban Dictionary: ${escapeHtml(query)}
                </h2>
                <div style="color: #6c757d;">
                    找到 ${count} 个相关内容
                </div>
            </div>
        `;
    }

    function createDefinitionCard(data) {
        return `
            <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <h3 style="color: white; margin: 0; font-size: 1.3rem;">
                        <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px; margin-right: 10px;">#${data.number}</span>
                        ${escapeHtml(data.word || '')}
                    </h3>
                    <div style="display: flex; gap: 15px; font-size: 0.9rem;">
                        <span style="background: rgba(76, 175, 80, 0.8); padding: 2px 8px; border-radius: 4px;">
                            <i class="fas fa-thumbs-up"></i> ${escapeHtml(data.upvotes)}
                        </span>
                        <span style="background: rgba(244, 67, 54, 0.8); padding: 2px 8px; border-radius: 4px;">
                            <i class="fas fa-thumbs-down"></i> ${escapeHtml(data.downvotes)}
                        </span>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <h4 style="color: #ffd54f; margin-bottom: 8px; font-size: 1rem;">
                        <i class="fas fa-lightbulb"></i> 含义
                    </h4>
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; line-height: 1.5;">
                        ${escapeHtml(data.meaning)}
                    </div>
                </div>

                ${data.example ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #4fc3f7; margin-bottom: 8px; font-size: 1rem;">
                        <i class="fas fa-comment-dots"></i> 例句
                    </h4>
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; font-style: italic; line-height: 1.5;">
                        "${escapeHtml(data.example)}"
                    </div>
                </div>
                ` : ''}

                <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: rgba(255,255,255,0.8);">
                    <span>
                        <i class="fas fa-user-edit"></i> 贡献者: ${escapeHtml(data.contributor)}
                    </span>
                    <span>
                        <i class="fas fa-heart" style="color: #ff6b6b;"></i> Urban Dictionary
                    </span>
                </div>
            </div>
        `;
    }

    function createGenericDefinitionCard(element, number) {
        const text = element.textContent.trim();
        const html = element.innerHTML;

        return `
            <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <h4 style="color: #1976d2; margin: 0;">定义 ${number}</h4>
                    <small style="color: #666;">通用解析</small>
                </div>
                <div style="line-height: 1.5; margin-bottom: 10px;">
                    ${escapeHtml(text.substring(0, 300))}${text.length > 300 ? '...' : ''}
                </div>
                <div style="font-size: 0.8rem; color: #666;">
                    元素: ${element.tagName.toLowerCase()}
                </div>
            </div>
        `;
    }

    function showDebugInfo(html, query) {
        console.log('显示调试信息');

        const preview = html.substring(0, 1000);
        updateWebContent(`
            <div style="padding: 20px;">
                <h3 style="color: #ff6b6b;">
                    <i class="fas fa-bug"></i> 调试信息 - Urban Dictionary
                </h3>
                <p>搜索词: <strong>${escapeHtml(query)}</strong></p>
                <p>状态: 收到响应但无法解析标准格式</p>

                <details>
                    <summary>查看原始HTML前1000字符</summary>
                    <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; max-height: 300px; font-size: 12px; white-space: pre-wrap;">${escapeHtml(preview)}</pre>
                </details>

                <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                    <i class="fas fa-lightbulb"></i>
                    <strong>可能的原因:</strong>
                    <ul style="margin: 10px 0 0 20px;">
                        <li>Urban Dictionary页面结构已更新</li>
                        <li>触发了反爬虫机制</li>
                        <li>需要JavaScript渲染的内容</li>
                    </ul>
                </div>
            </div>
        `);
    }

    function addFooter() {
        return `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #ff6b6b;">
                <div style="display: flex; align-items: center; gap: 10px; color: #495057;">
                    <i class="fas fa-info-circle" style="color: #ff6b6b;"></i>
                    <div>
                        <strong>关于Urban Dictionary</strong>
                        <br>
                        <small>收录现代英语俚语、网络用语和文化术语的众包词典</small>
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 0.8rem;">
                    <i class="fas fa-database"></i> 数据来源: Urban Dictionary
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