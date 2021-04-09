document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('submit');

    checkPageButton.addEventListener('click', function() {
        email = document.getElementById('email').value;

        params = {
            action: `requestEmailAccess&value=${email}@AppMailer.org`,
            tyle: "POST"
        }

        chrome.runtime.sendMessage({
            params: {
                action: `requestEmailAccess&value=${email}@AppMailer.org`,
                tyle: "GET"
            },
            sender: "popup"
        }, response => {
            console.log(response)
        });

        // requestData(params).then((res) => {
        //     console.log(res)
        // }, (err) => {
        //     console.log(err)
        // })

    }, false);
}, false);