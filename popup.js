// popup.js
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightKeywords(text, keywords) {
    if (!keywords.length) return escapeHtml(text);
    
    const escapedKeywords = [...new Set(keywords)]
        .sort((a, b) => b.length - a.length)
        .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    return escapeHtml(text)
        .replace(regex, '<span style="color:red;font-weight:bold">$1</span>')
        .replace(/\n/g, '<br>');
}

document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        keywordInput: document.getElementById('keywordInput'),
        searchButton: document.getElementById('searchButton'),
        deleteButton: document.getElementById('deleteButton'),
        historyList: document.getElementById('historyList')
    };

    dom.searchButton.addEventListener('click', () => {
        const rawKeywords = dom.keywordInput.value.trim();
        const keywords = rawKeywords.split(/\s+/).filter(k => k);
        
        if (!keywords.length) return;
        
        chrome.runtime.sendMessage({ 
            action: 'searchHistory', 
            keyword: rawKeywords 
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Search error:', chrome.runtime.lastError.message);
                return;
            }
            
            const sortedResponse = response.sort((a, b) => {
                return b.lastVisitTime - a.lastVisitTime;
            });
            
            dom.historyList.innerHTML = '';
            dom.deleteButton.disabled = !sortedResponse.length;
            
            sortedResponse.forEach((item, index) => {
                const li = document.createElement('li');
                li.style.backgroundColor = index % 2 ? '#f8f9fa' : 'transparent';
                
                const a = document.createElement('a');
                a.href = item.url;
                a.target = '_blank';
                a.style.display = 'flex';
                a.style.alignItems = 'center';
                
                const icon = document.createElement('img');
                icon.src = chrome.runtime.getURL('icon16.png');
                icon.style.marginRight = '8px';
                
                const content = document.createElement('div');
                content.innerHTML = `
                    <div>${highlightKeywords(item.title || 'Untitled', keywords)}</div>
                    <div style="font-size:0.8em;color:#666">
                        ${highlightKeywords(item.url, keywords)}
                    </div>
                    <div style="font-size:0.7em;color:#999">
                        ${new Date(item.lastVisitTime).toLocaleString()}
                    </div>
                `;
                
                a.append(icon, content);
                li.append(a);
                dom.historyList.append(li);
            });
        });
    });

    dom.deleteButton.addEventListener('click', () => {
        const keyword = dom.keywordInput.value.trim();
        if (!keyword) return;
        
        chrome.runtime.sendMessage({ 
            action: 'deleteHistory', 
            keyword: keyword 
        }, () => {
            dom.historyList.innerHTML = '';
            dom.deleteButton.disabled = true;
        });
    });
});
