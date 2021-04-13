/* Global Variables */
var credentials = {};
var emailMsgs = {};
var activeMsg;
var timer;

function saveOptions(data) {
    /*
     * Saves email token info to chrome.storage & global variable(s)
     * Updates popup.html with email info.
     * Starts listening for incoming emails.
     *
     * params:
     *     data: Object { address: "emailAddress", secretKey: "secretKey" }
     */

    // console.log(`popup::saveOptions`)
    let toSave = {
        email: data.address,
        secret: data.secretKey,
        created: data.created
    };

    credentials = toSave;

    chrome.storage.sync.set(toSave, function() {
        restoreOptions();
    });

    setTimer(listenForEmails, 3000);

}

function clearOptions() {
    /*
     * Clears data stored in chrome.storage
     */

    // console.log(`popup::clearOptions`);

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
                    // console.log("removed: " + index);
                })
            });
        });
    });
}

function restoreOptions() {
    /*
     * Checks to see if there is existing email credentials. If none found,
     * generates new, else displays existing.
     * Updates popup.html with email info.
     * Starts listening for incoming emails.
     */

    // console.log(`popup::restoreOptions`)

    chrome.storage.sync.get([
        'email',
        'secret',
        'created'
    ], function(items) {
        var expired = Math.round((new Date(items.created) - new Date()) / 1000);

        if (typeof items.email != "undefined" && typeof items.secret != "undefined" && expired < 21500) {
            document.getElementById('emailAddress').value = items.email;
            credentials = {
                email: items.email,
                secret: items.secret,
                created: items.created
            };

            console.log(credentials)
            listenForEmails();
        } else {
            getNewEmailAddress();
        }
    });

}

function getNewEmailAddress() {
    /*
     * Creates new email address
     */

    // console.log(`popup::getNewEmailAddress`);

    var data = {
        method: "GET",
        action: "requestEmailAccess&value=random"
    }

    postData(data).then(res => {
        res['created'] = new Date().getTime();
        console.log(res)
        saveOptions(res);
    }, (err) => {
        // console.log(err)
    })
}

function copyAddress() {
    /*
     * Implements copy for email addres.
     */

    var emailInput = document.getElementById("emailAddress");
    var capitalizedAddress = emailInput.value;

    emailInput.value = capitalizedAddress.toLowerCase();
    emailInput.select();
    document.execCommand("copy");

    emailInput.value = capitalizedAddress;

    emailInput.setSelectionRange(0, 255);
}

function setTimer(func, time) {
    /*
     * Configures a timer for function given a function and time.
     *
     * params:
     *     func: function
     *     time: int
     */

    // console.log(`popup::setTimer: func=${func}, time=${time}`);

    if (typeof(timer) != "undefined") {
        clearInterval(timer);
    }

    timer = setInterval(func, time);
}

function listenForEmails() {
    /*
     * Checks & handles emails
     */

    // console.log(`popup::listenForEmails`);

    if (!('secret' in credentials)) {
        return false;
    }

    var data = {
        action: `checkInbox&value=${credentials.secret}`,
        // action: `checkInbox&value=MmbaqlOE66iSq9IcBFDAVeKjEyideKee`, // for testing
        method: "GET"
    }

    postData(data).then(res => {
        // console.log(res)
        Object.keys(res).reverse().forEach((msg, idx) => {
            if (!(msg in emailMsgs)) {
                renderEmailMsg(res[msg]);
            }
        });

        emailMsgs = res;

        // console.log(res)
    }, (err) => {
        // console.log(err)
    })
}


function renderEmailMsg(msg) {
    /*
     * Renders out an email to popup.html
     *
     * params:
     *     msg: Object
     *         attachments: []
     *         date: "1618003920"           string epoch
     *         from: "email@sender.com"     string email
     *         id: "fjkslaf"                string hash
     *         name: null                   unknonw
     *         sourceHash: null             unknown
     *         subject: "subjectstuff"      string
     *         to: "email address"          string receiver email
     */

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
        <div class="row mt-1 pb-2" id="${msg.id}" style="font-size:12px;border-bottom:solid 1px black;">
            <div class="col-4 ${msg.id}">${dif} ${label} ago<br>(${date})</div>
            <div class="col-4 ${msg.id}">${msg.from}</div>
            <div class="col-4 ${msg.id}">${msg.subject}</div>
        </div>
    `;

    document.addEventListener('click', function(e) {
        if (e.target) {
            var msg = e.target.className.split(' ')[1];
            if (msg in emailMsgs) {
                viewEmail(msg, false)
            }
        }
    });

}

function viewEmail(id, close) {
    /*
     * TODO: implement displaying email msg
     */
    var url = `https://temporarymail.com/view/?i=${id}&width=200`;
    var frame = document.getElementById("msgFrame");

    console.log(close)


    if (close) {
        var closeBtn = document.getElementById('closeEmail');
        closeBtn.setAttribute("style", "display: none !imporant");
        frame.setAttribute("src", "");
    } else {
        var closeBtn = document.getElementById('closeEmail');
        closeBtn.setAttribute("style", "display: block !imporant");
        frame.setAttribute("src", url);
    }

}


function postData(data) {
    /*
     * Http requests
     *
     * params:
     *     data: Object
     *         method: "http.method" string
     *         action: "api action"  string
     */

    // console.log(`popup::postData: data=${data}`);
    var url;
    if ('url' in data) {
        url = data.url;
    } else {
        url = `https://temporarymail.com/ajax/api.php?action=${data['action']}`;
    }
    return fetch(url, {
        method: data.mehtod,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).then(response => response.json());
}

/* Event Listners */
document.getElementById('changeEmail').addEventListener('click', getNewEmailAddress);
document.getElementById('copyAddress').addEventListener('click', copyAddress);
document.getElementById('closeEmail').addEventListener('click', function() {
    viewEmail(0, true);
});
document.addEventListener('DOMContentLoaded', function() {
    // clearOptions();
    restoreOptions();
    setTimer(listenForEmails, 3000);
});