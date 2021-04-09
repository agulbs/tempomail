var credentials = {};

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('submit').addEventListener('click', function() {
        var email = document.getElementById('email').value;

        params = {
            action: `requestEmailAccess&value=${email}@AppMailer.org`,
            tyle: "GET"
        }

        chrome.runtime.sendMessage({
            params,
            sender: "popup"
        }, response => {
            chrome.storage.sync.set({
                creds: response
            }, function() {
                console.log('Value is set to ' + response);
            });

            chrome.storage.sync.get(['creds'], function(result) {
                console.log('Value currently is ', result);
            });
        });

    }, false);
}, false);