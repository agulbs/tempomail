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