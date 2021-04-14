function responseMsg(msg) {
    console.log(msg)
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    tabID = tabId;
    chrome.tabs.sendMessage(tabId, {
        text: 'pasteEmail'
    }, responseMsg);
});