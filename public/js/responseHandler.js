function handleResponse(response, successCallback, errorCallback) {
    switch (response.status) {
        case 200:
        case 201: {
            successCallback(response);
            break;
        }
        case 400:
        case 401:
        case 403:
        case 404:
        case 413:
        case 500: {
            response.json()
                .then(result => errorCallback(result.message));
            break;
        }
        case 429: {
            response.text()
                .then(result => errorCallback(result));
        }
    }
}