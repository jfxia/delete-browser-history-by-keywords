function filterHistoryItems(results, keyword) {
    return results.filter(item => {
        const url = item.url.toLowerCase() || '';
        const title = item.title.toLowerCase() || '';
        return url.includes(keyword) || title.includes(keyword);
    });
}

function getAllHistoryWithPagination(startTime = 0, allResults = [], callback) {
    chrome.history.search({
        text: '',
        startTime: startTime,
        maxResults: 10000
    }, function (results) {
        if (chrome.runtime.lastError) {
            console.error('History search error:', chrome.runtime.lastError.message);
            callback(allResults);
            return;
        }
        allResults = allResults.concat(results);
        if (results.length === 10000) {
            const lastResult = results[results.length - 1];
            getAllHistoryWithPagination(lastResult.lastVisitTime, allResults, callback);
        } else {
            callback(allResults);
        }
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'searchHistory') {
        const keyword = message.keyword;
        getAllHistoryWithPagination(0, [], function (allHistory) {
            const filteredResults = filterHistoryItems(allHistory, keyword.toLowerCase());
            sendResponse(filteredResults);
        });
        return true;
    } else if (message.action === 'deleteHistory') {
        const keyword = message.keyword;
        getAllHistoryWithPagination(0, [], function (allHistory) {
            const filteredResults = filterHistoryItems(allHistory, keyword.toLowerCase());
            filteredResults.forEach(function (historyItem) {
                chrome.history.deleteUrl({ url: historyItem.url });
            });
        });
    }
});