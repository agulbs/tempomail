chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    switch (msg.text) {
        case 'pasteEmail':
            chrome.storage.sync.get([
                'email',
                'secret',
                'created'
            ], function(items) {
                console.log(items)
                var expired = Math.round((new Date(items.created) - new Date()) / 1000);

                if (typeof items.email != "undefined" && typeof items.secret != "undefined" && expired < 21500) {
                    var tags = document.getElementsByTagName('input');
                    for (var tag of tags) {
                        if (tag.type == "email") {
                            tag.value = items.email
                        }
                    }
                }
            });

            sendResponse("done");
            break;
    }
});