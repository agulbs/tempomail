function save_options(data) {
    let toSave = {
        email: "data.emaileeeee",
        // secret: "data.secret"
        email: data.email,
        secret: data.secret
    };

    chrome.storage.sync.set(toSave, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        restore_options();
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get([
        'email',
        'secret',
    ], function(items) {
        if (typeof items.email != "undefined" && typeof items.secret != "undefined") {
            console.log(items.email)
            document.getElementById('email').value = items.email;
        } else {
            document.getElementById('email').placeholder = "Please enter an email.";
        }
    });
}

function clear_options() {
    var remove = [];

    chrome.storage.sync.get(function(Items) {
        $.each(Items, function(index, value) {
            if (index == "email" || index == "secret") {
                remove.push(index);
            }
        });

        chrome.storage.sync.remove(remove, function(Items) {
            chrome.storage.sync.get(function(Items) {
                $.each(Items, function(index, value) {
                    console.log("removed: " + index);
                });
            });
        });
    });
}

function getNewEmail() {
    console.log("fuck")
    var email = document.getElementById('email').value

    if (email == "Please enter an email." || email.length < 1) {
        return false;
    }

    var data = {
        action: `requestEmailAccess&value=${email}@AppMailer.org`,
        method: "GET"
    }

    postData(data).then(res => {
        console.log(res);
        save_options(res);
    }, (err) => {
        console.log(err)
    })
}

function postData(data) {
    var url = `https://temporarymail.com/ajax/api.php?action=${data['action']}`;
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).then(response => response.json());
}

document.addEventListener('DOMContentLoaded', clear_options);
document.getElementById('getNewEmail').addEventListener('click', getNewEmail)