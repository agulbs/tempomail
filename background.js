chrome.runtime.onInstalled.addListener(function() {

});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.sender === 'popup') {
        console.log(msg);
        requestData(msg['params']).then((res) => {
            handleData(res).then(sendResponse)
        })

        return true;
    }
});

function handleData(data) {
    return new Promise(resolve => {
        // do something async
        resolve({
            data: data
        });
    });
}

async function requestData(params) {
    return await request(params);
}


function request(args) {
    url = `https://temporarymail.com/ajax/api.php?action=${args['action']}`;
    return $.ajax({
        url: url,
        type: args['type'],
        headers: {
            "Content-Type": "application/json",
        },
    });
}