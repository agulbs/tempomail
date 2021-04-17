var inputs = {

}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    var returnMsg;
    switch (msg.cmd) {
        case 'pasteEmail':
            returnMsg = pasteEmail()
            break;
    }

    sendResponse(returnMsg);
});

function pasteEmail() {
    chrome.storage.sync.get([
        'email',
        'secret',
        'created'
    ], function(items) {
        var expired = Math.round((new Date(items.created) - new Date()) / 1000);

        if (typeof items.email != "undefined" && typeof items.secret != "undefined" && expired < 21500) {
            var tags = document.getElementsByTagName('input');
            var i = 0;
            for (var tag of tags) {
                if (
                    tag.type == "email" || tag.name == "email" || tag.id == "email" ||
                    tag.type == "username" || tag.name == "username" || tag.id == "username"
                ) {
                    // tag.value = items.email
                    tag.style.width = (tag.offsetWidth - 100) + 'px';
                    var parent = tag.parentElement;
                    var icon = document.createElement("IMG")
                    icon.setAttribute("src", chrome.extension.getURL("./images/icon-16.png"));
                    icon.setAttribute("width", "25px")
                    icon.setAttribute("padding", "0px 0px 0px 5px")

                    var id = "email" + i;
                    icon.onclick = function() {
                        var elem = inputs[id];
                        elem.setAttribute("value", items.email);
                        elem.value = items.email
                    }

                    parent.append(icon)
                    inputs[id] = tag;
                    i++;
                }
            }
        }
    });

    return {
        msg: "pasted"
    };
}