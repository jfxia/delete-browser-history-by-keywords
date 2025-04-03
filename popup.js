document.addEventListener('DOMContentLoaded', function () {
    const keywordInput = document.getElementById('keywordInput');
    const searchButton = document.getElementById('searchButton');
    const historyList = document.getElementById('historyList');
    const deleteButton = document.getElementById('deleteButton');

    searchButton.addEventListener('click', function () {
        const keyword = keywordInput.value;
        if (keyword) {
            chrome.runtime.sendMessage({ action: 'searchHistory', keyword: keyword }, function (results) {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError.message);
                    return;
                }
                historyList.innerHTML = '';
                results.forEach(function (historyItem, index) {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = historyItem.url;
                    link.textContent = historyItem.title || 'No title available';
                    link.target = '_blank';

                    const img = document.createElement('img');
                    img.src = chrome.runtime.getURL('icon16.png');
                    img.style.marginRight = '5px';

                    link.prepend(img);
                    listItem.appendChild(link);
                    historyList.appendChild(listItem);

                    if (index % 2 === 1) {
                        listItem.style.backgroundColor = '#f0f0f0';
                    }
                });
                if (results.length > 0) {
                    deleteButton.disabled = false;
                } else {
                    deleteButton.disabled = true;
                }
            });
        }
    });

    deleteButton.addEventListener('click', function () {
        const keyword = keywordInput.value;
        if (keyword) {
            chrome.runtime.sendMessage({ action: 'deleteHistory', keyword: keyword });
            historyList.innerHTML = '';
            deleteButton.disabled = true;
        }
    });
});