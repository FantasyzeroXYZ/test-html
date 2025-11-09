// ==UserScript==
// @name         剑桥词典稳定版（结构化版）
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  稳定获取剑桥词典完整内容，并显示在底部面板（结构化美观）
// @author       Assistant
// @match        http://localhost:8080/*
// @match        http://127.0.0.1:8080/*
// @grant        GM_xmlhttpRequest
// @connect      dictionary.cambridge.org
// ==/UserScript==

(function() {
    'use strict';

    console.log('剑桥词典结构化脚本加载成功');

    let isSearching = false;

    setTimeout(initialize, 1500);

    function initialize() {
        const searchBtn = panelSearchBtn;
        const searchInput = panelSearchInput;

        if (!searchBtn || !searchInput) {
            console.log('未找到底部面板搜索元素，3秒后重试...');
            setTimeout(initialize, 3000);
            return;
        }

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });

        console.log('剑桥词典脚本初始化完成（面板绑定）');
    }

    function handleSearch() {
        const query = panelSearchInput.value.trim();
        if (!query || isSearching) return;
        isSearching = true;
        console.log('开始搜索:', query);
        searchCambridge(query);
    }

    function searchCambridge(query) {
        updatePanelContent(`<div class="loading" style="text-align:center; padding:20px;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><br>
            正在查询剑桥词典...<br><small>搜索词: "${escapeHtml(query)}"</small>
        </div>`);

        const url = `https://dictionary.cambridge.org/zhs/%E8%AF%8D%E5%85%B8/%E8%8B%B1%E8%AF%AD/${encodeURIComponent(query.toLowerCase())}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
            onload: function(response) {
                isSearching = false;
                if (response.status === 200) processResponse(response.responseText, query);
                else if (response.status === 404) showResult('未找到', `在剑桥词典中未找到单词 "${query}"`, 'error');
                else showResult('请求失败', `HTTP错误: ${response.status}`, 'error');
            },
            onerror: function() { isSearching = false; showResult('网络错误', '无法连接到剑桥词典', 'error'); },
            ontimeout: function() { isSearching = false; showResult('请求超时', '连接剑桥词典超时', 'error'); }
        });
    }

    function processResponse(html, query) {
        try {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const notFound = doc.querySelector('.empty-message, [data-title="无此词条"]');
            if (notFound) return showResult('未找到', `在剑桥词典中未找到单词 "${query}"`, 'error');
            const content = extractContent(doc, query);
            if (content) updatePanelContent(content);
            else showResult('解析失败', '无法解析剑桥词典页面内容，页面结构可能已更新', 'error');
        } catch (err) {
            console.error('解析错误:', err);
            showResult('解析错误', `处理页面内容时出错: ${err.message}`, 'error');
        }
    }

    function extractContent(doc, query) {
        let content = `<div style="font-family:Segoe UI, sans-serif; color:#212529;">`;

        // 单词标题 + 发音 + 词性
        const word = doc.querySelector('h1.hw, .headword')?.textContent.trim() || query;
        const pron = doc.querySelector('.pron.dpron, .dpron')?.textContent.trim() || '';
        const pos = doc.querySelector('.pos.dpos, .dpos')?.textContent.trim() || '';

        content += `<div style="border-bottom:2px solid #2575fc; padding-bottom:10px; margin-bottom:15px;">
            <h2 style="color:#2575fc; margin-bottom:5px;"><i class="fas fa-book"></i> ${escapeHtml(word)}</h2>`;
        if (pron) content += `<div style="color:#6c757d; font-size:1.1rem; margin-bottom:5px;">
            <i class="fas fa-volume-up"></i> ${escapeHtml(pron)}</div>`;
        if (pos) content += `<div style="display:inline-block; background:#e7f1ff; color:#2575fc; padding:3px 8px; border-radius:5px; font-weight:bold;">${escapeHtml(pos)}</div>`;
        content += `</div>`;

        // 词义
        const defs = doc.querySelectorAll('.def.ddef_d.db, .ddef_d, .definition');
        if (defs.length > 0) {
            content += `<h3 style="color:#495057; margin-bottom:10px;"><i class="fas fa-list"></i> 词义</h3>`;
            defs.forEach((def, idx) => {
                content += `<div style="margin-bottom:8px; padding:10px; background:#f8f9fa; border-radius:6px; border-left:4px solid #2575fc;">
                    <strong>${idx + 1}. ${escapeHtml(def.textContent.trim())}</strong>`;
                // 例句
                const exs = def.querySelectorAll('.eg.deg, .dexamp, .example, .deg');
                if (exs.length > 0) {
                    content += `<div style="margin-top:6px;">`;
                    exs.forEach(ex => {
                        content += `<div style="margin-bottom:5px; padding:5px 8px; background:#ffffff; border:1px solid #e9ecef; border-radius:4px; font-style:italic; color:#495057;">
                            <i class="fas fa-quote-left" style="color:#6c757d;"></i> ${escapeHtml(ex.textContent.trim())}
                        </div>`;
                    });
                    content += `</div>`;
                }
                content += `</div>`;
            });
        }

        content += addFooter();
        content += `</div>`;
        return content;
    }

    function addFooter() {
        return `<div style="margin-top:20px; padding-top:10px; border-top:1px solid #e9ecef; color:#6c757d; font-size:0.8rem;">
            <i class="fas fa-database"></i> 数据来源: 剑桥词典 (Cambridge Dictionary)<br>
            <i class="fas fa-clock"></i> 更新时间: ${new Date().toLocaleString()}
        </div>`;
    }

    function updatePanelContent(html) {
        if (panelTampermonkeyResult) panelTampermonkeyResult.innerHTML = html;
    }

    function escapeHtml(text){
        if(!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showResult(title,message,type='info'){
        const color = type==='error' ? '#dc3545':'#17a2b8';
        updatePanelContent(`<div style="text-align:center; padding:20px; color:${color}">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
        </div>`);
    }

})();
