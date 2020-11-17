function showPage(pageString) {
    switch (pageString.split('/')[0]) {
        case '': {
            window.history.replaceState('', '', '/' + pageString);
            getPageHTML('upload');
            break;
        }
        case 'download': {
            window.history.replaceState('', '', '/' + pageString + '/' + window.location.href.split("/")[4]);
            getPageHTML('download');
            break;
        }
        case 'confirm-email': {
            window.history.replaceState('', '', '/' + pageString);
            confirmEmail();
            getPageHTML('upload');
            break;
        }
        default: {
            window.history.replaceState('', '', '/' + pageString);
            getPageHTML(pageString);
        }
    }
}

function getPageHTML(page) {
    fetch('/pages/' + page)
        .then(response => {
            handleResponse(response, (response) => {
                response.text()
                    .then(result => {
                        const container = $('.container');

                        container.html(
                            '<div class="spinner-grow" role="status">' +
                            '<span class="sr-only">Loading...</span>' +
                            '</div>'
                        );

                        setTimeout(() => {
                            container.html('');
                            container.append(result + '');
                            if (page === 'download') download();
                            if (page === 'userpage') getUploads();
                        }, 750);
                    });
            }, (error) => {
                popUpAlert(error, 'warning');
            });
        });
}

showPage(window.location.href.split('/')[3]);