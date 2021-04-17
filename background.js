function responseMsg(msg) {
    console.log(msg)
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // if (changeInfo.status == 'complete' && tab.active) {
    if (tab.active) {
        chrome.tabs.sendMessage(tabId, {
            cmd: 'pasteEmail'
        }, responseMsg);
    }

});