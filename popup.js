var setupFlag;
var credentials = {};
var emailMsgs = {};
var timer;

function save_options(data) {
    /*
     * Saves email token info to chrome.storage & global variable(s)
     * Updates popup.html with email info.
     * Starts listening for incoming emails.
     *
     * params:
     *     data: Object { address: "emailAddress", secretKey: "secretKey" }
     */

    console.log(`popup::save_options`)
    let toSave = {
        email: data.address,
        secret: data.secretKey
    };

    credentials = toSave;

    chrome.storage.sync.set(toSave, function() {
        restore_options();
    });

    setTimer(listenForEmails, 3000);

}

function restore_options() {
    /*
     * Checks to see if there is existing email credentials. If none found,
     * generates new, else displays existing.
     * Updates popup.html with email info.
     * Starts listening for incoming emails.
     */

    console.log(`popup::restore_options`)
    chrome.storage.sync.get([
        'email',
        'secret',
    ], function(items) {
        if (typeof items.email != "undefined" && typeof items.secret != "undefined") {
            setupFlag = false;
            document.getElementById('emailAddress').innerHTML = " " + items.email;
            credentials = {
                email: items.email,
                secret: items.secret
            }
        } else {
            setupFlag = true;
            getNewEmailAddress();
            document.getElementById('emailAddress').innerHTML = "Register a new email.";
        }
    });


}

function setTimer(func, time) {
    console.log(`popup::setTimer: func=${func}, time=${time}`);

    if (typeof(timer) != "undefined") {
        clearInterval(timer);
    }

    timer = setInterval(func, time);
}

function listenForEmails() {
    console.log(`popup::listenForEmails`);
    if (!('secret' in credentials)) {
        return false;
    }

    var data = {
        // action: `checkInbox&value=${credentials.secret}`,
        action: `checkInbox&value=MmbaqlOE66iSq9IcBFDAVeKjEyideKee`,
        method: "GET"
    }

    postData(data).then(res => {
        Object.keys(res).reverse().forEach((msg) => {
            if (!(msg in emailMsgs)) {
                renderEmailMsg(res[msg])
            }
        });

        emailMsgs = res;
    }, (err) => {
        console.log(err)
    })

    // https://temporarymail.com/ajax/?action=checkInbox&value=Cm2it3frRDtP73bGMgNpkzrYRXZbz1UH
}

function clear_options() {
    console.log(`popup::clear_options`);
    var remove = [];

    chrome.storage.sync.get(function(items) {
        items.forEach((item) => {
            if (item == "email" || item == "secret") {
                remove.push(item);
            }
        })

        chrome.storage.sync.remove(remove, function(items) {
            chrome.storage.sync.get(function(items) {
                items.forEach((item) => {
                    console.log("removed: " + index);
                })
            });
        });
    });


}

function renderEmailMsg(msg) {
    // attachments: []
    // date: "1618003920"
    // from: "alekgulbenkian@gmail.com"
    // id: "BaofWrmo5EBU6CLl9RiNscFBRxo5reEa"
    // name: null
    // sourceHash: null
    // subject: "test fuck"
    // to: "gee.mcgee@appmailer.org"

    var label = "minutes"
    var date = new Date(msg.date * 1000);
    var dnow = new Date();
    var dif = Math.floor(((dnow.getTime() - date.getTime()) / 1000) / 60);
    date = date.toISOString().split('T')[0] + " " + date.toLocaleTimeString();

    if (dif >= 60 && dif < 1440) {
        dif = Math.floor(dif / 60);
        label = "hours";
    }

    if (dif >= 1440) {
        dif = Math.floor(dif / 1440);
        label = "days";
    }

    document.getElementById('emailMsgs').innerHTML += `
        <div class="row mt-1 pb-2" style="font-size:12px;border-bottom:solid 1px black;">
            <div class="col-4">${dif} ${label} ago<br>(${date})</div>
            <div class="col-4">${msg.from}</div>
            <div class="col-4">${msg.subject}</div>
        </div>
    `;
}

function setDomains() {
    console.log(`popup::setDomains`);
    var data = {
        action: "getDomains",
        method: "GET"
    }

    postData(data).then(res => {
        res.forEach((r) => {
            daySelect = document.getElementById('domains');
            daySelect.options[daySelect.options.length] = new Option('@' + r, r);
        })
    }, (err) => {
        console.log(err)
    })
}

function getNewEmailAddress() {
    console.log(`popup::getNewEmailAddress`);

    var data = {
        method: "GET",
        action: ""
    }

    if (setupFlag) {
        data['action'] = `requestEmailAccess&value=random`;
        setupFlag = false;
    } else {
        var email = document.getElementById('email').value

        if (email == "Please enter an email." || email.length < 1) {
            return false;
        }

        var domain = document.getElementById('domains');
        domain = domain.selectedOptions[0].value;

        data['action'] = `requestEmailAccess&value=${email}@${domain}`
    }

    postData(data).then(res => {
        document.getElementById('email').value = ''
        save_options(res);
    }, (err) => {
        console.log(err)
    })
}

function postData(data) {
    console.log(`popup::postData: data=${data}`);
    var url = `https://temporarymail.com/ajax/api.php?action=${data['action']}`;
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).then(response => response.json());
}

document.addEventListener('DOMContentLoaded', function() {
    restore_options();
    setDomains();
    listenForEmails();
    setTimer(listenForEmails, 3000);
});
document.getElementById('getNewEmailAddress').addEventListener('click', getNewEmailAddress)