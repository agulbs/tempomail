var contextClickedOn;
var email;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request)
    if (request.pasteEmail) {
        sendResponse({
            complete: true
        });
        contextClickedOn.value = this.email
        return;
    }
});


function insertEmail(e) {
    if (isOverImgBg(e)) {
        typeEmail(e);
    }
}

function mouseMove(e) {
    if (isOverImgBg(e)) {
        e.target.style.cursor = 'pointer';
    } else {
        e.target.style.cursor = 'auto';
    }
}

function mouseEnterOut(e) {
    setTMBtn(e.target);
}

function isOverImgBg(e) {
    return (e.clientX - e.target.getBoundingClientRect().left) / (e.target.scrollWidth - 20) * 100 > 97;
}

function typeEmail(e) {

    var inputElement = e['path'][0];
    inputElement.setAttribute("value", email);
    inputElement.value = email;
    const o = new Event('input', {
        bubbles: !0
    });
    inputElement.dispatchEvent(o);
}

function renderPasteEmailIcon() {
    console.log("running")
    var tags = document.querySelectorAll('input[name*="email"]:enabled:not([readonly]):not([type="checkbox"]):not([type="radio"]),input[type=email]:enabled:not([readonly])');
    var i = 0;
    for (var tag of tags) {
        if (tag.getAttribute("data-tmpmail-button") == "1") {
            return false;
        }

        var parent = tag.parentElement;
        var icon = document.createElement("img");
        var imageB64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAkFBMVEUAAABktfYeiOUhlvMhku8ilvIglfJcsPRXrfQkjugch+Uml/EilvJcsfVUq/Mgi+hXrPIskelRrPQgkOwij+sumvIhlvMeiOVktfYelfNmtvceiuhnt/cfke4ejesglfNApPQbhuUgk/Ffs/ZasPVKqfQ3n/MlmPNQrPVUrfUunPQqmvMynvQulOopkOg1l+qjFiGsAAAAFnRSTlMA1dXV8OHc1dXV1beRi4iIbm5oXT0MnbttCwAAARVJREFUSMft0clywjAMgOF03/dWihwvMVkIYen7v13rjsE0amJfO/AfOPmT0CQ7dkg9X5/Eu3rcvX8VeUri4cODtpIp7/PyzgNadiK6RNYruvQACMpKRMY3c4KzLQCgvpsSom6JYB+4JfkYEcKNh98ADPWLv2+XlRvPAADN3RI+vlsSAAdO0KqWw/dVSQQc7JY0bgkbz0FY0tZifzwQjIGwxH9FIRe9f87BYIm7ROZ+fAyAtpvGjV9bbRKA0YgWN5/r718sZlEwK9BlrcWfVASoAgepSaCQpw0H4e/z/CEMsPdcBBDOHRMKOFA4lWJA4XR6ADTGKkwA7Nyx0y88OC8wKXXvwTum9ZZte7m5PY33lB37x30BX9Fpgt/J+1AAAAAASUVORK5CYII=';

        tag.setAttribute("data-tmpmail-button", "1");
        tag.setAttribute('style', `background-image: url("data:image/png;base64,${imageB64}") !important`);
        tag.style.backgroundRepeat = 'no-repeat';
        tag.style.backgroundSize = '20px';
        tag.style.backgroundPosition = '97% center';
        tag.style.cursor = 'auto';

        tag.addEventListener('mousemove', mouseMove);
        tag.addEventListener('click', insertEmail);

        parent.append(icon)
    }
}

let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        let oldValue = mutation.oldValue;
        let newValue = mutation.target.textContent;
        if (oldValue !== newValue) {
            renderPasteEmailIcon();
        }
    });
});

observer.observe(document.body, {
    characterDataOldValue: true,
    subtree: true,
    childList: true,
    characterData: true
});

window.onload = function() {
    chrome.storage.sync.get(['email', 'secret', 'created'], function(items) {
        var expired = Math.round((new Date(items.created) - new Date()) / 1000);
        if (typeof items.email != "undefined" && typeof items.secret != "undefined" && expired < 21500) {
            email = items.email
        }
    })

    renderPasteEmailIcon();
}

document.addEventListener('contextmenu', function(e) {
    contextClickedOn = e.path[0]
}, false);